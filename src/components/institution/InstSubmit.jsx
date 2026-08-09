import { useState } from "react";
import { CheckCircle, Upload, AlertCircle, Send, ChevronRight } from "lucide-react";
import { APPLICATION_CATALOGUE, BASE_REQUIRED_DOCS, EXTRA_REQUIRED_DOC } from "../../data";
import PageHeader from "../shared/PageHeader";
import StatusBadge from "../shared/StatusBadge";

export default function InstSubmit({ onSubmitApplication }) {
  const [step, setStep] = useState(1);
  const [module, setModule] = useState("UGC");
  const [selectedType, setSelectedType] = useState(null);
  const [form, setForm] = useState({
    institutionName: "Deccan Institute of Management",
    programme: "",
    cycle: "2025–26",
    state: "Telangana",
    city: "Hyderabad",
    contact: "Dr. Aarav Mehta",
    email: "registrar@deccan-mgmt.edu.in",
    phone: "+91 98450 12233",
    remarks: "",
  });
  const [docs, setDocs] = useState({});
  const [submitted, setSubmitted] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const steps = ["Application Type", "Details", "Documents"];
  const ic =
    "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 shadow-sm transition-all";

  const typeInfo = selectedType
    ? [...APPLICATION_CATALOGUE.UGC, ...APPLICATION_CATALOGUE.AICTE].find((t) => t.id === selectedType)
    : null;
  const requiredDocs = selectedType
    ? [...BASE_REQUIRED_DOCS, EXTRA_REQUIRED_DOC[selectedType]]
    : BASE_REQUIRED_DOCS;
  const allUploaded = requiredDocs.every((d) => docs[d]);

  const handleSubmit = () => {
    const newId = `APP-2025-${String(900 + Math.floor(Math.random() * 90)).padStart(4, "0")}`;
    onSubmitApplication(
      { id: newId, name: form.institutionName, type: typeInfo?.label ?? "General", state: form.state },
      { id: newId, cycle: form.cycle, type: typeInfo?.label ?? "General", submitted: new Date().toISOString().slice(0, 10) }
    );
    setSubmitted(newId);
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedType(null);
    setDocs({});
    setSubmitted(null);
  };

  if (submitted) {
    return (
      <div className="p-6 min-h-full flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-1">Application Submitted</h2>
          <p className="text-sm text-slate-500 mb-4">
            {typeInfo?.label} has been filed and is now visible to UGC/AICTE reviewers.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-slate-800">{submitted}</span>
            <StatusBadge status="New" />
          </div>
          <button
            onClick={resetWizard}
            className="flex items-center gap-2 justify-center w-full bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-bold shadow-sm"
          >
            <Send size={14} />
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-full">
      <PageHeader title="New Compliance Application" subtitle="UGC / AICTE Recognition, Approval & Compliance Filing" />
      <div className="flex items-center mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-3">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <button
              onClick={() => i + 1 < step && setStep(i + 1)}
              className={`flex items-center gap-2 ${i + 1 < step ? "cursor-pointer" : "cursor-default"}`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  step === i + 1
                    ? "bg-emerald-600 text-white"
                    : i + 1 < step
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {i + 1 < step ? <CheckCircle size={12} /> : i + 1}
              </span>
              <span
                className={`text-xs font-medium ${
                  step === i + 1 ? "text-emerald-700" : i + 1 < step ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {s}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${i + 1 < step ? "bg-emerald-300" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7">
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-1 max-w-xs">
              {["UGC", "AICTE"].map((m) => (
                <button
                  key={m}
                  onClick={() => setModule(m)}
                  className={`text-xs font-bold py-2 rounded-lg transition-all ${
                    module === m ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {m} Module
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {APPLICATION_CATALOGUE[module].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    selectedType === t.id
                      ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300"
                      : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedType === t.id ? "bg-emerald-100" : "bg-slate-100"
                    }`}
                  >
                    <t.icon size={16} className={selectedType === t.id ? "text-emerald-700" : "text-slate-500"} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{t.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t.desc}</p>
                  </div>
                  {selectedType === t.id && <CheckCircle size={16} className="text-emerald-600 ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5">
              {typeInfo && <typeInfo.icon size={15} className="text-emerald-700 shrink-0" />}
              <p className="text-sm font-semibold text-emerald-800">{typeInfo?.label}</p>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                Institution Name *
              </label>
              <input
                value={form.institutionName}
                onChange={(e) => update("institutionName", e.target.value)}
                className={ic}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                Programme / Course Name
              </label>
              <input
                value={form.programme}
                onChange={(e) => update("programme", e.target.value)}
                placeholder="If applicable"
                className={ic}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                Application Cycle
              </label>
              <input value={form.cycle} onChange={(e) => update("cycle", e.target.value)} className={ic} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">State</label>
              <input value={form.state} onChange={(e) => update("state", e.target.value)} className={ic} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">City</label>
              <input value={form.city} onChange={(e) => update("city", e.target.value)} className={ic} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                Contact Person
              </label>
              <input value={form.contact} onChange={(e) => update("contact", e.target.value)} className={ic} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Email</label>
              <input value={form.email} onChange={(e) => update("email", e.target.value)} className={ic} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Phone</label>
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={ic} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                Remarks / Justification
              </label>
              <textarea
                value={form.remarks}
                onChange={(e) => update("remarks", e.target.value)}
                rows={3}
                placeholder="Brief context for this application…"
                className={ic}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {requiredDocs.map((d) => (
                <button
                  key={d}
                  onClick={() => setDocs((v) => ({ ...v, [d]: !v[d] }))}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                    docs[d] ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200 hover:border-amber-300"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      docs[d] ? "bg-emerald-100" : "bg-amber-100"
                    }`}
                  >
                    {docs[d] ? (
                      <CheckCircle size={14} className="text-emerald-600" />
                    ) : (
                      <Upload size={13} className="text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{d}</p>
                    <p className={`text-[11px] ${docs[d] ? "text-emerald-600" : "text-amber-600"}`}>
                      {docs[d] ? "Uploaded" : "Click to upload"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {!allUploaded && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5 font-medium">
                <AlertCircle size={12} />
                Upload all required documents to submit.
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-7 pt-6 border-t border-slate-100">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
          >
            ← Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              disabled={step === 1 && !selectedType}
              className="flex items-center gap-2 bg-emerald-600 text-white text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-700 font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allUploaded}
              className="flex items-center gap-2 bg-emerald-600 text-white text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-700 font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
