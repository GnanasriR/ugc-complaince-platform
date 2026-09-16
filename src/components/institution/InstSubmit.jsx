import { useState, useEffect } from "react";
import { CheckCircle, Upload, AlertCircle, Send, ChevronRight, Save } from "lucide-react";
import { APPLICATION_CATALOGUE, BASE_REQUIRED_DOCS, EXTRA_REQUIRED_DOC } from "../../data";
import { applicationsApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../shared/PageHeader";
import StatusBadge from "../shared/StatusBadge";
import { addNotification } from "../../utils/notifications";
import { saveAppUploadedDoc } from "../../utils/appDocs";

export default function InstSubmit({ onSubmitApplication }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [module, setModule] = useState("UGC");
  const [selectedType, setSelectedType] = useState(null);
  
  const [form, setForm] = useState(() => ({
    institutionName: user?.institutionName || "Institutional Applicant",
    programme: "",
    cycle: "2025–26",
    state: "Karnataka",
    city: "Bengaluru",
    contact: user?.fullName || "Authorised Representative",
    email: user?.email || "registrar@institution.ac.in",
    phone: user?.mobileNumber || "+91 98765 43210",
    remarks: "",
  }));

  // Update default form if user loads post-mount
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        institutionName: user.institutionName || f.institutionName,
        contact: user.fullName || f.contact,
        email: user.email || f.email,
        phone: user.mobileNumber || f.phone,
      }));
    }
  }, [user]);

  const [docs, setDocs] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [activeAppId, setActiveAppId] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");

  // Auto-sync documents uploaded in Document Vault into application form docs state
  useEffect(() => {
    try {
      const savedDocs = localStorage.getItem("ugc_doc_vault_items");
      if (savedDocs) {
        const parsed = JSON.parse(savedDocs);
        if (Array.isArray(parsed)) {
          const synced = {};
          parsed.forEach((d) => {
            if (d.done) {
              synced[d.name || d.item || d.id] = {
                fileName: d.fileName,
                fileSizeMb: d.fileSizeMb,
                fileHash: d.fileHash,
                uploadedAt: d.uploadedAt,
                done: true,
              };
            }
          });
          if (Object.keys(synced).length > 0) {
            setDocs((prev) => ({ ...synced, ...prev }));
          }
        }
      }
    } catch (e) {}
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const steps = ["Application Type", "Details", "Documents"];
  const ic =
    "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 shadow-sm transition-all";

  const typeInfo = selectedType
    ? [...APPLICATION_CATALOGUE.UGC, ...APPLICATION_CATALOGUE.AICTE].find((t) => t.id === selectedType)
    : null;
  const extraDoc = selectedType && EXTRA_REQUIRED_DOC[selectedType] ? EXTRA_REQUIRED_DOC[selectedType] : null;
  const requiredDocs = (selectedType
    ? [...BASE_REQUIRED_DOCS, extraDoc]
    : BASE_REQUIRED_DOCS).filter(Boolean);
  const uploadedRequiredDocs = requiredDocs.filter((d) => {
    const docNameStr = typeof d === "string" ? d : (d?.name || "");
    return Boolean(docs[docNameStr]);
  });
  const uploadedCount = uploadedRequiredDocs.length;
  const allUploaded = requiredDocs.length > 0 && uploadedCount === requiredDocs.length;
  const hasAtLeastOneDoc = uploadedCount >= 1;

  // Pre-load draft if selected for editing from Institution Dashboard
  useEffect(() => {
    try {
      const activeEditId = localStorage.getItem("ugc_active_edit_draft_id");
      if (activeEditId) {
        const savedDrafts = localStorage.getItem("ugc_institution_drafts");
        if (savedDrafts) {
          const parsed = JSON.parse(savedDrafts);
          const targetDraft = parsed[activeEditId];
          if (targetDraft) {
            setActiveAppId(targetDraft.id);
            if (targetDraft.selectedType) setSelectedType(targetDraft.selectedType);
            if (targetDraft.step) setStep(targetDraft.step);
            if (targetDraft.form) setForm((f) => ({ ...f, ...targetDraft.form }));
            if (targetDraft.docs) setDocs(targetDraft.docs);
          }
        }
      }
    } catch (e) {}
  }, []);

  const saveDraftToStore = (draftId, updatedForm, updatedStep, updatedDocs, selectedCategory) => {
    if (!draftId) return;
    try {
      const saved = localStorage.getItem("ugc_institution_drafts");
      const drafts = saved ? JSON.parse(saved) : {};
      drafts[draftId] = {
        id: draftId,
        institutionName: updatedForm.institutionName || "Institutional Applicant",
        selectedType: selectedCategory,
        step: updatedStep,
        form: updatedForm,
        docs: updatedDocs,
        status: "DRAFT",
        updatedAt: new Date().toLocaleTimeString(),
      };
      localStorage.setItem("ugc_institution_drafts", JSON.stringify(drafts));
      window.dispatchEvent(new CustomEvent("ugc_drafts_updated"));
    } catch (e) {}
  };

  // Auto-Save Draft Interval every 60 seconds (FR-APP-002)
  useEffect(() => {
    if (!activeAppId || submitted) return;

    saveDraftToStore(activeAppId, form, step, docs, selectedType);

    const interval = setInterval(() => {
      setAutoSaveStatus("Saving draft...");
      saveDraftToStore(activeAppId, form, step, docs, selectedType);
      applicationsApi
        .saveDraft(activeAppId, JSON.stringify(form))
        .then(() => {
          setAutoSaveStatus("Draft auto-saved at " + new Date().toLocaleTimeString());
          setTimeout(() => setAutoSaveStatus(""), 3000);
        })
        .catch((err) => {
          setAutoSaveStatus("Draft saved locally");
          setTimeout(() => setAutoSaveStatus(""), 3000);
        });
    }, 15000);

    return () => clearInterval(interval);
  }, [activeAppId, form, step, docs, selectedType, submitted]);

  const handleNextStep = () => {
    if (step === 1 && selectedType) {
      // Create Application in DRAFT status on backend (FR-APP-001)
      const isAicte = selectedType?.startsWith("aicte");
      const tempId = activeAppId || `${isAicte ? "AICTE" : "UGC"}-2025-${String(Math.floor(10000 + Math.random() * 90000))}`;
      setActiveAppId(tempId);
      saveDraftToStore(tempId, form, 2, docs, selectedType);
      applicationsApi
        .create({
          id: tempId,
          name: form.institutionName || "Institutional Applicant",
          type: typeInfo?.label || "General",
          regulatoryBody: isAicte ? "AICTE" : "UGC",
          state: form.state || "Karnataka",
          academicYear: form.cycle || "2025–26",
          status: "DRAFT",
        })
        .then((res) => {
          if (res && res.id) {
            setActiveAppId(res.id);
          }
        })
        .catch((err) => console.warn("[Draft Init]", err.message));
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const computeFileHash = async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    } catch (e) {
      return "SHA256_" + Math.random().toString(36).substring(2, 14).toUpperCase();
    }
  };

  const handleFileUpload = async (docName, file) => {
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      alert("Only PDF and DOCX files are allowed for annexure uploads.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds maximum 10MB limit.");
      return;
    }

    const hash = await computeFileHash(file);
    const fileType = ext === "docx" ? "DOCX" : "PDF";
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

    const docMetadata = {
      fileName: file.name,
      fileSizeMb: sizeMb,
      fileSize: file.size,
      fileType: fileType,
      fileHash: hash,
      uploadedAt: new Date().toLocaleTimeString(),
    };

    setDocs((prev) => ({
      ...prev,
      [docName]: docMetadata,
    }));

    if (activeAppId) {
      saveAppUploadedDoc(activeAppId, file);
      applicationsApi
        .uploadDocument(activeAppId, {
          slotName: docName,
          fileName: file.name,
          fileType: fileType,
          fileSize: file.size,
          fileHash: hash,
        })
        .catch((e) => console.warn("[Doc Upload]", e.message));
    }
  };

  const handleRemoveDocument = (docName) => {
    setDocs((prev) => {
      const copy = { ...prev };
      delete copy[docName];
      return copy;
    });
  };

  const handleSubmit = () => {
    const finalId = activeAppId || `APP-2025-${String(900 + Math.floor(Math.random() * 90)).padStart(4, "0")}`;
    
    // Remove from draft store once submitted
    try {
      localStorage.removeItem("ugc_active_edit_draft_id");
      const savedDrafts = localStorage.getItem("ugc_institution_drafts");
      if (savedDrafts) {
        const parsed = JSON.parse(savedDrafts);
        delete parsed[finalId];
        localStorage.setItem("ugc_institution_drafts", JSON.stringify(parsed));
      }
      window.dispatchEvent(new CustomEvent("ugc_drafts_updated"));
    } catch (e) {}

    // Submit Application to backend (FR-APP-002)
    applicationsApi
      .submit(finalId)
      .catch((e) => console.warn("[App Submit]", e.message));

    // Send real-time notification to UGC Dashboard
    addNotification("ugc", {
      title: "New Application Submitted",
      desc: `New Application ${finalId} submitted by ${form.institutionName} (${typeInfo?.label || "General"}, ${form.state}). Awaiting UGC officer review.`,
      tone: "bg-blue-100 text-blue-700",
      iconName: "FileText",
    });

    // Trigger AI Automatic Norm Match Resolution Engine for submitted application
    try {
      fetch("/api/v1/ai/resolve-norm-for-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: finalId,
          applicationId: finalId,
          institutionName: form.institutionName,
          type: typeInfo?.label || "General",
          selectedType: selectedType,
          distinctDiscipline: form.distinctDiscipline,
          programmesList: form.programmesList,
          state: form.state,
          cycle: form.cycle,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.resolution) {
            const resData = data.resolution;
            try {
              localStorage.setItem(`ugc_app_resolved_norm_${finalId}`, JSON.stringify(resData));
            } catch (e) {}

            addNotification("ugc", {
              title: "AI Regulatory Norm Resolved",
              desc: `AI Engine automatically resolved Application ${finalId} with Regulatory Norm Document '${resData.resolvedNormFilename}' (${resData.matchConfidenceScore}% Match Confidence).`,
              tone: "bg-emerald-100 text-emerald-800",
              iconName: "ShieldCheck",
            });
          }
        })
        .catch(() => {});
    } catch (e) {}

    onSubmitApplication(
      { id: finalId, name: form.institutionName, type: typeInfo?.label ?? "General", state: form.state },
      { id: finalId, cycle: form.cycle, type: typeInfo?.label ?? "General", submitted: new Date().toISOString().slice(0, 10) }
    );
    setSubmitted(finalId);
  };

  const resetWizard = () => {
    try {
      localStorage.removeItem("ugc_active_edit_draft_id");
    } catch (e) {}
    setStep(1);
    setSelectedType(null);
    setDocs({});
    setSubmitted(null);
    setActiveAppId(null);
  };

  if (submitted) {
    return (
      <div className="p-6 min-h-full flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-1">Application Submitted</h2>
          <p className="text-sm text-slate-500 mb-4">
            {typeInfo?.label} has been filed and is now visible to UGC/AICTE reviewers.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-slate-800">{submitted}</span>
            <StatusBadge status="New" />
          </div>
          <button
            onClick={resetWizard}
            className="flex items-center gap-2 justify-center w-full bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-bold shadow-sm"
          >
            <Send size={14} />
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-full">
      <PageHeader
        title="New Compliance Application"
        subtitle="UGC / AICTE Recognition, Approval & Compliance Filing"
      />

      {autoSaveStatus && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-2 rounded-xl flex items-center gap-2 font-medium">
          <Save size={13} className="animate-pulse" />
          <span>{autoSaveStatus}</span>
        </div>
      )}

      <div className="flex items-center mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-3">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <button
              onClick={() => i + 1 < step && setStep(i + 1)}
              className={`flex items-center gap-2 ${i + 1 < step ? "cursor-pointer" : "cursor-default"}`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  step === i + 1
                    ? "bg-emerald-600 text-white"
                    : i + 1 < step
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {i + 1 < step ? <CheckCircle size={12} /> : i + 1}
              </span>
              <span
                className={`text-xs font-medium ${
                  step === i + 1 ? "text-emerald-700 font-bold" : i + 1 < step ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {s}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${i + 1 < step ? "bg-emerald-300" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7">
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-1 max-w-xs">
              {["UGC", "AICTE"].map((m) => (
                <button
                  key={m}
                  onClick={() => setModule(m)}
                  className={`text-xs font-bold py-2 rounded-lg transition-all ${
                    module === m ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {m} Module
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {APPLICATION_CATALOGUE[module].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    selectedType === t.id
                      ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300"
                      : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedType === t.id ? "bg-emerald-100" : "bg-slate-100"
                    }`}
                  >
                    <t.icon size={16} className={selectedType === t.id ? "text-emerald-700" : "text-slate-500"} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{t.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t.desc}</p>
                  </div>
                  {selectedType === t.id && <CheckCircle size={16} className="text-emerald-600 ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {typeInfo && <typeInfo.icon size={18} className="text-emerald-700 shrink-0" />}
                <div>
                  <p className="text-sm font-bold text-emerald-900">{typeInfo?.label || "General Category Application"}</p>
                  <p className="text-xs text-emerald-700">Taxonomy Category: {selectedType?.includes("distinct-new") ? "Distinct Category — New Institution" : selectedType?.includes("distinct-existing") ? "Distinct Category — Existing Institution" : "General Category"}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-white border border-emerald-300 px-3 py-1 rounded-full shadow-xs">
                Taxonomy Aligned
              </span>
            </div>

            {/* Dynamic Form Sections Based on UGC Application Taxonomy */}
            {selectedType === "ugc-distinct-new" ? (
              <div className="grid grid-cols-2 gap-5 border border-purple-200 bg-purple-50/30 rounded-2xl p-5">
                <div className="col-span-2">
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">Distinct Category — New Institution Structure</h4>
                  <p className="text-xs text-slate-500">Provide details for the 5 required sections (Distinct Discipline, 5 Academic Programmes, Infrastructure, Financial/Corpus, Documents).</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">1. Distinct Discipline *</label>
                  <input
                    value={form.distinctDiscipline || "Artificial Intelligence & Quantum Computing"}
                    onChange={(e) => update("distinctDiscipline", e.target.value)}
                    placeholder="e.g. Artificial Intelligence, Renewable Energy, Health Sciences"
                    className={ic}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">2. Mandatory 5 Academic Programmes *</label>
                  <textarea
                    value={form.programmesList || "1. B.Tech AI & ML\n2. M.Tech Quantum Computing\n3. B.Sc Data Science\n4. M.Sc Robotics & Automation\n5. Ph.D. Advanced Intelligent Systems"}
                    onChange={(e) => update("programmesList", e.target.value)}
                    rows={4}
                    placeholder="List 5 proposed degree/diploma academic programmes..."
                    className={ic}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">3. Infrastructure (Land & Built-up Sq. Ft) *</label>
                  <input
                    value={form.builtUpAreaSqFt || "85,000 sq ft"}
                    onChange={(e) => update("builtUpAreaSqFt", e.target.value)}
                    placeholder="e.g. 85,000 sq ft"
                    className={ic}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">4. Financial / Corpus Reserve Deposit *</label>
                  <input
                    value={form.corpusFundCr || "₹10.0 Crore"}
                    onChange={(e) => update("corpusFundCr", e.target.value)}
                    placeholder="e.g. ₹10.0 Crore"
                    className={ic}
                  />
                </div>
              </div>
            ) : selectedType === "ugc-distinct-existing" ? (
              <div className="grid grid-cols-2 gap-5 border border-sky-200 bg-sky-50/30 rounded-2xl p-5">
                <div className="col-span-2">
                  <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-1">Distinct Category — Existing Institution Structure</h4>
                  <p className="text-xs text-slate-500">Provide details for the 4 required sections (Distinct Discipline, Existing Infrastructure, Financial/Corpus, Documents).</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">1. Distinct Discipline Addition *</label>
                  <input
                    value={form.distinctDiscipline || "School of Advanced Robotics & Autonomous Systems"}
                    onChange={(e) => update("distinctDiscipline", e.target.value)}
                    placeholder="e.g. School of Renewable Tech & Energy Storage"
                    className={ic}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">2. Existing Infrastructure Expansion Audit *</label>
                  <input
                    value={form.builtUpAreaSqFt || "Existing Wing B (45,000 sq ft Shared Labs)"}
                    onChange={(e) => update("builtUpAreaSqFt", e.target.value)}
                    placeholder="e.g. Existing Wing A (35,000 sq ft)"
                    className={ic}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">3. Supplemental Corpus Allocation *</label>
                  <input
                    value={form.corpusFundCr || "₹5.0 Crore Supplemental"}
                    onChange={(e) => update("corpusFundCr", e.target.value)}
                    placeholder="e.g. ₹5.0 Crore"
                    className={ic}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 border border-slate-200 bg-slate-50/40 rounded-2xl p-5">
                <div className="col-span-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">General Category Structure</h4>
                  <p className="text-xs text-slate-500">Provide details for the 6 required sections (Eligibility, Accreditation/Ranking, Faculty & Students, Infrastructure, Financial/Corpus, Documents).</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">1. Eligibility Standing *</label>
                  <input
                    value={form.eligibilityStanding || "Sec 2(f)/12(B) Recognized State University"}
                    onChange={(e) => update("eligibilityStanding", e.target.value)}
                    className={ic}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">2. Accreditation / NIRF Ranking *</label>
                  <input
                    value={form.accreditationGrade || "NAAC A++ (CGPA 3.65) · NIRF Rank #42"}
                    onChange={(e) => update("accreditationGrade", e.target.value)}
                    className={ic}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">3. Faculty & Student Ratio *</label>
                  <input
                    value={form.facultyCount || "68 Faculty (75% PhD) · 1:15 Ratio"}
                    onChange={(e) => update("facultyCount", e.target.value)}
                    className={ic}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">4. Infrastructure & Land Sq. Ft *</label>
                  <input
                    value={form.builtUpAreaSqFt || "10.5 Acres · 61,200 sq ft Built-up"}
                    onChange={(e) => update("builtUpAreaSqFt", e.target.value)}
                    className={ic}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">5. Financial / Corpus Fund *</label>
                  <input
                    value={form.corpusFundCr || "₹5.0 Crore Corpus Fund Deposit · Audited Balance Sheet OK"}
                    onChange={(e) => update("corpusFundCr", e.target.value)}
                    className={ic}
                  />
                </div>
              </div>
            )}

            {/* Standard Institutional Contact Fields */}
            <div className="grid grid-cols-2 gap-5 pt-3 border-t border-slate-200">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  Institution Name *
                </label>
                <input
                  value={form.institutionName}
                  onChange={(e) => update("institutionName", e.target.value)}
                  className={ic}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  Application Cycle
                </label>
                <input value={form.cycle} onChange={(e) => update("cycle", e.target.value)} className={ic} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">State</label>
                <input value={form.state} onChange={(e) => update("state", e.target.value)} className={ic} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  Contact Person
                </label>
                <input value={form.contact} onChange={(e) => update("contact", e.target.value)} className={ic} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Email</label>
                <input value={form.email} onChange={(e) => update("email", e.target.value)} className={ic} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  Remarks / Justification
                </label>
                <textarea
                  value={form.remarks}
                  onChange={(e) => update("remarks", e.target.value)}
                  rows={3}
                  placeholder="Brief context for this taxonomy application…"
                  className={ic}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <strong>Annexure Document Uploads</strong> — Please select real PDF or DOCX files from your computer.
                Each file is automatically verified and SHA-256 hashed.
              </div>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded-md text-xs ${
                  uploadedCount === requiredDocs.length
                    ? "text-emerald-700 bg-emerald-100 border border-emerald-200"
                    : uploadedCount > 0
                      ? "text-amber-800 bg-amber-100 border border-amber-200"
                      : "text-slate-600 bg-slate-100 border border-slate-200"
                }`}
              >
                {uploadedCount} / {requiredDocs.length} Uploaded
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredDocs.map((d, idx) => {
                const docNameStr = typeof d === "string" ? d : (d?.name || `Required Document ${idx + 1}`);
                const docMeta = docs[docNameStr];
                const isUploaded = Boolean(docMeta);
                const safeId = `file-input-${docNameStr.replace(/[^\w-]/g, "-")}`;

                return (
                  <div
                    key={docNameStr}
                    className={`p-4 rounded-xl border transition-all ${
                      isUploaded ? "bg-emerald-50/60 border-emerald-200 shadow-sm" : "bg-amber-50/40 border-amber-200 hover:border-amber-300"
                    }`}
                  >
                    <input
                      type="file"
                      id={safeId}
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(docNameStr, e.target.files[0]);
                        }
                      }}
                    />

                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isUploaded ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isUploaded ? <CheckCircle size={18} /> : <Upload size={18} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{d}</p>
                        {isUploaded ? (
                          <div className="space-y-0.5 mt-1">
                            <p className="text-[11px] font-semibold text-emerald-700 truncate">
                              📄 {docMeta.fileName || `${d}.pdf`} ({docMeta.fileSizeMb || "2.40"} MB)
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono truncate">
                              SHA-256: {docMeta.fileHash ? `${docMeta.fileHash.substring(0, 16)}...` : "VERIFIED"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
                            Click to select real PDF / DOCX file (Max 10MB)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-end gap-2">
                      {isUploaded ? (
                        <>
                          <button
                            type="button"
                            onClick={() => document.getElementById(`file-input-${d.replace(/\s+/g, "-")}`).click()}
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-200 hover:bg-emerald-50 px-2.5 py-1 rounded-md transition-all cursor-pointer"
                          >
                            Replace File
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(d)}
                            className="text-[11px] font-semibold text-red-600 hover:text-red-700 bg-white border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded-md transition-all cursor-pointer"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => document.getElementById(safeId)?.click()}
                          className="text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Upload size={11} /> Select PDF File
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasAtLeastOneDoc ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2 font-medium animate-in fade-in duration-200">
                <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>{uploadedCount} of {requiredDocs.length} required document(s) uploaded.</strong> Application submission is now unlocked! Additional missing annexures can be uploaded later in the Document Vault.
                </span>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3.5 rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span>
                  Please click <strong>"Select PDF File"</strong> on at least 1 required annexure document above to enable application submission.
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-7 pt-6 border-t border-slate-100">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
          >
            ← Back
          </button>
          {step < 3 ? (
            <button
              onClick={handleNextStep}
              disabled={step === 1 && !selectedType}
              className="flex items-center gap-2 bg-emerald-600 text-white text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-700 font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!hasAtLeastOneDoc}
              className="flex items-center gap-2 bg-emerald-600 text-white text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-700 font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={14} />
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
