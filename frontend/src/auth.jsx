import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, clearTokens, getAccessToken, setTokens } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");

  async function refreshUser() {
    setAccessError("");
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    const res = await apiFetch("/api/me/");
    if (!res.ok) {
      setUser(null);
      setLoading(false);
      return;
    }
    const u = await res.json();
    setUser({
      id: u.id,
      email: u.email ?? "",
      name: u.name || u.username || "",
      role: u.role === "admin" ? "admin" : "member",
    });
    setLoading(false);
  }

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    function onKick() {
      setUser(null);
      setAccessError("Session expired. Sign in again.");
      setLoading(false);
    }
    window.addEventListener("auth:unauthorized", onKick);
    return () => window.removeEventListener("auth:unauthorized", onKick);
  }, []);

  async function logout() {
    setAccessError("");
    clearTokens();
    setUser(null);
  }

  function clearAccessError() {
    setAccessError("");
  }

  async function refreshProfile() {
    await refreshUser();
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      accessError,
      clearAccessError,
      isAdmin: user?.role === "admin",
      logout,
      refreshProfile,
      refreshUser,
      setAuthTokens: setTokens,
      setAccessError,
    }),
    [user, loading, accessError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth inside AuthProvider");
  return ctx;
}
