import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Workflow,
  FileSearch,
  BarChart3,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import UGCDashboard from "./UGCDashboard";
import UgcPipelinePage from "./UgcPipelinePage";
import AdminRegistrationsPage from "./AdminRegistrationsPage";
import UGCNlp from "./UGCNlp";
import UGCReports from "./UGCReports";
import UGCAnomalies from "./UGCAnomalies";
import ProfilePage from "../shared/ProfilePage";
import NotificationsPage from "../shared/NotificationsPage";
import Topbar from "../shared/Topbar";
import AiAssistantModal from "../shared/AiAssistantModal";
import { getNotifications } from "../../utils/notifications";

function determineUserRole(user) {
  if (user) {
    const email = (user.email || "").toLowerCase();
    if (email.includes("expert") || email.includes("committee")) return "expert_admin";
    if (user.officialRole) return user.officialRole;
    if (email.includes("admin") || email.includes("super")) return "admin";
    if (email.includes("manager") || email.includes("head") || email.includes("director")) return "manager";
  }
  return "evaluator";
}

export default function UGCApp({ applications = [] }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { view: routeView, sub } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active role derived directly from logged-in user profile
  const officialRole = determineUserRole(user);
  const isSystemAdmin = officialRole === "admin";
  const isExpertAdmin = officialRole === "expert_admin";

  let view = routeView || (isSystemAdmin ? "user-approvals" : "dashboard");
  if (!isSystemAdmin && view === "user-approvals") {
    view = "dashboard";
  }

  const [unreadCount, setUnreadCount] = useState(() =>
    getNotifications("ugc").filter((n) => n.unread).length
  );

  useEffect(() => {
    const handleUpdate = () => {
      setUnreadCount(getNotifications("ugc").filter((n) => n.unread).length);
    };
    window.addEventListener("ugc_notification_added", handleUpdate);
    window.addEventListener("ugc_application_promoted", handleUpdate);
    return () => {
      window.removeEventListener("ugc_notification_added", handleUpdate);
      window.removeEventListener("ugc_application_promoted", handleUpdate);
    };
  }, []);

  // Filter navigation items strictly by logged-in role
  const navItems = isSystemAdmin
    ? [
        { id: "user-approvals", label: "User Approvals", icon: UserCheck, badge: "Admin Queue" },
      ]
    : isExpertAdmin
      ? [
          { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
          { id: "pipeline", label: "Committee Final Pipeline", icon: Workflow, badge: "Final 2 Stages" },
          { id: "nlp", label: "NLP Document Analysis", icon: FileSearch },
          { id: "reports", label: "Analytics & Reports", icon: BarChart3 },
          { id: "anomaly", label: "Anomaly Brief", icon: AlertTriangle, badge: "Flagged" },
        ]
      : [
          { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
          { id: "pipeline", label: "Review Pipeline", icon: Workflow, badge: "Stages" },
          { id: "nlp", label: "NLP Document Analysis", icon: FileSearch },
          { id: "reports", label: "Analytics & Reports", icon: BarChart3 },
          { id: "anomaly", label: "Anomaly Brief", icon: AlertTriangle, badge: "Flagged" },
        ];

  const views = {
    dashboard: <UGCDashboard applications={applications} />,
    pipeline: <UgcPipelinePage applications={applications} />,
    "user-approvals": <AdminRegistrationsPage />,
    nlp: <UGCNlp applications={applications} appId={sub} />,
    reports: <UGCReports applications={applications} />,
    anomaly: <UGCAnomalies applications={applications} />,
    profile: <ProfilePage portal="ugc" />,
    notifications: <NotificationsPage portal="ugc" />,
  };

  const defaultView = isSystemAdmin ? <AdminRegistrationsPage /> : <UGCDashboard applications={applications} />;
  const activeView = views[view] || defaultView;
  const gradient = "linear-gradient(135deg, #059669 0%, #0D9488 100%)";

  return (
    <div className="flex flex-col h-screen bg-slate-100/70 text-slate-800 font-sans overflow-hidden">
      {/* Top Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-5 py-2 flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-[10px]">
            U
          </div>
          <span className="font-bold tracking-wide">UGC / AICTE Portal</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300 font-medium">
            {isSystemAdmin ? "System Administrator Portal (admin@ugc.gov.in)" : isExpertAdmin ? "Expert Evaluation & Approval Committee Portal" : "UGC Regulatory Officer Portal"}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg">
            <UserCheck size={13} className="text-emerald-400" />
            <span className="text-[11px] font-bold text-slate-300">Active Profile:</span>
            <span className="text-emerald-300 text-[11px] font-bold">
              {user?.fullName || "Regulatory Official"} (
              {isSystemAdmin
                ? "⚙️ System Admin"
                : officialRole === "evaluator"
                  ? "🧑‍⚖️ Evaluator"
                  : officialRole === "expert_admin"
                    ? "🎓 Expert Admin"
                    : "👔 Manager"}
              )
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
            <ShieldCheck size={13} strokeWidth={2.5} /> Panel Active
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-60" : "w-16"
          } bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-200 shrink-0 z-10 shadow-xs`}
        >
          <div>
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              {sidebarOpen && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs"
                    style={{ background: gradient }}
                  >
                    UG
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {isSystemAdmin ? "Admin Portal" : isExpertAdmin ? "Expert Committee" : "UGC Portal"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {isSystemAdmin ? "User Approvals Desk" : isExpertAdmin ? "Final 2 Stages Desk" : "Officer Review System"}
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-auto cursor-pointer"
              >
                {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
              </button>
            </div>

            <nav className="p-2 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/ugc/${item.id}`)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                      active
                        ? "bg-emerald-50 text-emerald-700 font-bold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    } ${!sidebarOpen ? "justify-center px-0" : ""}`}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon size={16} className={active ? "text-emerald-700" : "text-slate-400"} />
                    {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
                    {sidebarOpen && item.badge && (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono border border-emerald-300">
                        {item.badge}
                      </span>
                    )}
                    {!sidebarOpen && item.id === "user-approvals" && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-2 border-t border-slate-100 space-y-0.5">
            <button
              onClick={() => navigate("/")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer ${
                !sidebarOpen ? "justify-center px-0" : ""
              }`}
            >
              <ArrowLeft size={15} />
              {sidebarOpen && "Back to Home"}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar
            active={view}
            onProfile={() => navigate("/ugc/profile")}
            onNotifications={() => navigate("/ugc/notifications")}
            unread={unreadCount}
            gradient={gradient}
          />
          <main className="flex-1 overflow-y-auto scrollbar-none">{activeView}</main>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <AiAssistantModal />
    </div>
  );
}
