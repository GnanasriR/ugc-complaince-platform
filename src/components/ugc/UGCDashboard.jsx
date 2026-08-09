import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
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

export default function UGCDashboard() {
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
              Live · 14 Nov 2024, 14:32 IST
            </span>
            <h2 className="text-xl font-black text-white">Regulatory Overview</h2>
            <p className="text-emerald-200 text-sm mt-0.5">UGC/AICTE Compliance Analytics · Cycle 2024–25</p>
          </div>
          <div className="relative text-right">
            <p className="text-emerald-200 text-xs">Cycle Progress</p>
            <p className="text-white text-3xl font-bold mt-1">68.4%</p>
            <div className="w-28 h-1.5 bg-white/20 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-green-300 rounded-full" style={{ width: "68.4%" }} />
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
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="apg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "JetBrains Mono,monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "JetBrains Mono,monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                }}
              />
              <Area type="monotone" dataKey="apps" stroke="#0D9488" strokeWidth={2} fill="url(#ag)" name="Submitted" />
              <Area type="monotone" dataKey="approved" stroke="#059669" strokeWidth={2} fill="url(#apg)" name="Approved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-5">5-Stage Pipeline</h3>
          <div className="space-y-4">
            {PIPELINE_STAGES.map((s) => (
              <div key={s.stage}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-slate-600">{s.stage}</span>
                  <span className="font-mono text-xs font-semibold text-slate-800">{s.count.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Compliance by Institution Type</h3>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={COMPLIANCE_BY_TYPE} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="type"
                tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "JetBrains Mono,monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "JetBrains Mono,monospace" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v}%`, "Compliance"]}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {COMPLIANCE_BY_TYPE.map((e) => (
                  <Cell key={e.type} fill={e.rate >= 80 ? "#059669" : e.rate >= 70 ? "#0D9488" : "#DC2626"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Top Anomaly Categories</h3>
          <div className="space-y-3">
            {ANOMALY_CATEGORIES.map((a) => (
              <div key={a.category} className="flex items-center gap-3">
                <div
                  className={`w-1.5 h-6 rounded-full shrink-0 ${
                    a.severity === "Critical" ? "bg-red-500" : a.severity === "High" ? "bg-amber-500" : "bg-emerald-400"
                  }`}
                />
                <p className="text-xs text-slate-700 flex-1 truncate">{a.category}</p>
                <span className="font-mono text-sm font-bold text-slate-900 shrink-0">{a.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
