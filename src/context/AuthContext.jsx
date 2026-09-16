import { createContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("ugc_auth_token") || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ugc_auth_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("ugc_auth_token", token);
    } else {
      localStorage.removeItem("ugc_auth_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("ugc_auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("ugc_auth_user");
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const cleanEmail = (email || "").trim().toLowerCase();
      const isAdmin = cleanEmail.includes("admin@ugc.gov.in") || cleanEmail.startsWith("admin");

      // Check pending admin approval status for non-admin users
      if (!isAdmin) {
        let pendingRequests = [];
        try {
          const saved = localStorage.getItem("ugc_pending_registrations");
          if (saved) pendingRequests = JSON.parse(saved);
        } catch (e) {}

        const userPendingRec = pendingRequests.find(
          (u) => (u.email || "").trim().toLowerCase() === cleanEmail
        );

        if (userPendingRec) {
          if (userPendingRec.status === "PENDING_APPROVAL") {
            throw new Error(
              `🔒 Access Denied: Registration for '${email}' is PENDING SYSTEM ADMIN APPROVAL. An email notification will be sent to your registered mail ID once approved by the Admin.`
            );
          } else if (userPendingRec.status === "REJECTED") {
            throw new Error(
              `❌ Access Denied: Registration request for '${email}' was declined by the System Administrator.`
            );
          }
        }
      }

      const res = await authApi.login({ email, password });
      if (res && res.token) {
        const isUgcOfficer =
          isAdmin ||
          cleanEmail.includes("@ugc.gov.in") ||
          cleanEmail.includes("@aicte.gov.in") ||
          cleanEmail.includes("@gov.in") ||
          cleanEmail.startsWith("ugc") ||
          cleanEmail.startsWith("officer");

        const loggedUser = {
          id: Date.now(),
          email: email,
          fullName: isAdmin
            ? "System Administrator (admin@ugc.gov.in)"
            : isUgcOfficer
              ? "UGC Regulatory Officer (Shali)"
              : "Institutional Applicant",
          institutionName: isAdmin
            ? "UGC National Super Admin Desk"
            : isUgcOfficer
              ? "UGC Compliance Cell"
              : "State Technological University",
          role: isAdmin ? "ROLE_ADMIN" : isUgcOfficer ? "ROLE_UGC_OFFICER" : (res.user?.role || "ROLE_INSTITUTION"),
          officialRole: isAdmin ? "admin" : isUgcOfficer ? "evaluator" : "institution",
          status: "ACTIVE",
          ...(res.user || {}),
        };

        if (isAdmin) {
          loggedUser.role = "ROLE_ADMIN";
          loggedUser.officialRole = "admin";
        } else if (isUgcOfficer) {
          loggedUser.role = "ROLE_UGC_OFFICER";
        }

        setToken(res.token);
        setUser(loggedUser);
        localStorage.setItem("ugc_auth_token", res.token);
        localStorage.setItem("ugc_auth_user", JSON.stringify(loggedUser));
        return { ...res, user: loggedUser };
      }
      throw new Error("Invalid response from auth server");
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const res = await authApi.register(payload);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (mobileNumber, otpCode, extraUserInfo = null) => {
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ mobileNumber, otpCode }, extraUserInfo);
      if (res && res.token) {
        const mergedUser = {
          ...(res.user || {}),
          ...(extraUserInfo || {}),
        };
        setToken(res.token);
        setUser(mergedUser);
        localStorage.setItem("ugc_auth_token", res.token);
        localStorage.setItem("ugc_auth_user", JSON.stringify(mergedUser));
        return { ...res, user: mergedUser };
      }
      throw new Error("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    return await authApi.forgotPassword(email);
  };

  const resetPassword = async (payload) => {
    return await authApi.resetPassword(payload);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ugc_auth_token");
    localStorage.removeItem("ugc_auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        verifyOtp,
        forgotPassword,
        resetPassword,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth } from "./useAuth";
