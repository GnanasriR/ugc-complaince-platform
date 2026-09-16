import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, User, Key, CheckCheck, LogOut, ShieldCheck, Sparkles, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getNotifications, markNotificationsAsRead } from "../../utils/notifications";

export default function Topbar({ active, onProfile, onNotifications, unread, gradient }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.fullName || user?.institutionName || "User Account";
  const initial = displayName.charAt(0).toUpperCase();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const portal = user?.email?.endsWith("@ugc.gov.in") ? "ugc" : "institution";
  const [notifications, setNotifications] = useState(() => getNotifications(portal));

  useEffect(() => {
    const handleNotifUpdate = () => {
      setNotifications(getNotifications(portal));
    };
    window.addEventListener("ugc_notification_added", handleNotifUpdate);
    return () => window.removeEventListener("ugc_notification_added", handleNotifUpdate);
  }, [portal]);

  // Click Outside Listener: Closes Notification & Profile cards whenever clicking anywhere outside their container!
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    const updated = markNotificationsAsRead(portal);
    setNotifications(updated);
  };

  return (
    <>
      <header className="h-14 shrink-0 border-b border-slate-200 bg-white flex items-center justify-between px-5 relative z-30">
        <div className="flex items-center gap-2 text-slate-300 min-w-0">
          <Search size={14} className="shrink-0" />
          <span className="text-xs text-slate-400 truncate">Search applications, institutions, reports…</span>
        </div>

        <div className="flex items-center gap-2">

          {/* Notifications Trigger & Dropdown Card Container */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifDropdown((prev) => !prev);
                setShowProfileDropdown(false);
              }}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                showNotifDropdown || active === "notifications"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
              title="Notifications"
            >
              <Bell size={16} />
              {(unreadCount > 0 || unread > 0) && (
                <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Quick Notifications Popover Card */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 cursor-default">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-emerald-700" />
                    <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-mono">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-none">
                  {notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 transition-colors ${
                        n.unread ? "bg-emerald-50/40 border-emerald-200" : "bg-slate-50/60 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 truncate">{n.title}</p>
                        {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{n.desc}</p>
                      <p className="text-[9px] text-slate-400 font-mono">{n.time}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-center py-6 text-xs text-slate-400">No notifications available.</p>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 mt-3">
                  <button
                    onClick={() => {
                      setShowNotifDropdown(false);
                      if (onNotifications) onNotifications();
                    }}
                    className="w-full text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    View All Notifications <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Trigger & Dropdown Card Container */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileDropdown((prev) => !prev);
                setShowNotifDropdown(false);
              }}
              className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-colors cursor-pointer ${
                showProfileDropdown || active === "profile"
                  ? "bg-emerald-50 text-emerald-700 font-bold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
              title="User Account & Profile"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm"
                style={{ background: gradient }}
              >
                {initial || <User size={13} />}
              </div>
              <span className="text-xs font-semibold max-w-[120px] truncate hidden sm:inline">{displayName}</span>
            </button>

            {/* Quick Profile & Account Popover Card */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 cursor-default space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                    style={{ background: gradient }}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || "user@ugc.gov.in"}</p>
                    <span className="inline-block text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded mt-1">
                      {portal === "ugc" ? "UGC Regulatory Officer" : "Institution Applicant"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs font-medium">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      if (onProfile) onProfile();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    <User size={15} className="text-slate-400" />
                    <span>View Profile & Account Settings</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      if (logout) logout();
                      navigate("/");
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-bold transition-colors cursor-pointer text-xs"
                  >
                    <LogOut size={14} />
                    <span>Sign Out Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
