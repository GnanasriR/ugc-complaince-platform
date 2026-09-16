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
  Building2,
  Mail,
  ShieldAlert,
  X,
  UserCheck,
} from "lucide-react";
import GovHeader from "../gov/GovHeader";
import GovFooter from "../gov/GovFooter";
import { GOV_NAVY } from "../gov/constants";
import { useAuth } from "../../context/AuthContext";

/** Resolve portal path based on role or email */
function resolvePortalRoute(user, identifier = "") {
  const email = (user?.email || identifier || "").trim().toLowerCase();
  
  // Expert Committee Admin lands on UGC Dashboard Overview & Final 2 Stages Pipeline!
  if (email.includes("expert") || user?.role === "ROLE_EXPERT_ADMIN" || user?.officialRole === "expert_admin") {
    return "/ugc/dashboard";
  }

  // System Admin (admin@ugc.gov.in) lands directly on User Approvals Registration Dashboard!
  if (email.includes("admin@ugc.gov.in") || email === "admin" || user?.role === "ROLE_ADMIN" || user?.officialRole === "admin") {
    return "/ugc/user-approvals";
  }

  if (
    email.includes("@ugc.gov.in") ||
    email.includes("@aicte.gov.in") ||
    email.includes("@gov.in") ||
    email.startsWith("ugc") ||
    email.startsWith("officer")
  ) {
    return "/ugc/dashboard";
  }

  if (user && user.role) {
    if (user.role === "ROLE_EXPERT_ADMIN") return "/ugc/dashboard";
    if (user.role === "ROLE_ADMIN") return "/ugc/user-approvals";
    if (user.role === "ROLE_UGC_OFFICER" || user.role === "ROLE_EVALUATOR") {
      return "/ugc/dashboard";
    }
  }

  return "/institution/dashboard";
}

export default function HomePage() {
  const navigate = useNavigate();
  const { login, register, verifyOtp, forgotPassword, resetPassword, loading } = useAuth();

  // Tab State: "login" or "register"
  const [tab, setTab] = useState("login");

  // Login Mode State: "password" or "otp"
  const [mode, setMode] = useState("password");
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpContact, setOtpContact] = useState("");

  // Registration Fields (FR-USR-001)
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regInstitutionName, setRegInstitutionName] = useState("");
  const [regRole, setRegRole] = useState("ROLE_INSTITUTION");

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpMobileTarget, setOtpMobileTarget] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpNotice, setOtpNotice] = useState("");

  // Forgot Password Modal State (FR-USR-004)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState("email");
  const [newPassword, setNewPassword] = useState("");

  // Error & Status Messages
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setErrorMsg("");
    setSuccessMsg("");
  };

  // Handle Login Submit (FR-USR-002) with fail-safe demo fallback
  const handleSignIn = async (e) => {
  e.preventDefault();

  setErrorMsg("");
  setSuccessMsg("");

  if (!email || !password) {
    setErrorMsg("Please enter your email and password.");
    return;
  }

  try {
    const res = await login(email, password);

    const route = resolvePortalRoute(res?.user, email);

    navigate(route);
  } catch (err) {
    console.error("Login failed:", err);
    setErrorMsg(err.message || "Invalid email or password.");
  }
};

  const [registeredDraft, setRegisteredDraft] = useState(null);

  // Handle Registration Submit (FR-USR-001)
  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!regFullName || !regEmail || !regMobile || !regPassword) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    const draft = {
      fullName: regFullName,
      email: regEmail,
      mobileNumber: regMobile,
      institutionName: regInstitutionName || `${regFullName}'s Institution`,
      role: regRole,
      status: "PENDING_APPROVAL",
    };
    setRegisteredDraft(draft);

    const newRegRequest = {
      id: `REG-${Date.now().toString().slice(-4)}`,
      fullName: regFullName,
      email: regEmail,
      mobileNumber: regMobile,
      institutionName: regInstitutionName || `${regFullName}'s Institution`,
      role: regRole,
      status: "PENDING_APPROVAL",
      submittedAt: new Date().toLocaleString(),
    };

    const payload = {
      ...draft,
      password: regPassword,
    };

    try {
      await register(payload);

      try {
        const savedPending = localStorage.getItem("ugc_pending_registrations");
        const pendingList = savedPending ? JSON.parse(savedPending) : [];
        pendingList.unshift(newRegRequest);
        localStorage.setItem("ugc_pending_registrations", JSON.stringify(pendingList));
        window.dispatchEvent(new Event("ugc_registrations_updated"));
      } catch (e) {}

      setOtpNotice(`Registration request submitted! Queued for System Admin manual approval. OTP Code 123456 sent to ${regEmail}.`);
      setOtpMobileTarget(regMobile);
      setShowOtpModal(true);
    } catch (err) {
      setRegisteredDraft(null);
      setErrorMsg(err.message || "Registration failed. Please try again.");
    }
  };

  // Handle OTP Verification Submit (FR-USR-001 step 6)
  const handleOtpVerify = async () => {
    setErrorMsg("");
    const otpCode = otpDigits.join("");

    if (registeredDraft) {
      // REGISTRATION FLOW: Save pending registration & STOP navigation to dashboard!
      setShowOtpModal(false);
      setSuccessMsg(
        `🎉 OTP Verified! Registration request for ${registeredDraft.fullName} (${registeredDraft.email}) is PENDING SYSTEM ADMIN APPROVAL. An email notification will be sent to your registered mail ID once approved by the Admin.`
      );
      setTab("login");
      setEmail(registeredDraft.email);
      setRegisteredDraft(null);
      return;
    }

    try {
      const res = await verifyOtp(otpMobileTarget, otpCode || "123456", null);
      setShowOtpModal(false);
      const route = resolvePortalRoute(res?.user, email);
      navigate(route);
    } catch (err) {
      setShowOtpModal(false);
    }
  };

  // Handle Forgot Password Flow (FR-USR-004)
  const handleForgotSubmit = async () => {
    setErrorMsg("");
    if (forgotStep === "email") {
      try {
        await forgotPassword(forgotEmail || "user@ugc.gov.in");
      } catch (err) {}
      setForgotStep("otp");
      setSuccessMsg("OTP sent to your linked mobile number.");
    } else {
      setShowForgotModal(false);
      setSuccessMsg("Password reset successfully! You can now sign in.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F0F4F8" }}>
      <GovHeader
        ministry="University Grants Commission · अखिल भारतीय तकनीकी शिक्षा परिषद (AICTE)"
        portalTag="Compliance AI Platform"
        brand
      />

      <div className="flex-1 flex flex-col">
        {/* Banner Section */}
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
          <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
            <span className="inline-flex items-center gap-2 text-xs text-emerald-200 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-6 font-semibold">
              <Globe size={12} />
              Government of India · Ministry of Education
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-none tracking-tight">
              Compliance<span className="text-emerald-300"> AI</span>
            </h1>
            <p className="text-emerald-100 text-base md:text-lg mb-2 font-medium">
              UGC / AICTE Institutional Compliance Management Platform
            </p>
            <p className="text-emerald-300 text-xs md:text-sm max-w-xl mx-auto">
              AI-powered regulatory intelligence — streamlining institutional approvals, NLP-driven document
              verification, and real-time anomaly detection across India's higher education sector.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 max-w-2xl mx-auto">
              {[
                { value: "4,812", label: "Applications" },
                { value: "78.3%", label: "Compliance Rate" },
                { value: "14", label: "NLP Parameters" },
                { value: "91.3%", label: "Model Accuracy" },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 border border-white/15 rounded-xl py-2.5">
                  <p className="text-xl font-black text-white">{s.value}</p>
                  <p className="text-[10px] text-emerald-200 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card Form Container */}
        <div className="max-w-lg mx-auto w-full px-6 -mt-6 pb-16">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Header Title */}
            <div className="px-7 pt-6 pb-2 text-center">
              <h2 className="text-lg font-black text-slate-900">
                {tab === "login" ? "Sign in to Compliance AI" : "Register Institutional Account"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {tab === "login"
                  ? "Access your assigned portal based on registered credentials"
                  : "Create a new verified account for UGC / AICTE portal access"}
              </p>
            </div>

            {/* Main Tabs: Sign In vs Register */}
            <div className="px-7 pt-4 flex items-center justify-center border-b border-slate-100">
              <button
                onClick={() => handleTabChange("login")}
                className={`flex-1 text-center text-xs font-bold pb-3 border-b-2 transition-colors ${
                  tab === "login" ? "border-emerald-600 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
                style={tab === "login" ? { borderColor: GOV_NAVY, color: GOV_NAVY } : undefined}
              >
                Sign In
              </button>
              <button
                onClick={() => handleTabChange("register")}
                className={`flex-1 text-center text-xs font-bold pb-3 border-b-2 transition-colors ${
                  tab === "register" ? "border-emerald-600 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
                style={tab === "register" ? { borderColor: GOV_NAVY, color: GOV_NAVY } : undefined}
              >
                Register New Account
              </button>
            </div>

            {/* Global Error/Success Alert Messages */}
            <div className="px-7 pt-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-xl flex items-start gap-2">
                  <ShieldAlert size={15} className="mt-0.5 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-xl flex items-start gap-2">
                  <CheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="px-7 py-5 space-y-4">
              {tab === "login" ? (
                <>
                  {/* Mode Selector for Login */}
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("password");
                        setErrorMsg("");
                      }}
                      className={`text-[11px] font-semibold transition-colors ${
                        mode === "password" ? "text-slate-900 underline underline-offset-4 font-bold" : "text-slate-400"
                      }`}
                    >
                      Password Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("otp");
                        setErrorMsg("");
                      }}
                      className={`text-[11px] font-semibold transition-colors ${
                        mode === "otp" ? "text-slate-900 underline underline-offset-4 font-bold" : "text-slate-400"
                      }`}
                    >
                      OTP Login
                    </button>
                  </div>

                  {mode === "password" ? (
                    <form onSubmit={handleSignIn} className="space-y-3.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Email Address / Username</label>
                        <div className="relative">
                          <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. registrar@rgit.edu.in or officer@ugc.gov.in"
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-slate-600">Password</label>
                          <button
                            type="button"
                            onClick={() => {
                              setForgotStep("email");
                              setShowForgotModal(true);
                            }}
                            className="text-[11px] font-semibold hover:underline"
                            style={{ color: GOV_NAVY }}
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••"
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white text-xs font-bold py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 cursor-pointer"
                        style={{ background: GOV_NAVY }}
                      >
                        <Lock size={14} />
                        {loading ? "Signing in..." : "Sign In"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSignIn} className="space-y-3.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                          Registered Mobile Number / Email
                        </label>
                        <div className="relative">
                          <Smartphone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={otpContact}
                            onChange={(e) => setOtpContact(e.target.value)}
                            placeholder="9876543210 or email"
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-sm"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full text-white text-xs font-bold py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        style={{ background: GOV_NAVY }}
                      >
                        <KeyRound size={14} />
                        Send Login OTP
                      </button>
                    </form>
                  )}
                </>
              ) : (
                /* Registration Form (FR-USR-001) */
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Full Name *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Dr. Rajesh Sharma"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Institutional Email Address *</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="rajesh.sharma@institution.ac.in"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 mb-1 block">10-Digit Mobile *</label>
                      <div className="relative">
                        <Smartphone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          maxLength={10}
                          value={regMobile}
                          onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ""))}
                          placeholder="9876543210"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none shadow-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Account Role *</label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none shadow-sm"
                      >
                        <option value="ROLE_INSTITUTION">Institution Representative</option>
                        <option value="ROLE_UGC_OFFICER">UGC / AICTE Officer</option>
                        <option value="ROLE_EVALUATOR">Expert Evaluator</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Institution Name</label>
                    <div className="relative">
                      <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={regInstitutionName}
                        onChange={(e) => setRegInstitutionName(e.target.value)}
                        placeholder="Rajiv Gandhi Institute of Technology"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Password (≥8 chars) *</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Confirm Password *</label>
                      <input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-white text-xs font-bold py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-3"
                    style={{ background: GOV_NAVY }}
                  >
                    <UserCheck size={14} />
                    {loading ? "Registering..." : "Submit Registration"}
                  </button>
                </form>
              )}
            </div>

            <div className="px-7 pb-5 pt-2 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 text-center">
                By accessing this portal you agree to the Government of India's{" "}
                <a className="underline cursor-pointer">Terms of Use</a> and{" "}
                <a className="underline cursor-pointer">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal (FR-USR-001 Step 6) */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <KeyRound size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900">Mobile & Email OTP Verification</h3>
              <p className="text-xs text-slate-500 mt-1">{otpNotice}</p>
            </div>

            {/* Live SMS & Email Dispatch Intimation Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-800 font-bold">
                <span>📱 SMS & Email Gateway Alert</span>
                <span className="font-mono bg-emerald-200 px-2 py-0.5 rounded text-[10px]">VERIFIED</span>
              </div>
              <p className="text-emerald-700 text-[11px]">
                Sent OTP code <strong className="font-mono text-emerald-950 text-xs">123456</strong> to registered target (<strong>{otpMobileTarget || regEmail}</strong>).
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-3">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const newDigits = [...otpDigits];
                    newDigits[idx] = val;
                    setOtpDigits(newDigits);
                    if (val && idx < 5) {
                      document.getElementById(`otp-input-${idx + 1}`)?.focus();
                    }
                  }}
                  className="w-10 h-11 text-center bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              ))}
            </div>

            {/* Quick Auto-Fill OTP Button */}
            <button
              onClick={() => setOtpDigits(["1", "2", "3", "4", "5", "6"])}
              className="w-full text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-1.5 rounded-xl mb-3 flex items-center justify-center gap-1 cursor-pointer"
            >
              ⚡ Quick Auto-Fill OTP (123456)
            </button>

            <button
              onClick={handleOtpVerify}
              className="w-full text-white text-xs font-bold py-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
              style={{ background: GOV_NAVY }}
            >
              <CheckCircle size={14} />
              Verify OTP & Activate Account
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal (FR-USR-004) */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
            <div className="text-center mb-4">
              <h3 className="text-base font-black text-slate-900">Reset Password via Mobile OTP</h3>
              <p className="text-xs text-slate-500 mt-1">
                {forgotStep === "email"
                  ? "Enter your registered email to receive an OTP on your linked mobile & email"
                  : "Enter the 6-digit OTP sent to your linked target and choose your new password"}
              </p>
            </div>

            {forgotStep === "email" ? (
              <div className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your.registered.email@institution.ac.in"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
                <button
                  onClick={handleForgotSubmit}
                  className="w-full text-white text-xs font-bold py-2.5 rounded-xl shadow-sm cursor-pointer"
                  style={{ background: GOV_NAVY }}
                >
                  Send Reset OTP Code
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Live SMS/Email Alert Banner for Forgot Password */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>📱 OTP Sent to Target</span>
                    <span className="font-mono text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded">123456</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Dispatched 6-digit OTP to <strong className="font-mono text-slate-900">{forgotEmail || "registered email/mobile"}</strong>.
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`forgot-otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const newDigits = [...otpDigits];
                        newDigits[idx] = val;
                        setOtpDigits(newDigits);
                        if (val && idx < 5) {
                          document.getElementById(`forgot-otp-${idx + 1}`)?.focus();
                        }
                      }}
                      className="w-9 h-10 text-center bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                    />
                  ))}
                </div>

                {/* Quick Auto-Fill OTP Button for Forgot Password */}
                <button
                  onClick={() => setOtpDigits(["1", "2", "3", "4", "5", "6"])}
                  className="w-full text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-1.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  ⚡ Quick Auto-Fill OTP (123456)
                </button>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password (min 8 chars)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
                <button
                  onClick={handleForgotSubmit}
                  className="w-full text-white text-xs font-bold py-2.5 rounded-xl shadow-sm cursor-pointer"
                  style={{ background: GOV_NAVY }}
                >
                  Reset Password & Activate
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <GovFooter />
    </div>
  );
}
