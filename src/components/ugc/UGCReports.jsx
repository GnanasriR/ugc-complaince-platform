import { useState } from "react";
import { FileText, FileSearch, AlertTriangle, Users, Download, AlertCircle } from "lucide-react";
import PageHeader from "../shared/PageHeader";

export default function UGCReports() {
  const [generating, setGenerating] = useState(null);

  const reports = [
    {
      id: "cycle",
      title: "Cycle Summary Report",
      desc: "Pipeline throughput, approval/rejection rates, compliance averages by institution type.",
      stats: ["4,812 applications", "78.3% compliance", "847 approvals"],
      format: "PDF · Excel",
      icon: FileText,
      accent: "#0D9488",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      id: "eval",
      title: "Per-Application Evaluation",
      desc: "NLP analysis and reviewer notes per application — parameter scores, anomaly flags, rationale.",
      stats: ["14 parameters scored", "Reviewer comments", "Per-app export"],
      format: "PDF",
      icon: FileSearch,
      accent: "#0F766E",
      bg: "bg-teal-50",
      border: "border-teal-200",
    },
    {
      id: "anomaly",
      title: "Anomaly Intelligence Brief",
      desc: "Fraud patterns, data inconsistency signatures, and systemic failures from NLP engine.",
      stats: ["769 anomalies", "5 fraud classes", "211 conflicts"],
      format: "PDF · JSON",
      icon: AlertTriangle,
      accent: "#DC2626",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    {
      id: "irc",
      title: "Inter-Rater Consistency",
      desc: "Cohen's κ across 47 reviewers. Identifies outlier evaluators and litigation-risk clusters.",
      stats: ["κ = 0.74", "47 reviewers", "3 outlier pairs"],
      format: "PDF",
      icon: Users,
      accent: "#059669",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
  ];

  const kappa = [
    { p: "R-04×R-12", k: 0.91, l: "Almost Perfect" },
    { p: "R-07×R-23", k: 0.83, l: "Strong" },
    { p: "R-11×R-31", k: 0.74, l: "Substantial" },
    { p: "R-02×R-19", k: 0.41, l: "Moderate" },
    { p: "R-09×R-44", k: 0.28, l: "Outlier" },
  ];

  return (
    <div className="p-6 min-h-full">
      <PageHeader title="Reports" subtitle="Four standardised report types · Cycle 2024–25" />
      <div className="grid grid-cols-2 gap-4 mb-5">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-11 h-11 rounded-xl ${r.bg} border ${r.border} flex items-center justify-center shrink-0`}
              >
                <r.icon size={18} style={{ color: r.accent }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{r.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.desc}</p>
              </div>
            </div>
            <div className="space-y-1.5 mb-4">
              {r.stats.map((s) => (
                <div key={s} className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-1 h-1 rounded-full shrink-0" style={{ background: r.accent }} />
                  {s}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-semibold">
                {r.format}
              </span>
              <button
                onClick={() => {
                  setGenerating(r.id);
                  setTimeout(() => setGenerating(null), 2200);
                }}
                className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-semibold shadow-sm hover:opacity-90"
                style={{ background: r.accent }}
              >
                {generating === r.id ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Download size={11} />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Inter-Rater Consistency — Cohen's κ</h3>
        <p className="text-xs text-slate-500 mb-5">
          47 reviewers · 1,204 co-evaluated applications · litigation risk threshold: κ = 0.60
        </p>
        <div className="grid grid-cols-5 gap-3 mb-4">
          {kappa.map((e) => {
            const col = e.k >= 0.61 ? "#059669" : e.k >= 0.41 ? "#D97706" : "#DC2626";
            const bg =
              e.k >= 0.61
                ? "bg-emerald-50 border-emerald-200"
                : e.k >= 0.41
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200";
            return (
              <div key={e.p} className={`${bg} border rounded-xl p-4 text-center`}>
                <p className="font-mono text-[10px] text-slate-500 mb-2 font-semibold">{e.p}</p>
                <p className="text-4xl font-black leading-none" style={{ color: col }}>
                  {e.k.toFixed(2)}
                </p>
                <p className="text-[10px] mt-2 font-semibold" style={{ color: col }}>
                  {e.l}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
          <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-medium">
            Reviewer pairs R-02×R-19 and R-09×R-44 fall below the κ = 0.60 threshold. Mandatory calibration required
            before Cycle 2025–26.
          </p>
        </div>
      </div>
    </div>
  );
}
