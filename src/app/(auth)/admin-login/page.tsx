"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import PasswordInput from "@/components/ui/PasswordInput";
export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("username", email.trim());
      formData.append("password", password);
      const response = await api.post("/auth/admin-login", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await login(response.data.access_token);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <img src="/blue.png" alt="BLUEROCK NATIONAL CREDIT UNION" className="h-56 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Administrator Portal</h1>
          <p className="text-slate-400 text-sm mt-1">BLUEROCK NATIONAL CREDIT UNION — Authorized Staff Access Only</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bluerocknational.com"
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <PasswordInput
                dark
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0E3DAA] hover:bg-red-800 text-white font-semibold py-3 rounded-lg text-sm transition disabled:opacity-50 mt-2"
            >
              {isLoading ? "Signing in..." : "Sign in to Admin Panel"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <a
              href="/login"
              className="text-slate-500 hover:text-slate-300 text-xs transition"
            >
              Not staff? Go to customer login →
            </a>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          This portal is restricted to authorized BLUEROCK NATIONAL CREDIT UNION staff only.
        </p>
      </div>
    </div>
  );
}
