import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { ANOMALIES } from "../../data";
import PageHeader from "../shared/PageHeader";

export default function UGCAnomalies() {
  const [resolved, setResolved] = useState(new Set());

  return (
    <div className="p-6 min-h-full">
      <PageHeader
        title="Anomaly Detection"
        subtitle={`NLP cross-reference engine · ${ANOMALIES.length - resolved.size} active anomalies`}
      />
      <div className="space-y-3">
        {ANOMALIES.map((a) => (
          <div
            key={a.id}
            className={`bg-white rounded-xl border shadow-sm transition-all ${
              resolved.has(a.id)
                ? "opacity-40 border-slate-200"
                : a.severity === "Critical"
                  ? "border-l-4 border-l-red-500 border-slate-200"
                  : "border-l-4 border-l-amber-500 border-slate-200"
            }`}
          >
            <div className="p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                      a.severity === "Critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {a.severity}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {a.category}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">{a.description}</p>
                <div className="flex items-center gap-5 text-xs text-slate-500 flex-wrap">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{a.id}</span>
                  <span>Detected: {a.detectedAt}</span>
                  <span>
                    Confidence: <span className="font-mono font-bold text-slate-800">{a.confidence}%</span>
                  </span>
                </div>
                <div className="mt-2 flex gap-1.5 flex-wrap">
                  {a.apps.map((app) => (
                    <span
                      key={app}
                      className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
              {!resolved.has(a.id) ? (
                <div className="flex flex-col gap-2 shrink-0">
                  <button className="text-xs bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg font-semibold shadow-sm">
                    Escalate
                  </button>
                  <button
                    onClick={() => setResolved((p) => new Set([...p, a.id]))}
                    className="text-xs bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-4 py-2 rounded-lg font-semibold"
                  >
                    Issue Notice
                  </button>
                  <button
                    onClick={() => setResolved((p) => new Set([...p, a.id]))}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Resolve
                  </button>
                </div>
              ) : (
                <span className="text-sm text-emerald-600 flex items-center gap-1.5 shrink-0 font-semibold">
                  <CheckCircle size={14} />
                  Resolved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
