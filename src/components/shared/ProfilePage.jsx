import {
  Building2,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BadgeCheck,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "./PageHeader";
import { getLiveAnomalies } from "../../utils/anomalies";

export default function ProfilePage({ portal }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const isInst = portal === "institution";

  const info = {
    name: user?.institutionName || user?.fullName || (isInst ? "Institution Account" : "UGC Officer Account"),
    role: user?.role === "ROLE_UGC_OFFICER" ? "UGC / AICTE Officer" : user?.role === "ROLE_EVALUATOR" ? "Expert Evaluator" : "Institution Representative",
    contact: user?.fullName || "Authorised User",
    email: user?.email || "user@domain.ac.in",
    phone: user?.mobileNumber || "+91 98765 43210",
    location: isInst ? "Bengaluru, Karnataka" : "New Delhi",
    since: "Registered User Account",
    tag: user?.status ? `Status: ${user.status}` : "Verified Active Session",
    gradient: isInst ? "linear-gradient(135deg,#065F46,#0D9488)" : "linear-gradient(135deg,#052E2B,#059669)",
    icon: isInst ? Building2 : ShieldCheck,
    stats: isInst
      ? [
          { l: "Applications filed", v: "1" },
          { l: "Documents uploaded", v: "8" },
          { l: "Compliance status", v: "Valid" },
        ]
      : [
          { l: "Reviewed this cycle", v: "312" },
          { l: "Anomalies flagged", v: String(getLiveAnomalies().length) },
          { l: "Avg. review time", v: "2.4d" },
        ],
  };

  const Icon = info.icon;

  return (
    <div className="p-6 min-h-full">
      <PageHeader title="User Profile & Settings" subtitle="Logged-in account credentials and session preferences" />
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-fit">
          <div className="p-6 text-center" style={{ background: info.gradient }}>
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-3">
              <Icon size={26} className="text-white" />
            </div>
            <p className="text-sm font-bold text-white">{info.name}</p>
            <p className="text-[11px] text-emerald-100 mt-0.5">{info.role}</p>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <User size={13} className="text-emerald-500 shrink-0" />
              {info.contact}
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Mail size={13} className="text-emerald-500 shrink-0" />
              {info.email}
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Phone size={13} className="text-emerald-500 shrink-0" />
              {info.phone}
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <MapPin size={13} className="text-emerald-500 shrink-0" />
              {info.location}
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Calendar size={13} className="text-emerald-500 shrink-0" />
              {info.since}
            </div>
            <div className="pt-3 border-t border-slate-100">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <BadgeCheck size={12} />
                {info.tag}
              </span>
            </div>
          </div>
        </div>
        <div className="col-span-2 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {info.stats.map((s) => (
              <div key={s.l} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="text-3xl font-bold text-slate-900">{s.v}</div>
                <div className="text-xs text-slate-500 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Settings size={14} className="text-emerald-600" />
              Preferences
            </h3>
            <div className="space-y-3">
              {[
                { l: "Email notifications", d: "Reviewer comments, status changes and reminders" },
                { l: "SMS alerts", d: "Critical anomalies and deadline reminders only" },
                { l: "Weekly digest", d: "Summary of activity every Monday morning" },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-b-0">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{p.l}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{p.d}</p>
                  </div>
                  <div className="w-9 h-5 rounded-full bg-emerald-500 relative shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] right-[3px] shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
