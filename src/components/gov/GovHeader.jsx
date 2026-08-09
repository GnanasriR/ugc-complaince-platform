import { useState } from "react";
import { Landmark, Shield } from "lucide-react";
import { GOV_NAVY, GOV_NAVY_DARK, SAFFRON, INDIA_GREEN } from "./constants";
import TricolorBar from "./TricolorBar";

export default function GovHeader({ ministry, portalTag, brand }) {
  const [lang, setLang] = useState("en");
  const [, setFontSize] = useState(1);

  return (
    <div className="shrink-0">
      <div className="text-white text-[10px]" style={{ background: GOV_NAVY_DARK }}>
        <div className="flex items-center justify-between px-5 py-1">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline opacity-80">भारत सरकार · Government of India</span>
            <span className="opacity-50">|</span>
            <a className="hover:underline opacity-90 cursor-pointer">Skip to Main Content</a>
            <span className="opacity-50">|</span>
            <a className="hover:underline opacity-90 cursor-pointer">Screen Reader Access</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-mono">
              <button onClick={() => setFontSize((f) => Math.max(0.9, f - 0.1))} className="w-4 h-4 flex items-center justify-center hover:bg-white/10 rounded">
                A-
              </button>
              <button onClick={() => setFontSize(1)} className="w-4 h-4 flex items-center justify-center hover:bg-white/10 rounded">
                A
              </button>
              <button onClick={() => setFontSize((f) => Math.min(1.2, f + 0.1))} className="w-4 h-4 flex items-center justify-center hover:bg-white/10 rounded">
                A+
              </button>
            </div>
            <span className="opacity-50">|</span>
            <button onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))} className="hover:underline font-semibold">
              {lang === "en" ? "हिंदी" : "English"}
            </button>
          </div>
        </div>
      </div>
      <TricolorBar />
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 ring-2"
            style={{ background: GOV_NAVY, borderColor: SAFFRON }}
          >
            <Landmark size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-bold leading-tight" style={{ color: GOV_NAVY }}>
              {ministry}
            </p>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Government of India · भारत सरकार</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {brand && (
            <div className="flex items-center gap-2 pr-3 mr-1 border-r border-slate-200">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#0B2953,#123B6B)" }}
              >
                <Shield size={14} className="text-white" />
              </div>
              <p className="text-sm font-black text-slate-900 leading-none">
                Compliance<span className="text-emerald-600"> AI</span>
              </p>
            </div>
          )}
          {portalTag && (
            <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: INDIA_GREEN }}>
              {portalTag}
            </span>
          )}
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded border" style={{ color: GOV_NAVY, borderColor: GOV_NAVY }}>
            Digital India
          </span>
        </div>
      </div>
    </div>
  );
}
