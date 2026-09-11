"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import {
  LayoutDashboard,
  ArrowRightLeft,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  CreditCard,
  BitcoinIcon,
  FileText,
  Wallet,
  ChevronDown,
  User,
  Globe,
  TrendingUp,
  TrendingDown,
  Receipt,
  Camera,
  History,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ChatWidget from "./ChatWidget";
import GoogleTranslate from "./GoogleTranslate";

type NavChild = { name: string; href: string };
type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: NavChild[];
  arrow?: boolean;
};

const NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "My Account",
    href: "/dashboard",
    icon: User,
    children: [{ name: "Account summary", href: "/dashboard" }],
  },
  { name: "Send Money", href: "/transfer", icon: ArrowRightLeft, arrow: true },
  { name: "Cross-border Transfer", href: "/transfer", icon: Globe },
  { name: "Deposit Check", href: "/check-deposits", icon: CreditCard },
  { name: "Pay Bills", href: "/bill-payments", icon: Receipt },
  { name: "Virtual Cards", href: "/virtual-cards", icon: Wallet },
  { name: "Crypto Currency", href: "/crypto-wallet", icon: BitcoinIcon },
  { name: "KYC Status", href: "/kyc", icon: ShieldCheck },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuth();
  const pathname = usePathname();

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

  useEffect(() => {
    api.get("/accounts/").then(async (r) => {
      const accounts: any[] = r.data;
      const bal = accounts.reduce((s: number, a: any) => s + Number(a.balance), 0);
      setTotalBalance(bal);
      if (accounts.length > 0) {
        const results = await Promise.all(accounts.map((a: any) => api.get(`/transactions/${a.id}`)));
        const seen = new Set<string>();
        let inc = 0, exp = 0;
        results.forEach((res) => res.data.forEach((t: any) => {
          if (seen.has(t.id)) return;
          seen.add(t.id);
          if (accounts.some((a) => a.id === t.receiver_account_id)) inc += Number(t.amount);
          if (accounts.some((a) => a.id === t.sender_account_id)) exp += Number(t.amount);
        }));
        setIncome(inc);
        setExpenses(exp);
      }
    }).catch(() => {});

    api.get("/check-deposits/").then((r) => {
      const pending = r.data
        .filter((d: any) => d.status === "pending")
        .reduce((s: number, d: any) => s + Number(d.amount), 0);
      setTotalPending(pending);
    }).catch(() => {});
  }, []);

  const toggle = (name: string) =>
    setOpenMenus((prev) => {
      const n = new Set(prev);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });

  const fmt = (n: number) => n.toLocaleString("en-US");

  const total = income + expenses;
  const incomePct = total > 0 ? ((income / total) * 100).toFixed(2) : "0.00";
  const debitPct = total > 0 ? ((expenses / total) * 100).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col">
      {/* Top bar — logo, horizontal nav (desktop), profile/logout */}
      <header className="bg-[#0a0a17] border-b border-white/[0.07] sticky top-0 z-40">
        <div className="flex items-center gap-2 px-4 lg:px-8 py-3">
          <a href="/dashboard" className="flex items-center gap-2 shrink-0" title="Reload dashboard">
            <img src="/blue.png" alt="BLUEROCK NATIONAL CREDIT UNION" className="h-20 w-auto object-contain bg-white rounded p-1" />
          </a>

          {/* Desktop horizontal nav */}
          <nav className="hidden xl:flex items-center gap-1 ml-6">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href && !item.children;
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus.has(item.name);

              return (
                <div key={item.name} className="relative">
                  {hasChildren ? (
                    <button
                      onClick={() => toggle(item.name)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/[0.07] hover:text-white transition whitespace-nowrap"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                      {item.name}
                      <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                        active ? "bg-[#0E3DAA] text-white shadow-lg shadow-red-900/40" : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                      {item.name}
                    </Link>
                  )}

                  {hasChildren && isOpen && (
                    <div className="absolute top-full left-0 mt-1 min-w-[200px] bg-[#0a0a17] border border-white/[0.1] rounded-xl shadow-2xl py-1 z-50">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => toggle(item.name)}
                          className={`block px-4 py-2 text-sm transition ${
                            pathname === child.href ? "text-red-400 font-semibold" : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <GoogleTranslate dark />
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="relative w-8 h-8 rounded-full shrink-0 group focus:outline-none"
              title="Change profile photo"
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-white/20" />
              ) : (
                <div className="w-8 h-8 bg-linear-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {(user?.full_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-3 w-3 text-white" />
              </div>
            </button>

            <div className="hidden sm:block text-right leading-tight">
              <p className="text-sm font-semibold text-white truncate max-w-[160px]">
                {user?.full_name || user?.email || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate max-w-[160px]">{user?.email}</p>
            </div>

            <Link
              href="/settings"
              className={`flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium rounded-xl transition ${
                pathname === "/settings" ? "bg-[#0E3DAA] text-white" : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
              }`}
              title="Account settings"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium text-red-400 hover:bg-white/[0.05] rounded-xl transition"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button onClick={() => setSidebarOpen((v) => !v)} className="xl:hidden text-white p-1">
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile / tablet nav panel */}
        {sidebarOpen && (
          <div className="xl:hidden border-t border-white/[0.07] px-4 py-3 space-y-0.5 max-h-[70vh] overflow-y-auto">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href && !item.children;
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus.has(item.name);

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    <button
                      onClick={() => toggle(item.name)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/[0.07] hover:text-white transition"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="flex-1 text-left font-medium">{item.name}</span>
                      <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                        active ? "bg-[#0E3DAA] text-white shadow-lg shadow-red-900/40" : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                      <span className="flex-1">{item.name}</span>
                    </Link>
                  )}

                  {hasChildren && isOpen && (
                    <div className="ml-7 mt-0.5 space-y-0.5 border-l border-white/[0.07] pl-3">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`block px-2 py-2 rounded-lg text-sm transition ${
                            pathname === child.href ? "text-red-400 font-semibold" : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </header>

      {/* Balance strip — condensed horizontal summary (was the sidebar balance card) */}
      <div className="bg-[#0a0a17] border-b border-white/[0.07] px-4 lg:px-8 py-4">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Available Balance
            </p>
            <p className="text-red-400 text-2xl font-bold leading-none mt-1">
              {fmt(totalBalance)}{" "}
              <span className="text-base font-semibold text-red-400">USD</span>
            </p>
            <p className="text-white/70 text-sm font-medium mt-1">
              Current: {fmt(totalBalance + totalPending)} USD
            </p>
            {totalPending > 0 && (
              <p className="text-amber-400 text-[11px] font-semibold mt-0.5">
                +{fmt(totalPending)} uncleared, not yet available
              </p>
            )}
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs text-slate-400">Income</span>
              <span className="text-xs font-bold text-green-400">{incomePct}% ↑</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs text-slate-400">Debits</span>
              <span className="text-xs font-bold text-red-400">{debitPct}% ↓</span>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:ml-auto">
            <Link
              href="/transfer"
              className="flex items-center justify-center gap-1.5 bg-[#0E3DAA] hover:bg-red-800 text-white text-[11px] font-bold py-2.5 px-4 rounded-lg transition"
            >
              <ArrowRightLeft className="h-3 w-3" />
              TRANSFER
            </Link>
            <Link
              href="/bill-payments"
              className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold py-2.5 px-4 rounded-lg transition"
            >
              <FileText className="h-3 w-3" />
              PAY BILLS
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">{children}</main>

      {/* ── Mobile bottom navigation bar ─────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a0a17] border-t border-white/[0.07] flex items-center justify-around h-16 safe-area-inset-bottom">
        {[
          { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
          { href: "/transfer", icon: ArrowRightLeft, label: "Transfer" },
          { href: "/check-deposits", icon: CreditCard, label: "Deposit" },
          { href: "/history", icon: History, label: "History" },
        ].map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition ${
                active ? "text-red-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 transition"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>

      <ChatWidget />
    </div>
  );
}
