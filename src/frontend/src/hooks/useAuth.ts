import React, { createContext, useContext, useState, useMemo } from "react";

type User = { email: string; name?: string } | null;
type Ctx = { user: User; login: (email: string, name?: string) => void; logout: () => void };
const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem('auth-user');
    return stored ? JSON.parse(stored) : null;
  });

  const value = useMemo<Ctx>(
    () => ({
      user,
      login: (email: string, name?: string) => {
        const userData = { email, name: name || email.split('@')[0] };
        setUser(userData);
        localStorage.setItem('auth-user', JSON.stringify(userData));
      },
      logout: () => {
        setUser(null);
        localStorage.removeItem('auth-user');
      },
    }),
    [user]
  );
  
  return React.createElement(AuthCtx.Provider, { value }, children);
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
