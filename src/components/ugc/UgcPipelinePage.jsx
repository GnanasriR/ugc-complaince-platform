import { useState, useEffect } from "react";
import {
  Workflow,
  FileCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Filter,
  Search,
  Building2,
  FileText,
  ShieldCheck,
  RefreshCw,
  Bell,
  Send,
  UserCheck,
  XCircle,
  Lock,
  Eye,
  CheckSquare,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import PageHeader from "../shared/PageHeader";
import StatusBadge from "../shared/StatusBadge";
import MiniBar from "../shared/MiniBar";
import { addNotification } from "../../utils/notifications";

const PIPELINE_STAGES = [
  {
    id: "stage-1",
    key: "Document Verification",
    label: "1. Document Verification",
    icon: FileText,
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    nextKey: "AI & NLP Analysis",
    nextStatus: "Re-evaluated (AI Verified)",
    allowedRole: "evaluator",
    roleLabel: "Regulatory Evaluator",
  },
  {
    id: "stage-2",
    key: "AI & NLP Analysis",
    label: "2. AI & NLP Analysis",
    icon: Sparkles,
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    nextKey: "Committee Review",
    nextStatus: "Committee Review",
    allowedRole: "evaluator",
    roleLabel: "Regulatory Evaluator",
  },
  {
    id: "stage-3",
    key: "Discrepancy Flagged",
    label: "3. Discrepancy Flagged",
    icon: AlertTriangle,
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    nextKey: "AI & NLP Analysis",
    nextStatus: "Re-evaluated (AI Verified)",
    allowedRole: "evaluator",
    roleLabel: "Regulatory Evaluator",
  },
  {
    id: "stage-4",
    key: "Committee Review",
    label: "4. Committee Review & Offline Inspection",
    icon: Workflow,
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
    nextKey: "Approved & Granted",
    nextStatus: "Approved",
    allowedRole: "expert_admin",
    roleLabel: "Expert Committee Admin",
  },
  {
    id: "stage-5",
    key: "Approved & Granted",
    label: "5. Approved & Granted (Manager Final Sign-off)",
    icon: CheckCircle2,
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    nextKey: null,
    nextStatus: null,
    allowedRole: "manager",
    roleLabel: "Regulatory Manager",
  },
];

function getStageForApp(app) {
  const status = (app.status || "").toLowerCase();
  if (status.includes("rejected") || status.includes("declined")) return "Declined / Rejected";
  if (status.includes("approved") || status.includes("granted")) return "Approved & Granted";
  if (status.includes("flagged") || status.includes("escalated") || status.includes("discrepancy")) return "Discrepancy Flagged";
  if (status.includes("committee") || status.includes("pending grant")) return "Committee Review";
  if (status.includes("re-evaluated") || status.includes("ai verified") || status.includes("under review")) return "AI & NLP Analysis";
  return "Document Verification";
}

// Compute official role strictly from logged-in user profile
function determineUserRole(user) {
  if (user) {
    if (user.officialRole) return user.officialRole;
    const email = (user.email || "").toLowerCase();
    if (email.includes("expert") || email.includes("committee")) return "expert_admin";
    if (email.includes("manager") || email.includes("head") || email.includes("director")) return "manager";
  }
  return "evaluator";
}

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
    if (status === "draft" || status.includes("draft")) return false;
    if (status.includes("rejected") || status.includes("declined")) return false;
    return true;
  });
}

export default function UgcPipelinePage({ applications = [] }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Official Role determined strictly from logged-in user context
  const officialRole = determineUserRole(user);

  const [appsList, setAppsList] = useState(() => {
    try {
      const saved = localStorage.getItem("ugc_all_apps");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return filterActiveApps(parsed);
      }
    } catch (e) {}
    return filterActiveApps(applications);
  });

  const [activeStageFilter, setActiveStageFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [bodyFilter, setBodyFilter] = useState("ALL");
  const [intimationToast, setIntimationToast] = useState("");

  // Decline Modal State
  const [declineModalApp, setDeclineModalApp] = useState(null);
  const [declineCategory, setDeclineCategory] = useState("Regulatory Norm Non-compliance");
  const [declineRemarks, setDeclineRemarks] = useState("");

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("ugc_all_apps");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setAppsList(filterActiveApps(parsed));
        }
      } catch (e) {}
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("ugc_application_promoted", handleSync);
    window.addEventListener("ugc_notification_added", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("ugc_application_promoted", handleSync);
      window.removeEventListener("ugc_notification_added", handleSync);
    };
  }, []);

  // Update application stage & intimate evaluators
  const handleIntimateAndAdvanceStage = (app, targetStageConfig) => {
    const { nextStatus, nextKey } = targetStageConfig;
    if (!nextStatus || !nextKey) return;

    const currentStage = getStageForApp(app);
    const roleTitle =
      officialRole === "evaluator"
        ? "Regulatory Evaluator"
        : officialRole === "expert_admin"
          ? "Expert Committee Admin"
          : "Regulatory Manager";

    const updatedApps = appsList.map((a) =>
      a.id === app.id
        ? {
            ...a,
            status: nextStatus,
            stage: nextKey,
            updatedAt: new Date().toLocaleTimeString(),
            isTopPriority: true,
            evaluatorIntimated: true,
            intimatedByRole: officialRole,
            intimatedAt: new Date().toLocaleTimeString(),
          }
        : a
    );

    setAppsList(updatedApps);
    try {
      localStorage.setItem("ugc_all_apps", JSON.stringify(updatedApps));
    } catch (e) {}

    // Dispatch Intimation Notice to UGC Feed
    addNotification("ugc", {
      title: `⚡ ${roleTitle} Advanced Stage for ${app.id}`,
      desc: `Application ${app.id} (${app.name}) passed '${currentStage}' and was promoted to '${nextKey}' (${nextStatus}) by logged-in ${roleTitle}.`,
      tone: "bg-emerald-100 text-emerald-800",
      iconName: "Send",
    });

    // Dispatch Notice to Institution Feed
    addNotification("institution", {
      title: `Application Advanced to ${nextKey}`,
      desc: `${roleTitle} verified '${currentStage}' for ${app.id}. Application advanced to '${nextKey}'.`,
      tone: "bg-blue-100 text-blue-800",
      iconName: "CheckCircle2",
    });

    setIntimationToast(`⚡ Application ${app.id} passed '${currentStage}' and advanced to '${nextKey}' by ${roleTitle}.`);
    setTimeout(() => setIntimationToast(""), 4500);

    window.dispatchEvent(new CustomEvent("ugc_application_promoted"));
  };

  // Decline Application Handler — Permanently removes application from UI & localStorage
  const handleConfirmDecline = () => {
    if (!declineModalApp) return;

    const roleTitle =
      officialRole === "evaluator"
        ? "Regulatory Evaluator"
        : officialRole === "expert_admin"
          ? "Expert Committee Admin"
          : "Regulatory Manager";

    const currentStage = getStageForApp(declineModalApp);

    // Save application ID to persistent declined set in localStorage
    try {
      const savedDeclined = localStorage.getItem("ugc_declined_app_ids");
      const declinedIds = savedDeclined ? JSON.parse(savedDeclined) : [];
      if (!declinedIds.includes(declineModalApp.id)) {
        declinedIds.push(declineModalApp.id);
        localStorage.setItem("ugc_declined_app_ids", JSON.stringify(declinedIds));
      }
    } catch (e) {}

    // Filter out declined application completely from active apps
    const updatedApps = appsList.filter((a) => a.id !== declineModalApp.id);
    setAppsList(updatedApps);
    try {
      localStorage.setItem("ugc_all_apps", JSON.stringify(updatedApps));
    } catch (e) {}

    // Dispatch Decline Notice to Institution Dashboard
    addNotification("institution", {
      title: `❌ Application Declined by ${roleTitle}`,
      desc: `Application ${declineModalApp.id} was declined at stage '${currentStage}' by ${roleTitle}. Ground: ${declineCategory}. Remarks: "${declineRemarks || "Does not meet regulatory benchmarks"}"`,
      tone: "bg-red-100 text-red-800",
      iconName: "XCircle",
    });

    // Dispatch Notice to UGC Feed
    addNotification("ugc", {
      title: `Application Declined at Stage ${currentStage}`,
      desc: `${roleTitle} manually declined application ${declineModalApp.id}. Ground: ${declineCategory}.`,
      tone: "bg-red-100 text-red-800",
      iconName: "AlertTriangle",
    });

    setIntimationToast(`❌ Application ${declineModalApp.id} declined by ${roleTitle}. Notice sent to institution.`);
    setTimeout(() => setIntimationToast(""), 5000);

    setDeclineModalApp(null);
    setDeclineRemarks("");
    window.dispatchEvent(new CustomEvent("ugc_application_promoted"));
  };

  // Filter applications by search, body, and stage
  const filteredApps = appsList.filter((app) => {
    const matchesSearch =
      (app.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.state || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBody =
      bodyFilter === "ALL"
        ? true
        : bodyFilter === "UGC"
          ? (app.id || "").startsWith("UGC")
          : (app.id || "").startsWith("AICTE");

    const stage = getStageForApp(app);
    const matchesStage = activeStageFilter === "ALL" || stage === activeStageFilter;

    return matchesSearch && matchesBody && matchesStage;
  });

  const displayedPipelineStages = officialRole === "expert_admin"
    ? PIPELINE_STAGES.filter((stg) => stg.id === "stage-4" || stg.id === "stage-5")
    : PIPELINE_STAGES;

  return (
    <div className="p-6 space-y-6 min-h-full">
      <PageHeader
        title="Application Review Pipeline — Logged-in Official Portal"
        subtitle="Stage access control and review workflows customized automatically for your logged-in official profile."
      />

      {/* Logged-in Officer Profile Banner (No Role Switcher Dropdown) */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Logged-in Official Profile</p>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{user?.fullName || "Regulatory Official"}</span>
              <span className="text-emerald-300 font-semibold text-xs bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {officialRole === "evaluator"
                  ? "🧑‍⚖️ Regulatory Evaluator"
                  : officialRole === "expert_admin"
                    ? "🎓 Expert Committee Admin"
                    : "👔 UGC / AICTE Regulatory Manager"}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {user?.email || "officer@ugc.gov.in"} · {user?.institutionName || "UGC Compliance Cell"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl">
          <ShieldCheck size={14} />
          {officialRole === "evaluator"
            ? "Stages 1–3 Evaluation Rights Active"
            : officialRole === "expert_admin"
              ? "Stage 4 Expert Committee & Offline Verification Rights Active"
              : "Stage 5 Final Grant Sign-off Rights Active"}
        </div>
      </div>

      {/* Intimation Toast Alert */}
      {intimationToast && (
        <div className="bg-emerald-900 border border-emerald-700 text-white text-xs px-5 py-3 rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Bell size={16} className="text-emerald-400 animate-bounce shrink-0" />
            <span className="font-semibold font-mono">{intimationToast}</span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-800 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-600">
            Intimation Dispatched
          </span>
        </div>
      )}

      {/* Search & Filter Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Institution, ID, or State…"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500 shrink-0" />
            <select
              value={bodyFilter}
              onChange={(e) => setBodyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Regulatory Bodies</option>
              <option value="UGC">UGC Applications</option>
              <option value="AICTE">AICTE Applications</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            {filteredApps.length} Application(s) Shown
          </span>
        </div>
      </div>

      {/* Stage Summary Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveStageFilter("ALL")}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeStageFilter === "ALL"
              ? "bg-slate-900 text-white border-slate-800 shadow-md ring-2 ring-slate-700/30"
              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
          }`}
        >
          <p className="text-[11px] font-bold opacity-80 uppercase tracking-wider">All Stages</p>
          <p className="text-2xl font-black font-mono mt-1">{appsList.length}</p>
        </button>

        {displayedPipelineStages.map((stg) => {
          const count = appsList.filter((a) => getStageForApp(a) === stg.key).length;
          const isActive = activeStageFilter === stg.key;

          return (
            <button
              key={stg.id}
              onClick={() => setActiveStageFilter(stg.key)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-700 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <stg.icon size={15} className={isActive ? "text-emerald-200" : stg.color} />
                <span className="font-mono text-xs font-bold">{count}</span>
              </div>
              <p className="text-xs font-bold mt-2 truncate">{stg.key}</p>
            </button>
          );
        })}
      </div>

      {/* Stage-Sorted Kanban Columns & Logged-in User Permission Cards */}
      <div className="space-y-6">
        {displayedPipelineStages.filter((stg) => activeStageFilter === "ALL" || activeStageFilter === stg.key).map((stg) => {
          const stageApps = filteredApps.filter((a) => getStageForApp(a) === stg.key);

          // Check if logged-in user has permission for this stage
          const isRoleAuthorized =
            officialRole === "expert_admin" ||
            officialRole === stg.allowedRole ||
            (officialRole === "manager" && stg.allowedRole === "expert_admin");

          return (
            <div key={stg.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-3 p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl ${stg.bg} flex items-center justify-center font-bold`}>
                    <stg.icon size={16} className={stg.color} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {stg.label}
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                        {stageApps.length} App(s)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Assigned Official Role: <strong className="text-slate-700">{stg.roleLabel}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {stageApps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                        app.status?.includes("Re-evaluated")
                          ? "bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-500/20"
                          : "bg-slate-50/60 border-slate-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                              {app.id}
                            </span>
                            {app.evaluatorIntimated && (
                              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-mono border border-emerald-300 flex items-center gap-1">
                                <Bell size={9} /> Intimated
                              </span>
                            )}
                          </div>
                          <StatusBadge status={app.status || "New"} />
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{app.name}</h4>
                        <p className="text-xs text-slate-500">{app.type} · {app.state || "Karnataka"}</p>
                      </div>

                      {/* Offline Verification Notice for Expert Committee Admins */}
                      {stg.key === "Committee Review" && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 text-xs text-purple-900 space-y-1">
                          <p className="font-bold text-[11px] flex items-center gap-1">
                            <UserCheck size={12} className="text-purple-700" /> Expert Committee Offline Inspection:
                          </p>
                          <p className="text-[10px] text-purple-700 leading-tight">
                            Committee Admin verifies land title, physical lab infrastructure, and faculty payroll offline before approval.
                          </p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-500">NLP Score:</span>
                          <span className="font-bold text-emerald-700">{app.nlpScore || 88}/100</span>
                        </div>

                        {/* Action buttons rendered strictly based on logged-in user permissions */}
                        <div className="flex flex-col gap-2 pt-1">
                          {isRoleAuthorized ? (
                            <>
                              {stg.nextKey ? (
                                <button
                                  onClick={() => handleIntimateAndAdvanceStage(app, stg)}
                                  className="w-full text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                  <Send size={13} />
                                  {officialRole === "expert_admin"
                                    ? "Grant Committee Approval & Advance"
                                    : "Intimate Evaluator & Advance Stage"}
                                  <ArrowRight size={13} />
                                </button>
                              ) : (
                                <span className="text-xs font-bold text-green-800 bg-green-100 border border-green-200 px-3 py-2 rounded-xl text-center flex items-center justify-center gap-1">
                                  <Award size={13} strokeWidth={2.5} /> Final Executive Grant Issued
                                </span>
                              )}

                              {/* Manual Decline Option for authorized officials */}
                              <button
                                onClick={() => setDeclineModalApp(app)}
                                className="w-full text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                              >
                                <XCircle size={13} /> Decline Application Manually
                              </button>
                            </>
                          ) : (
                            <div className="p-2 bg-slate-100 border border-slate-200 rounded-xl text-center text-xs text-slate-500 font-mono space-y-1">
                              <p className="font-bold text-slate-700 flex items-center justify-center gap-1">
                                <Lock size={12} /> Stage Access Restricted
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Assigned to {stg.roleLabel}. Requires logged-in {stg.roleLabel} credentials.
                              </p>
                            </div>
                          )}

                          <button
                            onClick={() => navigate(`/ugc/nlp/${app.id}`)}
                            className="w-full text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <FileText size={12} /> Inspect Stage Analysis Report
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 font-mono">
                  No applications currently in {stg.key} stage.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Decline Modal Dialog */}
      {declineModalApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle size={20} />
                <h3 className="text-sm font-bold text-slate-900">Decline Application Manually</h3>
              </div>
              <button
                onClick={() => setDeclineModalApp(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-slate-600">
                Logged-in Official:{" "}
                <strong className="text-slate-800 font-mono">
                  {user?.fullName || "Regulatory Official"} (
                  {officialRole === "evaluator"
                    ? "Evaluator"
                    : officialRole === "expert_admin"
                      ? "Expert Committee Admin"
                      : "Regulatory Manager"}
                  )
                </strong>
              </p>
              <p className="text-slate-600">
                Application: <strong className="font-mono text-slate-900">{declineModalApp.id}</strong> ({declineModalApp.name})
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Decline Category / Regulatory Ground *
                </label>
                <select
                  value={declineCategory}
                  onChange={(e) => setDeclineCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="Regulatory Norm Non-compliance">Regulatory Norm Non-compliance</option>
                  <option value="Faculty Ratio Shortfall">Faculty Ratio Shortfall</option>
                  <option value="Land Title / Building Area Discrepancy">Land Title / Building Area Discrepancy</option>
                  <option value="Failed Offline Inspection">Failed Offline Inspection (Expert Committee)</option>
                  <option value="Document Forgery / Missing Annexures">Document Forgery / Missing Annexures</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Official Remarks & Justification *
                </label>
                <textarea
                  value={declineRemarks}
                  onChange={(e) => setDeclineRemarks(e.target.value)}
                  rows={3}
                  placeholder="Provide explicit reasons for declining this application. This notice will be sent to the institution dashboard."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeclineModalApp(null)}
                className="text-xs font-semibold text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecline}
                className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <XCircle size={14} /> Confirm Decline Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
