import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  User,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  KeyRound,
  CheckCircle,
} from "lucide-react";
import GovHeader from "../gov/GovHeader";
import GovFooter from "../gov/GovFooter";
import { GOV_NAVY } from "../gov/constants";

/** Resolve portal from credentials — UGC/AICTE emails → regulatory portal, else institution. */
function resolveRole(identifier = "") {
  const id = identifier.trim().toLowerCase();
  if (!id) return "institution";
  if (
    id.includes("@ugc.gov.in") ||
    id.includes("@aicte.gov.in") ||
    id.includes("@gov.in") ||
    id.startsWith("ugc") ||
    id.startsWith("officer")
  ) {
    return "ugc";
  }
  return "institution";
}

export default function HomePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [otpContact, setOtpContact] = useState("");

  const handleSignIn = () => {
    const identifier = mode === "password" ? email : otpContact;
    const role = resolveRole(identifier);
    navigate(role === "ugc" ? "/ugc/dashboard" : "/institution/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F0F4F8" }}>
      <GovHeader
        ministry="University Grants Commission · अखिल भारतीय तकनीकी शिक्षा परिषद (AICTE)"
        portalTag="Compliance AI Platform"
        brand
      />

      <div className="flex-1 flex flex-col">
        <div
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#061A33 0%,#0B2953 55%,#123B6B 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
            <span className="inline-flex items-center gap-2 text-xs text-emerald-200 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-6 font-semibold">
              <Globe size={12} />
              Government of India · Ministry of Education
            </span>
            <h1 className="text-5xl font-black text-white mb-4 leading-none tracking-tight">
              Compliance<span className="text-emerald-300"> AI</span>
            </h1>
            <p className="text-emerald-100 text-lg mb-2 font-medium">
              UGC / AICTE Institutional Compliance Management Platform
            </p>
            <p className="text-emerald-300 text-sm max-w-xl mx-auto">
              AI-powered regulatory intelligence — streamlining institutional approvals, NLP-driven document
              verification, and real-time anomaly detection across India's higher education sector.
            </p>
            <div className="grid grid-cols-4 gap-4 mt-10 max-w-2xl mx-auto">
              {[
                { value: "4,812", label: "Applications" },
                { value: "78.3%", label: "Compliance Rate" },
                { value: "14", label: "NLP Parameters" },
                { value: "91.3%", label: "Model Accuracy" },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 border border-white/15 rounded-xl py-3">
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-[11px] text-emerald-200 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto w-full px-6 -mt-8 pb-16">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-7 pt-7 pb-2 text-center">
              <h2 className="text-lg font-black text-slate-900">Sign in to Compliance AI</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your dashboard is assigned from your registered role
              </p>
            </div>

            <div className="px-7 pt-5 flex items-center gap-5 border-b border-slate-100">
              <button
                onClick={() => {
                  setMode("password");
                  setOtpSent(false);
                }}
                className={`text-xs font-semibold pb-3 border-b-2 transition-colors ${
                  mode === "password" ? "border-current" : "border-transparent text-slate-400"
                }`}
                style={mode === "password" ? { color: GOV_NAVY } : undefined}
              >
                Password Login
              </button>
              <button
                onClick={() => {
                  setMode("otp");
                  setOtpSent(false);
                }}
                className={`text-xs font-semibold pb-3 border-b-2 transition-colors ${
                  mode === "otp" ? "border-current" : "border-transparent text-slate-400"
                }`}
                style={mode === "otp" ? { color: GOV_NAVY } : undefined}
              >
                OTP Login
              </button>
            </div>

            <div className="px-7 py-6 space-y-4">
              {mode === "password" ? (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1.5 block">Email / Username</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your registered email or username"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-sm transition-all"
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 0 3px ${GOV_NAVY}22`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-semibold text-slate-600">Password</label>
                      <a className="text-[11px] font-semibold hover:underline cursor-pointer" style={{ color: GOV_NAVY }}>
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-sm transition-all"
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 0 3px ${GOV_NAVY}22`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                      <button
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSignIn}
                    className="w-full text-white text-sm font-bold py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    style={{ background: GOV_NAVY }}
                  >
                    <Lock size={14} />
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1.5 block">
                      Registered Mobile / Email
                    </label>
                    <div className="relative">
                      <Smartphone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={otpContact}
                        onChange={(e) => setOtpContact(e.target.value)}
                        disabled={otpSent}
                        placeholder="+91 XXXXX XXXXX or registered email"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-sm transition-all disabled:bg-slate-50 disabled:text-slate-400"
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 0 3px ${GOV_NAVY}22`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>
                  {!otpSent ? (
                    <button
                      onClick={() => setOtpSent(true)}
                      className="w-full text-white text-sm font-bold py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      style={{ background: GOV_NAVY }}
                    >
                      <KeyRound size={14} />
                      Send OTP
                    </button>
                  ) : (
                    <>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 mb-1.5 block">Enter 6-digit OTP</label>
                        <div className="flex gap-2">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <input
                              key={i}
                              maxLength={1}
                              className="w-full text-center bg-white border border-slate-200 rounded-xl py-2.5 text-sm font-bold text-slate-900 focus:outline-none shadow-sm"
                              onFocus={(e) => {
                                e.currentTarget.style.boxShadow = `0 0 0 3px ${GOV_NAVY}22`;
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                          Didn't receive it?{" "}
                          <a
                            onClick={() => setOtpSent(false)}
                            className="font-semibold hover:underline cursor-pointer"
                            style={{ color: GOV_NAVY }}
                          >
                            Resend OTP
                          </a>
                        </p>
                      </div>
                      <button
                        onClick={handleSignIn}
                        className="w-full text-white text-sm font-bold py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        style={{ background: GOV_NAVY }}
                      >
                        <CheckCircle size={14} />
                        Verify & Sign In
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="px-7 pb-6 pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 text-center">
                By signing in you agree to the Government of India's{" "}
                <a className="underline cursor-pointer">Terms of Use</a> and{" "}
                <a className="underline cursor-pointer">Privacy Policy</a>.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <Lock size={13} className="text-slate-400" />
              <span className="text-[11px] font-medium">End-to-end encrypted · ISO 27001 compliant</span>
            </div>
            <div className="flex items-center divide-x divide-slate-200">
              {["NIC Hosted", "MeitY Approved"].map((t) => (
                <span key={t} className="text-[11px] text-slate-400 px-3 first:pl-0 last:pr-0">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <GovFooter />
    </div>
  );
}
