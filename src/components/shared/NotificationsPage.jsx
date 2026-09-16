import { useState, useEffect } from "react";
import { CheckCheck, Trash2, Bell, Sparkles, FileText, Upload, AlertTriangle, CheckCircle2, MessageSquare } from "lucide-react";
import { getNotifications, markNotificationsAsRead } from "../../utils/notifications";
import PageHeader from "./PageHeader";

const ICON_MAP = {
  Sparkles,
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Bell,
};

export default function NotificationsPage({ portal }) {
  const [items, setItems] = useState(() => getNotifications(portal));

  useEffect(() => {
    const handleUpdate = () => {
      setItems(getNotifications(portal));
    };

    window.addEventListener("ugc_notification_added", handleUpdate);
    return () => window.removeEventListener("ugc_notification_added", handleUpdate);
  }, [portal]);

  const unread = items.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    const updated = markNotificationsAsRead(portal);
    setItems(updated);
  };

  const handleRemoveItem = (id) => {
    const updated = items.filter((x) => x.id !== id);
    setItems(updated);
    try {
      localStorage.setItem(`ugc_notifications_${portal}`, JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <div className="p-6 min-h-full space-y-4">
      <PageHeader title="Notifications" subtitle={`${unread} unread · Alerts, AI evaluation results, reviewer comments and system updates`}>
        {unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3.5 py-1.5 rounded-lg cursor-pointer"
          >
            <CheckCheck size={13} />
            Mark all as read
          </button>
        )}
      </PageHeader>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {items.map((n, i) => {
          const IconComp = typeof n.icon === "function" ? n.icon : ICON_MAP[n.iconName] || Bell;

          return (
            <div
              key={n.id}
              className={`flex items-start gap-3.5 px-5 py-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors ${
                i === items.length - 1 ? "border-b-0" : ""
              } ${n.unread ? "bg-emerald-50/30" : ""}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.tone || "bg-emerald-100 text-emerald-700"}`}>
                <IconComp size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
                <p className="text-[10px] text-slate-400 mt-1.5 font-mono">{n.time}</p>
              </div>
              <button
                onClick={() => handleRemoveItem(n.id)}
                className="text-slate-300 hover:text-red-500 p-1 shrink-0 cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="px-5 py-16 text-center text-sm text-slate-400">You're all caught up. No notifications available.</div>
        )}
      </div>
    </div>
  );
}
