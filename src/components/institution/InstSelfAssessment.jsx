import { useState } from "react";
import { AlertCircle } from "lucide-react";
import PageHeader from "../shared/PageHeader";

export default function InstSelfAssessment() {
  const [facultyRatio, setFacultyRatio] = useState(61);
  const [infraScore, setInfraScore] = useState(58);
  const [docCompleteness, setDocCompleteness] = useState(75);

  const raw =
    facultyRatio * 0.38 +
    infraScore * 0.3 +
    docCompleteness * 0.22 +
    8 -
    (facultyRatio < 40 ? 15 : 0) -
    (docCompleteness < 50 ? 10 : 0);
  const probability = Math.min(99, Math.max(4, Math.round(raw)));
  const probColor = probability >= 75 ? "#059669" : probability >= 50 ? "#D97706" : "#DC2626";
  const probBg =
    probability >= 75
      ? "bg-emerald-50 border-emerald-200"
      : probability >= 50
        ? "bg-amber-50 border-amber-200"
        : "bg-red-50 border-red-200";
  const probLabel =
    probability >= 75
      ? "Ready to Submit"
      : probability >= 50
        ? "Gaps Detected — Review Required"
        : "Not Ready — Significant Gaps";

  const shapData = [
    { feature: "Faculty Ratio", contribution: +(((facultyRatio - 50) / 50) * 38).toFixed(1) },
    { feature: "Infrastructure", contribution: +(((infraScore - 50) / 50) * 30).toFixed(1) },
    { feature: "Doc Completeness", contribution: +(((docCompleteness - 50) / 50) * 22).toFixed(1) },
    { feature: "Base Rate (XGB)", contribution: 8 },
  ];

  return (
    <div className="p-6 min-h-full">
      <PageHeader
        title="Pre-Submission Self-Assessment"
        subtitle="Test your compliance readiness before filing — powered by the same XGBoost model used by UGC reviewers"
      />
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
        <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 font-medium">
          Adjust the sliders to reflect your institution's actual metrics. A predicted probability below 75% indicates
          compliance gaps that NLP will flag during official review.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-7">
          <h3 className="text-sm font-bold text-slate-900">Your Compliance Metrics</h3>
          {[
            {
              label: "Faculty Ratio Score",
              val: facultyRatio,
              set: setFacultyRatio,
              desc: "Based on payroll-confirmed faculty vs enrolled students",
            },
            {
              label: "Infrastructure Score",
              val: infraScore,
              set: setInfraScore,
              desc: "Built-up area, labs, library holdings vs AICTE norms",
            },
            {
              label: "Document Completeness",
              val: docCompleteness,
              set: setDocCompleteness,
              desc: "Annexures I–XIV prepared and ready to upload",
            },
          ].map(({ label, val, set, desc }) => (
            <div key={label} className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-semibold text-slate-800">{label}</label>
                <span
                  className="font-mono text-2xl font-bold"
                  style={{ color: val >= 75 ? "#059669" : val >= 50 ? "#D97706" : "#DC2626" }}
                >
                  {val}
                </span>
              </div>
              <p className="text-xs text-slate-500">{desc}</p>
              <input
                type="range"
                min={0}
                max={100}
                value={val}
                onChange={(e) => set(Number(e.target.value))}
                className="w-full appearance-none cursor-pointer"
                style={{ accentColor: val >= 75 ? "#059669" : val >= 50 ? "#D97706" : "#DC2626" }}
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Non-compliant</span>
                <span>Fully compliant</span>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className={`${probBg} border rounded-2xl p-8 text-center space-y-4`}>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
              Predicted Approval Probability
            </p>
            <div className="text-8xl font-black leading-none" style={{ color: probColor }}>
              {probability}%
            </div>
            <div className="h-3 bg-white/80 rounded-full overflow-hidden mx-6 shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${probability}%`, background: probColor }}
              />
            </div>
            <p className="text-sm font-bold" style={{ color: probColor }}>
              {probLabel}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">SHAP Contribution Breakdown</h3>
            {shapData.map((s) => {
              const c = Number(s.contribution);
              const color = c > 0 ? "#059669" : s.feature === "Base Rate (XGB)" ? "#0D9488" : "#DC2626";
              return (
                <div key={s.feature} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{s.feature}</span>
                    <span className="font-mono font-bold" style={{ color }}>
                      {c > 0 ? "+" : ""}
                      {c.toFixed(1)}pp
                    </span>
                  </div>
                  <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(Math.abs(c) * 2.5, 100)}%`,
                        background: color,
                        left: c >= 0 ? 0 : "auto",
                        right: c < 0 ? 0 : "auto",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {probability < 75 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                <AlertCircle size={12} />
                Fix before submitting
              </h4>
              <ul className="space-y-1 text-xs text-amber-700">
                {facultyRatio < 70 && (
                  <li className="flex gap-2">
                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                    Verify payroll register matches declared faculty count — NLP cross-references Annexure VII
                  </li>
                )}
                {infraScore < 70 && (
                  <li className="flex gap-2">
                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                    Submit satellite-verified area certificates and independent lab valuation reports
                  </li>
                )}
                {docCompleteness < 80 && (
                  <li className="flex gap-2">
                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                    Complete all {Math.round((1 - docCompleteness / 100) * 14)} outstanding annexures before portal
                    submission
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
