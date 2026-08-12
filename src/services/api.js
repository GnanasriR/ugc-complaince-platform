import {
  APPLICATIONS,
  MY_APPLICATIONS,
  PIPELINE_STAGES,
  COMPLIANCE_BY_TYPE,
  TREND_DATA,
  ANOMALIES,
  NLP_PARAMETERS,
} from "../data";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("ugc_auth_token") || "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vQHVnYy5nb3YuaW4iLCJyb2xlIjoiUk9MRV_BVUdDX09GRklDRVIifQ.demo";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(endpoint, options = {}, fallbackData = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson = null;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        // Not JSON
      }
      const message = errorJson?.message || errorText || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    if (fallbackData !== null) {
      return fallbackData;
    }
    throw error;
  }
}

// ----------------------------------------------------
// Auth Service APIs (/api/v1/auth)
// ----------------------------------------------------
export const authApi = {
  register: (payload) =>
    request(
      "/api/v1/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      {
        message: "Registration successful. OTP sent.",
        mobileNumber: payload?.mobileNumber || "9876543210",
        otpCode: "123456",
      }
    ),

  verifyOtp: (payload, extraUser = null) =>
    request(
      "/api/v1/auth/verify-otp",
      {
        method: "POST",
        body: typeof payload === "string" ? JSON.stringify({ otpCode: payload }) : JSON.stringify(payload),
      },
      {
        token: "demo_jwt_token_2025",
        type: "Bearer",
        user: {
          id: 1,
          email: extraUser?.email || "user@institution.ac.in",
          fullName: extraUser?.fullName || "Registered Representative",
          mobileNumber: extraUser?.mobileNumber || payload?.mobileNumber || "9876543210",
          institutionName: extraUser?.institutionName || "Registered Institution",
          role: extraUser?.role || "ROLE_INSTITUTION",
          status: "ACTIVE",
        },
      }
    ),

  login: (payload) => {
    const isUgc =
      payload?.email?.includes("@ugc.gov.in") ||
      payload?.email?.includes("@aicte.gov.in") ||
      payload?.email?.includes("@gov.in");
    const nameFromEmail = payload?.email
      ? payload.email
          .split("@")[0]
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
      : "Authorized User";
    const domainPart = payload?.email?.split("@")[1]?.split(".")[0] || "institution";
    const instFromEmail = domainPart.toUpperCase() + " Institute of Higher Education";

    return request(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      {
        token: "demo_jwt_token_2025",
        type: "Bearer",
        user: {
          id: 1,
          email: payload?.email || "user@ugc.gov.in",
          fullName: isUgc ? "Dr. Senior Reviewer" : nameFromEmail,
          institutionName: isUgc ? "UGC / AICTE Regulatory HQ" : instFromEmail,
          role: isUgc ? "ROLE_UGC_OFFICER" : "ROLE_INSTITUTION",
          status: "ACTIVE",
        },
      }
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

  getCurrentUser: (email) =>
    request(
      "/api/v1/auth/me",
      {
        method: "GET",
        headers: { "X-User-Email": email },
      },
      { email, fullName: "Logged-in User", role: "ROLE_INSTITUTION" }
    ),

  getAllUsers: () => request("/api/v1/auth/users", { method: "GET" }, []),

  changeRole: (userId, role, adminId = 1) =>
    request(
      "/api/v1/auth/users/" + userId + "/role",
      {
        method: "PUT",
        headers: { "X-Admin-Id": String(adminId) },
        body: JSON.stringify({ role }),
      },
      { id: userId, role }
    ),
};

// ----------------------------------------------------
// Application Service APIs (/api/v1/applications)
// ----------------------------------------------------
export const applicationsApi = {
  getAll: () => request("/api/v1/applications", { method: "GET" }, APPLICATIONS),

  getById: (id) =>
    request(
      `/api/v1/applications/${id}`,
      { method: "GET" },
      APPLICATIONS.find((a) => a.id === id) || APPLICATIONS[0]
    ),

  create: (payload) =>
    request(
      "/api/v1/applications",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      { id: payload.id || "APP-2025-0001", status: "CREATED" }
    ),

  saveDraft: (id, draftPayload) =>
    request(
      `/api/v1/applications/${id}/draft`,
      {
        method: "PATCH",
        body: typeof draftPayload === "string" ? draftPayload : JSON.stringify(draftPayload),
      },
      { id, status: "DRAFT_SAVED" }
    ),

  submit: (id) =>
    request(
      `/api/v1/applications/${id}/submit`,
      {
        method: "POST",
      },
      { id, status: "SUBMITTED" }
    ),

  uploadDocument: (id, documentPayload) =>
    request(
      `/api/v1/applications/${id}/documents`,
      {
        method: "POST",
        body: JSON.stringify(documentPayload),
      },
      { id, status: "DOCUMENT_UPLOADED" }
    ),
};

// ----------------------------------------------------
// Analytics Service APIs (/api/v1/analytics)
// ----------------------------------------------------
export const analyticsApi = {
  getPipelineStages: () => request("/api/v1/analytics/pipeline-stages", { method: "GET" }, PIPELINE_STAGES),

  getComplianceByType: () => request("/api/v1/analytics/compliance-by-type", { method: "GET" }, COMPLIANCE_BY_TYPE),

  getTrends: () => request("/api/v1/analytics/trends", { method: "GET" }, TREND_DATA),

  getEvaluatorConsistency: () =>
    request(
      "/api/v1/analytics/evaluators/consistency",
      { method: "GET" },
      { kappaScore: 0.82, agreementLevel: "Substantial", TotalEvaluations: 412 }
    ),

  getReport: (applicationId) =>
    request(
      `/api/v1/analytics/reports/application/${applicationId}`,
      { method: "GET" },
      { applicationId, status: "GENERATED", summary: "Compliance report generated" }
    ),
};

// ----------------------------------------------------
// NLP Verification Service APIs (/api/v1/nlp)
// ----------------------------------------------------
export const nlpApi = {
  getParameters: (applicationId) =>
    request(`/api/v1/nlp/parameters/application/${applicationId}`, { method: "GET" }, NLP_PARAMETERS),

  checkDiscrepancies: (applicationId) =>
    request(
      `/api/v1/nlp/discrepancies/application/${applicationId}`,
      { method: "GET" },
      [
        { annexureA: "Annexure I (Faculty)", annexureB: "Annexure VII (Payroll)", parameter: "Faculty Count", diffPct: 8.5 },
      ]
    ),
};

// ----------------------------------------------------
// ML Scoring Service APIs (/api/v1/ml)
// ----------------------------------------------------
export const mlApi = {
  runPreCheck: (payload) =>
    request(
      "/api/v1/ml/pre-check",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      {
        approvalProbability: 84.5,
        riskTier: "Low Risk",
        shapValues: [
          { feature: "Faculty Ratio", impact: 18.4 },
          { feature: "Land Ownership", impact: 12.1 },
          { feature: "Library Volumes", impact: 9.3 },
        ],
      }
    ),
};

// ----------------------------------------------------
// Anomaly Detection Service APIs (/api/v1/anomalies)
// ----------------------------------------------------
export const anomalyApi = {
  getAnomalies: () => request("/api/v1/anomalies", { method: "GET" }, ANOMALIES),

  dispatchNotice: (anomalyId, payload) =>
    request(
      `/api/v1/anomalies/${anomalyId}/dispatch-notice`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      { anomalyId, status: "NOTICE_DISPATCHED", deadlineDays: 14 }
    ),
};

// ----------------------------------------------------
// Notification Service APIs (/api/v1/notifications)
// ----------------------------------------------------
export const notificationApi = {
  getNotifications: (portal) =>
    request(`/api/v1/notifications/user/${portal}`, { method: "GET" }, []),
};

// ----------------------------------------------------
// AI Service APIs (/api/v1/ai) - NEW AI SERVICE (Port 8088)
// ----------------------------------------------------
export const aiApi = {
  inspectDocument: (payload) =>
    request(
      "/api/v1/ai/inspect-document",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      {
        id: "INS-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        applicationId: payload?.applicationId || "AICTE-2025-0001",
        fileName: payload?.fileName || "Annexure.pdf",
        discrepanciesFound: 1,
        inspectionScore: 88,
        discrepancyList: [
          "Minor discrepancy detected: Faculty list count (34) vs Payroll roster (32).",
        ],
        forgeryAlert: false,
        summary: "Document inspected by AI model. Metadata hash verified.",
      }
    ),

  generateReport: (appId) =>
    request(
      `/api/v1/ai/reports/generate/${appId}`,
      {
        method: "POST",
      },
      {
        id: "REP-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        applicationId: appId,
        institutionName: "Deccan Inst. of Mgmt.",
        recommendation: "RECOMMEND_APPROVAL",
        executiveSummary:
          "AI Inspection indicates high compliance with UGC/AICTE norms. XGBoost model predicts 88% approval probability.",
        nlpComplianceScore: 84,
        mlApprovalProbability: 88,
        riskTier: "Low Risk",
        remediationDeadlineDays: 14,
      }
    ),

  getReport: (appId) =>
    request(
      `/api/v1/ai/reports/application/${appId}`,
      {
        method: "GET",
      },
      {
        id: "REP-EXISTS",
        applicationId: appId,
        recommendation: "RECOMMEND_APPROVAL",
        executiveSummary: "AI evaluation report on file.",
      }
    ),
};
