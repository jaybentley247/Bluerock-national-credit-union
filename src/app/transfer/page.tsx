"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import {
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Copy,
  CheckCircle,
  DollarSign,
  MapPin,
  Globe,
  Zap,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
}

function cn(...c: (string | boolean | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

const STEPS = ["Transfer Type", "Account & Amount", "Recipient", "Confirm"] as const;

const TRANSFER_TYPES = [
  {
    value: "internal",
    label: "Transfer within BLUEROCK NATIONAL CREDIT UNION",
    description: "Send instantly to another BLUEROCK NATIONAL CREDIT UNION account — no routing number needed.",
    icon: Building2,
  },
  {
    value: "local",
    label: "Local Transfer",
    description: "Send to an account at another local bank, domestically.",
    icon: MapPin,
  },
  {
    value: "international",
    label: "Cross-border Transfer",
    description: "Send funds internationally to a bank in another country.",
    icon: Globe,
  },
  {
    value: "swift",
    label: "SWIFT Transfer",
    description: "Wire transfer using a BIC/SWIFT code.",
    icon: Zap,
  },
] as const;

export default function TransferPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState("");

  // Step 2
  const [receiverAccountNumber, setReceiverAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [transferScope, setTransferScope] = useState("local");
  const [swiftCode, setSwiftCode] = useState("");
  const [description, setDescription] = useState("");

  // Transfer state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFrozenError, setIsFrozenError] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get("/accounts/").then((r) => {
      setAccounts(r.data);
      if (r.data.length > 0) setSelectedAccountId(r.data[0].id);
    }).catch(() => {});
  }, []);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const txLimit = user?.transaction_limit ?? null;
  const parsedAmount = parseFloat(amount) || 0;

  const handleSelectType = (type: string) => {
    setTransferScope(type);
    setError("");
    setStep(2);
  };

  const handleAccountStep = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (parsedAmount < 5) { setError("Minimum transfer amount is 5.00 USD."); return; }
    if (selectedAccount && parsedAmount > selectedAccount.balance) { setError("Insufficient account balance."); return; }
    if (txLimit !== null && parsedAmount > txLimit) { setError(`Amount exceeds your transaction limit of $${txLimit.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`); return; }
    setStep(3);
  };

  const handleRecipientStep = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!receiverAccountNumber.trim()) { setError("Please enter the recipient account number."); return; }
    if (transferScope !== "internal" && !routingNumber.trim()) { setError("Please enter the routing number."); return; }
    if ((transferScope === "international" || transferScope === "swift") && !swiftCode.trim()) { setError("BIC/SWIFT code is required for this transfer type."); return; }
    setStep(4);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError("");
    // Build a rich description that records banking details
    const parts: string[] = [];
    if (description.trim()) parts.push(description.trim());
    if (transferScope !== "internal") parts.push(`Routing: ${routingNumber.trim()}`);
    parts.push(`Scope: ${transferScope}`);
    if (swiftCode.trim()) parts.push(`SWIFT: ${swiftCode.trim()}`);
    const fullDescription = parts.join(" | ");

    try {
      const r = await api.post("/transactions/transfer", {
        sender_account_id: selectedAccountId,
        receiver_account_number: receiverAccountNumber.trim(),
        amount: parsedAmount,
        description: fullDescription,
        transfer_scope: transferScope,
      });
      setSuccessRef(r.data?.reference ?? "RCB-TRANSFER");
    } catch (err: any) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || "Transfer failed. Please check the details and try again.";
      setIsFrozenError(status === 403);
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const copyRef = () => {
    if (!successRef) return;
    navigator.clipboard.writeText(successRef).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };

  const fmtCurrency = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (successRef) {
    return (
      <DashboardLayout>
        <div className="min-h-full bg-[#0d0d1a] flex items-center justify-center p-6">
          <div className="bg-[#10102a] border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="w-20 h-20 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Transfer Successful!</h2>
            <p className="text-slate-400 text-sm mb-6">Your funds have been transferred securely and successfully.</p>

            <div className="bg-white/[0.05] border border-white/[0.1] rounded-xl p-4 mb-6">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Transaction Reference</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-white font-mono font-bold text-lg">{successRef}</span>
                <button onClick={copyRef} className="text-slate-500 hover:text-slate-300 transition">
                  {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="bg-white/[0.05] rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Amount</span>
                <span className="text-white font-semibold">{fmtCurrency(parsedAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">To Account</span>
                <span className="text-white font-mono">****{receiverAccountNumber.slice(-4)}</span>
              </div>
              {description && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Description</span>
                  <span className="text-white">{description}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => router.push("/history")} className="flex-1 bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold py-3 rounded-xl text-sm transition">
                View History
              </button>
              <button onClick={() => router.push("/dashboard")} className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-semibold py-3 rounded-xl text-sm transition">
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Transfers Paused ─────────────────────────────────────────────────────────
  if (user?.transfer_paused) {
    return (
      <DashboardLayout>
        <div className="min-h-full bg-[#0d0d1a] flex items-center justify-center p-6">
          <div className="bg-[#10102a] border border-orange-500/30 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-orange-500/15 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="h-8 w-8 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Transfers Temporarily Paused</h2>
            <p className="text-slate-400 text-sm mb-6">
              {user.transfer_pause_reason || "Transfers on your account are currently paused. Please contact support for details."}
            </p>
            <button onClick={() => router.push("/dashboard")} className="w-full bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold py-3 rounded-xl transition text-sm">
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Wizard ──────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#0d0d1a] p-6">
        <div className="max-w-2xl mx-auto">

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-8">
            {STEPS.map((label, i) => {
              const num = i + 1;
              const active = step === num;
              const done = step > num;
              return (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition",
                      done ? "bg-green-500 border-green-500 text-white" : active ? "bg-[#0E3DAA] border-red-500 text-white" : "border-slate-600 text-slate-500")}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : num}
                    </div>
                    <span className={cn("text-sm font-medium hidden sm:block", active ? "text-white" : done ? "text-green-400" : "text-slate-500")}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={cn("flex-1 h-px mx-3", step > num ? "bg-green-500/50" : "bg-slate-700")} />}
                </React.Fragment>
              );
            })}
          </div>

          {/* Blue banner */}
          <div className="bg-[#0E3DAA] rounded-xl px-6 py-4 flex items-center gap-3 mb-6">
            <DollarSign className="h-6 w-6 text-white shrink-0" />
            <p className="text-white font-bold text-base">
              {step === 1
                ? "Choose the type of transfer you'd like to make."
                : `${TRANSFER_TYPES.find((t) => t.value === transferScope)?.label ?? "Transfer"} — from RCB.`}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className={cn(
              "rounded-xl p-4 flex gap-3 mb-5 border",
              isFrozenError
                ? "bg-orange-500/10 border-orange-500/40 text-orange-300"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            )}>
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 flex-shrink-0" />
              <div>
                {isFrozenError && <p className="text-xs font-bold uppercase tracking-wider mb-1 text-orange-400">Action Required</p>}
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* ── STEP 1: Transfer Type ────────────────────────────────────── */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TRANSFER_TYPES.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelectType(value)}
                  className="text-left bg-[#10102a] border border-white/[0.07] hover:border-red-500/50 hover:bg-white/[0.03] rounded-2xl p-5 transition flex flex-col gap-3"
                >
                  <div className="w-11 h-11 bg-red-500/15 rounded-xl flex items-center justify-center">
                    <Icon className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{label}</p>
                    <p className="text-slate-400 text-xs mt-1">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── STEP 2: Account + Amount ─────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleAccountStep} className="space-y-5">
              {/* Select Account */}
              <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl p-5">
                <p className="text-slate-400 text-sm font-semibold mb-3">Select Account</p>
                <div className="relative">
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full appearance-none bg-white/[0.05] border border-white/[0.1] text-white rounded-xl px-4 py-4 pr-10 text-sm outline-none focus:border-red-500 transition"
                    required
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id} className="bg-[#10102a]">
                        {a.account_type.charAt(0).toUpperCase() + a.account_type.slice(1).toLowerCase()} Account ({a.currency}) — Balance: {a.balance.toLocaleString("en-US")}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Account card */}
                {selectedAccount && (
                  <div className="mt-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <DollarSign className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{selectedAccount.account_type.charAt(0).toUpperCase() + selectedAccount.account_type.slice(1).toLowerCase()} Account ({selectedAccount.currency})</p>
                      <p className="text-slate-400 text-xs">Available Balance: {selectedAccount.currency} {selectedAccount.balance.toLocaleString("en-US")}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl p-5">
                <p className="text-slate-400 text-sm font-semibold mb-3">Amount to Transfer</p>

                {/* Limit bar */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Transaction Limit:</span>
                  <span className="text-white font-semibold">
                    {txLimit !== null ? `USD${fmtCurrency(txLimit).replace("$", "")} max per transfer` : "No limit set"}
                  </span>
                </div>

                <div className="bg-white/[0.05] border border-white/[0.1] rounded-xl flex items-center px-4 py-4 focus-within:border-red-500 transition">
                  <input
                    type="number"
                    step="0.01"
                    min="5"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-white text-lg font-semibold outline-none placeholder-slate-600"
                    required
                  />
                  <span className="text-slate-400 font-semibold text-sm">USD</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span>Minimum: 5.00 USD</span>
                  <span>1 USD = 1 USD</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(""); }} className="flex items-center gap-2 bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold px-5 py-4 rounded-xl transition text-sm">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-base"
                >
                  Continue to next step <ArrowRight className="h-5 w-5" />
                </button>
              </div>
              <p className="text-center text-slate-500 text-xs">Note: our transfer fee is included.</p>
            </form>
          )}

          {/* ── STEP 3: Recipient ────────────────────────────────────────── */}
          {step === 3 && (
            <form onSubmit={handleRecipientStep} className="space-y-5">
              <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl p-5 space-y-4">
                <p className="text-slate-400 text-sm font-semibold">Recipient Details</p>

                {/* Account Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Recipient Account Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={receiverAccountNumber}
                    onChange={(e) => setReceiverAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    className="w-full bg-white/[0.05] border border-white/[0.1] text-white rounded-xl px-4 py-3.5 text-sm outline-none focus:border-red-500 transition placeholder-slate-600"
                    required
                    maxLength={30}
                  />
                </div>

                {/* Routing Number — not needed for transfers within BLUEROCK NATIONAL CREDIT UNION */}
                {transferScope !== "internal" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Routing Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      placeholder="Enter bank routing number (e.g. 021000021)"
                      className="w-full bg-white/[0.05] border border-white/[0.1] text-white rounded-xl px-4 py-3.5 text-sm outline-none focus:border-red-500 transition placeholder-slate-600"
                      required
                      maxLength={20}
                    />
                  </div>
                )}

                {/* Transfer Scope — chosen in step 1 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Transfer Type</label>
                  <div className="flex items-center justify-between bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3.5">
                    <span className="text-white text-sm font-semibold">
                      {TRANSFER_TYPES.find((t) => t.value === transferScope)?.label ?? "Transfer"}
                    </span>
                    <button type="button" onClick={() => setStep(1)} className="text-red-400 hover:text-red-300 text-xs font-semibold">
                      Change
                    </button>
                  </div>
                </div>

                {/* BIC/SWIFT — required for international/SWIFT transfers */}
                {(transferScope === "international" || transferScope === "swift") && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                    <p className="text-red-300 text-xs font-semibold uppercase tracking-wider">Additional Details Required</p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        BIC / SWIFT Code <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={swiftCode}
                        onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                        placeholder="e.g. CHASUS33 or BOFAUS3N"
                        className="w-full bg-white/[0.05] border border-red-500/30 text-white rounded-xl px-4 py-3.5 text-sm outline-none focus:border-red-500 transition placeholder-slate-600 font-mono tracking-wider"
                        required={transferScope === "international"}
                        maxLength={11}
                      />
                      <p className="text-slate-500 text-xs mt-1.5">8 or 11 character SWIFT/BIC code of the recipient's bank.</p>
                    </div>
                  </div>
                )}

                {/* Description / Memo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Description / Memo <span className="text-slate-600 normal-case font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Rent payment, business invoice…"
                    className="w-full bg-white/[0.05] border border-white/[0.1] text-white rounded-xl px-4 py-3.5 text-sm outline-none focus:border-red-500 transition placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(2); setError(""); }} className="flex items-center gap-2 bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold px-5 py-4 rounded-xl transition text-sm">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button type="submit" className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-base">
                  Continue to next step <ArrowRight className="h-5 w-5" />
                </button>
              </div>
              <p className="text-center text-slate-500 text-xs">Note: our transfer fee is included.</p>
            </form>
          )}

          {/* ── STEP 4: Confirm ─────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl p-5">
                <p className="text-slate-400 text-sm font-semibold mb-4">Review Transfer Details</p>
                <div className="space-y-0">
                  {[
                    { label: "From Account", value: selectedAccount ? `${selectedAccount.account_type} (****${selectedAccount.account_number.slice(-4)})` : "—" },
                    { label: "Recipient Account", value: receiverAccountNumber },
                    ...(transferScope !== "internal" ? [{ label: "Routing Number", value: routingNumber }] : []),
                    ...(transferScope === "international" || transferScope === "swift" ? [{ label: "BIC / SWIFT Code", value: swiftCode || "—" }] : []),
                    { label: "Transfer Type", value: TRANSFER_TYPES.find((t) => t.value === transferScope)?.label ?? "Transfer" },
                    { label: "Amount", value: fmtCurrency(parsedAmount), highlight: true },
                    { label: "Description", value: description || "—" },
                    { label: "Transfer Fee", value: "Included" },
                    { label: "Exchange Rate", value: "1 USD = 1 USD" },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
                      <span className="text-slate-400 text-sm shrink-0 mr-4">{label}</span>
                      <span className={cn("text-sm font-semibold text-right font-mono break-all", highlight ? "text-green-400 text-base" : "text-white")}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-yellow-400 text-xs">⚠ Please verify all recipient details carefully. Transfers cannot be reversed once completed.</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(3); setError(""); }} className="flex items-center gap-2 bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold px-5 py-4 rounded-xl transition text-sm">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-base disabled:opacity-50"
                >
                  {isLoading ? "Processing…" : <><CheckCircle2 className="h-5 w-5" /> Confirm Transfer</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
