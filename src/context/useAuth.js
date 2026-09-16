import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    const userJson = localStorage.getItem("ugc_auth_user");
    return {
      token: localStorage.getItem("ugc_auth_token") || null,
      user: userJson ? JSON.parse(userJson) : null,
      loading: false,
      login: async () => {},
      register: async () => {},
      verifyOtp: async () => {},
      forgotPassword: async () => {},
      resetPassword: async () => {},
      logout: () => {},
      setUser: () => {},
    };
  }
  return context;
}
