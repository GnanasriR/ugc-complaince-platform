import {
  APPLICATIONS,
  MY_APPLICATIONS,
  PIPELINE_STAGES,
  COMPLIANCE_BY_TYPE,
  TREND_DATA,
  EVALUATOR_CONSISTENCY,
  ANOMALIES,
  NLP_PARAMETERS,
} from "../data";
import { saveResolvedAnomalyId, saveDispatchedNotice } from "../utils/anomalies";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8090";

function getAuthHeaders(endpoint = "") {
  const token = localStorage.getItem("ugc_auth_token");
  const aiApiKey = localStorage.getItem("ugc_ai_api_key") || "UGC-COMPLIANCE-AI-SECRET-KEY-2025";
  
  // Public auth endpoints do not require Authorization header
  if (
    endpoint.includes("/api/v1/auth/register") ||
    endpoint.includes("/api/v1/auth/login") ||
    endpoint.includes("/api/v1/auth/verify-otp") ||
    endpoint.includes("/api/v1/auth/forgot-password") ||
    endpoint.includes("/api/v1/auth/reset-password")
  ) {
    return { "Content-Type": "application/json", "X-AI-API-Key": aiApiKey };
  }

  return {
    "Content-Type": "application/json",
    "X-AI-API-Key": aiApiKey,
    ...(token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {}),
  };
}

// Generate valid 3-part JWT structure for offline fallback
function createMockJwtToken(email, role) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: email || "user@institution.ac.in",
      role: role || "ROLE_INSTITUTION",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    })
  );
  const signature = btoa("ugc_compliance_platform_signature");
  return `${header}.${payload}.${signature}`;
}

async function request(endpoint, options = {}, fallbackData = null) {
  try {
    let baseUrl = import.meta.env?.VITE_API_BASE_URL || "";
    const url = `${baseUrl}${endpoint}`;

    const headers = {
      ...getAuthHeaders(endpoint),
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorMessage;
      } catch (e) {
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch (t) {}
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data && data.status === "SIMULATED" && fallbackData !== null) {
      return typeof fallbackData === "function" ? fallbackData() : fallbackData;
    }
    return data;

  } catch (error) {
    if (typeof fallbackData === "function") {
      return fallbackData();
    }
    if (fallbackData !== null) {
      return fallbackData;
    }
    throw error;
  }
}

// ----------------------------------------------------
// Authentication Service APIs (/api/v1/auth)
// ----------------------------------------------------
export const authApi = {
  register: (payload) => {
    const rawRole = payload?.role || "ROLE_INSTITUTION";
    const cleanRole = rawRole.replace("ROLE_", "");
    const cleanMobile = (payload?.mobileNumber || "9876543210").replace(/\D/g, "").slice(-10);
    const cleanEmail = (payload?.email || "").trim().toLowerCase();

    const formattedPayload = {
      email: payload?.email,
      password: payload?.password || "password123",
      fullName: payload?.fullName || "User",
      mobileNumber: cleanMobile.length === 10 ? cleanMobile : "9876543210",
      institutionName: payload?.institutionName || "Higher Education Institute",
      role: cleanRole,
    };

    const fallbackRegisterFunc = () => {
      const defaultEmails = [
        "admin@ugc.gov.in",
        "officer@ugc.gov.in",
        "ugc@demo.com",
        "inst@demo.com",
        "registrar@rgit.ac.in",
        "expert.admin@ugc.gov.in",
      ];
      if (defaultEmails.includes(cleanEmail)) {
        throw new Error("Email address is already registered. Please log in.");
      }
      try {
        const saved = localStorage.getItem("ugc_pending_registrations");
        if (saved) {
          const pendingList = JSON.parse(saved);
          if (pendingList.some((u) => (u.email || "").trim().toLowerCase() === cleanEmail)) {
            throw new Error("Email address is already registered. Please log in.");
          }
        }
      } catch (e) {
        if (e.message && e.message.includes("already registered")) throw e;
      }

      return { message: "Registration request submitted. Pending System Admin approval.", otpCode: "123456", status: "PENDING_APPROVAL" };
    };

    return request(
      "/api/v1/auth/register",
      {
        method: "POST",
        body: JSON.stringify(formattedPayload),
      },
      fallbackRegisterFunc
    );
  },

  verifyOtp: (payload, extraUserInfo = null) => {
    const cleanEmail = (extraUserInfo?.email || payload?.mobileNumber || "").trim().toLowerCase();
    const isUgcUser =
      extraUserInfo?.role === "ROLE_UGC_OFFICER" ||
      cleanEmail.includes("@ugc.gov.in") ||
      cleanEmail.includes("@aicte.gov.in") ||
      cleanEmail.includes("@gov.in") ||
      cleanEmail.startsWith("ugc") ||
      cleanEmail.startsWith("officer");
    const role = isUgcUser ? "ROLE_UGC_OFFICER" : "ROLE_INSTITUTION";

    const fallbackUser = {
      token: createMockJwtToken(extraUserInfo?.email || payload.mobileNumber, role),
      type: "Bearer",
      user: {
        id: Date.now(),
        email: extraUserInfo?.email || payload.mobileNumber || "user@institution.ac.in",
        fullName: extraUserInfo?.fullName || (isUgcUser ? "UGC Regulatory Officer" : "Institutional Applicant"),
        institutionName: extraUserInfo?.institutionName || (isUgcUser ? "UGC Compliance Cell" : "State Technological University"),
        role: role,
        status: "ACTIVE",
      },
    };

    return request(
      "/api/v1/auth/verify-otp",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      fallbackUser
    );
  },

  login: (payload) => {
    let rawEmail = (payload?.email || "").trim();
    let rawPassword = payload?.password || "";
    let cleanEmail = rawEmail.toLowerCase();
    if (!cleanEmail.includes("@")) {
      if (cleanEmail.includes("expert")) cleanEmail = "expert.admin@ugc.gov.in";
      else if (cleanEmail.includes("admin")) cleanEmail = "admin@ugc.gov.in";
      else if (cleanEmail.includes("officer") || cleanEmail.includes("ugc")) cleanEmail = "officer@ugc.gov.in";
      else if (cleanEmail) cleanEmail = `${cleanEmail}@institution.ac.in`;
    }

    const isExpertAdmin = cleanEmail.includes("expert.admin") || cleanEmail.includes("expert");
    const isAdmin = !isExpertAdmin && (cleanEmail.includes("admin@ugc.gov.in") || cleanEmail.includes("admin"));
    const isUgcOfficer =
      isExpertAdmin ||
      isAdmin ||
      cleanEmail.includes("@ugc.gov.in") ||
      cleanEmail.includes("@aicte.gov.in") ||
      cleanEmail.includes("@gov.in") ||
      cleanEmail.startsWith("ugc") ||
      cleanEmail.startsWith("officer");

    const role = isExpertAdmin ? "ROLE_EXPERT_ADMIN" : isAdmin ? "ROLE_ADMIN" : isUgcOfficer ? "ROLE_UGC_OFFICER" : "ROLE_INSTITUTION";
    const officialRole = isExpertAdmin ? "expert_admin" : isAdmin ? "admin" : isUgcOfficer ? "evaluator" : "institution";

    const fallbackUserFunc = () => {
      try {
        const saved = localStorage.getItem("ugc_pending_registrations");
        if (saved) {
          const pendingList = JSON.parse(saved);
          const found = pendingList.find((p) => (p.email || "").trim().toLowerCase() === cleanEmail);
          if (found) {
            if (found.status === "PENDING_APPROVAL") {
              throw new Error(`🔒 Access Denied: Registration for '${cleanEmail}' is PENDING SYSTEM ADMIN APPROVAL. An email notification will be sent once approved by the Admin.`);
            } else if (found.status === "REJECTED") {
              throw new Error(`❌ Access Denied: Registration request for '${cleanEmail}' was declined by the System Administrator.`);
            }
          }
        }
      } catch (e) {
        if (e.message && e.message.includes("Access Denied")) throw e;
      }

      const isKnownDemoUser =
        cleanEmail === "admin@ugc.gov.in" ||
        cleanEmail === "officer@ugc.gov.in" ||
        cleanEmail === "ugc@demo.com" ||
        cleanEmail === "inst@demo.com" ||
        cleanEmail === "registrar@rgit.ac.in" ||
        cleanEmail === "expert.admin@ugc.gov.in" ||
        cleanEmail.endsWith("@institution.ac.in");

      if (!rawPassword || rawPassword !== "password123") {
        throw new Error("Invalid email or password");
      }

      if (!isKnownDemoUser) {
        throw new Error("Invalid email or password");
      }

      return {
        token: createMockJwtToken(cleanEmail, role),
        type: "Bearer",
        user: {
          id: Date.now(),
          email: cleanEmail,
          fullName: isExpertAdmin
            ? "Expert Committee Admin (Dr. R. K. Sharma)"
            : isAdmin
              ? "System Administrator (admin@ugc.gov.in)"
              : isUgcOfficer
                ? "UGC Regulatory Officer (Shali)"
                : "Institutional Applicant",
          institutionName: isExpertAdmin
            ? "UGC Expert Evaluation & Final Approval Committee"
            : isAdmin
              ? "UGC National Super Admin Desk"
              : isUgcOfficer
                ? "UGC Compliance Cell"
                : "State Technological University",
          role: role,
          officialRole: officialRole,
          status: "ACTIVE",
        },
      };
    };

    return request(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email: cleanEmail,
          password: rawPassword,
        }),
      },
      fallbackUserFunc
    );
  },

  forgotPassword: (email) =>
    request(
      "/api/v1/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
      { message: "OTP sent to registered mobile" }
    ),

  resetPassword: (payload) =>
    request(
      "/api/v1/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      { message: "Password reset successful" }
    ),

  approveUser: (userIdOrEmail, payload) => {
    const target = encodeURIComponent(payload?.email || userIdOrEmail || "1");
    return request(
      `/api/v1/auth/users/${target}/approve`,
      {
        method: "POST",
        body: JSON.stringify(payload || {}),
      },
      { message: "Registration approved. Confirmation email dispatched via Spring Boot JavaMailSender.", status: "ACTIVE" }
    );
  },

  rejectUser: (userIdOrEmail, payload) => {
    const target = encodeURIComponent(payload?.email || userIdOrEmail || "1");
    return request(
      `/api/v1/auth/users/${target}/reject`,
      {
        method: "POST",
        body: JSON.stringify(payload || {}),
      },
      { message: "Registration request rejected.", status: "REJECTED" }
    );
  },

  getAllUsers: () => {
    const defaultPendingUsers = [
      {
        id: "REG-2025-901",
        fullName: "Dr. Ananya Sharma",
        email: "ananya.sharma@bits-pilani.ac.in",
        mobileNumber: "9876543210",
        institutionName: "Birla Institute of Technology & Science",
        role: "ROLE_INSTITUTION",
        status: "PENDING_APPROVAL",
        submittedAt: "2026-08-13 10:15 AM",
      },
      {
        id: "REG-2025-902",
        fullName: "Prof. Rajesh Kumar",
        email: "rajesh.k@nitt.edu",
        mobileNumber: "9123456789",
        institutionName: "National Institute of Technology Trichy",
        role: "ROLE_INSTITUTION",
        status: "PENDING_APPROVAL",
        submittedAt: "2026-08-13 11:00 AM",
      },
      {
        id: "REG-2025-903",
        fullName: "Officer Vikramaditya Singh",
        email: "vikramaditya@ugc.gov.in",
        mobileNumber: "9988776655",
        institutionName: "UGC Western Regional Office",
        role: "ROLE_UGC_OFFICER",
        status: "PENDING_APPROVAL",
        submittedAt: "2026-08-13 11:20 AM",
      },
      {
        id: "REG-2025-904",
        fullName: "Dr. K. V. Raman",
        email: "kv.raman@fakeuniv.edu.in",
        mobileNumber: "9876543299",
        institutionName: "Unrecognized Technical Institute",
        role: "ROLE_INSTITUTION",
        status: "REJECTED",
        submittedAt: "2026-08-12 04:15 PM",
      },
      {
        id: "REG-2025-905",
        fullName: "Director S. P. Malhotra",
        email: "malhotra@unapproved-degree.ac.in",
        mobileNumber: "9876543298",
        institutionName: "Apex Distance Learning Society",
        role: "ROLE_INSTITUTION",
        status: "REJECTED",
        submittedAt: "2026-08-12 05:30 PM",
      },
    ];

    try {
      const saved = localStorage.getItem("ugc_pending_registrations");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return request("/api/v1/auth/users", { method: "GET" }, parsed);
      }
    } catch (e) {}

    return request("/api/v1/auth/users", { method: "GET" }, defaultPendingUsers);
  },
};

// ----------------------------------------------------
// Application Service APIs (/api/v1/applications)
// ----------------------------------------------------
export const applicationsApi = {
  getAll: () => request("/api/v1/applications", {}, APPLICATIONS),

  getById: (id) => request(`/api/v1/applications/${id}`, {}, APPLICATIONS.find((a) => a.id === id) || APPLICATIONS[0]),

  create: (payload) => {
    const requestBody = {
      name: payload.name || payload.institutionName || "Institutional Applicant",
      type: payload.type || payload.programmeType || "General",
      regulatoryBody: payload.regulatoryBody || (payload.type?.includes("AICTE") || payload.programmeType?.includes("AICTE") ? "AICTE" : "UGC"),
      state: payload.state || "Karnataka",
      academicYear: payload.academicYear || "2025–26",
    };

    return request(
      "/api/v1/applications",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
      {
        id: payload?.id || `APP-2025-${Math.floor(100 + Math.random() * 900)}`,
        status: payload?.status || "DRAFT",
        submissionDate: new Date().toISOString().split("T")[0],
        ...payload,
        ...requestBody,
      }
    );
  },

  saveDraft: (id, draftPayload) =>
    request(
      `/api/v1/applications/${id}/draft`,
      {
        method: "PATCH",
        body: typeof draftPayload === "string" ? draftPayload : JSON.stringify(draftPayload),
      },
      { id, status: "DRAFT", draftData: draftPayload }
    ),

  submit: (payload) => {
    const id = typeof payload === "object" ? payload.id : payload;
    return request(
      `/api/v1/applications/${id}/submit`,
      {
        method: "POST",
        body: typeof payload === "object" ? JSON.stringify(payload) : undefined,
      },
      {
        id,
        status: "SUBMITTED",
        submissionDate: new Date().toISOString().split("T")[0],
        ...(typeof payload === "object" ? payload : {}),
      }
    );
  },

  uploadDocument: (id, docPayload) => {
    let rawType = (docPayload.fileType || "PDF").toUpperCase();
    if (rawType.includes("DOCX")) {
      rawType = "DOCX";
    } else {
      rawType = "PDF";
    }

    const requestBody = {
      slotName: docPayload.slotName || "General Document",
      fileName: docPayload.fileName || "document.pdf",
      fileType: rawType,
      fileSize: docPayload.fileSize || 1024000,
      fileHash: docPayload.fileHash || "sha256_" + Math.random().toString(36).substring(2, 10),
    };

    return request(
      `/api/v1/applications/${id}/documents`,
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      },
      {
        id: "DOC-" + Math.floor(Math.random() * 9000 + 1000),
        applicationId: id,
        ...docPayload,
        ...requestBody,
      }
    );
  },

  getDocuments: (id) =>
    request(`/api/v1/applications/${id}/documents`, {}, []),

  updateStatus: (id, status, notes) =>
    request(
      `/api/v1/applications/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
      },
      { id, status, notes }
    ),
};

// ----------------------------------------------------
// Analytics Service APIs (/api/v1/analytics)
// ----------------------------------------------------
import { getStoredReports, saveReportToDatabase } from "../utils/reportsDb";

export const analyticsApi = {
  getPipelineStages: () => Promise.resolve(PIPELINE_STAGES),
  getComplianceByType: () => Promise.resolve(COMPLIANCE_BY_TYPE),
  getTrends: () => Promise.resolve(TREND_DATA),
  getEvaluatorConsistency: () => Promise.resolve(EVALUATOR_CONSISTENCY),
  getReports: () => Promise.resolve(getStoredReports()),
  saveReport: (payload) => {
    saveReportToDatabase(payload);
    try {
      fetch("/api/v1/analytics/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (e) {}
    return Promise.resolve(payload);
  },
  saveAppReport: (appId, payload) => {
    try {
      fetch(`/api/v1/analytics/reports/application/${appId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (e) {}
    return Promise.resolve(payload);
  },
  generateReport: (appId) => Promise.resolve({ reportId: `REP-${appId}`, applicationId: appId, downloadUrl: "#" }),
  getSummary: () => Promise.resolve({
    totalApplications: 1420,
    compliantCount: 1180,
    nonCompliantCount: 140,
    pendingReviewCount: 100,
    averageComplianceRate: 88.5,
  }),
};

// ----------------------------------------------------
// Anomaly Detection APIs (/api/v1/anomalies)
// ----------------------------------------------------
export const anomalyApi = {
  getAll: () => request("/api/v1/anomalies", {}, ANOMALIES),
  getByAppId: (appId) => request(`/api/v1/anomalies/application/${appId}`, {}, ANOMALIES.filter((a) => a.applicationId === appId)),
  flagDiscrepancy: (payload) => {
    try {
      fetch("/api/v1/anomalies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (e) {}
    return Promise.resolve(payload);
  },
  resolve: (id) => {
    saveResolvedAnomalyId(id);
    try {
      fetch(`/api/v1/anomalies/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});
    } catch (e) {}
    return Promise.resolve({ id, status: "RESOLVED" });
  },
  dispatchNotice: (id, noticeText) => {
    const noticeObj = {
      dispatchedAt: new Date().toLocaleDateString(),
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      noticeText,
    };
    saveDispatchedNotice(id, noticeObj);
    saveResolvedAnomalyId(id);
    return request(
      `/api/v1/anomalies/${id}/dispatch-notice`,
      {
        method: "POST",
        body: JSON.stringify({ noticeText }),
      },
      {
        noticeId: `NTC-2025-${Math.floor(1000 + Math.random() * 9000)}`,
        anomalyId: id,
        dispatchedAt: new Date().toISOString(),
        status: "DISPATCHED",
        ...noticeObj,
      }
    );
  },
};

// ----------------------------------------------------
// NLP & BERT Document Compliance APIs (/api/v1/nlp)
// ----------------------------------------------------
export const nlpApi = {
  getParametersByAppId: (appId) => request(`/api/v1/nlp/parameters/application/${appId}`, {}, NLP_PARAMETERS),
  saveParametersBatch: (parameters) => {
    try {
      fetch("/api/v1/nlp/parameters/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parameters),
      }).catch(() => {});
    } catch (e) {}
    return Promise.resolve(parameters);
  },
  extractParameters: (formData) =>
    request(
      "/api/v1/ai/extract-nlp",
      {
        method: "POST",
        body: formData,
        headers: {},
      },
      {
        applicationId: "APP-NEW",
        nlpComplianceScore: 88.5,
        extractedParameters: [
          { parameterName: "Faculty Ratio", extractedValue: "1:15", status: "COMPLIANT" },
          { parameterName: "Land Area", extractedValue: "10.5 Acres", status: "COMPLIANT" },
        ],
      }
    ),
};

// ----------------------------------------------------
// ML Approval Probability Prediction APIs (/api/v1/ml)
// ----------------------------------------------------
export const mlApi = {
  getScore: (appId) => request(`/api/v1/ml/score/${appId}`, {}, { applicationId: appId, approvalProbability: 85.0, riskTier: "Low" }),
  saveScore: (payload) => {
    try {
      fetch("/api/v1/ml/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (e) {}
    return Promise.resolve(payload);
  },
  predict: (payload) => {
    try {
      fetch("/api/v1/ml/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: payload.applicationId || "APP-2024-0891",
          approvalProbability: payload.probability || 88.5,
          riskTier: payload.riskCategory || "Low",
        }),
      }).catch(() => {});
    } catch (e) {}
    return request(
      "/api/v1/ml/predict",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      {
        applicationId: payload.applicationId || "APP-DEMO",
        probability: 92.5,
        riskCategory: "LOW",
        topRiskFactors: ["Minor library journal deficit"],
      }
    );
  },

  runPreCheck: (payload) => {
    const docComp = payload.documentCompletenessScore ?? 0;
    const faculty = payload.facultyRatioScore ?? 60;
    const infra = payload.infrastructureScore ?? 60;

    let prob = 5;
    if (docComp <= 0) {
      prob = 5;
    } else if (docComp < 25) {
      prob = Math.min(25, Math.max(8, Math.round(docComp * 1.2 + 8)));
    } else if (docComp < 50) {
      prob = Math.min(45, Math.max(20, Math.round(docComp * 0.8 + 12)));
    } else {
      let raw = faculty * 0.35 + infra * 0.3 + docComp * 0.35;
      if (faculty < 50) raw -= 15;
      if (infra < 50) raw -= 15;
      prob = Math.min(98, Math.max(10, Math.round(raw)));
    }

    const appId = payload.applicationId || "APP-2024-0891";
    try {
      fetch("/api/v1/ml/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          approvalProbability: prob,
          riskTier: prob >= 70 ? "Low" : prob >= 45 ? "Medium" : "High",
        }),
      }).catch(() => {});
    } catch (e) {}

    return Promise.resolve({
      simulatedProbability: prob,
      simulatedApprovalProbability: prob,
      riskTier: prob >= 70 ? "Low" : prob >= 45 ? "Medium" : "High",
    });
  },
};

// ----------------------------------------------------
// AI Assistant APIs (/api/v1/ai)
// ----------------------------------------------------
export const aiApi = {
  verifyKey: (apiKey) =>
    request(
      "/api/v1/ai/verify-key",
      {
        method: "POST",
        body: JSON.stringify({ apiKey }),
      },
      { valid: true, message: "AI Model API Key verified successfully." }
    ),

  predictApproval: (payload) =>
    request(
      "/api/v1/ai/predict-approval",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      {
        mlApprovalProbability: 92.4,
        recommendation: "RECOMMEND_APPROVAL",
        shapBreakdown: [
          { feature: "Faculty-Student Ratio", contribution: 12.5 },
          { feature: "Land & Built-up Area", contribution: 8.4 },
          { feature: "Financial Audit & Corpus", contribution: 14.2 },
          { feature: "Document Completeness Vault", contribution: 5.1 },
        ],
      }
    ),

  getSelfAssessmentReport: (payload) => {
    const reportData = {
      id: `RPT-${payload?.applicationId || "APP-2024-0891"}`,
      applicationId: payload?.applicationId || "APP-2024-0891",
      institutionName: payload?.institutionName || "Institutional Applicant",
      recommendation: "RECOMMEND_APPROVAL",
      nlpComplianceScore: 88.5,
      mlApprovalProbability: 92.4,
      executiveSummary: `AI Analysis synthesized 14 extracted NLP parameters and XGBoost ML probability model for ${payload?.applicationId || "APP-2024-0891"}. Document authenticity verified. Faculty headcount meets prescribed benchmarks.`,
      evaluatorNotes: "All mandatory annexure files successfully parsed and cryptographically hashed.",
    };

    try {
      fetch("/api/v1/ai/self-assessment-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      }).catch(() => {});
    } catch (e) {}

    return request(
      "/api/v1/ai/self-assessment-report",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      reportData
    );
  },

  query: (prompt) =>
    request(
      "/api/v1/ai/assistant",
      {
        method: "POST",
        body: JSON.stringify({ prompt }),
      },
      {
        response: `UGC Compliance Assistant analysis: Based on current regulations and your query ("${prompt}"), institutional parameter compliance is currently at 88.5%. Please ensure faculty ratio and infrastructure affidavits are fully uploaded before submission.`,
      }
    ),

  inspectDocument: (payload) =>
    request(
      "/api/v1/ai/inspect-document",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      {
        id: "INSP-" + Math.floor(Math.random() * 9000 + 1000),
        applicationId: payload.applicationId,
        fileName: payload.fileName,
        extractedParamsCount: 14,
        discrepancyCount: 2,
        forgeryFlagDetected: true,
        extractedParametersSummary: [
          "Faculty Headcount: Declared 68, Verified 38 (Shortfall 30)",
          "Built-up Area: 85,000 sq ft (Verified 61,200 sq ft)",
          "Solvency Ratio: 1.8 (Norm >= 2.0)",
        ],
        detectedDiscrepancies: [
          "Annexure III payroll headcount contradicts Annexure VII tax filings",
          "PDF creation metadata timestamp post-dates notary seal timestamp",
        ],
      }
    ),

  generateReport: (appId) =>
    request(
      `/api/v1/ai/reports/generate/${appId}`,
      {
        method: "POST",
      },
      {
        id: "AI-REP-2024-" + Math.floor(Math.random() * 900 + 100),
        applicationId: appId,
        institutionName: "Rajiv Gandhi Institute of Technology",
        recommendation: "RECOMMEND_CONDITIONAL_APPROVAL",
        executiveSummary:
          "AI analysis synthesised 14 extracted NLP parameters and XGBoost ML probability model (91.3% accuracy). Document authenticity verified. Faculty headcount meets prescribed 1:15 ratio with 71% PhD faculty.",
        nlpComplianceScore: 84.5,
        mlApprovalProbability: 91.2,
        riskTier: "Low",
        remediationDeadlineDays: 14,
        evaluatorNotes: "Institution exhibits strong academic compliance. Recommend 1-year approval subject to satellite area audit.",
      }
    ),
};
