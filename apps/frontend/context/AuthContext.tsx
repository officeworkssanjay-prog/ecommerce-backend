"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "USER" | "VENDOR" | "ADMIN";
  vendor?: {
    id: string;
    shopName: string;
    status: boolean;
  } | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isCustomer: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; role?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation?: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.success && (res.user || res.data)) {
        setUser(res.user || res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.success) {
      const loggedUser = res.user || res.data?.user || res.data;
      if (loggedUser) {
        setUser(loggedUser);
        return { success: true, role: loggedUser.role };
      }
    }
    return { success: false, message: res.message || "Invalid credentials" };
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation?: string
  ) => {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      passwordConfirmation: passwordConfirmation || password,
    });
    if (res.success) {
      const registeredUser = res.user || res.data?.user || res.data;
      if (registeredUser) {
        setUser(registeredUser);
        return { success: true };
      }
    }
    return {
      success: false,
      message:
        res.message ||
        res.errors?.passwordConfirmation?._errors?.[0] ||
        "Registration failed",
    };
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const isAdmin = user?.role === "ADMIN";
  const isVendor = user?.role === "VENDOR";
  const isCustomer = user?.role === "USER";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isVendor,
        isCustomer,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
