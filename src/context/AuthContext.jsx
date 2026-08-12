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
      const res = await authApi.login({ email, password });
      if (res && res.token) {
        setToken(res.token);
        setUser(res.user);
        return res;
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
