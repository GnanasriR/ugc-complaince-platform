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
import PageHeader from "./PageHeader";

export default function ProfilePage({ portal }) {
  const info =
    portal === "institution"
      ? {
          name: "Deccan Institute of Management",
          role: "Institution Administrator",
          contact: "Dr. Aarav Mehta",
          email: "registrar@deccan-mgmt.edu.in",
          phone: "+91 98450 12233",
          location: "Hyderabad, Telangana",
          since: "Registered March 2019",
          tag: "APP-2024-0893 · Under Review",
          gradient: "linear-gradient(135deg,#065F46,#0D9488)",
          icon: Building2,
          stats: [
            { l: "Applications filed", v: "3" },
            { l: "Documents on file", v: "42" },
            { l: "Compliance score", v: "86%" },
          ],
        }
      : {
          name: "Dr. Priya Ramanathan",
          role: "Senior Compliance Reviewer, UGC/AICTE",
          contact: "Regulatory Analytics Division",
          email: "p.ramanathan@ugc.gov.in",
          phone: "+91 11 2323 4567",
          location: "New Delhi",
          since: "On panel since 2016",
          tag: "Cycle 2024–25 · 312 apps reviewed",
          gradient: "linear-gradient(135deg,#052E2B,#059669)",
          icon: Shield,
          stats: [
            { l: "Reviewed this cycle", v: "312" },
            { l: "Anomalies flagged", v: "28" },
            { l: "Avg. review time", v: "2.4d" },
          ],
        };

  const Icon = info.icon;

  return (
    <div className="p-6 min-h-full">
      <PageHeader title="Profile" subtitle="Account details and activity summary" />
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
          <button className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-4 py-2.5 rounded-xl">
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
