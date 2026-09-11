"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import {
  ArrowUpRight,
  ArrowDownLeft,
  History as HistoryIcon,
  Search,
  Filter,
  Download,
  Calendar,
  Copy,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  sender_account_id: string | null;
  receiver_account_id: string | null;
  amount: number;
  description: string | null;
  reference: string | null;
  status: string;
  timestamp: string;
}

function cn(...c: (string | boolean | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export default function HistoryPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "sent" | "received">("all");
  const [accountFilter, setAccountFilter] = useState("all");

  const copyRef = (ref: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(ref).then(() => {
      setCopied(ref);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  useEffect(() => {
    const fetchAllData = async (initial = false) => {
      try {
        const { data: fetchedAccounts } = await api.get("/accounts/");
        setAccounts(fetchedAccounts);

        if (fetchedAccounts.length > 0) {
          const responses = await Promise.all(
            fetchedAccounts.map((acc: Account) => api.get(`/transactions/${acc.id}`))
          );
          const allTrans: Transaction[] = [];
          const seen = new Set<string>();
          responses.forEach((res) => res.data.forEach((t: Transaction) => {
            if (!seen.has(t.id)) { seen.add(t.id); allTrans.push(t); }
          }));
          allTrans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setTransactions(allTrans);
          setFilteredTransactions(allTrans);
        }
      } catch (err) {
        console.error("Failed to fetch history data", err);
      } finally {
        if (initial) setIsLoading(false);
      }
    };

    fetchAllData(true);
    const interval = setInterval(() => fetchAllData(false), 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = [...transactions];
    if (typeFilter !== "all") {
      result = result.filter((t) => {
        const out = accounts.some((a) => a.id === t.sender_account_id);
        return typeFilter === "sent" ? out : !out;
      });
    }
    if (accountFilter !== "all") {
      result = result.filter((t) => t.sender_account_id === accountFilter || t.receiver_account_id === accountFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) => t.description?.toLowerCase().includes(term) || t.amount.toString().includes(term) || (t.reference ?? "").toLowerCase().includes(term)
      );
    }
    setFilteredTransactions(result);
  }, [searchTerm, typeFilter, accountFilter, transactions, accounts]);

  const fmtCurrency = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const totalIncome = transactions.reduce((s, t) => accounts.some((a) => a.id === t.receiver_account_id) ? s + t.amount : s, 0);
  const totalExpenses = transactions.reduce((s, t) => accounts.some((a) => a.id === t.sender_account_id) ? s + t.amount : s, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Transaction History</h1>
            <p className="text-slate-400 text-sm mt-0.5">Conveniently view and manage the complete history of all your past transactions.</p>
          </div>
          <button className="flex items-center gap-2 bg-[#10102a] border border-white/[0.1] px-4 py-2 rounded-xl font-bold text-slate-300 hover:bg-white/[0.07] transition text-sm">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#10102a] border border-green-500/20 rounded-2xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Income</p>
            <p className="text-green-400 text-xl font-bold">{fmtCurrency(totalIncome)}</p>
          </div>
          <div className="bg-[#10102a] border border-red-500/20 rounded-2xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Expenses</p>
            <p className="text-red-400 text-xl font-bold">{fmtCurrency(totalExpenses)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by description, amount or reference…"
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-red-500/50 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] px-3 py-2.5 rounded-xl">
              <Filter className="h-4 w-4 text-slate-400" />
              <select className="bg-transparent text-sm font-semibold text-slate-300 outline-none" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
                <option value="all">All Types</option>
                <option value="sent">Debit</option>
                <option value="received">Credit</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] px-3 py-2.5 rounded-xl">
              <Calendar className="h-4 w-4 text-slate-400" />
              <select className="bg-transparent text-sm font-semibold text-slate-300 outline-none" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}>
                <option value="all">All Accounts</option>
                {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.account_type} (****{acc.account_number.slice(-4)})</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Transaction cards */}
        <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.07]">
            <p className="text-slate-400 text-sm">{filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="divide-y divide-white/[0.05]">
            {isLoading ? (
              [1,2,3,4].map((i) => <div key={i} className="h-24 mx-5 my-3 bg-white/[0.03] animate-pulse rounded-xl" />)
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => {
                const isDebit = accounts.some((a) => a.id === t.sender_account_id);
                const isAdminCredit = !t.sender_account_id && !isDebit;
                const isAdminDebit = !t.receiver_account_id && isDebit;
                const ref = t.reference ?? t.id.slice(0, 12).toUpperCase();

                const subtitle = isAdminCredit ? "Admin Credit" : isAdminDebit ? "Admin Debit" : isDebit ? "Debit Transfer" : "Credit Transfer";

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTxn(t)}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition cursor-pointer group"
                  >
                    {/* Left */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5", isDebit ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400")}>
                        {isDebit ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold text-sm font-mono">{ref}</span>
                          {(isAdminCredit || isAdminDebit) && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-500/20 text-purple-400">Admin</span>
                          )}
                          <button onClick={(e) => copyRef(ref, e)} className="text-slate-600 hover:text-slate-300 transition" title="Copy reference">
                            {copied === ref ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {new Date(t.timestamp).toLocaleDateString("en-US", { day:"2-digit", month:"short", year:"numeric" })}, {new Date(t.timestamp).toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}
                        </p>
                        <p className="text-slate-600 text-xs truncate max-w-[260px]">{t.description || subtitle}</p>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className={cn("text-xl font-bold", isDebit ? "text-red-400" : "text-green-400")}>
                          {isDebit ? "-" : "+"}{t.amount.toLocaleString("en-US")}
                        </span>
                        <span className={cn("text-xs font-bold", isDebit ? "text-red-400" : "text-green-400")}>
                          {isDebit ? "Debit" : "Credit"}
                        </span>
                      </div>
                      <span className="text-slate-500 text-xs">USD</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-red-400 font-semibold group-hover:text-red-300">View Details</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", t.status === "completed" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400")}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center">
                <HistoryIcon className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No transactions found</p>
                <button onClick={() => { setSearchTerm(""); setTypeFilter("all"); setAccountFilter("all"); }} className="mt-4 text-red-400 text-sm font-semibold hover:underline">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTxn && (() => {
        const t = selectedTxn;
        const isDebit = accounts.some((a) => a.id === t.sender_account_id);
        const senderAcct = accounts.find((a) => a.id === t.sender_account_id);
        const receiverAcct = accounts.find((a) => a.id === t.receiver_account_id);
        const ref = t.reference ?? t.id.slice(0, 12).toUpperCase();
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTxn(null)}>
            <div className="bg-[#10102a] border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className={cn("rounded-t-2xl px-6 py-5 flex items-center justify-between", isDebit ? "bg-red-500/10 border-b border-red-500/20" : "bg-green-500/10 border-b border-green-500/20")}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDebit ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400")}>
                    {isDebit ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className={cn("text-lg font-bold", isDebit ? "text-red-400" : "text-green-400")}>{isDebit ? "Debit" : "Credit"}</p>
                    <p className="text-slate-400 text-xs">Transaction Details</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTxn(null)} className="text-slate-500 hover:text-white transition p-1"><X className="h-5 w-5" /></button>
              </div>

              {/* Amount */}
              <div className="px-6 py-5 border-b border-white/[0.07] text-center">
                <p className={cn("text-4xl font-bold", isDebit ? "text-red-400" : "text-green-400")}>
                  {isDebit ? "-" : "+"}{fmtCurrency(t.amount)}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase", t.status === "completed" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400")}>
                    {t.status === "completed" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {t.status}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="px-6 py-4 space-y-3">
                {[
                  {
                    label: "Reference",
                    value: (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white">{ref}</span>
                        <button onClick={() => copyRef(ref)} className="text-slate-500 hover:text-slate-300 transition">
                          {copied === ref ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    ),
                  },
                  { label: "Description", value: <span className="text-white text-sm">{t.description || "—"}</span> },
                  {
                    label: "Date & Time",
                    value: <span className="text-white text-sm">{new Date(t.timestamp).toLocaleString("en-US", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", second:"2-digit" })}</span>,
                  },
                  { label: "From", value: <span className="text-white text-sm font-mono">{senderAcct ? `****${senderAcct.account_number.slice(-4)}` : "External / Admin"}</span> },
                  { label: "To", value: <span className="text-white text-sm font-mono">{receiverAcct ? `****${receiverAcct.account_number.slice(-4)}` : "External / Admin"}</span> },
                  { label: "Currency", value: <span className="text-white text-sm">USD</span> },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span className="text-slate-500 text-xs uppercase tracking-wider shrink-0 pt-0.5">{label}</span>
                    <div className="text-right">{value}</div>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-5">
                <button onClick={() => setSelectedTxn(null)} className="w-full bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold py-2.5 rounded-xl text-sm transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </DashboardLayout>
  );
}
