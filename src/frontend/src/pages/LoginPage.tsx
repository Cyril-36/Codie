import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleLogin();
  }

  function handleLogin() {
    login(email);
    nav("/");
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-pale dark:bg-[#0b1220]">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-lg shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Sign in</h1>
        <div className="space-y-1">
          <label className="text-sm text-gray-600 dark:text-gray-300" htmlFor="email">Email</label>
          <input
            id="email"
            placeholder="you@example.com"
            className="w-full border rounded px-3 py-2 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-gray-100"
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-600 dark:text-gray-300" htmlFor="password">Password</label>
          <input
            id="password"
            placeholder="••••••••"
            className="w-full border rounded px-3 py-2 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-gray-100"
            type="password"
            value={pass}
            onChange={(e)=>setPass(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          onClick={handleLogin}
          className="w-full bg-primary hover:bg-primary-dark text-white rounded px-4 py-2 transition"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
