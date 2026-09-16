import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Brain,
  Upload,
  Send,
  User,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import InstDashboard from "./InstDashboard";
import InstSelfAssessment from "./InstSelfAssessment";
import InstDocVault from "./InstDocVault";
import InstSubmit from "./InstSubmit";
import ProfilePage from "../shared/ProfilePage";
import NotificationsPage from "../shared/NotificationsPage";
import Topbar from "../shared/Topbar";
import AiAssistantModal from "../shared/AiAssistantModal";
import { getNotifications } from "../../utils/notifications";

const NAV_ITEMS = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "assess", label: "Self-Assessment", icon: Brain },
  { id: "vault", label: "Document Vault", icon: Upload },
  { id: "submit", label: "New Application", icon: Send },
];

export default function InstitutionApp({ myApplications, onSubmitApplication }) {
  const navigate = useNavigate();
  const { view: routeView } = useParams();
  const view = routeView || "dashboard";

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [unreadCount, setUnreadCount] = useState(() =>
    getNotifications("institution").filter((n) => n.unread).length
  );

  useEffect(() => {
    const handleUpdate = () => {
      setUnreadCount(getNotifications("institution").filter((n) => n.unread).length);
    };
    window.addEventListener("ugc_notification_added", handleUpdate);
    return () => window.removeEventListener("ugc_notification_added", handleUpdate);
  }, []);

  const views = {
    dashboard: <InstDashboard myApplications={myApplications} />,
    assess: <InstSelfAssessment myApplications={myApplications} />,
    vault: <InstDocVault />,
    submit: <InstSubmit onSubmitApplication={onSubmitApplication} />,
    profile: <ProfilePage portal="institution" />,
    notifications: <NotificationsPage portal="institution" />,
  };

  const activeView = views[view] || views.dashboard;
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
          <span className="text-slate-300 font-medium">Institution Self-Assessment & Evaluation Portal</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
            <ShieldCheck size={13} strokeWidth={2.5} /> Live Assessment Engine
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
                    IN
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">Institution Portal</p>
                    <p className="text-[10px] text-slate-400 font-medium">Self-Assessment Portal</p>
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
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/institution/${item.id}`)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-emerald-50 text-emerald-700 font-bold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    } ${!sidebarOpen ? "justify-center px-0" : ""}`}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon size={16} className={active ? "text-emerald-700" : "text-slate-400"} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-2 border-t border-slate-100 space-y-0.5">
            <button
              onClick={() => navigate("/institution/profile")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer ${
                view === "profile" ? "bg-emerald-50 text-emerald-700 font-bold" : ""
              } ${!sidebarOpen ? "justify-center px-0" : ""}`}
            >
              <User size={16} className="text-slate-400" />
              {sidebarOpen && <span>Profile & Account</span>}
            </button>
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
            onProfile={() => navigate("/institution/profile")}
            onNotifications={() => navigate("/institution/notifications")}
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
