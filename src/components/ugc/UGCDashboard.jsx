import { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { PIPELINE_STAGES, COMPLIANCE_BY_TYPE, TREND_DATA, APPLICATIONS } from "../../data";
import { analyticsApi } from "../../services/api";
import { getLiveAnomalies } from "../../utils/anomalies";
import { getAppUploadedDocs } from "../../utils/appDocs";

function filterActiveApps(appList) {
  if (!Array.isArray(appList)) return [];
  let declinedIds = [];
  try {
    const savedDeclined = localStorage.getItem("ugc_declined_app_ids");
    if (savedDeclined) declinedIds = JSON.parse(savedDeclined);
  } catch (e) {}

  return appList.filter((app) => {
    if (!app || !app.id) return false;
    if (declinedIds.includes(app.id)) return false;
    const status = (app.status || "").toLowerCase();
    if (status === "draft" || status.includes("draft")) return false;
    if (status.includes("rejected") || status.includes("declined")) return false;
    return true;
  });
}

export default function UGCDashboard({ applications = [] }) {
  const [pipelineStages, setPipelineStages] = useState([]);
  const [complianceByType, setComplianceByType] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const [promotedApps, setPromotedApps] = useState(() => {
    try {
      const saved = localStorage.getItem("ugc_all_apps");
      return saved ? filterActiveApps(JSON.parse(saved)) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const handlePromoted = (e) => {
      if (e.detail?.apps) {
        setPromotedApps(filterActiveApps(e.detail.apps));
      } else {
        try {
          const saved = localStorage.getItem("ugc_all_apps");
          setPromotedApps(saved ? filterActiveApps(JSON.parse(saved)) : []);
        } catch (err) {}
      }
    };
    window.addEventListener("ugc_application_promoted", handlePromoted);
    return () => window.removeEventListener("ugc_application_promoted", handlePromoted);
  }, []);

  const fetchLiveAnalytics = () => {
    analyticsApi
      .getPipelineStages()
      .then((data) => {
        setPipelineStages(Array.isArray(data) && data.length > 0 ? data : PIPELINE_STAGES);
      })
      .catch(() => setPipelineStages(PIPELINE_STAGES));

    analyticsApi
      .getComplianceByType()
      .then((data) => {
        setComplianceByType(Array.isArray(data) && data.length > 0 ? data : COMPLIANCE_BY_TYPE);
      })
      .catch(() => setComplianceByType(COMPLIANCE_BY_TYPE));

    analyticsApi
      .getTrends()
      .then((data) => {
        setTrendData(Array.isArray(data) && data.length > 0 ? data : TREND_DATA);
      })
      .catch(() => setTrendData(TREND_DATA));

    setLastRefreshed(new Date());
  };

  useEffect(() => {
    fetchLiveAnalytics();
    const interval = setInterval(fetchLiveAnalytics, 300000);
    return () => clearInterval(interval);
  }, []);

  const displayCompliance = complianceByType.length > 0 ? complianceByType : COMPLIANCE_BY_TYPE;
  const displayTrends = trendData.length > 0 ? trendData : TREND_DATA;

  const sortedAppsForDashboard = [...(promotedApps.length > 0 ? promotedApps : APPLICATIONS)].sort((a, b) => {
    const getWeight = (app) => {
      const st = (app.status || "").toLowerCase();
      if (st.includes("approved") || st.includes("granted")) return 5;
      if (st.includes("committee") || st.includes("pending grant") || st.includes("expert")) return 4;
      if (st.includes("flagged") || st.includes("discrepancy")) return 3;
      if (st.includes("re-evaluated") || st.includes("ai verified")) return 2;
      return 1;
    };
    return getWeight(b) - getWeight(a);
  });

  return (
    <div className="p-6 space-y-6 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">UGC / AICTE Regulatory Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time compliance monitoring, priority pipeline health & risk attribution
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-mono">
            Auto-sync: {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchLiveAnalytics}
            className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            Sync Analytics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: "4,812", sub: "+12.4% YoY", icon: FileText, dir: "up" },
          { label: "Overall Compliance Rate", value: "78.3%", sub: "+4.1% vs FY24", icon: CheckCircle, dir: "up" },
          { label: "Avg. Review Cycle", value: "2.4 Days", sub: "-68% reduction", icon: Clock, dir: "down" },
          { label: "Anomalies Flagged", value: String(getLiveAnomalies(promotedApps).length), sub: "Active Forensics Queue", icon: AlertTriangle, dir: "flat" },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <k.icon size={16} />
              </div>
              <span
                className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  k.dir === "up"
                    ? "bg-emerald-50 text-emerald-600"
                    : k.dir === "down"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-600"
                }`}
              >
                {k.dir === "up" ? <TrendingUp size={10} /> : k.dir === "down" ? <TrendingDown size={10} /> : <Activity size={10} />}
                {k.sub}
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-0.5">{k.value}</div>
            <p className="text-[10px] text-slate-400">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Priority Application Pipeline Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">UGC Priority Review Pipeline Queue</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {promotedApps.length > 0 ? `${promotedApps.length} Applications` : "8 Applications Active"}
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 text-left bg-slate-50/50">
              <th className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5 pl-5">
                Rank & Application ID
              </th>
              <th className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5">
                Institution Name
              </th>
              <th className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5">
                Type
              </th>
              <th className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5">
                AI XGBoost Prob
              </th>
              <th className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5">
                NLP Compliance
              </th>
              <th className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-4 py-2.5 pr-5">
                Status & Priority
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAppsForDashboard.slice(0, 5).map((app, index) => (
              <tr
                key={app.id}
                className={`border-b border-slate-100 transition-colors ${
                  index === 0 && (app.isTopPriority || app.status?.includes("Re-evaluated"))
                    ? "bg-emerald-50/70 font-medium"
                    : "hover:bg-slate-50/60"
                }`}
              >
                <td className="px-4 py-3 pl-5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-mono ${
                        index === 0
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800">{app.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-bold text-slate-900">{app.name}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{app.type}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {app.mlProb || 88}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  {getAppUploadedDocs(app.id).length === 0 ? (
                    <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200" title="No documents uploaded yet">
                      No Docs
                    </span>
                  ) : (
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {app.nlpScore || 90}%
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 pr-5">
                  {index === 0 && (app.isTopPriority || app.status?.includes("Re-evaluated")) ? (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit shadow-2xs">
                      <Sparkles size={12} className="text-emerald-700" /> Top Priority (AI Re-evaluated)
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      {app.status || "Under Review"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Application Volume & Approvals</h3>
          <p className="text-xs text-slate-500 mb-4">Monthly trend · Cycle 2024–25</p>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={displayTrends}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="apps" name="Applications" stroke="#059669" fill="url(#ag)" strokeWidth={2} />
              <Area type="monotone" dataKey="approved" name="Approved" stroke="#10B981" fill="none" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Compliance Rate by Discipline</h3>
          <p className="text-xs text-slate-500 mb-4">Percentage meeting UGC norms</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={displayCompliance} layout="vertical" margin={{ left: -10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                {displayCompliance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.rate >= 75 ? "#059669" : entry.rate >= 65 ? "#D97706" : "#DC2626"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
