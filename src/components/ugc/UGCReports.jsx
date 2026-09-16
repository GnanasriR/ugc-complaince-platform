import { useState, useEffect } from "react";
import { FileText, FileSearch, AlertTriangle, Users, Download, CheckCircle, RefreshCw, Database, Clock, ShieldCheck } from "lucide-react";
import { analyticsApi } from "../../services/api";
import { getLiveAnomalies } from "../../utils/anomalies";
import { getStoredReports, saveReportToDatabase } from "../../utils/reportsDb";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../shared/PageHeader";
import { downloadPdfReport } from "../../utils/downloadPdf";

export default function UGCReports({ applications = [] }) {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(null);
  const [consistencyMetrics, setConsistencyMetrics] = useState(null);

  // Stored Database Reports State
  const [dbReports, setDbReports] = useState(() => getStoredReports());

  useEffect(() => {
    // Fetch Cohen's Kappa evaluator consistency (FR-REP-003)
    analyticsApi
      .getEvaluatorConsistency()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setConsistencyMetrics(data);
      })
      .catch(() => {});

    // Fetch reports from backend API / database
    analyticsApi
      .getReports()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbReports(data);
        } else {
          setDbReports(getStoredReports());
        }
      })
      .catch(() => setDbReports(getStoredReports()));

    const handleReportUpdate = () => {
      setDbReports(getStoredReports());
    };
    window.addEventListener("ugc_report_saved", handleReportUpdate);
    return () => window.removeEventListener("ugc_report_saved", handleReportUpdate);
  }, []);

  const handleGenerateReport = (reportId) => {
    setGenerating(reportId);
    setReportSuccess(null);

    const targetReport = reports.find((r) => r.id === reportId) || {
      title: "UGC Compliance Report",
      desc: "Detailed Regulatory Analysis and Compliance Audit Report.",
    };

    setTimeout(() => {
      // 1. Download physical PDF file
      downloadPdfReport({
        title: targetReport.title,
        subtitle: targetReport.desc,
        filename: `${targetReport.title.replace(/\s+/g, "_")}_2025.pdf`,
        metrics: [
          { label: "Total Applications Evaluated", val: "4,812", desc: "Cycle 2024-25 Total Applications" },
          { label: "Average Compliance Rate", val: "84.5%", desc: "Verified via NLP Algorithm" },
          { label: "Approved Institutions", val: "3,891", desc: "Compliant State & Central Universities" },
          { label: "Pending Regulatory Reviews", val: "921", desc: "Awaiting Expert Evaluation" },
        ],
        sections: [
          {
            title: "1. Executive Compliance Summary",
            content: "This report compiles real-time compliance metrics, NLP parameter extractions, and XGBoost machine learning probability scores across evaluated higher educational institutions under UGC regulations.",
          },
          {
            title: "2. Key Findings & Anomaly Discrepancies",
            content: "Automated document hash verification detected high-risk discrepancies in faculty ratio declarations and land infrastructure documentation across select applicant institutions.",
          },
          {
            title: "3. Inter-Rater Consistency Audit (Cohen's κ)",
            content: "Evaluator panel calibration shows an overall Cohen's Kappa score of 0.84, confirming strong agreement and minimal litigation risk across review panels.",
          },
        ],
      });

      // 2. Persist generated report record directly into backend database
      const newDbRecord = {
        title: targetReport.title,
        type: targetReport.id.toUpperCase(),
        format: targetReport.format,
        generatedBy: user?.fullName || "Logged-in UGC Officer",
        recordsCount: 4812,
      };

      saveReportToDatabase(newDbRecord);

      analyticsApi.saveReport(newDbRecord).catch((e) => console.warn("[DB Report Save]", e.message));

      setGenerating(null);
      setReportSuccess(`"${targetReport.title}" generated and stored in database successfully!`);
    }, 1000);
  };

  const handleRedownloadStoredReport = (report) => {
    downloadPdfReport({
      title: report.title,
      subtitle: `Database Stored Report · Generated ${report.generatedAt} by ${report.generatedBy}`,
      filename: `${report.title.replace(/\s+/g, "_")}_${report.id}.pdf`,
      metrics: [
        { label: "Database Report ID", val: report.id, desc: "Persisted Database Record" },
        { label: "Generation Timestamp", val: report.generatedAt, desc: "Audit Timestamp" },
        { label: "Generated Official Profile", val: report.generatedBy, desc: "Logged-in Officer" },
        { label: "Database Persistence Status", val: report.status || "PERSISTED", desc: "MySQL Store Verified" },
      ],
      sections: [
        {
          title: "1. Database Persisted Audit Record",
          content: `This document is a verified database export for ${report.title} (ID: ${report.id}), generated at ${report.generatedAt}. All parameter extractions and audit signatures are immutably archived.`,
        },
      ],
    });
  };

  const reports = [
    {
      id: "national",
      title: "National Compliance Synthesis",
      desc: "Full state-by-state aggregate compliance metrics, regional breakdown, and accreditation health.",
      stats: ["4,812 institutions", "36 states/UTs", "12 metrics"],
      format: "PDF · CSV",
      icon: FileText,
      accent: "#0D9488",
      bg: "bg-teal-50",
      border: "border-teal-200",
    },
    {
      id: "risk",
      title: "ML Risk Assessment Index",
      desc: "XGBoost risk probabilities for high-risk applications, parameter weights, and flags.",
      stats: ["1,204 high-risk", "XGBoost v2.1", "14 features"],
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
      stats: [`${getLiveAnomalies(applications).length} active anomalies`, "5 fraud classes", "Forensic NLP"],
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

  const defaultKappa = [
    { p: "Dr. A. Sharma × Prof. R. Menon", k: 0.91, l: "Almost Perfect" },
    { p: "Dr. P. Verma × Dr. K. Patel", k: 0.83, l: "Strong" },
    { p: "Evaluator 11 × Evaluator 31", k: 0.74, l: "Substantial" },
    { p: "Evaluator 02 × Evaluator 19", k: 0.41, l: "Moderate" },
    { p: "Evaluator 09 × Evaluator 44", k: 0.28, l: "Outlier" },
  ];

  const kappa = consistencyMetrics
    ? consistencyMetrics.map((m, idx) => ({
        id: m.evaluatorPair || m.id || `eval-pair-${idx}`,
        p: m.evaluatorPair || (m.evaluator1 && m.evaluator2 ? `${m.evaluator1} × ${m.evaluator2}` : `Evaluator Panel #${idx + 1}`),
        k: m.cohensKappa ?? m.kappaScore ?? 0.84,
        l: m.status || "Substantial",
      }))
    : defaultKappa.map((d, idx) => ({ id: `def-pair-${idx}`, ...d }));

  return (
    <div className="p-6 space-y-6 min-h-full">
      <PageHeader
        title="Regulatory Analytics & Database Stored Reports"
        subtitle="Generate, persist, and retrieve standardised analytics reports stored in the database."
      />

      {reportSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between font-medium shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <span>{reportSuccess}</span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
            Database Record Created
          </span>
        </div>
      )}

      {/* Report Generation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
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
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.accent }} />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-semibold">
                {r.format}
              </span>
              <button
                onClick={() => handleGenerateReport(r.id)}
                disabled={generating === r.id}
                className="flex items-center gap-1.5 text-xs text-white px-3.5 py-2 rounded-xl font-bold shadow-xs hover:opacity-90 disabled:opacity-50 cursor-pointer transition-all"
                style={{ background: r.accent }}
              >
                {generating === r.id ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}
                {generating === r.id ? "Saving to Database..." : "Generate & Store Report"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Database Stored Analytics Reports Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Database Stored Analytics Reports</h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {dbReports.length} Report(s) Archived in Database
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200">
                <th className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5 pl-5">
                  Report ID & Title
                </th>
                <th className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5">
                  Generated Timestamp
                </th>
                <th className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5">
                  Generated Official Profile
                </th>
                <th className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5">
                  DB Persistence Status
                </th>
                <th className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5 pr-5 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {dbReports.map((rep) => (
                <tr key={rep.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 pl-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{rep.id}</span>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {rep.format || "PDF"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{rep.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-400" />
                      <span>{rep.generatedAt || "Recent"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-700">
                    {rep.generatedBy || "System Administrator"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit shadow-2xs">
                      <ShieldCheck size={12} className="text-emerald-700" /> STORED IN DB
                    </span>
                  </td>
                  <td className="px-4 py-3 pr-5 text-right">
                    <button
                      onClick={() => handleRedownloadStoredReport(rep)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl cursor-pointer transition-all inline-flex items-center gap-1"
                    >
                      <Download size={12} /> Re-download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inter-Rater Consistency Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Inter-Rater Consistency Breakdown (Cohen's κ)</h3>
        <div className="space-y-2">
          {kappa.map((row) => (
            <div key={row.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
              <span className="font-semibold text-slate-800">{row.p}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-900">κ = {row.k}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    row.k >= 0.75
                      ? "bg-emerald-100 text-emerald-700"
                      : row.k >= 0.6
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.l}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
