import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Upload, FileSearch, RefreshCw } from "lucide-react";
import { NLP_PARAMETERS } from "../../data";
import { nlpApi } from "../../services/api";
import PageHeader from "../shared/PageHeader";
import StatusBadge from "../shared/StatusBadge";
import MiniBar from "../shared/MiniBar";
import buildAppReport from "./buildAppReport";

function ParamTable({ rows }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 grid grid-cols-5 gap-4">
        {["Parameter", "Declared", "NLP-Verified", "Status", "Confidence"].map((h) => (
          <span key={h} className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            {h}
          </span>
        ))}
      </div>
      {rows.map((p, i) => (
        <div
          key={i}
          className={`grid grid-cols-5 gap-4 px-5 py-3 border-b border-slate-100 hover:bg-slate-50/50 text-sm ${
            i === rows.length - 1 ? "border-b-0" : ""
          } ${p.status === "MISMATCH" && p.critical ? "bg-red-50/40" : ""}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-slate-800 font-medium">{p.param || p.parameterName}</span>
            {(p.critical || p.isCritical) && p.status === "MISMATCH" && (
              <span className="text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded font-mono">CRIT</span>
            )}
          </div>
          <span className="font-mono text-slate-500 text-xs self-center">{p.declared || p.declaredValue}</span>
          <span className="font-mono text-slate-800 text-xs font-medium self-center">{p.verified || p.verifiedValue}</span>
          <div className="self-center">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full font-mono ${
                p.status === "PASS"
                  ? "bg-emerald-100 text-emerald-700"
                  : p.status === "MISMATCH"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {p.status}
            </span>
          </div>
          <div className="flex items-center gap-2 self-center">
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.confidence || p.confidenceScore || 90}%` }} />
            </div>
            <span className="font-mono text-xs text-slate-500 shrink-0">{p.confidence || p.confidenceScore || 90}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryCards({ passes, mismatches, uncertain }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { l: "Passed", v: passes, col: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", line: "bg-emerald-500" },
        { l: "Discrepancies", v: mismatches, col: "text-red-700", bg: "bg-red-50 border-red-200", line: "bg-red-500" },
        { l: "Uncertain", v: uncertain, col: "text-amber-700", bg: "bg-amber-50 border-amber-200", line: "bg-amber-500" },
      ].map((c) => (
        <div key={c.l} className={`${c.bg} border rounded-2xl p-5 flex items-center gap-4`}>
          <div className={`w-1.5 h-12 rounded-full ${c.line} shrink-0`} />
          <div>
            <div className={`text-4xl font-bold ${c.col}`}>{c.v}</div>
            <div className={`text-sm font-medium mt-1 ${c.col} opacity-70`}>{c.l}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UGCNlp({ applications, appId }) {
  const navigate = useNavigate();
  const selectedApp = appId ? applications.find((a) => a.id === appId) ?? null : null;
  const [scanState, setScanState] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [scanned, setScanned] = useState(0);
  const [liveParams, setLiveParams] = useState(null);
  const fRef = useRef(null);

  useEffect(() => {
    if (appId) {
      nlpApi
        .getParametersByAppId(appId)
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setLiveParams(data);
        })
        .catch(() => {});
    }
  }, [appId]);

  if (appId && !selectedApp) {
    navigate("/ugc/nlp", { replace: true });
    return null;
  }

  const startScan = () => {
    setScanState("scanning");
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 7 + 3;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setScanState("done");
      }
      setProgress(Math.min(p, 100));
      setScanned(Math.floor((Math.min(p, 100) / 100) * 14));
    }, 130);
  };

  if (selectedApp) {
    const report = liveParams || buildAppReport(selectedApp);
    const mismatches = report.filter((p) => p.status === "MISMATCH").length;
    const uncertain = report.filter((p) => p.status === "UNCERTAIN").length;
    const passes = report.filter((p) => p.status === "PASS").length;
    const critical = report.find((p) => p.status === "MISMATCH" && (p.critical || p.isCritical));

    return (
      <div className="p-6 min-h-full">
        <button
          onClick={() => navigate("/ugc/nlp")}
          className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-800 font-medium mb-4"
        >
          <ArrowLeft size={13} />
          Back to application list
        </button>
        <PageHeader
          title={`NLP Report — ${selectedApp.name}`}
          subtitle={`${selectedApp.id} · ${selectedApp.type} · ${selectedApp.state}`}
        >
          <StatusBadge status={selectedApp.status} />
        </PageHeader>
        <div className="space-y-5">
          <SummaryCards passes={passes} mismatches={mismatches} uncertain={uncertain} />
          {critical && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={15} className="text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-800">
                  Critical: {critical.param || critical.parameterName} — declared {critical.declared || critical.declaredValue}, NLP-verified {critical.verified || critical.verifiedValue}
                </p>
              </div>
            </div>
          )}
          <ParamTable rows={report} />
        </div>
      </div>
    );
  }

  const mismatches = NLP_PARAMETERS.filter((p) => p.status === "MISMATCH").length;
  const passes = NLP_PARAMETERS.filter((p) => p.status === "PASS").length;

  return (
    <div className="p-6 min-h-full">
      <PageHeader
        title="NLP Document Analysis"
        subtitle="AI extraction engine · 14 compliance parameters cross-referenced against UGC/AICTE norms"
      />
      {scanState === "idle" && (
        <div className="space-y-5">
          <div
            className="border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-white rounded-2xl p-10 text-center cursor-pointer transition-all group shadow-sm"
            onClick={() => {
              fRef.current?.click();
              startScan();
            }}
          >
            <input ref={fRef} type="file" className="hidden" onChange={startScan} />
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-100 transition-all">
              <Upload size={22} className="text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Upload Institution Documents</h3>
            <p className="text-xs text-slate-500">PDF · DOCX · Max 200 MB · Annexures I–XII</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Applications Awaiting NLP Review</h3>
              <span className="text-xs text-slate-400 font-mono">{applications.length} applications</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Application ID", "Institution", "Type", "NLP Score", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5 first:pl-5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app, i) => (
                  <tr
                    key={app.id}
                    className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors ${
                      i === applications.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-3 pl-5">
                      <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {app.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{app.name}</p>
                      <p className="text-xs text-slate-400">{app.state}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {app.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {app.status === "New" ? (
                        <span className="text-xs text-sky-600 font-medium">Pending scan</span>
                      ) : (
                        <MiniBar
                          value={app.nlpScore}
                          color={app.nlpScore >= 75 ? "#059669" : app.nlpScore >= 55 ? "#0D9488" : "#DC2626"}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 pr-5">
                      {app.status === "New" ? (
                        <span className="text-xs text-slate-400 italic">Awaiting scan</span>
                      ) : (
                        <button
                          onClick={() => navigate(`/ugc/nlp/${app.id}`)}
                          className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap"
                        >
                          <FileSearch size={12} />
                          View Full Report
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {scanState === "scanning" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border-[3px] border-emerald-600 border-t-transparent animate-spin shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900">NLP Scanner Running</h3>
              <p className="text-sm text-slate-500">Extracting and cross-referencing parameters…</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Parameters scanned</span>
              <span className="font-mono font-semibold">{scanned} / 14</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="flex gap-2">
            {NLP_PARAMETERS.map((p, i) => (
              <div
                key={i}
                className={`flex-1 h-2.5 rounded-full ${
                  i < scanned
                    ? p.status === "MISMATCH"
                      ? "bg-red-500"
                      : p.status === "UNCERTAIN"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      )}
      {scanState === "done" && (
        <div className="space-y-5">
          <SummaryCards passes={passes} mismatches={mismatches} uncertain={1} />
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={15} className="text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">
                Critical: Faculty Shortfall — declared 60, payroll-confirmed 38 (shortfall: 22 staff, 36.7%)
              </p>
            </div>
          </div>
          <ParamTable rows={NLP_PARAMETERS} />
          <button
            onClick={() => setScanState("idle")}
            className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5 font-medium"
          >
            <RefreshCw size={13} />
            Analyse another document
          </button>
        </div>
      )}
    </div>
  );
}
