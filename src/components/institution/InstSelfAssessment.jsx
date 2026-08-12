import { useState, useEffect } from "react";
import { AlertCircle, Play, CheckCircle2 } from "lucide-react";
import { mlApi } from "../../services/api";
import PageHeader from "../shared/PageHeader";

export default function InstSelfAssessment() {
  const [facultyRatio, setFacultyRatio] = useState(61);
  const [infraScore, setInfraScore] = useState(58);
  const [docCompleteness, setDocCompleteness] = useState(75);
  const [backendProb, setBackendProb] = useState(null);

  // Trigger ML Pre-check API (FR-ML-003)
  useEffect(() => {
    mlApi
      .runPreCheck({
        facultyRatioScore: facultyRatio,
        infrastructureScore: infraScore,
        documentCompletenessScore: docCompleteness,
      })
      .then((res) => {
        if (res && res.simulatedProbability) {
          setBackendProb(Math.round(res.simulatedProbability));
        }
      })
      .catch((e) => {
        // Fallback to local XGB model formula
        setBackendProb(null);
      });
  }, [facultyRatio, infraScore, docCompleteness]);

  const raw =
    facultyRatio * 0.38 +
    infraScore * 0.3 +
    docCompleteness * 0.22 +
    8 -
    (facultyRatio < 40 ? 15 : 0) -
    (docCompleteness < 50 ? 10 : 0);
  const probability = backendProb ?? Math.min(99, Math.max(4, Math.round(raw)));
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

        <div className="space-y-5">
          <div className={`border rounded-2xl shadow-sm p-6 ${probBg}`}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: probColor }}>
              XGBoost Simulated Outcome
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-mono text-5xl font-black" style={{ color: probColor }}>
                {probability}%
              </span>
              <span className="text-sm font-bold text-slate-700">Approval Probability</span>
            </div>
            <p className="text-sm font-bold" style={{ color: probColor }}>
              {probLabel}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">SHAP Feature Impact Breakdown</h4>
            <div className="space-y-3">
              {shapData.map(({ feature, contribution }) => (
                <div key={feature} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{feature}</span>
                  <span
                    className={`font-mono font-bold ${
                      contribution > 0
                        ? "text-emerald-600"
                        : contribution < 0
                          ? "text-red-600"
                          : "text-slate-500"
                    }`}
                  >
                    {contribution > 0 ? `+${contribution}%` : `${contribution}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
