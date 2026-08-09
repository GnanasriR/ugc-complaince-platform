import { Search, Bell, User } from "lucide-react";

export default function Topbar({ active, onProfile, onNotifications, unread, gradient }) {
  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white flex items-center justify-between px-5">
      <div className="flex items-center gap-2 text-slate-300 min-w-0">
        <Search size={14} className="shrink-0" />
        <span className="text-xs text-slate-400 truncate">Search applications, institutions, reports…</span>
      </div>
      <div className="flex items-center gap-1.5">
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
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            active === "profile"
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ background: gradient }}
          >
            <User size={13} />
          </div>
        </button>
      </div>
    </header>
  );
}
