import { useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Brain,
  FolderOpen,
  Building2,
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
import InstDashboard from "./InstDashboard";
import InstSubmit from "./InstSubmit";
import InstSelfAssessment from "./InstSelfAssessment";
import InstDocVault from "./InstDocVault";

const INST_NAV = [
  { id: "dashboard", label: "My Dashboard", icon: LayoutDashboard },
  { id: "submit", label: "New Application", icon: ClipboardList },
  { id: "assess", label: "Self-Assessment", icon: Brain },
  { id: "vault", label: "Document Vault", icon: FolderOpen },
];

const VALID_VIEWS = new Set([
  ...INST_NAV.map((n) => n.id),
  "profile",
  "notifications",
]);

export default function InstitutionApp({ myApplications, onSubmitApplication }) {
  const { view } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const gradient = "linear-gradient(135deg,#0B2953,#123B6B)";

  if (!VALID_VIEWS.has(view)) {
    return <Navigate to="/institution/dashboard" replace />;
  }

  const instName = user?.institutionName || user?.fullName || "Institution Portal";

  const views = {
    dashboard: <InstDashboard myApplications={myApplications} />,
    submit: <InstSubmit onSubmitApplication={onSubmitApplication} />,
    assess: <InstSelfAssessment />,
    vault: <InstDocVault />,
    profile: <ProfilePage portal="institution" />,
    notifications: <NotificationsPage portal="institution" />,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <GovHeader ministry="Institution Portal · University Grants Commission" portalTag={instName} />
      <div className="flex flex-1 bg-background overflow-hidden">
        <aside
          className={`shrink-0 border-r border-slate-200 bg-white flex flex-col shadow-sm transition-all duration-300 ease-in-out overflow-hidden ${
            sidebarOpen ? "w-56" : "w-16"
          }`}
        >
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2 px-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                  <Building2 size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{instName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {user?.email ? user.email.split("@")[0] : "INST-2024-048"}
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
            {INST_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/institution/${item.id}`)}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full flex items-center transition-all font-semibold ${
                  sidebarOpen ? "gap-3 px-3 py-2.5 rounded-xl text-left" : "justify-center px-0 py-2.5 rounded-xl"
                } ${
                  view === item.id
                    ? "bg-emerald-50 text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon
                  size={16}
                  className={`shrink-0 ${view === item.id ? "text-emerald-600" : "text-slate-400"}`}
                />
                {sidebarOpen && (
                  <>
                    <span className="text-[13px]">{item.label}</span>
                    {view === item.id && <div className="ml-auto w-1 h-4 rounded-full bg-emerald-500 shrink-0" />}
                  </>
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
            onProfile={() => navigate("/institution/profile")}
            onNotifications={() => navigate("/institution/notifications")}
            unread={NOTIFICATIONS.institution.filter((n) => n.unread).length}
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
