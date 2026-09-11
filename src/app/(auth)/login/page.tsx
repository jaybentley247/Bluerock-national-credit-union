"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import Link from "next/link";
import MarketingHeader from "@/components/layout/MarketingHeader";
import PasswordInput from "@/components/ui/PasswordInput";

export default function LoginPage() {
  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", accountNumber.trim());
      formData.append("password", password);

      const response = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.access_token) {
        // OTP isn't enabled for this account — signed in directly.
        await login(response.data.access_token);
      } else {
        setStep("otp");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/verify-otp", {
        identifier: accountNumber.trim(),
        code: otpCode.trim(),
      });
      await login(response.data.access_token);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-5 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="flex justify-center">
              <img src="/blue.png" alt="BLUEROCK NATIONAL CREDIT UNION" className="h-40 w-auto object-contain" />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {step === "credentials" ? "Welcome back — sign in securely with your account number" : "Almost there — enter the verification code we just emailed you"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          {step === "credentials" ? (
            <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    id="account-number"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Enter your 10-digit account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <PasswordInput
                    id="password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0E3DAA] hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <form className="mt-4 space-y-5" onSubmit={handleVerifyOtp}>
              <div>
                <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  required
                  maxLength={6}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 text-center text-lg tracking-[0.5em] font-semibold"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                />
                <p className="text-xs text-gray-500 mt-2">Sent securely to the email on file for this account — this code expires in 10 minutes, so enter it promptly.</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0E3DAA] hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify & Sign In"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("credentials"); setOtpCode(""); setError(""); }}
                className="w-full text-center text-sm text-gray-500 hover:text-red-700"
              >
                ← Back
              </button>
            </form>
          )}

          <div className="text-center space-y-2">
            <div>
              <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-red-700">
                Forgot your password?
              </Link>
            </div>
            <div>
              <Link href="/register" className="text-sm font-medium text-red-700 hover:text-red-600">
                New here? Open your account today
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
