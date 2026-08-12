import { useState } from "react";
import { CheckCircle, Upload, FileText, Check } from "lucide-react";
import { CHECKLIST_ITEMS } from "../../data";
import PageHeader from "../shared/PageHeader";

export default function InstDocVault() {
  const [items, setItems] = useState(CHECKLIST_ITEMS);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleToggle = (id) => {
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    );
    setUploadMessage("Document vault updated cleanly!");
    setTimeout(() => setUploadMessage(""), 3000);
  };

  return (
    <div className="p-6 min-h-full">
      <PageHeader
        title="Document Vault"
        subtitle="Manage, upload, and track all annexure documents for your application"
      />

      {uploadMessage && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium">
          <Check size={14} className="text-emerald-600" />
          <span>{uploadMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {items.map((c) => (
          <div
            key={c.id || c.name}
            className={`bg-white border rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all ${
              c.done ? "border-emerald-200" : "border-amber-200"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                c.done ? "bg-emerald-50" : "bg-amber-50"
              }`}
            >
              {c.done ? (
                <CheckCircle size={20} className="text-emerald-600" />
              ) : (
                <Upload size={20} className="text-amber-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">{c.name || c.item}</p>
              <p className={`text-xs mt-0.5 font-medium ${c.done ? "text-emerald-600" : "text-amber-600"}`}>
                {c.done ? "Uploaded & SHA-256 Hashed" : "Pending upload"}
              </p>
              {c.done && (
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  SHA-256: E3B0C44298FC1C149AFBF4C8996FB924
                </p>
              )}
            </div>
            <button
              onClick={() => handleToggle(c.id)}
              className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                c.done
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
              }`}
            >
              {c.done ? "Replace File" : "Upload Document"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
