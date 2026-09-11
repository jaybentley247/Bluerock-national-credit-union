"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import MarketingHeader from "@/components/layout/MarketingHeader";
import PasswordInput from "@/components/ui/PasswordInput";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "reset" | "done">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleRequestCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { account_number: email.trim() });
      setStep("reset");
      setNotice("If that account exists, a 6-digit code has been emailed to it. Enter it below along with your new password — the code expires in 10 minutes.");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setIsResending(true);
    try {
      await api.post("/auth/forgot-password", { account_number: email.trim() });
      setNotice("A new code has been sent — it expires in 10 minutes.");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to resend the code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        account_number: email.trim(),
        code: code.trim(),
        new_password: newPassword,
      });
      setStep("done");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to reset password. Please check your code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MarketingHeader />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <ShieldCheck className="h-12 w-12 text-red-700" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === "request"
                ? "Enter your account number and we'll email you a verification code."
                : step === "reset"
                ? "Enter the code we emailed you along with a new password."
                : "Enter your account number below and choose a strong new password to regain secure access."}
            </p>
          </div>

          {step === "done" ? (
            <div className="space-y-6 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-green-700 font-semibold">Your password has been reset successfully!</p>
                <p className="text-green-600 text-sm mt-1">You're all set — log in any time with your new password.</p>
              </div>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full py-2 px-4 text-sm font-medium text-white bg-[#0E3DAA] hover:bg-red-800 rounded-md"
              >
                Go to Login
              </Link>
            </div>
          ) : step === "request" ? (
            <form className="space-y-5" onSubmit={handleRequestCode}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your 10-digit account number"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 text-sm font-medium text-white bg-[#0E3DAA] hover:bg-red-800 rounded-md disabled:opacity-50"
              >
                {isLoading ? "Sending code..." : "Send verification code"}
              </button>

              <div className="text-center">
                <Link href="/login" className="inline-flex items-center gap-1 text-sm text-red-700 hover:text-red-600">
                  <ArrowLeft className="h-3 w-3" /> Back to login
                </Link>
              </div>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {notice && !error && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700 text-sm rounded">
                  {notice}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm tracking-[0.3em] text-center focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="6-digit code"
                />
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="mt-1 text-xs font-medium text-red-700 hover:text-red-600 disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend code"}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <PasswordInput
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                <PasswordInput
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Repeat new password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 text-sm font-medium text-white bg-[#0E3DAA] hover:bg-red-800 rounded-md disabled:opacity-50"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="inline-flex items-center gap-1 text-sm text-red-700 hover:text-red-600"
                >
                  <ArrowLeft className="h-3 w-3" /> Use a different account number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
