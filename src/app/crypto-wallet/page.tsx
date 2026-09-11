"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import {
  Copy,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  X,
  AlertTriangle,
  Wallet,
  ChevronDown,
} from "lucide-react";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
}

interface CryptoAsset {
  code: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  gradient: string;
  textColor: string;
  badgeColor: string;
  networks: { label: string; address: string }[];
  minDeposit: number;
  confirmations: number;
  balance: number;
}

const CRYPTO_ASSETS: CryptoAsset[] = [
  {
    code: "BTC", name: "Bitcoin", symbol: "₿",
    price: 67420, change24h: 2.34,
    gradient: "from-orange-500 to-amber-600",
    textColor: "text-orange-500", badgeColor: "bg-orange-100 text-orange-700",
    networks: [{ label: "Bitcoin Network", address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq" }],
    minDeposit: 0.0001, confirmations: 3, balance: 0,
  },
  {
    code: "ETH", name: "Ethereum", symbol: "Ξ",
    price: 3580, change24h: 1.82,
    gradient: "from-purple-500 to-indigo-600",
    textColor: "text-purple-500", badgeColor: "bg-purple-100 text-purple-700",
    networks: [{ label: "ERC-20", address: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97" }],
    minDeposit: 0.001, confirmations: 12, balance: 0,
  },
  {
    code: "USDT", name: "Tether", symbol: "₮",
    price: 1.00, change24h: 0.01,
    gradient: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-500", badgeColor: "bg-emerald-100 text-emerald-700",
    networks: [
      { label: "TRC-20 (Tron)", address: "TDkM7q8STtH23Kj3GqHWqRyjfJXJbGnUG3" },
      { label: "ERC-20 (Ethereum)", address: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97" },
      { label: "BEP-20 (BSC)", address: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f99" },
    ],
    minDeposit: 1, confirmations: 20, balance: 0,
  },
  {
    code: "USDC", name: "USD Coin", symbol: "◎",
    price: 1.00, change24h: -0.02,
    gradient: "from-blue-500 to-sky-600",
    textColor: "text-blue-500", badgeColor: "bg-blue-100 text-blue-700",
    networks: [
      { label: "ERC-20 (Ethereum)", address: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97" },
      { label: "BEP-20 (BSC)", address: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f99" },
      { label: "Solana (SPL)", address: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV1" },
    ],
    minDeposit: 1, confirmations: 12, balance: 0,
  },
  {
    code: "BNB", name: "BNB", symbol: "⬡",
    price: 590, change24h: 3.15,
    gradient: "from-yellow-400 to-amber-500",
    textColor: "text-yellow-500", badgeColor: "bg-yellow-100 text-yellow-700",
    networks: [{ label: "BEP-20 (BSC)", address: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f99" }],
    minDeposit: 0.01, confirmations: 15, balance: 0,
  },
  {
    code: "XRP", name: "Ripple", symbol: "✕",
    price: 0.52, change24h: -0.83,
    gradient: "from-sky-400 to-blue-600",
    textColor: "text-sky-500", badgeColor: "bg-sky-100 text-sky-700",
    networks: [{ label: "XRP Ledger", address: "rDsbeomae4FXwgQTJp9Rs64Qg9vDiTCdBv" }],
    minDeposit: 10, confirmations: 4, balance: 0,
  },
  {
    code: "SOL", name: "Solana", symbol: "◎",
    price: 165, change24h: 4.21,
    gradient: "from-violet-500 to-pink-600",
    textColor: "text-violet-500", badgeColor: "bg-violet-100 text-violet-700",
    networks: [{ label: "Solana Network", address: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV1" }],
    minDeposit: 0.01, confirmations: 32, balance: 0,
  },
  {
    code: "ADA", name: "Cardano", symbol: "₳",
    price: 0.43, change24h: -1.12,
    gradient: "from-blue-600 to-indigo-700",
    textColor: "text-indigo-500", badgeColor: "bg-indigo-100 text-indigo-700",
    networks: [{ label: "Cardano Network", address: "addr1qy2dpt3h0vc4r6q0l6v83k3w8sflv9rlhv2yg3f7xr9tp2lkzr4" }],
    minDeposit: 2, confirmations: 15, balance: 0,
  },
  {
    code: "LTC", name: "Litecoin", symbol: "Ł",
    price: 78, change24h: 1.22,
    gradient: "from-slate-400 to-slate-600",
    textColor: "text-slate-500", badgeColor: "bg-slate-100 text-slate-700",
    networks: [{ label: "Litecoin Network", address: "ltc1q3w9gfz8s7hx2kpnvy0g2t5r3xmjsqp7xvpx7d" }],
    minDeposit: 0.01, confirmations: 6, balance: 0,
  },
  {
    code: "DOGE", name: "Dogecoin", symbol: "Ð",
    price: 0.15, change24h: 5.67,
    gradient: "from-amber-300 to-yellow-500",
    textColor: "text-amber-500", badgeColor: "bg-amber-100 text-amber-700",
    networks: [{ label: "Dogecoin Network", address: "DRzqGRHLSj2Ls7BPVbTLPtJtmcfTfD1j6D" }],
    minDeposit: 50, confirmations: 6, balance: 0,
  },
  {
    code: "MATIC", name: "Polygon", symbol: "⬡",
    price: 0.72, change24h: 2.91,
    gradient: "from-purple-600 to-violet-700",
    textColor: "text-purple-600", badgeColor: "bg-purple-100 text-purple-700",
    networks: [
      { label: "Polygon (MATIC)", address: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97" },
      { label: "ERC-20 (Ethereum)", address: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97" },
    ],
    minDeposit: 1, confirmations: 128, balance: 0,
  },
  {
    code: "AVAX", name: "Avalanche", symbol: "△",
    price: 36, change24h: 1.54,
    gradient: "from-red-500 to-rose-600",
    textColor: "text-red-500", badgeColor: "bg-red-100 text-red-700",
    networks: [{ label: "Avalanche C-Chain", address: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97" }],
    minDeposit: 0.1, confirmations: 1, balance: 0,
  },
];

export default function CryptoWalletPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedCode, setSelectedCode] = useState("BTC");
  const [selectedNetworkIdx, setSelectedNetworkIdx] = useState(0);
  const [modal, setModal] = useState<"deposit" | "withdraw" | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [cryptoBalances, setCryptoBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    api.get("/accounts/").then((r) => {
      setAccounts(r.data);
      if (r.data.length > 0) setSelectedAccount(r.data[0].id);
    }).catch(() => {});

    // Fetch real crypto balances from backend
    api.get("/crypto/balances").then((r) => {
      setCryptoBalances(r.data);
    }).catch(() => {});

    const interval = setInterval(() => {
      api.get("/crypto/balances").then((r) => setCryptoBalances(r.data)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // Reset network index when switching crypto
  const selectCrypto = (code: string) => {
    setSelectedCode(code);
    setSelectedNetworkIdx(0);
  };

  const crypto = CRYPTO_ASSETS.find((c) => c.code === selectedCode)!;
  const network = crypto.networks[selectedNetworkIdx];
  const usdValue = parseFloat(depositAmount || "0") * crypto.price;

  const copyAddress = () => {
    navigator.clipboard.writeText(network.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openDeposit = () => {
    setDepositAmount("");
    setModal("deposit");
  };

  const openWithdraw = () => {
    setWithdrawAmount("");
    setWithdrawAddress("");
    setModal("withdraw");
  };

  const refreshBalances = () => {
    api.get("/crypto/balances").then((r) => setCryptoBalances(r.data)).catch(() => {});
  };

  const handleDeposit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setToast({ msg: "Please enter a valid amount.", ok: false });
      return;
    }
    if (parseFloat(depositAmount) < crypto.minDeposit) {
      setToast({ msg: `Minimum deposit is ${crypto.minDeposit} ${crypto.code}.`, ok: false });
      return;
    }
    setIsSaving(true);
    try {
      await api.post("/crypto/deposit", {
        currency_code: crypto.code,
        amount: parseFloat(depositAmount),
        network: network.label,
      });
      setToast({
        msg: `Deposit request submitted! Send exactly ${depositAmount} ${crypto.code} to the address shown. Your account will be credited after ${crypto.confirmations} network confirmations.`,
        ok: true,
      });
      setModal(null);
      refreshBalances();
    } catch (err: any) {
      const msg = err.response?.status === 403
        ? "Your account is frozen. Please contact support."
        : err.response?.data?.detail || "Deposit failed.";
      setToast({ msg, ok: false });
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setToast({ msg: "Please enter a valid amount.", ok: false });
      return;
    }
    if (!withdrawAddress.trim()) {
      setToast({ msg: "Please enter a destination wallet address.", ok: false });
      return;
    }
    setIsSaving(true);
    try {
      await api.post("/crypto/withdraw", {
        currency_code: crypto.code,
        amount: parseFloat(withdrawAmount),
        address: withdrawAddress.trim(),
        network: network.label,
      });
      setToast({
        msg: `Withdrawal of ${withdrawAmount} ${crypto.code} to ${withdrawAddress.slice(0, 12)}... submitted for processing.`,
        ok: true,
      });
      setModal(null);
      refreshBalances();
    } catch (err: any) {
      const msg = err.response?.status === 403
        ? "Your account is frozen. Please contact support."
        : err.response?.data?.detail || "Withdrawal failed.";
      setToast({ msg, ok: false });
    } finally {
      setIsSaving(false);
    }
  };

  const getBalance = (code: string) => cryptoBalances[code] ?? 0;
  const totalPortfolioUSD = CRYPTO_ASSETS.reduce(
    (sum, c) => sum + getBalance(c.code) * c.price,
    0,
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 max-w-md rounded-xl shadow-xl p-4 flex items-start gap-3 ${
              toast.ok
                ? "bg-green-50 border border-green-200 text-green-900"
                : "bg-red-50 border border-red-200 text-red-900"
            }`}
          >
            {toast.ok ? (
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            )}
            <p className="text-sm">{toast.msg}</p>
            <button onClick={() => setToast(null)} className="ml-auto shrink-0">
              <X className="h-4 w-4 opacity-50" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Wallet className="h-8 w-8 text-red-700" />
              Crypto Wallet
            </h1>
            <p className="text-gray-500 mt-1">
              Deposit and withdraw from 12 supported cryptocurrencies
            </p>
          </div>
          <div className="bg-linear-to-r from-[#0E3DAA] to-red-800 text-white rounded-2xl px-6 py-4 text-right">
            <p className="text-red-100 text-xs uppercase tracking-wider mb-1">
              Total Portfolio
            </p>
            <p className="text-2xl font-bold">
              ${totalPortfolioUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Crypto grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {CRYPTO_ASSETS.map((c) => (
            <button
              key={c.code}
              onClick={() => selectCrypto(c.code)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedCode === c.code
                  ? "border-[#0E3DAA] bg-red-50 shadow-md shadow-red-100"
                  : "border-gray-100 bg-white hover:border-red-200 hover:shadow-sm"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full bg-linear-to-br ${c.gradient} flex items-center justify-center text-white font-bold text-sm mb-2`}
              >
                {c.symbol}
              </div>
              <p className="font-bold text-gray-900 text-sm">{c.code}</p>
              <p className="text-xs text-gray-500 truncate">{c.name}</p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                ${c.price < 1 ? c.price.toFixed(4) : c.price.toLocaleString()}
              </p>
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium mt-0.5 ${
                  c.change24h >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {c.change24h >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {c.change24h >= 0 ? "+" : ""}
                {c.change24h.toFixed(2)}%
              </span>
            </button>
          ))}
        </div>

        {/* Active wallet panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main wallet card */}
          <div className={`lg:col-span-2 bg-linear-to-br ${crypto.gradient} rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden`}>
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -right-4 bottom-4 w-24 h-24 rounded-full bg-white/5" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                      {crypto.symbol}
                    </div>
                    <span className="font-semibold text-lg">{crypto.name}</span>
                  </div>
                  <p className="text-white/70 text-xs uppercase tracking-wider">
                    {crypto.code} Balance
                  </p>
                  <p className="text-4xl font-bold mt-1">
                    {getBalance(crypto.code).toFixed(crypto.price < 1 ? 4 : 6)} {crypto.code}
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    ≈ ${(getBalance(crypto.code) * crypto.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Active
                </span>
              </div>

              {/* Network selector */}
              {crypto.networks.length > 1 && (
                <div className="mb-4">
                  <p className="text-white/70 text-xs uppercase tracking-wider mb-2">
                    Select Network
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {crypto.networks.map((n, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedNetworkIdx(i)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                          selectedNetworkIdx === i
                            ? "bg-white text-gray-900"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Deposit address */}
              <div className="bg-white/15 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white/70 text-xs uppercase tracking-wider">
                    Deposit Address · {network.label}
                  </p>
                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded-lg transition"
                  >
                    {copied ? (
                      <><CheckCircle className="h-3 w-3" /> Copied!</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Copy</>
                    )}
                  </button>
                </div>
                <p className="font-mono text-sm break-all text-white leading-relaxed">
                  {network.address}
                </p>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={openDeposit}
                  className="flex items-center justify-center gap-2 bg-white text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  Deposit
                </button>
                <button
                  onClick={openWithdraw}
                  className="flex items-center justify-center gap-2 border-2 border-white text-white font-bold py-3 rounded-xl hover:bg-white/10 transition"
                >
                  <ArrowUpFromLine className="h-4 w-4" />
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Right stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Market Info
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Price (USD)</span>
                  <span className="font-bold text-gray-900">
                    ${crypto.price < 1 ? crypto.price.toFixed(4) : crypto.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">24h Change</span>
                  <span
                    className={`font-bold ${crypto.change24h >= 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {crypto.change24h >= 0 ? "+" : ""}
                    {crypto.change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Network</span>
                  <span className="font-medium text-gray-700 text-sm">
                    {network.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Deposit Info
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Min. Deposit</span>
                  <span className="font-bold text-gray-900">
                    {crypto.minDeposit} {crypto.code}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Confirmations</span>
                  <span className="font-bold text-gray-900">
                    {crypto.confirmations}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Est. Time</span>
                  <span className="font-bold text-gray-900">
                    {crypto.confirmations < 5 ? "~5 min" : crypto.confirmations < 20 ? "~15 min" : "~30 min"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-800 mb-1">
                    Important
                  </p>
                  <p className="text-xs text-amber-700">
                    Only send {crypto.code} on the {network.label} network to this address. Sending other coins may result in permanent loss.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All wallets overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50">
            <h2 className="text-xl font-bold text-gray-900">All Wallets</h2>
            <p className="text-sm text-gray-500 mt-1">
              Your balances across all supported cryptocurrencies
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {CRYPTO_ASSETS.map((c) => (
              <div
                key={c.code}
                onClick={() => selectCrypto(c.code)}
                className="w-full flex items-center justify-between px-8 py-4 hover:bg-gray-50 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full bg-linear-to-br ${c.gradient} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                  >
                    {c.symbol}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.code} · {c.networks[0].label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900">
                      {getBalance(c.code).toFixed(c.price < 1 ? 4 : 6)} {c.code}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${(getBalance(c.code) * c.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-gray-900">
                      ${c.price < 1 ? c.price.toFixed(4) : c.price.toLocaleString()}
                    </p>
                    <span
                      className={`text-xs font-medium ${c.change24h >= 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {c.change24h >= 0 ? "+" : ""}{c.change24h.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectCrypto(c.code);
                        openDeposit();
                      }}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-1.5 rounded-lg transition"
                    >
                      Deposit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Deposit Modal ─────────────────────────────────────────────────────── */}
      {modal === "deposit" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div
              className={`bg-linear-to-r ${crypto.gradient} p-6 rounded-t-2xl flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                  {crypto.symbol}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Deposit {crypto.code}
                  </h2>
                  <p className="text-white/70 text-sm">{crypto.name}</p>
                </div>
              </div>
              <button
                onClick={() => setModal(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="p-6 space-y-5">
              {/* Network selector */}
              {crypto.networks.length > 1 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Network <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedNetworkIdx}
                      onChange={(e) => setSelectedNetworkIdx(Number(e.target.value))}
                      className="w-full border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none appearance-none pr-10"
                    >
                      {crypto.networks.map((n, i) => (
                        <option key={i} value={i}>{n.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    Make sure you send on the correct network or funds will be lost.
                  </p>
                </div>
              )}

              {/* Deposit address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Send {crypto.code} to this address
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="font-mono text-sm text-gray-800 break-all leading-relaxed mb-3">
                    {network.address}
                  </p>
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    {copied ? (
                      <><CheckCircle className="h-4 w-4 text-green-500" /> Address Copied!</>
                    ) : (
                      <><Copy className="h-4 w-4" /> Copy Address</>
                    )}
                  </button>
                </div>
              </div>

              {/* QR code placeholder */}
              <div className="flex justify-center">
                <div className="w-36 h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50">
                  <div className="grid grid-cols-5 gap-0.5 p-2">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-sm ${
                          [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,7,12,17,6,11,16].includes(i)
                            ? "bg-gray-800"
                            : "bg-gray-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">QR Code</p>
                </div>
              </div>

              {/* Amount to deposit */}
              {accounts.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Credit to Account
                  </label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.account_type} ···{a.account_number.slice(-4)} — ${a.balance.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount You Are Sending <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min={crypto.minDeposit}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={`Min. ${crypto.minDeposit}`}
                    className="w-full border border-gray-300 text-gray-900 rounded-xl px-4 py-3 pr-16 text-sm focus:border-red-500 outline-none"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                    {crypto.code}
                  </span>
                </div>
                {depositAmount && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ ${usdValue.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                  </p>
                )}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-900">
                <p className="font-semibold mb-1">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 text-red-800 text-xs">
                  <li>Copy the deposit address above</li>
                  <li>Send {crypto.code} from your external wallet</li>
                  <li>Your account is credited after {crypto.confirmations} confirmations (~{crypto.confirmations < 5 ? "5 min" : crypto.confirmations < 20 ? "15 min" : "30 min"})</li>
                </ol>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex-1 bg-linear-to-r ${crypto.gradient} text-white font-bold py-3 rounded-xl transition disabled:opacity-50`}
                >
                  {isSaving ? "Submitting..." : "Confirm Deposit"}
                </button>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Withdraw Modal ────────────────────────────────────────────────────── */}
      {modal === "withdraw" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div
              className={`bg-linear-to-r ${crypto.gradient} p-6 rounded-t-2xl flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                  {crypto.symbol}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Withdraw {crypto.code}
                  </h2>
                  <p className="text-white/70 text-sm">Available: {getBalance(crypto.code).toFixed(6)} {crypto.code}</p>
                </div>
              </div>
              <button onClick={() => setModal(null)} className="text-white/70 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="p-6 space-y-5">
              {crypto.networks.length > 1 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Withdrawal Network <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedNetworkIdx}
                      onChange={(e) => setSelectedNetworkIdx(Number(e.target.value))}
                      className="w-full border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none appearance-none pr-10"
                    >
                      {crypto.networks.map((n, i) => (
                        <option key={i} value={i}>{n.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Destination Wallet Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder={`Enter ${crypto.code} wallet address`}
                  className="w-full border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(String(getBalance(crypto.code)))}
                    className="text-xs text-red-700 font-semibold hover:underline"
                  >
                    Max: {getBalance(crypto.code).toFixed(6)}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max={getBalance(crypto.code)}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-gray-300 text-gray-900 rounded-xl px-4 py-3 pr-16 text-sm focus:border-red-500 outline-none"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                    {crypto.code}
                  </span>
                </div>
                {withdrawAmount && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ ${(parseFloat(withdrawAmount || "0") * crypto.price).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                  </p>
                )}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs text-red-800">
                  <p className="font-semibold mb-1">Warning</p>
                  <p>Double-check the destination address and network. Crypto transactions are irreversible and cannot be recovered.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving || getBalance(crypto.code) === 0}
                  className={`flex-1 bg-linear-to-r ${crypto.gradient} text-white font-bold py-3 rounded-xl transition disabled:opacity-50`}
                >
                  {isSaving ? "Processing..." : "Confirm Withdrawal"}
                </button>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
