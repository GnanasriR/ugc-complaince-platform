import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import { CHECKLIST_ITEMS } from "../../data";
import StatusBadge from "../shared/StatusBadge";

export default function InstDashboard({ myApplications }) {
  const pending = CHECKLIST_ITEMS.filter((c) => !c.done).length;
  const complete = CHECKLIST_ITEMS.filter((c) => c.done).length;
  const completePct = Math.round((complete / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="p-6 space-y-5 min-h-full">
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#065F46,#10B981)" }}>
        <div className="px-7 py-5 flex items-center justify-between">
          <div>
            <p className="text-emerald-200 text-xs font-semibold mb-1">Welcome back</p>
            <h2 className="text-xl font-black text-white">Deccan Institute of Management</h2>
            <p className="text-emerald-200 text-sm mt-0.5">Hyderabad, Telangana · Management · NAAC B+</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-200 text-xs mb-1">Active Application</p>
            <p className="font-mono text-white font-bold text-lg">APP-2024-0893</p>
            <StatusBadge status="Under Review" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Applications Filed", value: myApplications.length, icon: FileText, bg: "bg-emerald-50", ic: "text-emerald-600" },
          { label: "Annexures Complete", value: `${complete}/${CHECKLIST_ITEMS.length}`, icon: CheckCircle, bg: "bg-emerald-50", ic: "text-emerald-600" },
          { label: "Pending Action", value: pending, icon: AlertCircle, bg: "bg-amber-50", ic: "text-amber-600" },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <k.icon size={18} className={k.ic} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{k.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Application History</h3>
          <div className="space-y-3">
            {myApplications.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-mono text-xs font-bold text-slate-700">{a.id}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cycle {a.cycle} · Submitted {a.submitted}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {a.stage} · {a.daysElapsed} days
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={a.status} />
                  <p className="font-mono text-xs text-slate-400 mt-1.5">NLP: {a.nlpScore}/100</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Document Readiness</h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                completePct === 100 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {completePct}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${completePct}%` }} />
          </div>
          <div className="space-y-2">
            {CHECKLIST_ITEMS.map((c) => (
              <div
                key={c.item}
                className={`flex items-center gap-2.5 text-xs py-1 ${c.done ? "text-slate-600" : "text-amber-700 font-semibold"}`}
              >
                {c.done ? (
                  <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle size={13} className="text-amber-500 shrink-0" />
                )}
                {c.item}
                {!c.done && (
                  <span className="ml-auto text-[10px] bg-amber-50 border border-amber-200 text-amber-600 px-1.5 py-0.5 rounded-full font-mono">
                    PENDING
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
