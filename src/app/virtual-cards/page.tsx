"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import {
  CreditCard, Plus, Eye, EyeOff, Copy, CheckCircle, Lock,
  Unlock, Trash2, X, ShieldCheck,
} from "lucide-react";

interface Account {
  id: string;
  account_number: string;
  balance: number;
  currency: string;
}

interface VirtualCard {
  id: string;
  account_id: string;
  label: string;
  card_number: string;
  expiry: string;
  cvv: string;
  spending_limit: number;
  spent: number;
  color: string;
  frozen: boolean;
}

const CARD_COLORS = [
  { label: "Ocean Blue", from: "from-blue-700", to: "to-blue-900", value: "blue" },
  { label: "Midnight", from: "from-slate-700", to: "to-slate-900", value: "slate" },
  { label: "Emerald", from: "from-emerald-700", to: "to-emerald-900", value: "emerald" },
  { label: "Violet", from: "from-violet-700", to: "to-violet-900", value: "violet" },
];

const COLOR_MAP: Record<string, { from: string; to: string }> = {
  blue: { from: "from-blue-700", to: "to-blue-900" },
  slate: { from: "from-slate-700", to: "to-slate-900" },
  emerald: { from: "from-emerald-700", to: "to-emerald-900" },
  violet: { from: "from-violet-700", to: "to-violet-900" },
};

function formatCardNumber(num: string) {
  return num.replace(/(.{4})/g, "$1 ").trim();
}

export default function VirtualCardsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [revealId, setRevealId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Create form
  const [cardLabel, setCardLabel] = useState("My Virtual Card");
  const [spendLimit, setSpendLimit] = useState("1000");
  const [selectedColor, setSelectedColor] = useState("blue");
  const [linkedAccount, setLinkedAccount] = useState("");

  const loadCards = () => {
    api.get("/cards/").then((r) => setCards(r.data)).catch(() => {});
  };

  useEffect(() => {
    api.get("/accounts/").then((r) => {
      setAccounts(r.data);
      if (r.data.length > 0) setLinkedAccount(r.data[0].id);
    }).catch(() => {});
    loadCards();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cards.length >= 3) { setToast({ msg: "Maximum 3 virtual cards allowed.", ok: false }); return; }
    setIsSaving(true);
    try {
      await api.post("/cards/", {
        account_id: linkedAccount,
        label: cardLabel,
        color: selectedColor,
        spending_limit: parseFloat(spendLimit) || 1000,
      });
      loadCards();
      setToast({ msg: "Virtual card created successfully!", ok: true });
      setShowCreate(false);
      setCardLabel("My Virtual Card");
      setSpendLimit("1000");
    } catch (err: any) {
      setToast({ msg: err.response?.data?.detail || "Failed to create card.", ok: false });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFreeze = async (card: VirtualCard) => {
    try {
      await api.patch(`/cards/${card.id}`, { frozen: !card.frozen });
      setCards((prev) => prev.map((c) => c.id === card.id ? { ...c, frozen: !c.frozen } : c));
    } catch {
      setToast({ msg: "Failed to update card.", ok: false });
    }
  };

  const deleteCard = async (id: string) => {
    if (!confirm("Delete this virtual card? This cannot be undone.")) return;
    try {
      await api.delete(`/cards/${id}`);
      setCards((prev) => prev.filter((c) => c.id !== id));
      setToast({ msg: "Card deleted.", ok: true });
    } catch {
      setToast({ msg: "Failed to delete card.", ok: false });
    }
  };

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#0d0d1a] p-6 space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 max-w-sm rounded-xl shadow-xl p-4 flex items-start gap-3 ${toast.ok ? "bg-green-900/80 border border-green-600/40 text-green-100" : "bg-red-900/80 border border-red-600/40 text-red-100"}`}>
            {toast.ok ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <X className="h-4 w-4 shrink-0 mt-0.5" />}
            <p className="text-sm">{toast.msg}</p>
            <button onClick={() => setToast(null)} className="ml-auto opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Header */}
        <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <CreditCard className="h-7 w-7 text-red-400" />
              Virtual Cards
            </h1>
            <p className="text-slate-400 text-sm mt-1">Effortlessly create and manage virtual debit cards for genuinely secure online payments</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#0E3DAA] hover:bg-red-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition"
          >
            <Plus className="h-4 w-4" />
            New Card
          </button>
        </div>

        {/* Cards grid */}
        {cards.length === 0 ? (
          <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl py-24 flex flex-col items-center justify-center">
            <CreditCard className="h-16 w-16 text-slate-700 mb-4" />
            <p className="text-slate-300 font-semibold text-lg">No virtual cards yet</p>
            <p className="text-slate-500 text-sm mt-1 mb-6">Create your very first virtual card to get started today</p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-[#0E3DAA] hover:bg-red-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition"
            >
              <Plus className="h-4 w-4" />
              Create Virtual Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card) => {
              const colors = COLOR_MAP[card.color] || COLOR_MAP.blue;
              const isRevealed = revealId === card.id;
              const usedPct = Math.min((card.spent / card.spending_limit) * 100, 100);
              const displayNumber = formatCardNumber(card.card_number);
              return (
                <div key={card.id} className="flex flex-col gap-4">
                  {/* Card visual */}
                  <div className={`bg-linear-to-br ${colors.from} ${colors.to} rounded-2xl p-6 text-white relative overflow-hidden shadow-2xl ${card.frozen ? "opacity-60 grayscale" : ""}`}>
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/[0.07]" />
                    <div className="absolute right-8 -bottom-8 w-24 h-24 rounded-full bg-white/[0.05]" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{card.label}</p>
                        {card.frozen && (
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">FROZEN</span>
                        )}
                      </div>
                      <p className="font-mono text-lg font-bold tracking-widest mb-5">
                        {isRevealed ? displayNumber : displayNumber.replace(/\d(?=.{4})/g, "•")}
                      </p>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-white/50 text-[10px] uppercase tracking-wider">Expires</p>
                          <p className="font-semibold text-sm">{isRevealed ? card.expiry : "••/••"}</p>
                        </div>
                        <div>
                          <p className="text-white/50 text-[10px] uppercase tracking-wider">CVV</p>
                          <p className="font-semibold text-sm">{isRevealed ? card.cvv : "•••"}</p>
                        </div>
                        <ShieldCheck className="h-8 w-8 text-white/30" />
                      </div>
                    </div>
                  </div>

                  {/* Spend bar */}
                  <div className="bg-[#10102a] border border-white/[0.07] rounded-xl p-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>Spent: ${card.spent.toFixed(2)}</span>
                      <span>Limit: ${card.spending_limit.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${usedPct}%` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRevealId(isRevealed ? null : card.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold py-2.5 rounded-xl border border-white/[0.07] transition"
                    >
                      {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {isRevealed ? "Hide" : "Reveal"}
                    </button>
                    <button
                      onClick={() => copyNumber(card.card_number)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold py-2.5 rounded-xl border border-white/[0.07] transition"
                    >
                      {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => toggleFreeze(card)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold py-2.5 rounded-xl border border-white/[0.07] transition"
                    >
                      {card.frozen ? <Unlock className="h-3.5 w-3.5 text-green-400" /> : <Lock className="h-3.5 w-3.5 text-yellow-400" />}
                      {card.frozen ? "Unfreeze" : "Freeze"}
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="w-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create card modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#10102a] border border-white/[0.1] rounded-2xl w-full max-w-md shadow-2xl">
              <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Create Virtual Card</h2>
                <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Card Label</label>
                  <input
                    type="text"
                    value={cardLabel}
                    onChange={(e) => setCardLabel(e.target.value)}
                    placeholder="e.g. Shopping Card"
                    className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Linked Account</label>
                  <select
                    value={linkedAccount}
                    onChange={(e) => setLinkedAccount(e.target.value)}
                    className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        ···{a.account_number.slice(-4)} — ${a.balance.toLocaleString()} USD
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Spending Limit (USD)</label>
                  <input
                    type="number"
                    min="1"
                    value={spendLimit}
                    onChange={(e) => setSpendLimit(e.target.value)}
                    className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Card Color</label>
                  <div className="flex gap-3">
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setSelectedColor(c.value)}
                        className={`flex-1 h-10 rounded-xl bg-linear-to-br ${c.from} ${c.to} border-2 transition ${selectedColor === c.value ? "border-white" : "border-transparent"}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={isSaving || !linkedAccount} className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
                    {isSaving ? "Creating..." : "Create Card"}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 font-bold py-3 rounded-xl transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
