"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import {
  ShieldCheck, User, FileText, CheckCircle, Clock, Upload,
  AlertTriangle, X, ChevronRight,
} from "lucide-react";

type KycStatus = "unverified" | "pending" | "approved" | "rejected";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const STEPS = [
  { id: 1, label: "Personal Information", icon: User },
  { id: 2, label: "Identity Document", icon: FileText },
  { id: 3, label: "Review & Submit", icon: ShieldCheck },
];

export default function KycPage() {
  const [status, setStatus] = useState<KycStatus>("unverified");
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Step 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 fields
  const [docType, setDocType] = useState("passport");
  const [docNumber, setDocNumber] = useState("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [reviewerNote, setReviewerNote] = useState<string | null>(null);

  useEffect(() => {
    api.get("/kyc/status").then((r) => {
      setStatus(r.data.status);
      setReviewerNote(r.data.reviewer_note ?? null);
    }).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const [front_image, back_image, selfie_image] = await Promise.all([
        frontFile ? fileToBase64(frontFile) : Promise.resolve(undefined),
        backFile ? fileToBase64(backFile) : Promise.resolve(undefined),
        selfieFile ? fileToBase64(selfieFile) : Promise.resolve(undefined),
      ]);

      await api.post("/kyc/submit", {
        first_name: firstName,
        last_name: lastName,
        dob,
        nationality,
        address,
        phone,
        doc_type: docType,
        doc_number: docNumber,
        front_image,
        back_image,
        selfie_image,
      });

      setStatus("pending");
      setToast("KYC documents submitted! Verification typically takes 1–2 business days.");
    } catch (err: any) {
      setToast(err.response?.data?.detail || "Failed to submit KYC documents.");
    } finally {
      setIsSaving(false);
    }
  };

  const statusConfig: Record<KycStatus, { label: string; color: string; bg: string; icon: React.ElementType; desc: string }> = {
    unverified: { label: "Not Verified", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", icon: AlertTriangle, desc: "Complete KYC verification to unlock full banking features." },
    pending: { label: "Under Review", color: "text-slate-300", bg: "bg-slate-400/10 border-slate-400/30", icon: Clock, desc: "Your documents are being reviewed. This takes 1–2 business days." },
    approved: { label: "Verified", color: "text-green-400", bg: "bg-green-400/10 border-green-400/30", icon: CheckCircle, desc: "Your identity has been verified. You have full access to all features." },
    rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-400/10 border-red-400/30", icon: X, desc: reviewerNote || "Your submission was rejected. Please review and resubmit your documents." },
  };

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#0d0d1a] p-6 space-y-6">

        {/* Toast */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 max-w-md rounded-xl shadow-xl p-4 bg-green-900/80 border border-green-600/40 text-green-100 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">{toast}</p>
            <button onClick={() => setToast(null)} className="ml-auto opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Header */}
        <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl px-8 py-5">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-red-400" />
            KYC Application
          </h1>
          <p className="text-slate-400 text-sm mt-1">Know Your Customer — Identity verification required for full account access</p>
        </div>

        {/* Status card */}
        <div className={`border rounded-2xl p-5 flex items-center gap-4 ${cfg.bg}`}>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <StatusIcon className={`h-6 w-6 ${cfg.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className={`font-bold text-lg ${cfg.color}`}>{cfg.label}</p>
            </div>
            <p className="text-slate-300 text-sm mt-0.5">{cfg.desc}</p>
          </div>
          {status === "approved" && (
            <div className="ml-auto bg-green-500/20 text-green-300 text-xs font-bold px-3 py-1.5 rounded-full border border-green-500/30">
              ✓ VERIFIED
            </div>
          )}
        </div>

        {status === "pending" && (
          <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl p-8 text-center">
            <Clock className="h-16 w-16 text-slate-500/40 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Documents Under Review</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Our compliance team is reviewing your submitted documents. You will receive a notification once the review is complete.
            </p>
            <div className="mt-6 flex items-center justify-center gap-8">
              {["Documents Received", "Under Review", "Decision"].map((s, i) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < 2 ? "bg-slate-500 text-white" : "bg-white/[0.07] text-slate-500"}`}>
                    {i < 2 ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  <p className={`text-xs ${i < 2 ? "text-slate-300" : "text-slate-600"}`}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === "approved" && (
          <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Identity Verified</h2>
            <p className="text-slate-400 text-sm">Your identity verification is fully complete — you now have complete, unrestricted access to all banking features.</p>
          </div>
        )}

        {(status === "unverified" || status === "rejected") && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Step indicators */}
            <div className="bg-[#10102a] border border-white/[0.07] rounded-2xl p-5 h-fit">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Verification Steps</p>
              <div className="space-y-2">
                {STEPS.map((s) => {
                  const Icon = s.icon;
                  const done = step > s.id;
                  const active = step === s.id;
                  return (
                    <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl ${active ? "bg-red-700/20 border border-red-500/30" : "border border-transparent"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-green-500" : active ? "bg-[#0E3DAA]" : "bg-white/[0.07]"}`}>
                        {done ? <CheckCircle className="h-4 w-4 text-white" /> : <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-500"}`} />}
                      </div>
                      <span className={`text-sm font-medium ${active ? "text-white" : done ? "text-green-400" : "text-slate-500"}`}>{s.label}</span>
                      {active && <ChevronRight className="h-3.5 w-3.5 text-red-400 ml-auto" />}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-5 border-t border-white/[0.07]">
                <p className="text-xs text-slate-500">Step {step} of {STEPS.length}</p>
                <div className="h-1.5 bg-white/[0.07] rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-[#0E3DAA] rounded-full transition-all" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3 bg-[#10102a] border border-white/[0.07] rounded-2xl p-6">

              {/* Step 1 — Personal Info */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-white mb-1">Personal Information</h2>
                  <p className="text-slate-400 text-sm mb-5">Please provide your personal details precisely as they appear on your government-issued ID.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "First Name", value: firstName, setter: setFirstName, placeholder: "John" },
                      { label: "Last Name", value: lastName, setter: setLastName, placeholder: "Smith" },
                    ].map((f) => (
                      <div key={f.label}>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{f.label} *</label>
                        <input type="text" value={f.value} onChange={(e) => f.setter(e.target.value)} placeholder={f.placeholder}
                          className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:border-red-500 outline-none" />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth *</label>
                      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nationality *</label>
                      <select value={nationality} onChange={(e) => setNationality(e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none">
                        <option value="">Select country</option>
                        {["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Nigeria", "Ghana", "South Africa", "Other"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Residential Address *</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main Street, City, State, ZIP"
                      className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:border-red-500 outline-none" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:border-red-500 outline-none" />
                  </div>

                  <button
                    onClick={() => { if (!firstName || !lastName || !dob || !nationality || !address) { setToast("Please fill in all required fields."); return; } setStep(2); }}
                    className="w-full bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Step 2 — Documents */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-white mb-1">Identity Document</h2>
                  <p className="text-slate-400 text-sm mb-5">Please upload a clear, legible photo of your government-issued ID.</p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Document Type *</label>
                    <select value={docType} onChange={(e) => setDocType(e.target.value)}
                      className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none">
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID Card</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="residence_permit">Residence Permit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Document Number *</label>
                    <input type="text" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="e.g. A12345678"
                      className="w-full bg-[#0d0d1a] border border-white/[0.1] text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:border-red-500 outline-none" />
                  </div>

                  {[
                    { label: "Front of Document", state: frontFile, setter: setFrontFile },
                    { label: "Back of Document", state: backFile, setter: setBackFile },
                    { label: "Selfie with Document", state: selfieFile, setter: setSelfieFile },
                  ].map(({ label, state, setter }) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label} *</label>
                      <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition ${state ? "border-green-500/40 bg-green-500/5" : "border-white/[0.12] hover:border-red-500/40 bg-white/[0.02]"}`}>
                        {state ? (
                          <>
                            <CheckCircle className="h-8 w-8 text-green-400" />
                            <p className="text-green-300 text-sm font-semibold">{state.name}</p>
                            <p className="text-slate-500 text-xs">Click to replace</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-slate-500" />
                            <p className="text-slate-400 text-sm">Click to upload or drag & drop</p>
                            <p className="text-slate-600 text-xs">JPG, PNG or PDF — Max 5 MB</p>
                          </>
                        )}
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setter(e.target.files?.[0] ?? null)} />
                      </label>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(1)} className="flex-1 bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 font-bold py-3 rounded-xl transition">
                      Back
                    </button>
                    <button
                      onClick={() => { if (!docNumber || !frontFile || !selfieFile) { setToast("Please upload the required documents."); return; } setStep(3); }}
                      className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      Continue <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 — Review */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-white mb-1">Review & Submit</h2>
                  <p className="text-slate-400 text-sm mb-5">Please carefully review your information one last time before submitting.</p>

                  <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl divide-y divide-white/[0.05]">
                    {[
                      { label: "Full Name", value: `${firstName} ${lastName}` },
                      { label: "Date of Birth", value: dob },
                      { label: "Nationality", value: nationality },
                      { label: "Address", value: address },
                      { label: "Document Type", value: docType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
                      { label: "Document Number", value: docNumber },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between px-4 py-3">
                        <span className="text-slate-500 text-sm">{label}</span>
                        <span className="text-white text-sm font-medium">{value || "—"}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-200 text-xs">
                      By submitting, you confirm that all information provided is accurate and that you consent to identity verification processing.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(2)} className="flex-1 bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 font-bold py-3 rounded-xl transition">
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {isSaving ? "Submitting..." : "Submit for Verification"}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
