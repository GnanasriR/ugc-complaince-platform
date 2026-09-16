import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Search, Eye, Bell, GitBranch } from "lucide-react";
import PageHeader from "../shared/PageHeader";
import StatusBadge from "../shared/StatusBadge";
import MiniBar from "../shared/MiniBar";

export default function UGCPipeline({ applications }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const statuses = ["All", "New", "Approved", "Under Review", "Flagged", "Escalated", "Rejected"];

  const filtered = (applications || [])
    .filter((a) => a && (a.status || "").toLowerCase() !== "draft" && !(a.status || "").toLowerCase().includes("draft"))
    .filter(
      (a) =>
        (filter === "All" || a.status === filter) &&
        (a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="p-6 min-h-full">
      <PageHeader title="Application Pipeline Queue" subtitle="ML-ranked queue · real-time NLP scoring & verification">
        <button
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filtered));
            const downloadAnchor = document.createElement("a");
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "ugc_applications_pipeline.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors"
        >
          <Download size={13} />
          Export JSON
        </button>
      </PageHeader>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded text-xs transition-all cursor-pointer ${
                filter === s ? "bg-emerald-600 text-white font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or Institution…"
            className="bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 shadow-sm w-64"
          />
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Application ID", "Institution", "Type", "NLP Score", "ML Prob.", "Risk", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-4 py-3 first:pl-5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, i) => (
                <tr
                  key={app.id}
                  className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors ${
                    i === filtered.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-4 py-3.5 pl-5">
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold">
                      {app.id}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-slate-900">{app.name}</p>
                    <p className="text-xs text-slate-400">{app.state}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">{app.type}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    {app.status === "New" ? (
                      <span className="text-xs text-sky-600 font-medium">Pending scan</span>
                    ) : (
                      <MiniBar
                        value={app.nlpScore}
                        color={app.nlpScore >= 75 ? "#059669" : app.nlpScore >= 55 ? "#0D9488" : "#DC2626"}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {app.status === "New" ? (
                      <span className="text-xs text-sky-600 font-medium">—</span>
                    ) : (
                      <MiniBar
                        value={app.mlProb}
                        color={app.risk === "Low" ? "#059669" : app.risk === "Medium" ? "#0D9488" : "#DC2626"}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        app.risk === "Low"
                          ? "text-emerald-700 bg-emerald-50"
                          : app.risk === "Medium"
                            ? "text-emerald-700 bg-emerald-50"
                            : app.risk === "Pending"
                              ? "text-sky-700 bg-sky-50"
                              : "text-red-700 bg-red-50"
                      }`}
                    >
                      {app.risk}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3.5 pr-5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => navigate(`/ugc/nlp/${app.id}`)}
                        title="Inspect NLP Parameters"
                        className="text-slate-500 hover:text-emerald-600 p-1.5 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate("/ugc/anomaly")}
                        title="Check Anomalies"
                        className="text-slate-500 hover:text-amber-600 p-1.5 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Bell size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <GitBranch size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Applications in Queue</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Applications filed by institutional applicants will appear here in real-time as they pass through the recognition pipeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
