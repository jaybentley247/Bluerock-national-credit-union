"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import {
  Zap, Wifi, Phone, Shield, Home, Tv, Car, GraduationCap,
  CheckCircle, X, ChevronRight, CreditCard,
} from "lucide-react";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
}

const BILL_CATEGORIES = [
  { id: "electricity", label: "Electricity", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { id: "internet", label: "Internet", icon: Wifi, color: "text-red-400", bg: "bg-red-400/10" },
  { id: "phone", label: "Phone", icon: Phone, color: "text-green-400", bg: "bg-green-400/10" },
  { id: "insurance", label: "Insurance", icon: Shield, color: "text-purple-400", bg: "bg-purple-400/10" },
  { id: "rent", label: "Rent / Mortgage", icon: Home, color: "text-orange-400", bg: "bg-orange-400/10" },
  { id: "cable", label: "Cable / TV", icon: Tv, color: "text-pink-400", bg: "bg-pink-400/10" },
  { id: "auto", label: "Auto / Fuel", icon: Car, color: "text-red-400", bg: "bg-red-400/10" },
  { id: "education", label: "Education", icon: GraduationCap, color: "text-sky-400", bg: "bg-sky-400/10" },
];

interface BillHistory {
  id: string;
  biller_type: string;
  biller_name: string;
  amount: number;
  timestamp: string;
  status: string;
}

export default function BillPaymentsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [accountId, setAccountId] = useState("");
  const [billerName, setBillerName] = useState("");
  const [billerRef, setBillerRef] = useState("");
  const [amount, setAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [history, setHistory] = useState<BillHistory[]>([]);

  const loadHistory = () => {
    api.get("/bill-payments/").then((r) => setHistory(r.data)).catch(() => {});
  };

  useEffect(() => {
    api.get("/accounts/").then((r) => {
      setAccounts(r.data);
      if (r.data.length > 0) setAccountId(r.data[0].id);
    }).catch(() => {});
    loadHistory();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) { setToast({ msg: "Please select a bill category.", ok: false }); return; }
    if (!billerName || !amount || parseFloat(amount) <= 0) {
      setToast({ msg: "Please fill in all required fields.", ok: false }); return;
    }
    setIsSaving(true);
    try {
      await api.post("/bill-payments/", {
        account_id: accountId,
        biller_type: selected,
        biller_name: billerName,
        account_ref: billerRef || "N/A",
        amount: parseFloat(amount),
      });
      setToast({ msg: `Bill payment of $${parseFloat(amount).toFixed(2)} to ${billerName} submitted successfully.`, ok: true });
      setBillerName(""); setBillerRef(""); setAmount(""); setSelected(null);
      loadHistory();
    } catch (err: any) {
      const msg = err.response?.status === 403
        ? "Your account is frozen. Please contact support."
        : err.response?.data?.detail || "Failed to submit payment.";
      setToast({ msg, ok: false });
    } finally {
      setIsSaving(false);
    }
  };

  const selCat = BILL_CATEGORIES.find((c) => c.id === selected);

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#0d0d1a] p-6 space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 max-w-md rounded-xl shadow-xl p-4 flex items-start gap-3 ${toast.ok ? "bg-green-900/80 border border-green-600/40 text-green-100" : "bg-red-900/80 border border-red-600/40 text-red-100"}`}>
            {toast.ok ? <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" /> : <X className="h-5 w-5 shrink-0 mt-0.5" />}
            <p className="text-sm">{toast.msg}</p>
            <button onClick={() => setToast(null)} className="ml-auto shrink-0 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Header */}
        <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl px-8 py-5">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-red-400" />
            Pay Bills
          </h1>
          <p className="text-slate-400 text-sm mt-1">Effortlessly pay utility bills, subscriptions, and much more directly from your account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Category picker */}
            <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Select Bill Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BILL_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelected(cat.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                        selected === cat.id
                          ? "border-red-500 bg-red-500/10"
                          : "border-white/[0.07] hover:border-white/20 bg-white/[0.03]"
                      }`}
                    >
                      <div className={`w-10 h-10 ${cat.bg} rounded-full flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${cat.color}`} />
                      </div>
                      <span className="text-xs font-semibold text-slate-300 text-center leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment form */}
            <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Payment Details</h2>
              <form onSubmit={handlePay} className="space-y-5">

                {selected && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                    {selCat && (() => { const Icon = selCat.icon; return <Icon className={`h-5 w-5 ${selCat.color}`} />; })()}
                    <span className="text-sm font-semibold text-white">{selCat?.label}</span>
                    <button type="button" onClick={() => setSelected(null)} className="ml-auto text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pay From Account *</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none"
                    required
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.account_type} ···{a.account_number.slice(-4)} — ${a.balance.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Biller Name *</label>
                    <input
                      type="text"
                      value={billerName}
                      onChange={(e) => setBillerName(e.target.value)}
                      placeholder="e.g. City Power Co."
                      required
                      className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account / Reference No.</label>
                    <input
                      type="text"
                      value={billerRef}
                      onChange={(e) => setBillerRef(e.target.value)}
                      placeholder="e.g. 123456789"
                      className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:border-red-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amount (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl pl-8 pr-4 py-3 text-sm placeholder-slate-600 focus:border-red-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {isSaving ? "Processing..." : "Pay Now"}
                </button>
              </form>
            </div>
          </div>

          {/* Right — history */}
          <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Recent Payments</h2>
            <div className="space-y-3">
              {history.length === 0 && (
                <p className="text-slate-500 text-sm">No bill payments yet.</p>
              )}
              {history.map((h) => {
                const cat = BILL_CATEGORIES.find((c) => c.id === h.biller_type);
                return (
                  <div key={h.id} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                    <div className="w-9 h-9 bg-green-500/15 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{h.biller_name}</p>
                      <p className="text-slate-500 text-xs">
                        {cat?.label || h.biller_type} · {new Date(h.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-bold text-sm">${h.amount.toFixed(2)}</p>
                      <span className="text-xs text-green-400 font-medium capitalize">{h.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-5 border-t border-white/[0.07]">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Pay</h3>
              {BILL_CATEGORIES.slice(0, 4).map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelected(cat.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.05] transition group"
                  >
                    <div className={`w-7 h-7 ${cat.bg} rounded-full flex items-center justify-center shrink-0`}>
                      <Icon className={`h-3.5 w-3.5 ${cat.color}`} />
                    </div>
                    <span className="text-slate-300 text-sm group-hover:text-white transition">{cat.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600 ml-auto" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
