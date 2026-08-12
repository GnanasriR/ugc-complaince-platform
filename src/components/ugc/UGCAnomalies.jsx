import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Send, X, Clock } from "lucide-react";
import { ANOMALIES } from "../../data";
import { anomalyApi } from "../../services/api";
import PageHeader from "../shared/PageHeader";

export default function UGCAnomalies() {
  const [anomalies, setAnomalies] = useState(ANOMALIES);
  const [resolved, setResolved] = useState(new Set());
  const [dispatchedNotices, setDispatchedNotices] = useState({});
  const [noticeModalAnomaly, setNoticeModalAnomaly] = useState(null);
  const [noticeText, setNoticeText] = useState("");

  useEffect(() => {
    anomalyApi
      .getAll()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setAnomalies(data);
      })
      .catch(() => {});
  }, []);

  const handleOpenNoticeModal = (anomaly) => {
    setNoticeModalAnomaly(anomaly);
    setNoticeText(
      `FORMAL SHOW-CAUSE NOTICE (Ref: ${anomaly.id})\n\nThis is to notify that a critical anomaly (${anomaly.title}) has been detected during automated document verification.\n\nDescription: ${anomaly.description}\n\nYou are hereby directed to provide sworn clarification and re-upload supporting annexures within 14 calendar days.`
    );
  };

  const handleDispatchNoticeSubmit = () => {
    if (!noticeModalAnomaly) return;
    const anomalyId = noticeModalAnomaly.id;

    // Dispatch Notice to backend API (FR-ANO-003)
    anomalyApi
      .dispatchNotice(anomalyId, noticeText)
      .then((res) => {
        console.log("[Notice Dispatch Success]", res);
      })
      .catch((e) => console.warn("[Notice Dispatch]", e.message));

    setDispatchedNotices((prev) => ({
      ...prev,
      [anomalyId]: {
        dispatchedAt: new Date().toLocaleDateString(),
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      },
    }));

    setResolved((p) => new Set([...p, anomalyId]));
    setNoticeModalAnomaly(null);
  };

  return (
    <div className="p-6 min-h-full">
      <PageHeader
        title="Anomaly Detection & Forensic Audit"
        subtitle={`NLP cross-reference engine · ${anomalies.length - resolved.size} active anomalies`}
      />
      <div className="space-y-3">
        {anomalies.map((a) => {
          const isResolved = resolved.has(a.id);
          const notice = dispatchedNotices[a.id];

          return (
            <div
              key={a.id}
              className={`bg-white rounded-xl border shadow-sm transition-all ${
                isResolved
                  ? "border-emerald-200 bg-emerald-50/20"
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
                    <span>Detected: {a.detectedAt || "Recent"}</span>
                    <span>
                      Confidence: <span className="font-mono font-bold text-slate-800">{a.confidence || 94}%</span>
                    </span>
                  </div>
                  {notice && (
                    <div className="mt-2 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium">
                      <Clock size={13} className="text-amber-600 shrink-0" />
                      <span>14-Day Formal Notice Dispatched · Response Deadline: {notice.deadline}</span>
                    </div>
                  )}
                  <div className="mt-2.5 flex gap-1.5 flex-wrap">
                    {(a.apps || ["APP-2024-0894"]).map((app) => (
                      <span
                        key={app}
                        className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>

                {!isResolved ? (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenNoticeModal(a)}
                      className="text-xs bg-amber-600 text-white hover:bg-amber-700 px-4 py-2 rounded-lg font-semibold shadow-sm flex items-center gap-1.5"
                    >
                      <Send size={12} />
                      Dispatch Notice
                    </button>
                    <button
                      onClick={() => setResolved((p) => new Set([...p, a.id]))}
                      className="text-xs text-slate-500 hover:text-slate-800 py-1"
                    >
                      Dismiss / Resolve
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 font-bold">
                    <CheckCircle size={14} />
                    {notice ? "Notice Issued (14-Day SLA)" : "Resolved"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notice Dispatch Modal (FR-ANO-003) */}
      {noticeModalAnomaly && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setNoticeModalAnomaly(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
            <div className="mb-4">
              <h3 className="text-base font-black text-slate-900">Dispatch Formal Show-Cause Notice</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Issues official notice to institution with a 14-day compliance response deadline (FR-ANO-003).
              </p>
            </div>

            <textarea
              rows={6}
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 font-mono leading-relaxed focus:outline-none mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setNoticeModalAnomaly(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatchNoticeSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm flex items-center gap-1.5"
              >
                <Send size={13} />
                Approve & Dispatch Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
