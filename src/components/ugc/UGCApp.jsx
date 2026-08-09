import { useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  FileSearch,
  AlertTriangle,
  BarChart3,
  Shield,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import GovHeader from "../gov/GovHeader";
import Topbar from "../shared/Topbar";
import ProfilePage from "../shared/ProfilePage";
import NotificationsPage from "../shared/NotificationsPage";
import { NOTIFICATIONS } from "../../data";
import UGCDashboard from "./UGCDashboard";
import UGCPipeline from "./UGCPipeline";
import UGCNlp from "./UGCNlp";
import UGCAnomalies from "./UGCAnomalies";
import UGCReports from "./UGCReports";

const UGC_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pipeline", label: "Application Pipeline", icon: GitBranch },
  { id: "nlp", label: "NLP Analysis", icon: FileSearch },
  { id: "anomaly", label: "Anomaly Detection", icon: AlertTriangle },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

const VALID_VIEWS = new Set([
  ...UGC_NAV.map((n) => n.id),
  "profile",
  "notifications",
]);

export default function UGCApp({ applications }) {
  const { view, sub } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const gradient = "linear-gradient(135deg,#061A33,#0B2953)";

  if (!VALID_VIEWS.has(view)) {
    return <Navigate to="/ugc/dashboard" replace />;
  }

  const views = {
    dashboard: <UGCDashboard />,
    pipeline: <UGCPipeline applications={applications} />,
    nlp: <UGCNlp applications={applications} appId={view === "nlp" ? sub : undefined} />,
    anomaly: <UGCAnomalies />,
    reports: <UGCReports />,
    profile: <ProfilePage portal="ugc" />,
    notifications: <NotificationsPage portal="ugc" />,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <GovHeader ministry="Regulatory Analytics · UGC / AICTE" portalTag="Cycle 2024–25" />
      <div className="flex flex-1 bg-background overflow-hidden">
        <aside
          className={`shrink-0 border-r border-slate-200 bg-white flex flex-col shadow-sm transition-all duration-300 ease-in-out overflow-hidden ${
            sidebarOpen ? "w-56" : "w-16"
          }`}
        >
          <div className={`border-b border-slate-100 ${sidebarOpen ? "px-4 py-4" : "px-2 py-3"}`} style={{ background: gradient }}>
            <div className={`flex items-center ${sidebarOpen ? "gap-2.5 mb-3" : "justify-center mb-2"}`}>
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Shield size={15} className="text-white" />
              </div>
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-white leading-none">UGC / AICTE Portal</p>
                  <p className="text-[9px] text-emerald-200 font-mono mt-0.5">COMPLIANCE AI</p>
                </div>
              )}
              {sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  title="Collapse sidebar"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/15 hover:text-white transition-colors shrink-0"
                >
                  <PanelLeftClose size={14} />
                </button>
              )}
            </div>
            {sidebarOpen && (
              <div className="bg-white/10 rounded-lg px-3 py-2">
                <p className="text-[10px] text-emerald-200 font-mono">Regulatory Analytics</p>
                <p className="text-[10px] text-emerald-300 mt-0.5">Cycle 2024–25 · 4,812 apps</p>
              </div>
            )}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                title="Expand sidebar"
                className="w-full h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/15 hover:text-white transition-colors"
              >
                <PanelLeft size={14} />
              </button>
            )}
          </div>
          <nav className={`flex-1 py-4 space-y-0.5 ${sidebarOpen ? "px-2" : "px-1.5"}`}>
            {sidebarOpen && (
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest px-3 pb-2">
                Analytics Modules
              </p>
            )}
            {UGC_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/ugc/${item.id}`)}
                title={!sidebarOpen ? item.label : undefined}
                className={`relative w-full flex items-center rounded-xl text-left transition-all ${
                  sidebarOpen ? "gap-3 px-3 py-2.5" : "justify-center px-0 py-2.5"
                } ${
                  view === item.id
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <item.icon
                  size={14}
                  className={`shrink-0 ${view === item.id ? "text-emerald-600" : "text-slate-400"}`}
                />
                {sidebarOpen && (
                  <>
                    <span className="text-[13px]">{item.label}</span>
                    {item.id === "anomaly" && (
                      <span className="ml-auto text-[10px] bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0">
                        5
                      </span>
                    )}
                    {view === item.id && item.id !== "anomaly" && (
                      <div className="ml-auto w-1 h-4 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </>
                )}
                {!sidebarOpen && item.id === "anomaly" && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>
          <div className={`border-t border-slate-100 ${sidebarOpen ? "p-3" : "p-1.5"}`}>
            <button
              onClick={() => navigate("/")}
              title={!sidebarOpen ? "Back to Home" : undefined}
              className={`w-full flex items-center text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors font-medium ${
                sidebarOpen ? "gap-2 px-3 py-2.5" : "justify-center px-0 py-2.5"
              }`}
            >
              <ArrowLeft size={13} />
              {sidebarOpen && "Back to Home"}
            </button>
          </div>
        </aside>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar
            active={view}
            onProfile={() => navigate("/ugc/profile")}
            onNotifications={() => navigate("/ugc/notifications")}
            unread={NOTIFICATIONS.ugc.filter((n) => n.unread).length}
            gradient={gradient}
          />
          <main className="flex-1 overflow-y-auto scrollbar-none">{views[view]}</main>
        </div>
      </div>
    </div>
  );
}
