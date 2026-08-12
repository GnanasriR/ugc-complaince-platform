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
import AiAssistantModal from "../shared/AiAssistantModal";
import { NOTIFICATIONS } from "../../data";
import { useAuth } from "../../context/AuthContext";
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
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const gradient = "linear-gradient(135deg,#061A33,#0B2953)";

  if (!VALID_VIEWS.has(view)) {
    return <Navigate to="/ugc/dashboard" replace />;
  }

  const officerName = user?.fullName || "UGC Officer";

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
    <div className="flex flex-col h-screen overflow-hidden relative">
      <GovHeader ministry="Regulatory Portal · University Grants Commission" portalTag={`Officer: ${officerName}`} />
      <div className="flex flex-1 bg-background overflow-hidden">
        <aside
          className={`shrink-0 border-r border-slate-200 bg-white flex flex-col shadow-sm transition-all duration-300 ease-in-out overflow-hidden ${
            sidebarOpen ? "w-56" : "w-16"
          }`}
        >
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2 px-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                  <Shield size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{officerName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {user?.role === "ROLE_EVALUATOR" ? "Expert Evaluator" : "Senior Reviewer"}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mx-auto"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
            </button>
          </div>
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {UGC_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/ugc/${item.id}`)}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full flex items-center transition-all font-semibold relative ${
                  sidebarOpen ? "gap-3 px-3 py-2.5 rounded-xl text-left" : "justify-center px-0 py-2.5 rounded-xl"
                } ${
                  view === item.id
                    ? "bg-emerald-50 text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon
                  size={16}
                  className={`shrink-0 ${view === item.id ? "text-emerald-700" : "text-slate-400"}`}
                />
                {sidebarOpen && (
                  <>
                    <span className="text-[13px]">{item.label}</span>
                    {item.id === "anomaly" && (
                      <span className="ml-auto bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">
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

      {/* Floating AI Assistant */}
      <AiAssistantModal />
    </div>
  );
}
