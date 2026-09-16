import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Send, X, Clock, Filter, Building2, Search, RotateCcw } from "lucide-react";
import { getLiveAnomalies, getResolvedAnomalyIds, saveResolvedAnomalyId, removeResolvedAnomalyId, getDispatchedNotices, saveDispatchedNotice, removeDispatchedNotice } from "../../utils/anomalies";
import { anomalyApi } from "../../services/api";
import { APPLICATIONS } from "../../data";
import PageHeader from "../shared/PageHeader";

export default function UGCAnomalies({ applications = [] }) {
  const [anomalies, setAnomalies] = useState(() => getLiveAnomalies());
  const [resolved, setResolved] = useState(() => getResolvedAnomalyIds());
  const [dispatchedNotices, setDispatchedNotices] = useState(() => getDispatchedNotices());
  const [noticeModalAnomaly, setNoticeModalAnomaly] = useState(null);
  const [noticeText, setNoticeText] = useState("");

  // Tab State: "active" | "resolved"
  const [statusTab, setStatusTab] = useState("active");

  // Application Filter & View States
  const [selectedAppId, setSelectedAppId] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const allAppsList = Array.isArray(applications) && applications.length > 0 ? applications : APPLICATIONS;

  useEffect(() => {
    anomalyApi
      .getAll()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAnomalies(data);
          data.forEach((item) => {
            if (item.status === "RESOLVED" || item.status === "NOTICE_DISPATCHED") {
              saveResolvedAnomalyId(item.id);
            }
          });
        } else {
          setAnomalies(getLiveAnomalies());
        }
      })
      .catch(() => {
        setAnomalies(getLiveAnomalies());
      });

    const handleUpdate = () => {
      setAnomalies(getLiveAnomalies());
      setResolved(getResolvedAnomalyIds());
      setDispatchedNotices(getDispatchedNotices());
    };
    window.addEventListener("ugc_anomaly_updated", handleUpdate);
    return () => window.removeEventListener("ugc_anomaly_updated", handleUpdate);
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

    const noticeData = {
      dispatchedAt: new Date().toLocaleDateString(),
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      noticeText,
    };

    anomalyApi
      .dispatchNotice(anomalyId, noticeText)
      .then((res) => {
        console.log("[Notice Dispatch Success]", res);
      })
      .catch((e) => console.warn("[Notice Dispatch]", e.message));

    saveDispatchedNotice(anomalyId, noticeData);
    saveResolvedAnomalyId(anomalyId);

    setDispatchedNotices(getDispatchedNotices());
    setResolved(getResolvedAnomalyIds());
    setNoticeModalAnomaly(null);
  };

  const handleReopenAnomaly = (anomalyId) => {
    removeResolvedAnomalyId(anomalyId);
    removeDispatchedNotice(anomalyId);
    setResolved(getResolvedAnomalyIds());
    setDispatchedNotices(getDispatchedNotices());
  };

  // Filter anomalies based on selected application ID and search query
  const filteredAnomalies = anomalies.filter((a) => {
    const appsArray = a.apps || (a.affectedApps ? a.affectedApps.split(",") : []);
    const matchesApp =
      selectedAppId === "ALL" || appsArray.some((appId) => appId.trim() === selectedAppId);

    const matchesSearch =
      (a.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      appsArray.some((appId) => appId.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesApp && matchesSearch;
  });

  // Separate active vs. resolved items
  const activeAnomalies = filteredAnomalies.filter((a) => !resolved.has(a.id));
  const resolvedAnomalies = filteredAnomalies.filter((a) => resolved.has(a.id));

  const displayedList = statusTab === "active" ? activeAnomalies : resolvedAnomalies;

  // Compute application anomaly counts for selector dropdown
  const appAnomalyCounts = {};
  anomalies.forEach((a) => {
    const appsArray = a.apps || (a.affectedApps ? a.affectedApps.split(",") : []);
    appsArray.forEach((appId) => {
      const cleanId = appId.trim();
      if (cleanId) {
        appAnomalyCounts[cleanId] = (appAnomalyCounts[cleanId] || 0) + 1;
      }
    });
  });

  const appOptions = Object.keys(appAnomalyCounts).map((appId) => {
    const appObj = allAppsList.find((app) => app.id === appId);
    return {
      id: appId,
      name: appObj ? appObj.name : appId,
      count: appAnomalyCounts[appId],
    };
  });

  const selectedAppObj = allAppsList.find((a) => a.id === selectedAppId);

  return (
    <div className="p-6 space-y-6 min-h-full">
      <PageHeader
        title="Application-Based Anomaly Detection & Forensic Audit"
        subtitle={`NLP cross-reference engine · Manage active flagged anomalies and review resolved show-cause cases.`}
      />

      {/* Application Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anomalies by title, description, or App ID…"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500 shrink-0" />
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer max-w-xs truncate"
            >
              <option value="ALL">All Applications ({anomalies.length} Anomalies)</option>
              {appOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.id} — {opt.name} ({opt.count} Anomaly)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-amber-600" />
            {activeAnomalies.length > 0 ? `${activeAnomalies.length} Active Unresolved` : "0 Active Anomalies"}
          </span>
        </div>
      </div>

      {/* Selected Application Summary Card Header */}
      {selectedAppId !== "ALL" && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-2.5 py-0.5 rounded-full">
                  {selectedAppId}
                </span>
                <span className="text-xs text-slate-300">Application Anomaly Dossier</span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">
                {selectedAppObj ? selectedAppObj.name : selectedAppId}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedAppObj ? `${selectedAppObj.type} · ${selectedAppObj.state || "India"}` : "Institutional File"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedAppId("ALL")}
            className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
          >
            Show All Applications
          </button>
        </div>
      )}

      {/* Active vs. Resolved Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setStatusTab("active")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusTab === "active"
              ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-800"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <AlertTriangle size={14} className={statusTab === "active" ? "text-amber-400" : "text-amber-500"} />
          <span>Active Flagged Anomalies</span>
          <span className="font-mono text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-extrabold">
            {activeAnomalies.length}
          </span>
        </button>

        <button
          onClick={() => setStatusTab("resolved")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusTab === "resolved"
              ? "bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-700"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <CheckCircle size={14} className={statusTab === "resolved" ? "text-emerald-200" : "text-emerald-600"} />
          <span>Resolved Anomalies</span>
          <span className="font-mono text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-extrabold">
            {resolvedAnomalies.length}
          </span>
        </button>
      </div>

      {/* Anomaly Cards List */}
      <div className="space-y-4">
        {displayedList.length > 0 ? (
          displayedList.map((a) => {
            const isResolved = resolved.has(a.id);
            const notice = dispatchedNotices[a.id];
            const appsArray = a.apps || (a.affectedApps ? a.affectedApps.split(",") : ["APP-2024-0894"]);

            return (
              <div
                key={a.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${
                  isResolved
                    ? "border-emerald-200 bg-emerald-50/20"
                    : a.severity === "Critical"
                      ? "border-l-4 border-l-red-500 border-slate-200"
                      : "border-l-4 border-l-amber-500 border-slate-200"
                }`}
              >
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                          a.severity === "Critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {a.severity}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {a.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{a.description}</p>

                    <div className="flex items-center gap-5 text-xs text-slate-500 flex-wrap">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">{a.id}</span>
                      <span>Detected: {a.detectedAt || "Recent"}</span>
                      <span>
                        NLP Confidence: <span className="font-mono font-bold text-slate-800">{a.confidence || 94}%</span>
                      </span>
                    </div>

                    {notice && (
                      <div className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2 font-medium">
                        <Clock size={13} className="text-amber-600 shrink-0" />
                        <span>14-Day Formal Notice Dispatched · Response Deadline: {notice.deadline}</span>
                      </div>
                    )}

                    {/* Linked Applications Badge List */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Building2 size={12} className="text-slate-400" /> Linked Application(s):
                      </span>
                      {appsArray.map((appId) => {
                        const cleanId = appId.trim();
                        const appObj = allAppsList.find((ap) => ap.id === cleanId);
                        const isSelected = selectedAppId === cleanId;

                        return (
                          <button
                            key={cleanId}
                            onClick={() => setSelectedAppId(cleanId)}
                            className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? "bg-slate-900 text-white shadow-xs"
                                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                            }`}
                            title={`Filter anomalies for ${appObj ? appObj.name : cleanId}`}
                          >
                            <span>{cleanId}</span>
                            {appObj && <span className="font-sans font-medium text-[10px] opacity-80">({appObj.name})</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {!isResolved ? (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenNoticeModal(a)}
                        className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Send size={12} />
                        Dispatch Notice
                      </button>
                      <button
                        onClick={() => {
                          saveResolvedAnomalyId(a.id);
                          setResolved(getResolvedAnomalyIds());
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 py-1 font-semibold cursor-pointer"
                      >
                        Dismiss / Resolve
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 shrink-0 items-end">
                      <span className="text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold shadow-2xs">
                        <CheckCircle size={14} className="text-emerald-700" />
                        {notice ? "Notice Dispatched & Resolved" : "Resolved"}
                      </span>
                      <button
                        onClick={() => handleReopenAnomaly(a.id)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <RotateCcw size={11} /> Re-open Anomaly
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
            <AlertTriangle size={24} className="mx-auto text-slate-400" />
            <p className="text-sm font-bold text-slate-700">
              {statusTab === "active"
                ? "No active unresolved anomalies found for the selected filter."
                : "No resolved anomalies in this folder yet."}
            </p>
            {selectedAppId !== "ALL" && (
              <button
                onClick={() => {
                  setSelectedAppId("ALL");
                  setSearchQuery("");
                }}
                className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notice Dispatch Modal */}
      {noticeModalAnomaly && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setNoticeModalAnomaly(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Send size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Dispatch Formal Show-Cause Notice</h3>
                <p className="text-xs text-slate-500">Anomaly Ref: {noticeModalAnomaly.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Official Intimation Draft</label>
                <textarea
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  rows={6}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
                <Clock size={14} className="text-amber-700 shrink-0" />
                <span>
                  Dispatched notices set a mandatory 14-day SLA deadline and move the anomaly to the Resolved tab.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setNoticeModalAnomaly(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatchNoticeSubmit}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} />
                  Confirm & Dispatch Intimation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
