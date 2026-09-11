"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import {
  ArrowUpRight,
  ArrowDownLeft,
  History,
  TrendingUp,
  ArrowRightLeft,
  Download,
  Camera,
  Copy,
  X,
  CheckCircle,
  Clock,
  Plus,
  Wallet,
} from "lucide-react";
import Link from "next/link";

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

interface CheckDeposit {
  id: string;
  account_id: string;
  amount: number;
  status: string;
}

interface AccountRequest {
  id: string;
  account_type: string;
  currency: string;
  purpose: string;
  expected_activity: string;
  status: string;
  reviewer_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

const EXPECTED_ACTIVITY_OPTIONS = [
  "Under $1,000/mo",
  "$1,000 – $10,000/mo",
  "Over $10,000/mo",
];

function cn(...c: (string | boolean | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

const ALL_ACCOUNT_TYPES = ["Checking", "Savings", "Non-Resident Account", "Offshore Account"];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Open new account — request flow (identity verification, admin-approved)
  const [showOpenAccount, setShowOpenAccount] = useState(false);
  const [requestStep, setRequestStep] = useState<1 | 2>(1);
  const [newAccountType, setNewAccountType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [expectedActivity, setExpectedActivity] = useState(EXPECTED_ACTIVITY_OPTIONS[0]);
  const [idFullName, setIdFullName] = useState("");
  const [idDob, setIdDob] = useState("");
  const [idType, setIdType] = useState("Passport");
  const [idNumber, setIdNumber] = useState("");
  const [isOpeningAccount, setIsOpeningAccount] = useState(false);
  const [openAccountError, setOpenAccountError] = useState<string | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [myRequests, setMyRequests] = useState<AccountRequest[]>([]);

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref).then(() => {
      setCopied(ref);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  // Route guard — redirect unauthenticated users to login, admins to /admin
  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.is_admin) { router.replace("/admin"); return; }
  }, [user, loading, router]);
  const [transactionsByAccount, setTransactionsByAccount] = useState<Record<string, Transaction[]>>({});
  const [pendingByAccount, setPendingByAccount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isTransLoading, setIsTransLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [lastLogin, setLastLogin] = useState("");

  useEffect(() => {
    if (!user?.last_login) return;
    const loginTime = new Date(user.last_login);
    const h = loginTime.getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
    setLastLogin(
      loginTime.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, [user?.last_login]);

  useEffect(() => {
    const fetchData = async (initial = false) => {
      try {
        const { data: fetchedAccounts } = await api.get("/accounts/");
        setAccounts(fetchedAccounts);
        setSelectedAccountId((prev) => {
          if (prev && fetchedAccounts.some((a: Account) => a.id === prev)) return prev;
          return fetchedAccounts[0]?.id ?? null;
        });
        if (initial) setIsLoading(false);

        if (fetchedAccounts.length > 0) {
          const results = await Promise.all(
            fetchedAccounts.map((a: Account) => api.get(`/transactions/${a.id}`)),
          );
          const byAccount: Record<string, Transaction[]> = {};
          fetchedAccounts.forEach((a: Account, i: number) => {
            byAccount[a.id] = [...results[i].data].sort(
              (x: Transaction, y: Transaction) =>
                new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime(),
            );
          });
          setTransactionsByAccount(byAccount);
        }

        const { data: deposits } = await api.get("/check-deposits/");
        const pending: Record<string, number> = {};
        deposits.forEach((d: CheckDeposit) => {
          if (d.status !== "pending") return;
          pending[d.account_id] = (pending[d.account_id] || 0) + Number(d.amount);
        });
        setPendingByAccount(pending);

        const { data: requests } = await api.get("/accounts/requests");
        setMyRequests(requests);
      } catch {
        // silent
      } finally {
        if (initial) setIsTransLoading(false);
      }
    };

    fetchData(true);
    const interval = setInterval(() => fetchData(false), 15000);
    return () => clearInterval(interval);
  }, []);

  // Load profile photo from localStorage when user is known
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`profile_photo_${user.id}`);
    if (saved) setProfilePhoto(saved);
    const handler = (e: Event) => setProfilePhoto((e as CustomEvent).detail);
    window.addEventListener("profile-photo-updated", handler);
    return () => window.removeEventListener("profile-photo-updated", handler);
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem(`profile_photo_${user.id}`, dataUrl);
      setProfilePhoto(dataUrl);
      window.dispatchEvent(new CustomEvent("profile-photo-updated", { detail: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const resetOpenAccountForm = () => {
    setRequestStep(1);
    setNewAccountType("");
    setPurpose("");
    setExpectedActivity(EXPECTED_ACTIVITY_OPTIONS[0]);
    setIdFullName(user?.full_name || "");
    setIdDob("");
    setIdType("Passport");
    setIdNumber("");
    setOpenAccountError(null);
    setRequestSubmitted(false);
  };

  const handleAccountTypeStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newAccountType) return;
    setOpenAccountError(null);
    setRequestStep(2);
  };

  const handleSubmitAccountRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOpenAccountError(null);

    if (!idFullName.trim() || !idDob.trim() || !idNumber.trim()) {
      setOpenAccountError("Please complete all identity verification fields.");
      return;
    }
    if (!purpose.trim()) {
      setOpenAccountError("Please tell us the purpose of this account.");
      return;
    }

    setIsOpeningAccount(true);
    try {
      await api.post("/accounts/requests", {
        account_type: newAccountType,
        currency: "USD",
        purpose: purpose.trim(),
        expected_activity: expectedActivity,
        full_name: idFullName.trim(),
        date_of_birth: idDob.trim(),
        id_type: idType,
        id_number: idNumber.trim(),
      });
      const { data: requests } = await api.get("/accounts/requests");
      setMyRequests(requests);
      setRequestSubmitted(true);
    } catch (err: any) {
      setOpenAccountError(err.response?.data?.detail || "Failed to submit account request.");
    } finally {
      setIsOpeningAccount(false);
    }
  };

  const pendingRequestTypes = new Set(myRequests.filter((r) => r.status === "pending").map((r) => r.account_type));
  const availableNewTypes = ALL_ACCOUNT_TYPES.filter(
    (t) => !accounts.some((a) => a.account_type === t) && !pendingRequestTypes.has(t),
  );

  const primary = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalPending = accounts.reduce((s, a) => s + (pendingByAccount[a.id] || 0), 0);
  const primaryPending = primary ? pendingByAccount[primary.id] || 0 : 0;
  const transactions = (selectedAccountId && transactionsByAccount[selectedAccountId]) || [];

  // Real income / expenses from transaction history
  const income = transactions.reduce((sum, t) => {
    const received = accounts.some((a) => a.id === t.receiver_account_id);
    return received ? sum + t.amount : sum;
  }, 0);
  const expenses = transactions.reduce((sum, t) => {
    const sent = accounts.some((a) => a.id === t.sender_account_id);
    return sent ? sum + t.amount : sum;
  }, 0);

  const fmtCurrency = (n: number, cur = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(n);

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#0d0d1a] p-3 sm:p-6 space-y-4 sm:space-y-6">

        {/* ── Greeting bar ─────────────────────────────────────────── */}
        <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {greeting}, {user?.full_name?.split(" ")[0] || user?.email}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              At a glance summary of your account!
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link
              href="/check-deposits"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#0E3DAA] hover:bg-red-800 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-xl text-sm transition"
            >
              <Download className="h-4 w-4" />
              Deposit
            </Link>
            <Link
              href="/transfer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/8 hover:bg-white/13 text-slate-300 font-semibold px-4 sm:px-5 py-2.5 rounded-xl text-sm border border-white/10 transition"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Transfer
            </Link>
          </div>
        </div>

        {/* ── Overview + Non-Resident Account ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Overview card */}
          <div className="lg:col-span-2 bg-[#10102a] border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">
              Overview
            </h2>

            {isLoading ? (
              <div className="h-52 bg-white/5 animate-pulse rounded-xl" />
            ) : primary ? (
              <div className="bg-white rounded-2xl p-7 text-gray-900 relative overflow-hidden border border-gray-100 shadow-sm">
                {/* Decorative circles */}
                <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-red-50" />
                <div className="absolute right-16 -bottom-8 w-32 h-32 rounded-full bg-red-50/70" />

                {/* Hidden file input */}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />

                <div className="relative z-10 flex items-start gap-3 sm:gap-6">
                  {/* Clickable passport-photo upload */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg shrink-0 group focus:outline-none"
                      title="Upload a passport-size photo"
                    >
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg object-cover border-2 border-dashed border-gray-300" />
                      ) : (
                        <div className="w-16 h-20 sm:w-20 sm:h-24 bg-red-50 rounded-lg flex items-center justify-center text-xl sm:text-2xl font-bold text-red-700 border-2 border-dashed border-red-200">
                          {(user?.full_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                    </button>
                    <span className="text-[10px] font-medium text-gray-400 text-center leading-tight">Passport photo</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-red-700 text-xs uppercase tracking-wider mb-1 font-bold">
                      Available balance · {primary.account_type}
                    </p>
                    <p className="text-gray-500 text-sm sm:text-lg font-semibold">
                      {primary.currency}
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold leading-tight text-gray-900">
                      {primary.balance.toLocaleString("en-US")}
                    </p>
                    <div className="flex items-center flex-wrap gap-2 mt-1.5">
                      <p className="text-gray-500 text-xs sm:text-sm font-medium">
                        Current Balance: {(primary.balance + primaryPending).toLocaleString("en-US")} {primary.currency}
                      </p>
                      {primaryPending > 0 && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                          +{primaryPending.toLocaleString("en-US")} uncleared
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm font-medium mt-1 truncate">
                      {user?.full_name || user?.email}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-6 mt-6 pt-5 border-t border-gray-100">
                  <div>
                    <p className="text-red-700 text-xs uppercase tracking-wider mb-1 font-bold">
                      Last Login
                    </p>
                    <p className="font-semibold text-sm text-gray-700">{lastLogin}</p>
                  </div>
                  <div>
                    <p className="text-red-700 text-xs uppercase tracking-wider mb-1 font-bold">
                      Your IP address
                    </p>
                    <p className="font-bold text-gray-900">{user?.last_login_ip || "Unknown"}</p>
                    {user?.last_login_location && (
                      <p className="text-gray-500 text-xs mt-0.5">{user.last_login_location}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center text-slate-500 bg-white/[0.03] rounded-xl">
                No account data available
              </div>
            )}
          </div>

          {/* Your Accounts — switcher */}
          <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Your Accounts
              </h2>
              <button
                onClick={() => { resetOpenAccountForm(); setNewAccountType(availableNewTypes[0] || ""); setShowOpenAccount(true); }}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> New Account
              </button>
            </div>

            <div className="space-y-2">
              {accounts.map((a) => {
                const isSelected = a.id === selectedAccountId;
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAccountId(a.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition text-left",
                      isSelected ? "bg-red-700/15 border-red-500/30" : "border-transparent hover:bg-white/[0.05]",
                    )}
                  >
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", isSelected ? "bg-[#0E3DAA]" : "bg-white/[0.07]")}>
                      <Wallet className={cn("h-4 w-4", isSelected ? "text-white" : "text-slate-400")} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-xs font-semibold truncate", isSelected ? "text-white" : "text-slate-300")}>{a.account_type}</p>
                      <p className="text-slate-500 text-[11px] font-mono">*****{a.account_number.slice(-5)}</p>
                      {pendingByAccount[a.id] > 0 && (
                        <p className="text-amber-500 text-[10px] font-semibold mt-0.5">
                          +{pendingByAccount[a.id].toLocaleString("en-US")} uncleared
                        </p>
                      )}
                    </div>
                    <p className={cn("font-bold text-sm shrink-0", isSelected ? "text-white" : "text-slate-400")}>
                      {a.balance.toLocaleString("en-US")} <span className="text-[10px] font-normal text-slate-500">USD</span>
                    </p>
                  </button>
                );
              })}
              {accounts.length === 0 && !isLoading && (
                <p className="text-slate-500 text-sm text-center py-4">No accounts yet.</p>
              )}
            </div>

            <div className="border-t border-white/[0.07] mt-5 pt-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available total</span>
                <span className="text-white font-bold text-sm">{totalBalance.toLocaleString("en-US")} <span className="text-slate-500 text-[10px] font-normal">USD</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current total</span>
                <span className="text-slate-300 font-bold text-sm">{(totalBalance + totalPending).toLocaleString("en-US")} <span className="text-slate-500 text-[10px] font-normal">USD</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Transactions + Balance Flow ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Transactions — card style */}
          <div className="lg:col-span-2 bg-[#10102a] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-base">Recent Transaction Activities</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  {primary ? `${primary.account_type} · latest transactions` : "Your latest transactions"}
                </p>
              </div>
              <Link href="/history" className="text-xs text-red-400 hover:text-red-300 font-semibold bg-red-500/10 px-3 py-1.5 rounded-lg">All</Link>
            </div>

            <div className="divide-y divide-white/[0.05]">
              {isTransLoading ? (
                [1,2,3].map((i) => <div key={i} className="h-24 mx-5 my-3 bg-white/[0.03] animate-pulse rounded-xl" />)
              ) : transactions.length > 0 ? (
                transactions.slice(0, 10).map((t) => {
                  const isDebit = accounts.some((a) => a.id === t.sender_account_id);
                  const ref = t.reference ?? t.id.slice(0, 12).toUpperCase();
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTxn(t)}
                      className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 hover:bg-white/[0.03] transition cursor-pointer group"
                    >
                      {/* Left: icon + info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", isDebit ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400")}>
                          {isDebit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-white font-semibold text-xs sm:text-sm font-mono truncate max-w-[100px] sm:max-w-none">{ref}</p>
                            <button onClick={(e) => { e.stopPropagation(); copyRef(ref); }} className="text-slate-600 hover:text-slate-300 transition shrink-0" title="Copy reference">
                              {copied === ref ? <CheckCircle className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                          <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">{new Date(t.timestamp).toLocaleDateString("en-US", { day:"2-digit", month:"short", year:"numeric" })}</p>
                          <p className="text-slate-600 text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-[240px]">{t.description || (isDebit ? "Debit Transfer" : "Credit Transfer")}</p>
                        </div>
                      </div>

                      {/* Right: amount + status */}
                      <div className="flex flex-col items-end gap-0.5 shrink-0 ml-2 sm:ml-4">
                        <span className={cn("text-sm sm:text-lg font-bold", isDebit ? "text-red-400" : "text-green-400")}>
                          {isDebit ? "-" : "+"}{t.amount.toLocaleString("en-US")}
                        </span>
                        <span className="text-slate-500 text-[10px] sm:text-xs">USD</span>
                        <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase mt-0.5", t.status === "completed" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400")}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center">
                  <History className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium text-sm">No recent transactions found just yet</p>
                  <p className="text-slate-600 text-xs mt-1">Get started by making your very first transfer today.</p>
                </div>
              )}
            </div>
          </div>

          {/* Balance Flow — donut chart */}
          <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-base">Balance Flow</h2>
              <span className="text-xs text-red-400 font-semibold bg-red-500/10 px-3 py-1.5 rounded-lg">All time</span>
            </div>

            {/* Donut chart */}
            {(income + expenses) > 0 ? (() => {
              const total = income + expenses;
              const r = 54, cx = 80, cy = 80;
              const circ = 2 * Math.PI * r;
              const creditArc = (income / total) * circ;
              const debitArc = (expenses / total) * circ;
              return (
                <div className="relative flex items-center justify-center">
                  <svg viewBox="0 0 160 160" className="w-44 h-44">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2740" strokeWidth="26" />
                    {expenses > 0 && (
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f97316" strokeWidth="26"
                        strokeDasharray={`${debitArc} ${circ - debitArc}`}
                        strokeDashoffset={-creditArc}
                        transform={`rotate(-90 ${cx} ${cy})`} />
                    )}
                    {income > 0 && (
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth="26"
                        strokeDasharray={`${creditArc} ${circ - creditArc}`}
                        strokeDashoffset={0}
                        transform={`rotate(-90 ${cx} ${cy})`} />
                    )}
                    <text x={cx} y={cy - 6} textAnchor="middle" className="fill-white text-lg font-bold" style={{fontSize:13,fontWeight:700,fill:"white"}}>{((income/(income+expenses))*100).toFixed(0)}%</text>
                    <text x={cx} y={cy + 10} textAnchor="middle" style={{fontSize:9,fill:"#94a3b8"}}>Credit</text>
                  </svg>
                </div>
              );
            })() : (
              <div className="h-44 flex items-center justify-center">
                <TrendingUp className="h-10 w-10 text-red-500/30" />
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mb-2">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-slate-400 text-xs">Credit</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500" /><span className="text-slate-400 text-xs">Debit</span></div>
            </div>

            {/* Mini stats — real inflow / outflow */}
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-slate-400 text-xs">Income</span>
                </div>
                <span className="text-green-400 text-xs font-bold">{fmtCurrency(income)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-slate-400 text-xs">Expenses</span>
                </div>
                <span className="text-red-400 text-xs font-bold">{fmtCurrency(expenses)}</span>
              </div>
              <div className="h-px bg-white/[0.06]" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-slate-400 text-xs">Net Balance</span>
                </div>
                <span className="text-red-400 text-xs font-bold">
                  {fmtCurrency(totalBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Open New Account Modal ───────────────────────────────── */}
      {showOpenAccount && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowOpenAccount(false)}>
          <div className="bg-[#10102a] border border-white/[0.1] rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {requestSubmitted ? "Request Submitted" : "Open a New Account"}
              </h2>
              <button onClick={() => setShowOpenAccount(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            {requestSubmitted ? (
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-7 w-7 text-green-400" />
                </div>
                <p className="text-white font-semibold mb-1">Your request is now pending approval</p>
                <p className="text-slate-400 text-sm">
                  We've securely sent your {newAccountType} account request and identity details to our team for careful review.
                  Once approved, the account will be automatically and seamlessly linked to your profile.
                </p>
                <button onClick={() => setShowOpenAccount(false)} className="mt-5 w-full bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-2.5 rounded-xl transition text-sm">Done</button>
              </div>
            ) : availableNewTypes.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-slate-400 text-sm">It looks like you already have one account of every available type, or a request is already pending review.</p>
                <button onClick={() => setShowOpenAccount(false)} className="mt-4 w-full bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 font-bold py-2.5 rounded-xl transition text-sm">Close</button>
              </div>
            ) : requestStep === 1 ? (
              <form onSubmit={handleAccountTypeStep} className="p-6 space-y-5">
                {openAccountError && (
                  <div className="bg-red-900/40 border border-red-700/40 text-red-200 text-xs px-3 py-2.5 rounded-lg">{openAccountError}</div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account Type</label>
                  <select
                    value={newAccountType}
                    onChange={(e) => setNewAccountType(e.target.value)}
                    className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none"
                  >
                    {availableNewTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <p className="text-slate-500 text-xs mt-2">
                    {newAccountType === "Non-Resident Account" && "For clients who bank with us but reside outside the country."}
                    {newAccountType === "Offshore Account" && "For holding funds outside your primary country of residence."}
                    {newAccountType === "Savings" && "Earn on balances you're setting aside."}
                    {newAccountType === "Checking" && "Your everyday spending and transfers account."}
                  </p>
                </div>
                <p className="text-slate-500 text-xs">
                  Next, we'll ask you to verify your identity before this request is sent to our team for approval.
                </p>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-3 rounded-xl transition">
                    Continue
                  </button>
                  <button type="button" onClick={() => setShowOpenAccount(false)} className="flex-1 bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 font-bold py-3 rounded-xl transition">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitAccountRequest} className="p-6 space-y-5">
                {openAccountError && (
                  <div className="bg-red-900/40 border border-red-700/40 text-red-200 text-xs px-3 py-2.5 rounded-lg">{openAccountError}</div>
                )}

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Verify Your Identity</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={idFullName}
                        onChange={(e) => setIdFullName(e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date of Birth</label>
                        <input
                          type="date"
                          required
                          value={idDob}
                          onChange={(e) => setIdDob(e.target.value)}
                          className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">ID Type</label>
                        <select
                          value={idType}
                          onChange={(e) => setIdType(e.target.value)}
                          className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
                        >
                          <option>Passport</option>
                          <option>Driver's License</option>
                          <option>National ID</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">ID Number</label>
                      <input
                        type="text"
                        required
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Account Purpose</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Purpose of this account</label>
                      <textarea
                        required
                        rows={2}
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="e.g. Saving for a house deposit"
                        className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Expected monthly activity</label>
                      <select
                        value={expectedActivity}
                        onChange={(e) => setExpectedActivity(e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
                      >
                        {EXPECTED_ACTIVITY_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setRequestStep(1)} className="flex-1 bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 font-bold py-3 rounded-xl transition">
                    Back
                  </button>
                  <button type="submit" disabled={isOpeningAccount} className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
                    {isOpeningAccount ? "Submitting..." : "Submit for Approval"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Transaction Detail Modal ─────────────────────────────── */}
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
                  <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold uppercase", t.status === "completed" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400")}>
                    {t.status === "completed" ? <CheckCircle className="h-3 w-3 inline mr-1" /> : <Clock className="h-3 w-3 inline mr-1" />}
                    {t.status}
                  </span>
                </div>
              </div>

              {/* Details list */}
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
                  {
                    label: "From",
                    value: <span className="text-white text-sm font-mono">{senderAcct ? `****${senderAcct.account_number.slice(-4)}` : "External / Admin"}</span>,
                  },
                  {
                    label: "To",
                    value: <span className="text-white text-sm font-mono">{receiverAcct ? `****${receiverAcct.account_number.slice(-4)}` : "External / Admin"}</span>,
                  },
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
