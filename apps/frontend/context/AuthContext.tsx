"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ApiError, api } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

export type User = AuthUser;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  passwordConfirmation?: string;
}

interface AuthContextType {
  user: User | null;
  /** True until the first /auth/me answer arrives. */
  loading: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  /** Throws ApiError on failure (wrong password, validation, network …). */
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /** Replace the cached user after a profile edit. */
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.user ?? null);
    } catch (err) {
      // 401 = signed out. A network failure keeps whatever we had instead of logging the user out.
      if (err instanceof ApiError && !err.isNetwork) setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // First load: who is signed in? (state is only set from the promise callbacks)
  useEffect(() => {
    let cancelled = false;
    api
      .get("/auth/me")
      .then((res) => {
        if (!cancelled) setUser(res.user ?? null);
      })
      .catch((err) => {
        // 401 = signed out. A network failure keeps the current state instead of logging the user out.
        if (!cancelled && err instanceof ApiError && !err.isNetwork) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Any API call that comes back 401 means the session ended.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    if (!res.user) throw new ApiError(500, "Unexpected response from the server");
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await api.post("/auth/register", { ...input, passwordConfirmation: input.passwordConfirmation ?? input.password });
    if (!res.user) throw new ApiError(500, "Unexpected response from the server");
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === "ADMIN",
      isCustomer: user?.role === "USER",
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
