import { Search, Bell, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ active, onProfile, onNotifications, unread, gradient }) {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.institutionName || "User Account";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white flex items-center justify-between px-5">
      <div className="flex items-center gap-2 text-slate-300 min-w-0">
        <Search size={14} className="shrink-0" />
        <span className="text-xs text-slate-400 truncate">Search applications, institutions, reports…</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onNotifications}
          className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            active === "notifications"
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          <Bell size={16} />
          {unread > 0 && <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />}
        </button>
        <button
          onClick={onProfile}
          className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-colors ${
            active === "profile"
              ? "bg-emerald-50 text-emerald-700 font-bold"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm"
            style={{ background: gradient }}
          >
            {initial || <User size={13} />}
          </div>
          <span className="text-xs font-semibold max-w-[120px] truncate hidden sm:inline">{displayName}</span>
        </button>
      </div>
    </header>
  );
}
