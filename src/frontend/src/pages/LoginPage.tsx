import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AxiosError } from "axios";

import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, username || email.split("@")[0], pass);
      } else {
        await login(email, pass);
      }
      nav(from, { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      const msg =
        axiosErr.response?.data?.detail ||
        axiosErr.message ||
        "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-pale dark:bg-[#0b1220]">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-lg shadow p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {isRegister ? "Create Account" : "Sign In"}
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm text-gray-600 dark:text-gray-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            placeholder="you@example.com"
            className="w-full border rounded px-3 py-2 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-gray-100"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {isRegister && (
          <div className="space-y-1">
            <label className="text-sm text-gray-600 dark:text-gray-300" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              placeholder="johndoe"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-gray-100"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm text-gray-600 dark:text-gray-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            placeholder="••••••••"
            className="w-full border rounded px-3 py-2 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-gray-100"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded px-4 py-2 transition flex items-center justify-center"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : isRegister ? (
            "Create Account"
          ) : (
            "Sign In"
          )}
        </button>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
          >
            {isRegister ? "Sign In" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
}
