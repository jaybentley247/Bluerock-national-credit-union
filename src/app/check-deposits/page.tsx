"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { Upload, X, CheckCircle, AlertCircle, Camera } from "lucide-react";
import Link from "next/link";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
}

interface CheckDeposit {
  id: string;
  check_number: string;
  amount: number;
  account_id: string;
  status: string;
  timestamp: string;
  front_image?: string;
  back_image?: string;
}

export default function CheckDepositsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [deposits, setDeposits] = useState<CheckDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [selectedAccount, setSelectedAccount] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [checkAmount, setCheckAmount] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get("/accounts/");
      setAccounts(response.data);
      if (response.data.length > 0) {
        setSelectedAccount(response.data[0].id);
      }
      await fetchDeposits();
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch accounts", error);
      setToast("Failed to load accounts");
      setIsLoading(false);
    }
  };

  const fetchDeposits = async () => {
    try {
      const response = await api.get("/check-deposits/");
      setDeposits(response.data);
    } catch (error) {
      console.error("Failed to fetch deposits", error);
    }
  };

  const handleImageSelect = (
    file: File,
    setImage: (file: File | null) => void,
    setPreview: (preview: string | null) => void,
  ) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setToast("Please select a valid image file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkNumber || !checkAmount || !frontImage || !backImage) {
      setToast("Please fill in all fields and upload both images");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("check_number", checkNumber);
      formData.append("amount", checkAmount);
      formData.append("account_id", selectedAccount);
      formData.append("front_image", frontImage);
      formData.append("back_image", backImage);

      await api.post("/check-deposits/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setToast(
        "Check deposit submitted successfully! It will be processed within 2-3 business days.",
      );
      setCheckNumber("");
      setCheckAmount("");
      setFrontImage(null);
      setBackImage(null);
      setFrontPreview(null);
      setBackPreview(null);
      setShowForm(false);
      await fetchDeposits();
    } catch (error: any) {
      console.error(error);
      const detail = error?.response?.status === 403
        ? "Your account is frozen. Please contact support."
        : error?.response?.data?.detail || "Failed to deposit check";
      setToast(detail);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Check Deposits</h1>
            <p className="text-gray-500 mt-2">
              Deposit checks using your mobile camera
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            {showForm ? "Cancel" : "Deposit Check"}
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md z-50">
            <p className="text-gray-900">{toast}</p>
          </div>
        )}

        {/* Deposit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Deposit a Check
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_type} -{" "}
                      {account.account_number.slice(-4)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Check Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Check Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                  placeholder="e.g., 001234"
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
                  required
                />
              </div>

              {/* Check Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Check Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={checkAmount}
                  onChange={(e) => setCheckAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">
                  Check Images <span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-gray-500">
                  Upload clear photos of the front and back of the check
                </p>

                {/* Front Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Front of Check
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageSelect(
                            e.target.files[0],
                            setFrontImage,
                            setFrontPreview,
                          );
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {frontPreview ? (
                      <div className="relative">
                        <img
                          src={frontPreview}
                          alt="Front preview"
                          className="h-48 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFrontImage(null);
                            setFrontPreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload or take a photo
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Back of Check
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageSelect(
                            e.target.files[0],
                            setBackImage,
                            setBackPreview,
                          );
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {backPreview ? (
                      <div className="relative">
                        <img
                          src={backPreview}
                          alt="Back preview"
                          className="h-48 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setBackImage(null);
                            setBackPreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload or take a photo
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {isSaving ? "Processing..." : "Submit Check"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>

              {/* Info */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-900">
                  <strong>Note:</strong> Checks will be processed within 2-3
                  business days. The amount will be held in pending status until
                  cleared.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Recent Deposits */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 lg:p-8 border-b border-gray-50">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Check Deposits
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0E3DAA]"></div>
            </div>
          ) : deposits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider font-bold">
                    <th className="px-8 py-4">Check Number</th>
                    <th className="px-8 py-4">Amount</th>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {deposits.map((deposit) => (
                    <tr
                      key={deposit.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-8 py-5 font-mono font-bold text-gray-900">
                        {deposit.check_number}
                      </td>
                      <td className="px-8 py-5 font-bold text-gray-900">
                        ${deposit.amount.toFixed(2)}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600">
                        {new Date(deposit.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                            deposit.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : deposit.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {deposit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center">
              <CheckCircle className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No check deposits yet</p>
              <p className="text-sm text-gray-400">
                Start depositing checks to see them here
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
