import { useState, useEffect } from "react";
import { FileText, CheckCircle, AlertCircle, PlusCircle, Sparkles, FileCheck, Layers, Upload, ArrowRight, ShieldCheck, Edit3, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CHECKLIST_ITEMS } from "../../data";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../shared/StatusBadge";

function filterActiveApps(appList) {
  if (!Array.isArray(appList)) return [];
  let declinedIds = [];
  try {
    const savedDeclined = localStorage.getItem("ugc_declined_app_ids");
    if (savedDeclined) declinedIds = JSON.parse(savedDeclined);
  } catch (e) {}

  return appList.filter((app) => {
    if (!app || !app.id) return false;
    if (declinedIds.includes(app.id)) return false;
    const status = (app.status || "").toLowerCase();
    if (status.includes("rejected") || status.includes("declined")) return false;
    return true;
  });
}

export default function InstDashboard({ myApplications = [] }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load active drafts saved for this institution
  const [draftsMap, setDraftsMap] = useState(() => {
    try {
      const saved = localStorage.getItem("ugc_institution_drafts");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const handleEditDraft = (draftId) => {
    try {
      localStorage.setItem("ugc_active_edit_draft_id", draftId);
    } catch (e) {}
    navigate("/institution/submit");
  };

  const handleDeleteDraft = (draftId) => {
    try {
      const saved = localStorage.getItem("ugc_institution_drafts");
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed[draftId];
        localStorage.setItem("ugc_institution_drafts", JSON.stringify(parsed));
        setDraftsMap(parsed);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const syncDrafts = () => {
      try {
        const saved = localStorage.getItem("ugc_institution_drafts");
        if (saved) setDraftsMap(JSON.parse(saved));
        else setDraftsMap({});
      } catch (e) {}
    };
    window.addEventListener("ugc_drafts_updated", syncDrafts);
    return () => window.removeEventListener("ugc_drafts_updated", syncDrafts);
  }, []);

  // Dynamic Applications list loaded from localStorage
  const [appsList, setAppsList] = useState(() => {
    if (user?.email) {
      try {
        const savedMy = localStorage.getItem(`ugc_user_my_apps_${user.email}`);
        if (savedMy) {
          const parsed = JSON.parse(savedMy);
          if (Array.isArray(parsed)) return filterActiveApps(parsed);
        }
      } catch (e) {}
    }
    return filterActiveApps(myApplications);
  });

  const displayApps = filterActiveApps(appsList.length > 0 ? appsList : myApplications);

  // Filter out APPROVED applications (approved applications are excluded from needed annexure action lists)
  const pendingApps = displayApps.filter((a) => a.status !== "Approved");
  const approvedAppsCount = displayApps.filter((a) => a.status === "Approved").length;
  const activeApp = pendingApps.length > 0 ? pendingApps[0] : (displayApps.length > 0 ? displayApps[0] : { id: "UGC-2025-14811" });

  // Aggregate ALL needed/missing annexures across ALL pending applications!
  const [neededAnnexuresList, setNeededAnnexuresList] = useState([]);
  const [completedAnnexuresCount, setCompletedAnnexuresCount] = useState(0);
  const [totalRequiredAnnexuresCount, setTotalRequiredAnnexuresCount] = useState(0);

  const calculateNeededAnnexures = () => {
    const neededList = [];
    let totalCompleted = 0;
    let totalRequired = 0;

    const appsToEvaluate = pendingApps.length > 0 ? pendingApps : displayApps;

    appsToEvaluate.forEach((app) => {
      let appChecklist = CHECKLIST_ITEMS;
      try {
        const saved = localStorage.getItem(`ugc_vault_items_${app.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) appChecklist = parsed;
        } else {
          const savedGlobal = localStorage.getItem("ugc_doc_vault_items");
          if (savedGlobal) {
            const parsed = JSON.parse(savedGlobal);
            if (Array.isArray(parsed) && parsed.length > 0) appChecklist = parsed;
          }
        }
      } catch (e) {}

      totalRequired += appChecklist.length;

      appChecklist.forEach((item) => {
        if (item.done) {
          totalCompleted += 1;
        } else {
          neededList.push({
            appId: app.id,
            appName: app.name || "Application Filing",
            appType: app.type || "Engineering",
            item: item.name || item.item,
            itemId: item.id,
          });
        }
      });
    });

    setNeededAnnexuresList(neededList);
    setCompletedAnnexuresCount(totalCompleted);
    setTotalRequiredAnnexuresCount(totalRequired);
  };

  // Sync state across storage events and updates
  useEffect(() => {
    const handleSync = () => {
      try {
        if (user?.email) {
          const savedMyApps = localStorage.getItem(`ugc_user_my_apps_${user.email}`);
          if (savedMyApps) {
            const parsed = JSON.parse(savedMyApps);
            if (Array.isArray(parsed) && parsed.length > 0) setAppsList(parsed);
          }
        }
      } catch (e) {}

      calculateNeededAnnexures();
    };

    handleSync();

    window.addEventListener("storage", handleSync);
    window.addEventListener("ugc_application_promoted", handleSync);
    window.addEventListener("ugc_notification_added", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("ugc_application_promoted", handleSync);
      window.removeEventListener("ugc_notification_added", handleSync);
    };
  }, [user?.email, appsList.length]);

  const instName = user?.institutionName || "Your Institution";
  const contactName = user?.fullName || "Representative";

  return (
    <div className="p-6 space-y-5 min-h-full">
      {/* Top Banner Card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#065F46,#10B981)" }}>
        <div className="px-7 py-5 flex items-center justify-between">
          <div>
            <p className="text-emerald-200 text-xs font-semibold mb-1">Welcome back, {contactName}</p>
            <h2 className="text-xl font-black text-white">{instName}</h2>
            <p className="text-emerald-200 text-sm mt-0.5">
              {user?.email || "registrar@institution.ac.in"} · Verified Active Account
            </p>
          </div>
          <div className="text-right">
            <p className="text-emerald-200 text-xs mb-1">Pending Application Oversight</p>
            <p className="font-mono text-white font-bold text-lg">
              {activeApp ? activeApp.id : "None"}
            </p>
            <StatusBadge status={activeApp ? activeApp.status || "New" : "No Active Application"} />
          </div>
        </div>
      </div>

      {/* Dynamic Summary Cards for Pending Applications */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{displayApps.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Applications Filed ({pendingApps.length} Active / {approvedAppsCount} Approved)
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {completedAnnexuresCount}/{totalRequiredAnnexuresCount || 8}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Annexures Completed (Active Applications)</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{neededAnnexuresList.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Needed Annexures (Excludes Approved)</p>
          </div>
        </div>
      </div>

      {/* Institution Application Drafts Section (Editable) */}
      {Object.keys(draftsMap).length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 size={16} className="text-amber-700" />
              <h3 className="text-sm font-bold text-slate-900">Application Drafts (In Progress — Editable)</h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full font-mono">
              {Object.keys(draftsMap).length} Draft(s) Stored
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(draftsMap).map((d) => (
              <div key={d.id} className="bg-white border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">{d.id}</span>
                    <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-100 px-2 py-0.5 rounded-md">Draft</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1">{d.institutionName || "Draft Application"}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Last saved: {d.updatedAt || "Recently"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditDraft(d.id)}
                    className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                  >
                    <Edit3 size={12} /> Edit Draft
                  </button>
                  <button
                    onClick={() => handleDeleteDraft(d.id)}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all cursor-pointer"
                    title="Delete Draft"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Application History */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application History</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {pendingApps.length} active application(s) awaiting completion
              </p>
            </div>
            <button
              onClick={() => navigate("/institution/submit")}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle size={13} />
              New Application
            </button>
          </div>
          <div className="space-y-3">
            {displayApps.length > 0 ? (
              displayApps.map((a, idx) => {
                const isApproved = a.status === "Approved";
                const isSelected = a.id === activeApp.id;

                return (
                  <div
                    key={a.id ? `my-app-${a.id}` : `my-app-idx-${idx}`}
                    className={`flex items-center justify-between p-3.5 rounded-xl border ${
                      isApproved
                        ? "bg-emerald-50/30 border-emerald-200/80"
                        : isSelected
                          ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-500/20"
                          : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs font-bold text-slate-800">{a.id}</p>
                        {isApproved ? (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                            <CheckCircle size={10} /> Fully Approved
                          </span>
                        ) : isSelected ? (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                            <Sparkles size={10} /> Active Filing
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Cycle {a.cycle || "2025–26"} · Submitted {a.submitted || "2026-08-12"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {a.stage || (isApproved ? "Approved & Granted" : "Document Verification")} · {a.daysElapsed || 0} days
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={a.status || "New"} />
                      <p className="font-mono text-xs font-bold text-emerald-700 mt-1.5">
                        NLP: {a.nlpScore || (isApproved ? 100 : 85)}/100
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <FileText size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No Applications Filed Yet</p>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">
                  Start your digitized compliance recognition filing for cycle 2025–26.
                </p>
                <button
                  onClick={() => navigate("/institution/submit")}
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  File First Application
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Needed Annexures List across ALL Pending Applications */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Needed Annexures List
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                  {neededAnnexuresList.length} Needed
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregated across pending applications (Excludes {approvedAppsCount} approved)
              </p>
            </div>

            <button
              onClick={() => navigate("/institution/vault")}
              className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer"
            >
              <Layers size={13} /> Open Vault
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {neededAnnexuresList.length > 0 ? (
              neededAnnexuresList.map((annex, idx) => (
                <div
                  key={`${annex.appId}-${annex.itemId}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-amber-200/70 bg-amber-50/30 hover:bg-amber-50/80 transition-colors text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                        {annex.appId}
                      </span>
                      <span className="font-bold text-slate-800 truncate">{annex.item}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Required for {annex.appName} ({annex.appType}) · Format: PDF/DOCX
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/institution/vault")}
                    className="text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                  >
                    <Upload size={12} /> Upload in Vault
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 px-4 border border-dashed border-emerald-200 rounded-xl bg-emerald-50/30">
                <CheckCircle size={24} className="mx-auto text-emerald-600 mb-2" />
                <p className="text-xs font-bold text-emerald-900">All Annexures Uploaded & Verified!</p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  No missing annexures pending across active filings. Approved applications are completed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
