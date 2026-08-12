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
import { PIPELINE_STAGES, COMPLIANCE_BY_TYPE, TREND_DATA, ANOMALY_CATEGORIES } from "../../data";
import { analyticsApi } from "../../services/api";

export default function UGCDashboard() {
  const [pipelineStages, setPipelineStages] = useState(PIPELINE_STAGES);
  const [complianceByType, setComplianceByType] = useState(COMPLIANCE_BY_TYPE);
  const [trendData, setTrendData] = useState(TREND_DATA);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchLiveAnalytics = () => {
    analyticsApi
      .getPipelineStages()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPipelineStages(data);
      })
      .catch(() => {});

    analyticsApi
      .getComplianceByType()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setComplianceByType(data);
      })
      .catch(() => {});

    analyticsApi
      .getTrends()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setTrendData(data);
      })
      .catch(() => {});

    setLastRefreshed(new Date());
  };

  // 5-minute Auto Refresh (FR-REP-001)
  useEffect(() => {
    fetchLiveAnalytics();
    const interval = setInterval(fetchLiveAnalytics, 300000); // 5 mins
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    { label: "Total Applications", value: "4,812", delta: "+312", dir: "up", sub: "this cycle", bg: "bg-emerald-50", ic: "text-emerald-600", icon: FileText },
    { label: "Compliance Rate", value: "78.3%", delta: "+2.1%", dir: "up", sub: "vs last cycle", bg: "bg-emerald-50", ic: "text-emerald-600", icon: CheckCircle },
    { label: "Pending Review", value: "1,204", delta: "3.2d", dir: "warn", sub: "avg pending", bg: "bg-amber-50", ic: "text-amber-600", icon: Clock },
    { label: "High-Risk Flagged", value: "347", delta: "7.2%", dir: "down", sub: "of pipeline", bg: "bg-red-50", ic: "text-red-600", icon: AlertTriangle },
  ];

  return (
    <div className="p-6 space-y-5 min-h-full">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg,#052E2B,#059669 55%,#10B981)" }}
      >
        <div className="px-7 py-5 flex items-center justify-between relative">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative">
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-200 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full mb-2 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
              Live · Refreshed {lastRefreshed.toLocaleTimeString()} (5m auto-sync)
            </span>
            <h2 className="text-xl font-black text-white">Regulatory Overview</h2>
            <p className="text-emerald-200 text-sm mt-0.5">UGC/AICTE Compliance Analytics · Cycle 2024–25</p>
          </div>
          <div className="relative flex items-center gap-4">
            <button
              onClick={fetchLiveAnalytics}
              className="bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 font-semibold transition-all"
            >
              <RefreshCw size={12} />
              Sync Now
            </button>
            <div className="text-right">
              <p className="text-emerald-200 text-xs">Cycle Progress</p>
              <p className="text-white text-3xl font-bold mt-1">68.4%</p>
              <div className="w-28 h-1.5 bg-white/20 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-green-300 rounded-full" style={{ width: "68.4%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center`}>
                <k.icon size={16} className={k.ic} />
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
                {k.delta}
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-0.5">{k.value}</div>
            <p className="text-[10px] text-slate-400">
              {k.sub} · {k.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Application Volume & Approvals</h3>
          <p className="text-xs text-slate-500 mb-4">Monthly trend · Cycle 2024–25</p>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={trendData}>
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
            <BarChart data={complianceByType} layout="vertical" margin={{ left: -10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                {complianceByType.map((entry, index) => (
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
