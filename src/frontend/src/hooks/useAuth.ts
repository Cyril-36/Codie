import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { setToken, clearToken } from "../services/client";
import * as authApi from "../services/authApi";
import type { UserResponse } from "../services/authApi";

interface AuthContext {
  user: UserResponse | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session from refresh cookie
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const refreshData = await authApi.refresh();
        setToken(refreshData.access_token);
        const me = await authApi.getMe();
        if (!cancelled) setUser(me);
      } catch {
        // No valid session — stay logged out
        clearToken();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const data = await authApi.register(email, username, password);
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout errors
    }
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContext>(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout]
  );

  return React.createElement(AuthCtx.Provider, { value }, children);
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
