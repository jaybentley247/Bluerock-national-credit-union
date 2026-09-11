"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import PasswordInput from "@/components/ui/PasswordInput";
import {
  Plus, Search, Trash2, ShieldOff, ShieldCheck, MoreVertical, LogOut,
  User, History, CreditCard, DollarSign, Send, BitcoinIcon, Wallet,
  FileText, Mail, ArrowUpRight, ArrowDownLeft, Clock, Settings,
  ImageIcon, Plug, MessageSquare, SlidersHorizontal, Key, Ticket,
  Save, Upload, CheckCircle, XCircle, ArrowRightLeft,
  ToggleLeft, ToggleRight, X, RefreshCw, Menu, MessageCircle, ArrowLeft, Ban, UserCheck,
} from "lucide-react";

// ── Interfaces ──────────────────────────────────────────────────────────────

interface Account { id: string; account_number: string; account_type: string; balance: number; currency: string; }
interface AdminUser { id: string; email: string; full_name?: string | null; phone?: string | null; date_of_birth?: string | null; address?: string | null; city?: string | null; state?: string | null; country?: string | null; zip_code?: string | null; is_active: boolean; is_approved: boolean; is_admin: boolean; transaction_limit: number | null; transfer_paused: boolean; transfer_pause_reason: string | null; is_deactivated: boolean; deactivated_reason: string | null; otp_enabled: boolean; created_at: string; account_count: number; total_balance: number; accounts: Account[]; }
interface AdminTransaction { id: string; amount: number; description: string | null; reference: string | null; status: string; timestamp: string; sender_account_number: string | null; receiver_account_number: string | null; }
interface SupportTicket { id: string; user: string; email: string; subject: string; message: string; status: "open" | "closed"; date: string; }
interface SliderItem { id: string; title: string; subtitle: string; active: boolean; }
interface AccountRequest {
  id: string; account_type: string; currency: string; purpose: string; expected_activity: string;
  full_name: string; date_of_birth: string; id_type: string; id_number: string;
  status: string; reviewer_note: string | null; submitted_at: string; reviewed_at: string | null;
  user_id: string; user_email: string; user_full_name: string | null;
}
interface ChatThread { user_id: string; user_email: string; user_full_name: string | null; last_message: string; last_message_at: string; unread_count: number; }
interface ChatMessage { id: string; sender: "user" | "bot" | "admin"; body: string; created_at: string; }

// ── Types ────────────────────────────────────────────────────────────────────

type Section =
  | "users" | "pending-users" | "account-requests" | "live-chat" | "transactions" | "bill-payments" | "check-deposits"
  | "fund-account" | "debit-account" | "send-email" | "crypto" | "virtual-cards"
  | "kyc-admin" | "loan" | "auth-code" | "support-ticket"
  | "general-settings" | "logo-favicon" | "plugins" | "email-sms" | "slider";

const DASHBOARD_NAV: { label: string; key: Section; icon: React.ElementType }[] = [
  { label: "Registered Users", key: "users", icon: User },
  { label: "Pending Approvals", key: "pending-users", icon: Clock },
  { label: "New Account Requests", key: "account-requests", icon: Plus },
  { label: "Live Chat", key: "live-chat", icon: MessageCircle },
  { label: "Transactions", key: "transactions", icon: History },
  { label: "Bill payments", key: "bill-payments", icon: FileText },
  { label: "Check Deposits", key: "check-deposits", icon: CreditCard },
  { label: "Fund a user account", key: "fund-account", icon: DollarSign },
  { label: "Debit a user account", key: "debit-account", icon: ArrowUpRight },
  { label: "Send Email", key: "send-email", icon: Mail },
  { label: "Crypto Currency", key: "crypto", icon: BitcoinIcon },
  { label: "Virtual Cards", key: "virtual-cards", icon: Wallet },
  { label: "KYC Application", key: "kyc-admin", icon: ShieldCheck },
  { label: "Loan/Credit Financing", key: "loan", icon: ArrowRightLeft },
];

const SETTINGS_NAV: { label: string; key: Section; icon: React.ElementType }[] = [
  { label: "Manage Auth Code Name", key: "auth-code", icon: Key },
  { label: "Support ticket", key: "support-ticket", icon: Ticket },
  { label: "General Settings", key: "general-settings", icon: Settings },
  { label: "Logo & Favicon", key: "logo-favicon", icon: ImageIcon },
  { label: "Plugins", key: "plugins", icon: Plug },
  { label: "Email & SMS Configuration", key: "email-sms", icon: MessageSquare },
  { label: "Slider Setting", key: "slider", icon: SlidersHorizontal },
];

const MOCK_TICKETS: SupportTicket[] = [
  { id: "1", user: "Raymond Smith", email: "raymond@example.com", subject: "Unable to complete transfer", message: "I have been trying to send money for 3 days but keep getting an error.", status: "open", date: "Jun 1, 2026" },
  { id: "2", user: "Alice Johnson", email: "alice@example.com", subject: "Account balance discrepancy", message: "My balance shows incorrect amount after last deposit.", status: "open", date: "May 30, 2026" },
  { id: "3", user: "Bob Martinez", email: "bob@example.com", subject: "KYC document rejected", message: "My documents were rejected but I believe they are correct.", status: "closed", date: "May 28, 2026" },
];

const DEFAULT_SLIDERS: SliderItem[] = [
  { id: "1", title: "Secure Banking for Everyone", subtitle: "Open an account in minutes", active: true },
  { id: "2", title: "Zero Fees on Transfers", subtitle: "Send money instantly worldwide", active: true },
  { id: "3", title: "Earn with Your Savings", subtitle: "Competitive interest rates", active: false },
];

// ── Component ─────────────────────────────────────────────────────────────────

// Fetched once from public API on first open
let _cachedCountries: string[] = [];

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("users");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [countryList, setCountryList] = useState<string[]>(_cachedCountries);

  // Route guard — redirect unauthenticated or non-admin users
  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/admin-login"); return; }
    if (!user.is_admin) { router.replace("/dashboard"); return; }
  }, [user, loading, router]);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createPassword, setCreatePassword] = useState("");
  const [createBalance, setCreateBalance] = useState("1000");
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Edit user modal state
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editAccountType, setEditAccountType] = useState("Checking");
  const [editDob, setEditDob] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editZip, setEditZip] = useState("");
  const [isEditSaving, setIsEditSaving] = useState(false);

  // Transaction limit modal state
  const [limitTarget, setLimitTarget] = useState<AdminUser | null>(null);
  const [limitAmount, setLimitAmount] = useState("");

  // Pending users state
  const [pendingUsers, setPendingUsers] = useState<{id:string;email:string;full_name:string|null;phone:string|null;country:string|null;created_at:string;account_number:string|null}[]>([]);
  const [isPendingLoading, setIsPendingLoading] = useState(false);

  // Freeze modal state
  const [freezeTarget, setFreezeTarget] = useState<AdminUser | null>(null);
  const [freezeReason, setFreezeReason] = useState("");
  const [isFreezeSubmitting, setIsFreezeSubmitting] = useState(false);

  // Deactivate modal state — distinct from Freeze: blocks login entirely
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [isDeactivateSubmitting, setIsDeactivateSubmitting] = useState(false);

  // Transfer-pause modal state
  const [pauseTarget, setPauseTarget] = useState<AdminUser | null>(null);
  const [pauseReason, setPauseReason] = useState("");

  // Account requests state
  const [accountRequests, setAccountRequests] = useState<AccountRequest[]>([]);
  const [isAccountRequestsLoading, setIsAccountRequestsLoading] = useState(false);
  const [requestReviewNotes, setRequestReviewNotes] = useState<Record<string, string>>({});

  // Live chat state
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [isChatThreadsLoading, setIsChatThreadsLoading] = useState(false);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatReply, setChatReply] = useState("");
  const [isChatReplying, setIsChatReplying] = useState(false);

  // Debit state (used in debit-account section via fundSelectedUser)
  const [debitUserId] = useState("");
  const [debitAmount] = useState("");

  // Create user form
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [houseAddress, setHouseAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [accountType, setAccountType] = useState("CHECKING");
  const [accountCurrency, setAccountCurrency] = useState("USD");

  // Transactions state
  const [allTransactions, setAllTransactions] = useState<AdminTransaction[]>([]);
  const [isTransLoading, setIsTransLoading] = useState(false);
  const [editTxn, setEditTxn] = useState<AdminTransaction | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("completed");
  const [editRef, setEditRef] = useState("");
  const [isEditTxnSaving, setIsEditTxnSaving] = useState(false);

  // Crypto funding state
  const [cryptoFundUser, setCryptoFundUser] = useState<AdminUser | null>(null);
  const [cryptoCoin, setCryptoCoin] = useState("BTC");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [cryptoBalances, setCryptoBalances] = useState<Record<string, number>>({});
  const [isCryptoFunding, setIsCryptoFunding] = useState(false);
  const [cryptoSearch, setCryptoSearch] = useState("");

  const CRYPTO_COINS = ["BTC","ETH","USDT","USDC","BNB","XRP","SOL","ADA","LTC","DOGE","MATIC","AVAX"] as const;

  // Fund account state
  const [fundUserId, setFundUserId] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [isFunding, setIsFunding] = useState(false);
  const [fundSelectedUser, setFundSelectedUser] = useState<AdminUser | null>(null);
  const [fundTab, setFundTab] = useState<"credit" | "debit">("credit");
  const [fundTransferScope, setFundTransferScope] = useState("local");
  const [fundDescription, setFundDescription] = useState("");
  const [fundFrequency, setFundFrequency] = useState("1");
  const [fundFreqUnit, setFundFreqUnit] = useState("Frequency");
  const [fundSendEmail, setFundSendEmail] = useState("no");
  const [fundSearch, setFundSearch] = useState("");

  // Send email state
  const [emailUserId, setEmailUserId] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // KYC admin state
  const [kycStatuses, setKycStatuses] = useState<Record<string, "pending" | "approved" | "rejected">>({});

  // Support tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [ticketReply, setTicketReply] = useState("");

  // General settings state (persisted in localStorage)
  const [siteName, setSiteName] = useState("BLUEROCK NATIONAL CREDIT UNION");
  const [siteShortName, setSiteShortName] = useState("NCU");
  const [siteEmail, setSiteEmail] = useState("info@bluerocknational.com");
  const [sitePhone, setSitePhone] = useState("");
  const [siteUrl, setSiteUrl] = useState("https://bluerocknational.com/");
  const [siteCountry, setSiteCountry] = useState("United States");
  const [siteCurrency, setSiteCurrency] = useState("USD");
  const [botsBlocker, setBotsBlocker] = useState(true);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [enableCrypto, setEnableCrypto] = useState(true);
  const [enableKyc, setEnableKyc] = useState(true);
  const [enableVirtualCards, setEnableVirtualCards] = useState(true);
  const [suspendedMsg, setSuspendedMsg] = useState("Dear Customer, we have discovered suspicious activities on your account. Your account has been temporarily suspended. Kindly contact our customer care representative for assistance.");
  const [transferBlockMsg, setTransferBlockMsg] = useState("Your account has been temporarily restricted from carrying out transactions. Kindly visit any of our nearest branches or contact our online customer care to resolve this issue.");

  // Logo & Favicon state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  // Plugins state
  const [plugins, setPlugins] = useState([
    { id: "livechat", label: "Live Chat", enabled: true, desc: "Real-time customer support chat widget" },
    { id: "analytics", label: "Google Analytics", enabled: false, desc: "Track website traffic and user behavior" },
    { id: "recaptcha", label: "reCAPTCHA", enabled: true, desc: "Protect forms from spam and bots" },
    { id: "2fa", label: "Two-Factor Authentication", enabled: true, desc: "Extra security layer on login" },
    { id: "seo", label: "SEO Tools", enabled: false, desc: "Search engine optimization helpers" },
  ]);

  // Email & SMS config state
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [fromName, setFromName] = useState("BLUEROCK NATIONAL CREDIT UNION");
  const [fromEmail, setFromEmail] = useState("noreply@bluerocknational.com");
  const [resendApiKey, setResendApiKey] = useState("");
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [smsProvider, setSmsProvider] = useState("twilio");
  const [smsAccountSid, setSmsAccountSid] = useState("");
  const [smsApiKey, setSmsApiKey] = useState("");
  const [smsApiSecret, setSmsApiSecret] = useState("");
  const [smsFromNumber, setSmsFromNumber] = useState("");
  const [smsUsername, setSmsUsername] = useState("");
  const [smsTestPhone, setSmsTestPhone] = useState("");
  const [isSmsTestSending, setIsSmsTestSending] = useState(false);
  const [smsTestResult, setSmsTestResult] = useState<{success: boolean; message: string} | null>(null);

  // Auth code state
  const [authCodeLabel, setAuthCodeLabel] = useState("Transaction PIN");
  const [authCodeLength, setAuthCodeLength] = useState("6");
  const [authCodeExpiry, setAuthCodeExpiry] = useState("5");

  // Slider state
  const [sliders, setSliders] = useState<SliderItem[]>(DEFAULT_SLIDERS);
  const [newSliderTitle, setNewSliderTitle] = useState("");
  const [newSliderSubtitle, setNewSliderSubtitle] = useState("");

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (_cachedCountries.length) return;
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((r) => r.json())
      .then((data: { name: { common: string } }[]) => {
        const names = data.map((c) => c.name.common).sort();
        _cachedCountries = names;
        setCountryList(names);
      })
      .catch(() => {
        // fallback — show a reasonable default list if API is unavailable
        const fallback = ["United States","United Kingdom","Canada","Australia","Germany","France","Nigeria","Ghana","India","China","Brazil","South Africa","Japan","Mexico","Italy","Spain","Netherlands","Sweden","Norway","Switzerland","Singapore","UAE","Saudi Arabia","Kenya","Egypt","Pakistan","Bangladesh","Indonesia","Malaysia","Philippines","Other"];
        _cachedCountries = fallback;
        setCountryList(fallback);
      });
  }, []);

  useEffect(() => {
    if (user?.is_admin) {
      fetchUsers();
      fetchPendingUsers();
      fetchChatThreads();
    }
  }, [user]);

  // Poll for new live-chat messages so the sidebar badge stays current
  // even while the admin is on a different section.
  useEffect(() => {
    if (!user?.is_admin) return;
    const interval = setInterval(fetchChatThreads, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // While a conversation is open, poll it directly for new incoming messages.
  useEffect(() => {
    if (!activeChatUserId) return;
    const interval = setInterval(async () => {
      try {
        const r = await api.get(`/chat/admin/${activeChatUserId}/messages`);
        setChatMessages(r.data);
        await api.patch(`/chat/admin/${activeChatUserId}/read`);
      } catch { /* silent */ }
    }, 6000);
    return () => clearInterval(interval);
  }, [activeChatUserId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_general_settings");
      if (saved) {
        const s = JSON.parse(saved);
        if (s.siteName) setSiteName(s.siteName);
        if (s.siteShortName) setSiteShortName(s.siteShortName);
        if (s.siteEmail) setSiteEmail(s.siteEmail);
        if (s.sitePhone) setSitePhone(s.sitePhone);
        if (s.siteUrl) setSiteUrl(s.siteUrl);
        if (s.siteCountry) setSiteCountry(s.siteCountry);
        if (s.siteCurrency) setSiteCurrency(s.siteCurrency);
        if (s.botsBlocker !== undefined) setBotsBlocker(s.botsBlocker);
        if (s.themeMode) setThemeMode(s.themeMode);
        if (s.enableCrypto !== undefined) setEnableCrypto(s.enableCrypto);
        if (s.enableKyc !== undefined) setEnableKyc(s.enableKyc);
        if (s.enableVirtualCards !== undefined) setEnableVirtualCards(s.enableVirtualCards);
        if (s.suspendedMsg) setSuspendedMsg(s.suspendedMsg);
        if (s.transferBlockMsg) setTransferBlockMsg(s.transferBlockMsg);
      }
    } catch { /* ignore */ }
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const fetchUsers = async () => {
    try {
      const r = await api.get("/admin/users");
      setUsers(r.data);
    } catch { setToast("Failed to load users."); }
  };

  const fetchPendingUsers = async () => {
    setIsPendingLoading(true);
    try {
      const r = await api.get("/admin/pending-users");
      setPendingUsers(r.data);
    } catch { setToast("Failed to load pending users."); }
    finally { setIsPendingLoading(false); }
  };

  const fetchAllTransactions = async () => {
    setIsTransLoading(true);
    try {
      const r = await api.get("/admin/transactions");
      setAllTransactions(r.data);
    } catch { setToast("Failed to load transactions."); }
    finally { setIsTransLoading(false); }
  };

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    setSidebarOpen(false);
    if (section === "transactions") fetchAllTransactions();
    if (section === "pending-users") fetchPendingUsers();
    if (section === "account-requests") fetchAccountRequests();
    if (section === "live-chat") { setActiveChatUserId(null); fetchChatThreads(); }
    if (section === "email-sms") fetchConfig();
    if (section === "fund-account") { setFundSelectedUser(null); setFundTab("credit"); setFundAmount(""); setFundSearch(""); }
    if (section === "debit-account") { setFundSelectedUser(null); setFundTab("debit"); setFundAmount(""); setFundSearch(""); }
  };

  const fetchConfig = async () => {
    setIsConfigLoading(true);
    try {
      const r = await api.get("/admin/config");
      setSmtpHost(r.data.smtp_host || "smtp.gmail.com");
      setSmtpPort(r.data.smtp_port || "587");
      setSmtpUser(r.data.smtp_user || "");
      setSmtpPass(r.data.smtp_pass || "");
      setFromName(r.data.from_name || "BLUEROCK NATIONAL CREDIT UNION");
      setFromEmail(r.data.from_email || "noreply@bluerocknational.com");
      setResendApiKey(r.data.resend_api_key || "");
      if (r.data.sms_provider) setSmsProvider(r.data.sms_provider);
      setSmsApiKey(r.data.sms_api_key || "");
      setSmsApiSecret(r.data.sms_api_secret || "");
      setSmsAccountSid(r.data.sms_account_sid || "");
      setSmsFromNumber(r.data.sms_from_number || "");
      setSmsUsername(r.data.sms_username || "");
    } catch { /* leave defaults if this is the first time it's ever been saved */ }
    finally { setIsConfigLoading(false); }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/approve`);
      // Remove from pending list immediately
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      // Refetch registered users — the newly approved user will now appear as Active
      await fetchUsers();
      setToast("Account activated. User can now log in.");
    } catch { setToast("Failed to activate account."); }
  };

  const handleRejectUser = async (userId: string) => {
    if (!confirm("Reject and permanently delete this registration?")) return;
    try {
      await api.delete(`/admin/users/${userId}/reject`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      setToast("Registration rejected and removed.");
    } catch { setToast("Failed to reject user."); }
  };

  const handleCreateUser = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!emailAddress || !createPassword || !firstName || !lastName) {
      setToast("Please fill in all required fields."); return;
    }
    setIsSaving(true);
    try {
      const fullName = `${firstName}${middleName ? " " + middleName : ""} ${lastName}`.trim();
      await api.post("/admin/users", { full_name: fullName, email: emailAddress, password: createPassword, initial_balance: Number(createBalance) || 0, currency: accountCurrency });
      setFirstName(""); setMiddleName(""); setLastName(""); setCountry(""); setStateVal(""); setCity(""); setZipCode(""); setDateOfBirth(""); setHouseAddress(""); setPhoneNumber(""); setEmailAddress(""); setCreatePassword(""); setCreateBalance("1000"); setAccountType("CHECKING"); setAccountCurrency("USD");
      setShowCreateModal(false);
      setToast("User created successfully.");
      fetchUsers();
    } catch (error: any) {
      setToast(error?.response?.data?.detail || "Unable to create user.");
    } finally { setIsSaving(false); }
  };

  const handleFreezeUser = async () => {
    if (!freezeTarget || isFreezeSubmitting) return;
    const isFreezing = freezeTarget.is_active;
    const nextIsActive = !isFreezing;
    setIsFreezeSubmitting(true);
    try {
      const r = await api.patch(`/admin/users/${freezeTarget.id}/freeze`, {
        is_active: nextIsActive,
        reason: isFreezing ? (freezeReason.trim() || undefined) : undefined,
      });
      setUsers((prev) => prev.map((u) => u.id === freezeTarget.id ? { ...u, is_active: r.data.is_active } : u));
      setToast(r.data.is_active ? "User account activated." : "User account frozen.");
      setFreezeTarget(null);
      setFreezeReason("");
      setShowActionMenu(null);
    } catch {
      setToast("Failed to update user status.");
    } finally {
      setIsFreezeSubmitting(false);
    }
  };

  const handleToggle2fa = async (u: AdminUser) => {
    const next = !u.otp_enabled;
    try {
      const r = await api.patch(`/admin/users/${u.id}/2fa`, { otp_enabled: next });
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, otp_enabled: r.data.otp_enabled } : x));
      setToast(r.data.otp_enabled ? "Login verification codes (2FA) enabled for this user." : "Login verification codes (2FA) disabled for this user.");
    } catch {
      setToast("Failed to update this user's 2FA setting.");
    }
    setShowActionMenu(null);
  };

  const handleDeactivateUser = async () => {
    if (!deactivateTarget || isDeactivateSubmitting) return;
    const isDeactivating = !deactivateTarget.is_deactivated;
    setIsDeactivateSubmitting(true);
    try {
      const r = await api.patch(`/admin/users/${deactivateTarget.id}/deactivate`, {
        is_deactivated: isDeactivating,
        reason: isDeactivating ? (deactivateReason.trim() || undefined) : undefined,
      });
      setUsers((prev) => prev.map((u) => u.id === deactivateTarget.id ? { ...u, is_deactivated: r.data.is_deactivated } : u));
      setToast(r.data.is_deactivated ? "User account deactivated — they can no longer log in." : "User account reactivated.");
      setDeactivateTarget(null);
      setDeactivateReason("");
      setShowActionMenu(null);
    } catch {
      setToast("Failed to update user status.");
    } finally {
      setIsDeactivateSubmitting(false);
    }
  };

  const submitTransferPause = async (paused: boolean, { close = true }: { close?: boolean } = {}) => {
    if (!pauseTarget) return;
    try {
      const r = await api.patch(`/admin/users/${pauseTarget.id}/transfer-pause`, {
        paused,
        reason: paused ? pauseReason.trim() || undefined : undefined,
      });
      setUsers((prev) => prev.map((u) => u.id === pauseTarget.id
        ? { ...u, transfer_paused: r.data.transfer_paused, transfer_pause_reason: r.data.transfer_pause_reason }
        : u));
      setToast(paused ? "Transfer pause reason saved." : "Transfers resumed for this user.");
      if (close) { setPauseTarget(null); setPauseReason(""); }
      else setPauseTarget((prev) => prev ? { ...prev, transfer_paused: r.data.transfer_paused, transfer_pause_reason: r.data.transfer_pause_reason } : prev);
    } catch { setToast("Failed to update transfer pause status."); }
    setShowActionMenu(null);
  };

  const fetchAccountRequests = async () => {
    setIsAccountRequestsLoading(true);
    try {
      const r = await api.get("/admin/account-requests");
      setAccountRequests(r.data);
    } catch { setToast("Failed to load account requests."); }
    finally { setIsAccountRequestsLoading(false); }
  };

  const handleReviewAccountRequest = async (id: string, reviewStatus: "approved" | "rejected") => {
    try {
      const r = await api.patch(`/admin/account-requests/${id}/review`, {
        status: reviewStatus,
        reviewer_note: requestReviewNotes[id]?.trim() || undefined,
      });
      setAccountRequests((prev) => prev.map((req) => req.id === id ? r.data : req));
      setToast(reviewStatus === "approved" ? "Account request approved and linked to the user." : "Account request rejected.");
    } catch (err: any) {
      setToast(err.response?.data?.detail || "Failed to review account request.");
    }
  };

  const fetchChatThreads = async () => {
    try {
      const r = await api.get("/chat/admin/threads");
      setChatThreads(r.data);
    } catch { /* silent — polled in the background */ }
  };

  const openChatThread = async (userId: string) => {
    setActiveChatUserId(userId);
    setIsChatThreadsLoading(true);
    try {
      const r = await api.get(`/chat/admin/${userId}/messages`);
      setChatMessages(r.data);
      await api.patch(`/chat/admin/${userId}/read`);
      setChatThreads((prev) => prev.map((t) => t.user_id === userId ? { ...t, unread_count: 0 } : t));
    } catch { setToast("Failed to load conversation."); }
    finally { setIsChatThreadsLoading(false); }
  };

  const handleChatReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = chatReply.trim();
    if (!body || !activeChatUserId || isChatReplying) return;
    setIsChatReplying(true);
    try {
      const r = await api.post(`/chat/admin/${activeChatUserId}/reply`, { body });
      setChatMessages((prev) => [...prev, r.data]);
      setChatReply("");
      fetchChatThreads();
    } catch { setToast("Failed to send reply."); }
    finally { setIsChatReplying(false); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user and all related accounts?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setToast("User deleted successfully.");
      setShowActionMenu(null);
    } catch { setToast("Failed to delete user."); }
  };

  const handleEditUser = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editTarget) return;
    setIsEditSaving(true);
    try {
      const payload: Record<string, unknown> = {
        full_name: editName,
        email: editEmail,
        phone: editPhone,
        date_of_birth: editDob,
        address: editAddress,
        city: editCity,
        state: editState,
        country: editCountry,
        zip_code: editZip,
        account_type: editAccountType,
      };
      if (editPassword.trim()) payload.password = editPassword.trim();

      const res = await api.patch(`/admin/users/${editTarget.id}/edit`, payload);
      setUsers((prev) => prev.map((u) => u.id === editTarget.id ? res.data : u));
      setToast("User details updated successfully.");
      setEditTarget(null);
      setEditPassword("");
    } catch (error: any) {
      setToast(error?.response?.data?.detail || "Failed to update user.");
    } finally { setIsEditSaving(false); }
  };

  const handleSetTransactionLimit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!limitTarget) return;
    const limit = limitAmount === "" ? null : parseFloat(limitAmount);
    try {
      await api.patch(`/admin/users/${limitTarget.id}/transaction-limit`, { limit });
      setUsers((prev) => prev.map((u) => u.id === limitTarget.id ? { ...u, transaction_limit: limit } : u));
      setToast(limit === null ? "Transaction limit removed." : `Limit set to $${limit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
      setLimitTarget(null);
    } catch (error: any) {
      setToast(error?.response?.data?.detail || "Failed to set transaction limit.");
    }
  };

  const handleFundSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fundSelectedUser) return;
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) { setToast("Please enter a valid amount."); return; }
    setIsFunding(true);
    const isCredit = fundTab === "credit";
    try {
      const payload = {
        amount,
        description: fundDescription.trim() || (isCredit ? "Admin credit" : "Admin debit"),
        transfer_scope: fundTransferScope,
        frequency: parseInt(fundFrequency) || 1,
        send_email: fundSendEmail === "yes",
      };
      const r = await api.post(`/admin/users/${fundSelectedUser.id}/${isCredit ? "fund" : "debit"}`, payload);
      setToast(`Account ${isCredit ? "credited" : "debited"} successfully. New balance: $${r.data.new_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
      setFundAmount(""); setFundDescription(""); setFundFrequency("1"); setFundFreqUnit("Frequency"); setFundSendEmail("no"); setFundTransferScope("local");
      setFundSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      const msg = error?.response?.data?.detail || `Failed to ${isCredit ? "credit" : "debit"} account.`;
      setToast(`Error: ${msg}`);
    } finally { setIsFunding(false); }
  };

  const handleSendEmail = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = users.find((u) => u.id === emailUserId);
    if (!target || !emailSubject || !emailMessage) { setToast("Please fill in all fields."); return; }
    setIsSendingEmail(true);
    try {
      await api.post(`/admin/users/${target.id}/send-email`, { subject: emailSubject, message: emailMessage });
      setToast("Email sent.");
      setEmailUserId(""); setEmailSubject(""); setEmailMessage("");
    } catch {
      setToast("Failed to send email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Delete this transaction? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/transactions/${id}`);
      setAllTransactions((prev) => prev.filter((t) => t.id !== id));
      setToast("Transaction deleted.");
    } catch { setToast("Failed to delete transaction."); }
  };

  const openEditTxn = (txn: AdminTransaction) => {
    const d = new Date(txn.timestamp);
    setEditTxn(txn);
    setEditDate(d.toISOString().slice(0, 10));
    setEditTime(d.toTimeString().slice(0, 8));
    setEditDesc(txn.description || "");
    setEditStatus(txn.status);
    setEditRef(txn.reference || "");
  };

  const handleSaveEditTxn = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editTxn) return;
    setIsEditTxnSaving(true);
    try {
      const isoTimestamp = `${editDate}T${editTime}`;
      const r = await api.patch(`/admin/transactions/${editTxn.id}`, {
        timestamp: isoTimestamp,
        description: editDesc,
        status: editStatus,
        reference: editRef,
      });
      setAllTransactions((prev) => prev.map((t) =>
        t.id === editTxn.id ? { ...t, timestamp: r.data.timestamp, description: r.data.description, status: r.data.status, reference: r.data.reference } : t
      ));
      setToast("Transaction updated successfully.");
      setEditTxn(null);
    } catch (err: any) {
      setToast(err?.response?.data?.detail || "Failed to update transaction.");
    } finally { setIsEditTxnSaving(false); }
  };

  const handleSaveGeneralSettings = () => {
    const data = { siteName, siteShortName, siteEmail, sitePhone, siteUrl, siteCountry, siteCurrency, botsBlocker, themeMode, enableCrypto, enableKyc, enableVirtualCards, suspendedMsg, transferBlockMsg };
    try {
      localStorage.setItem("admin_general_settings", JSON.stringify(data));
      setToast("General settings saved successfully.");
    } catch { setToast("Failed to save settings."); }
  };

  const handleKycAction = (userId: string, action: "approved" | "rejected") => {
    setKycStatuses((prev) => ({ ...prev, [userId]: action }));
    setToast(`KYC ${action} for user.`);
  };

  const handleTicketReply = (ticket: SupportTicket) => {
    if (!ticketReply.trim()) return;
    window.open(`mailto:${ticket.email}?subject=Re: ${encodeURIComponent(ticket.subject)}&body=${encodeURIComponent(ticketReply)}`, "_blank");
    setToast("Email client opened with reply.");
    setTicketReply("");
    setActiveTicket(null);
  };

  const handleCloseTicket = (id: string) => {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: "closed" } : t));
    setActiveTicket(null);
    setToast("Ticket closed.");
  };

  const handleAddSlider = () => {
    if (!newSliderTitle) return;
    setSliders((prev) => [...prev, { id: Date.now().toString(), title: newSliderTitle, subtitle: newSliderSubtitle, active: true }]);
    setNewSliderTitle(""); setNewSliderSubtitle("");
    setToast("Slider added.");
  };

  const filteredUsers = useMemo(() => users.filter((u) => {
    const text = [u.full_name, u.email].filter(Boolean).join(" ").toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  }), [users, searchTerm]);

  const formatDate = (s: string) => new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
  const formatDateTime = (s: string) => new Date(s).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  // ── Section renderers ──────────────────────────────────────────────────────

  const renderUsersSection = () => {
    const paged = filteredUsers.slice(0, usersPerPage);
    const allSelected = paged.length > 0 && paged.every((u) => selectedUsers.has(u.id));
    const toggleAll = () => setSelectedUsers(allSelected ? new Set() : new Set(paged.map((u) => u.id)));
    const toggleOne = (id: string) => setSelectedUsers((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

    return (
      <div>
        {/* Header */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 sm:px-6 py-4 sm:py-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg sm:text-2xl font-bold text-white">Manage users account.</h2>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 bg-[#0E3DAA] hover:bg-red-800 text-white px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-sm transition">
            <Plus className="h-4 w-4" /> Open an account
          </button>
        </div>

        {/* Sub-header */}
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-bold text-white">Registered Users</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Below is the complete list of registered members and their detailed account information</p>
        </div>

        {/* Search + Show control */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 flex-1 sm:max-w-xs">
            <Search className="h-4 w-4 text-slate-500 mr-2 shrink-0" />
            <input type="text" placeholder="Type in to Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent text-white placeholder-slate-500 outline-none flex-1 text-sm" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>Show</span>
            <select value={usersPerPage} onChange={(e) => setUsersPerPage(Number(e.target.value))} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm outline-none">
              {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/60">
                <th className="px-4 py-4 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#0E3DAA] w-4 h-4 rounded" />
                </th>
                {["Fullname", "Balance", "Account Number", "Verified", "Date registered", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => {
                const primary = u.accounts?.[0];
                const initials = (u.full_name || u.email).slice(0, 2).toUpperCase();
                const colors = ["from-rose-500 to-red-700", "from-purple-500 to-pink-600", "from-teal-500 to-cyan-600", "from-orange-500 to-red-600", "from-green-500 to-emerald-600"];
                const colorIdx = u.email.charCodeAt(0) % colors.length;
                return (
                  <tr key={u.id} className={`border-b border-slate-700/60 transition hover:bg-slate-700/30 ${selectedUsers.has(u.id) ? "bg-red-900/10" : ""}`}>
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selectedUsers.has(u.id)} onChange={() => toggleOne(u.id)} className="accent-[#0E3DAA] w-4 h-4 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 bg-linear-to-br ${colors[colorIdx]} rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0`}>{initials}</div>
                        <div>
                          <p className="text-sm font-semibold text-white leading-tight">{u.full_name || "—"}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-white">{u.total_balance.toLocaleString("en-US")}</p>
                      <p className="text-xs text-slate-400">USD</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300 font-mono">{primary?.account_number || "N/A"}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <span>Email</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-300">{new Date(u.created_at).toLocaleDateString("en-US", { day:"2-digit", month:"short", year:"numeric" })}</p>
                      <p className="text-xs text-slate-500">{new Date(u.created_at).toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}</p>
                    </td>
                    <td className="px-4 py-4">
                      {!u.is_approved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-900/40 text-yellow-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                          Pending
                        </span>
                      ) : u.is_deactivated ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${u.is_active ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-green-400" : "bg-red-400"}`} />
                          {u.is_active ? "Active" : "Frozen"}
                        </span>
                      )}
                      {u.transaction_limit !== null && (
                        <p className="text-xs text-yellow-500 mt-0.5">Limit: ${u.transaction_limit?.toLocaleString()}</p>
                      )}
                      {u.transfer_paused && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-900/40 text-orange-400 mt-1">
                          <ArrowRightLeft className="h-2.5 w-2.5" /> Transfers Paused
                        </span>
                      )}
                      {u.otp_enabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/40 text-blue-400 mt-1 ml-1">
                          <ToggleRight className="h-2.5 w-2.5" /> 2FA On
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 relative">
                      <button onClick={() => setShowActionMenu(showActionMenu === u.id ? null : u.id)} className="text-slate-400 hover:text-white p-1 rounded transition">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {showActionMenu === u.id && (
                        <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 w-52 py-1" onClick={(e) => e.stopPropagation()}>
                          {!u.is_approved && (
                            <button onClick={() => { handleApproveUser(u.id); setShowActionMenu(null); }}
                              className="w-full text-left px-4 py-2.5 text-sm text-green-400 hover:bg-slate-800 flex items-center gap-3 transition font-semibold">
                              <CheckCircle className="h-4 w-4 text-green-400" /> Activate Account
                            </button>
                          )}
                          <button onClick={() => {
                            setEditTarget(u);
                            setEditName(u.full_name || "");
                            setEditEmail(u.email);
                            setEditPhone(u.phone || "");
                            setEditPassword("");
                            setEditAccountType(u.accounts[0]?.account_type || "Checking");
                            setEditDob(u.date_of_birth || "");
                            setEditAddress(u.address || "");
                            setEditCity(u.city || "");
                            setEditState(u.state || "");
                            setEditCountry(u.country || "");
                            setEditZip(u.zip_code || "");
                            setShowActionMenu(null);
                          }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-3 transition">
                            <User className="h-4 w-4 text-red-400" /> Edit Account Details
                          </button>
                          <button onClick={() => { setFreezeTarget(u); setFreezeReason(""); setShowActionMenu(null); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-3 transition">
                            {u.is_active ? <><ShieldOff className="h-4 w-4 text-yellow-400" /> Freeze Account</> : <><ShieldCheck className="h-4 w-4 text-green-400" /> Activate Account</>}
                          </button>
                          <button onClick={() => { setDeactivateTarget(u); setDeactivateReason(u.deactivated_reason || ""); setShowActionMenu(null); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-3 transition">
                            {u.is_deactivated ? <><UserCheck className="h-4 w-4 text-green-400" /> Reactivate Account</> : <><Ban className="h-4 w-4 text-red-400" /> Deactivate Account (block login)</>}
                          </button>
                          <button onClick={() => { setPauseTarget(u); setPauseReason(u.transfer_pause_reason || ""); setShowActionMenu(null); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-3 transition">
                            {u.transfer_paused ? <><ArrowRightLeft className="h-4 w-4 text-green-400" /> Resume Transfers</> : <><ArrowRightLeft className="h-4 w-4 text-yellow-400" /> Pause Transfers</>}
                          </button>
                          <button onClick={() => { setLimitTarget(u); setLimitAmount(u.transaction_limit !== null ? String(u.transaction_limit) : ""); setShowActionMenu(null); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-3 transition">
                            <SlidersHorizontal className="h-4 w-4 text-purple-400" /> Set Transaction Limit
                          </button>
                          <button onClick={() => handleToggle2fa(u)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-3 transition">
                            {u.otp_enabled ? <><ToggleLeft className="h-4 w-4 text-yellow-400" /> Disable 2FA</> : <><ToggleRight className="h-4 w-4 text-blue-400" /> Enable 2FA</>}
                          </button>
                          <button onClick={() => { handleSectionChange("fund-account"); setFundSelectedUser(u); setFundTab("credit"); setShowActionMenu(null); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-3 transition">
                            <DollarSign className="h-4 w-4 text-green-400" /> Fund Account
                          </button>
                          <button onClick={() => { handleSectionChange("debit-account"); setFundSelectedUser(u); setFundTab("debit"); setShowActionMenu(null); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-3 transition">
                            <ArrowUpRight className="h-4 w-4 text-orange-400" /> Debit Account
                          </button>
                          <div className="border-t border-slate-700 mt-1 pt-1">
                            <button onClick={() => { handleDeleteUser(u.id); setShowActionMenu(null); }}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800 flex items-center gap-3 transition">
                              <Trash2 className="h-4 w-4" /> Delete User
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <User className="h-12 w-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No users found</p>
            </div>
          )}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
              <p className="text-slate-500 text-sm">Showing {Math.min(usersPerPage, filteredUsers.length)} of {filteredUsers.length} users</p>
              <div className="flex gap-2">
                <button disabled className="px-3 py-1.5 border border-slate-700 rounded-lg text-xs text-slate-500 bg-slate-900 disabled:cursor-not-allowed">Prev</button>
                <button className="px-3 py-1.5 border border-slate-700 rounded-lg text-xs text-white bg-[#0E3DAA]">1</button>
                <button disabled className="px-3 py-1.5 border border-slate-700 rounded-lg text-xs text-slate-500 bg-slate-900 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTransactionsSection = () => (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
        <div>
          <h2 className="text-xl sm:text-xl sm:text-3xl font-bold text-white">All Transactions</h2>
          <p className="text-slate-400 text-sm mt-1">Click any row to edit — date, time, status, description &amp; reference</p>
        </div>
        <button onClick={fetchAllTransactions} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shrink-0"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>
      {isTransLoading ? (
        <div className="space-y-3">{[1,2,3,4,5].map((i) => <div key={i} className="h-16 bg-slate-800 animate-pulse rounded-lg" />)}</div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900">
                {["From Account","To Account","Amount","Reference","Description","Status","Date & Time",""].map((h,i) => (
                  <th key={i} className="px-5 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allTransactions.map((txn) => (
                <tr
                  key={txn.id}
                  onClick={() => openEditTxn(txn)}
                  className="border-b border-slate-700 hover:bg-red-900/20 transition cursor-pointer group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-red-400 shrink-0" />
                      <span className="text-sm text-slate-300 font-mono">{txn.sender_account_number || "External"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="h-4 w-4 text-green-400 shrink-0" />
                      <span className="text-sm text-slate-300 font-mono">{txn.receiver_account_number || "External"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-white">${txn.amount.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                  <td className="px-5 py-4 text-xs text-red-400 font-mono">{txn.reference || "—"}</td>
                  <td className="px-5 py-4 text-sm text-slate-400 max-w-[180px] truncate">{txn.description || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${txn.status==="completed"?"bg-green-900 text-green-300":txn.status==="pending"?"bg-yellow-900 text-yellow-300":"bg-red-900 text-red-300"}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400 whitespace-nowrap">{formatDateTime(txn.timestamp)}</td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleDeleteTransaction(txn.id)} className="text-slate-500 hover:text-red-400 transition" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {allTransactions.length === 0 && (
            <div className="text-center py-12"><History className="h-12 w-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No transactions found</p></div>
          )}
        </div>
      )}

      {/* ── Edit Transaction Modal ────────────────────────────────────── */}
      {editTxn && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditTxn(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Edit Transaction</h2>
                <p className="text-slate-400 text-xs mt-0.5 font-mono">{editTxn.reference || editTxn.id.slice(0,16)}</p>
              </div>
              <button onClick={() => setEditTxn(null)} className="text-slate-500 hover:text-white transition"><X className="h-5 w-5" /></button>
            </div>

            {/* Summary */}
            <div className="px-6 py-3 bg-slate-800/60 border-b border-slate-700 flex items-center gap-6 text-sm">
              <div><span className="text-slate-500">Amount:</span> <span className="text-white font-bold">${editTxn.amount.toLocaleString("en-US",{minimumFractionDigits:2})}</span></div>
              <div><span className="text-slate-500">From:</span> <span className="text-slate-300 font-mono">{editTxn.sender_account_number || "External"}</span></div>
              <div><span className="text-slate-500">To:</span> <span className="text-slate-300 font-mono">{editTxn.receiver_account_number || "External"}</span></div>
            </div>

            <form onSubmit={handleSaveEditTxn} className="p-6 space-y-4">
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Time <span className="text-red-400">*</span></label>
                  <input
                    type="time"
                    step="1"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reference</label>
                <input
                  type="text"
                  value={editRef}
                  onChange={(e) => setEditRef(e.target.value)}
                  placeholder="e.g. RCB/XXXXXXXX-0626"
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none font-mono placeholder-slate-600"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Transaction description"
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none placeholder-slate-600"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                <div className="flex gap-3">
                  {(["completed","pending","failed"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditStatus(s)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition ${
                        editStatus === s
                          ? s === "completed" ? "bg-green-900/50 border-green-500 text-green-300"
                            : s === "pending" ? "bg-yellow-900/50 border-yellow-500 text-yellow-300"
                            : "bg-red-900/50 border-red-500 text-red-300"
                          : "border-slate-700 text-slate-500 hover:border-slate-500"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isEditTxnSaving}
                  className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {isEditTxnSaving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditTxn(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderFundAccountSection = () => {
    const filteredFundUsers = users.filter((u) => {
      const text = [u.full_name, u.email, u.accounts[0]?.account_number].filter(Boolean).join(" ").toLowerCase();
      return text.includes(fundSearch.toLowerCase());
    });

    const resetFundForm = () => {
      setFundSelectedUser(null);
      setFundAmount("");
      setFundTab("credit");
      setFundDescription("");
      setFundFrequency("1");
      setFundFreqUnit("Frequency");
      setFundSendEmail("no");
      setFundTransferScope("local");
    };

    // Stage 2: detailed credit/debit form
    if (fundSelectedUser) {
      const isCredit = fundTab === "credit";
      return (
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={resetFundForm} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">← Back</button>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">Fund a User Account</h2>
              <p className="text-slate-400 text-sm mt-0.5">Credit or debit the selected account with precision</p>
            </div>
          </div>

          {/* Credit / Debit tabs */}
          <div className="flex border-b border-slate-700 mb-8">
            <button
              type="button"
              onClick={() => setFundTab("credit")}
              className={`px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition ${isCredit ? "border-red-500 text-red-400" : "border-transparent text-slate-400 hover:text-white"}`}
            >Credit Account</button>
            <button
              type="button"
              onClick={() => setFundTab("debit")}
              className={`px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition ${!isCredit ? "border-red-500 text-red-400" : "border-transparent text-slate-400 hover:text-white"}`}
            >Debit Account</button>
          </div>

          <h3 className="text-lg sm:text-2xl font-bold text-white text-center mb-6 sm:mb-8">
            {isCredit ? "Send money to" : "Debit from"} {fundSelectedUser.full_name || fundSelectedUser.email}!
          </h3>

          <form onSubmit={handleFundSubmit} className="space-y-4">
            {/* Account card */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Account:</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold">{fundSelectedUser.full_name || fundSelectedUser.email}</p>
                  <p className="text-slate-400 text-xs">Current Balance: {fundSelectedUser.total_balance.toLocaleString("en-US", { minimumFractionDigits: 1 })}</p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Amount to {isCredit ? "Credit" : "Debit"}</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center overflow-hidden focus-within:border-red-500">
                <input
                  type="number" min="0.01" step="0.01"
                  value={fundAmount} onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent text-white px-4 py-4 text-sm outline-none"
                  required
                />
                <span className="text-slate-400 text-sm pr-4 shrink-0">USD</span>
              </div>
            </div>

            {/* Transfer Scope */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Transfer Scope</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center overflow-hidden focus-within:border-red-500">
                <select
                  value={fundTransferScope} onChange={(e) => setFundTransferScope(e.target.value)}
                  className="flex-1 bg-transparent text-white px-4 py-4 text-sm outline-none"
                >
                  <option value="local">Local Transfer</option>
                  <option value="international">International Transfer</option>
                  <option value="interbank">Interbank Transfer</option>
                  <option value="swift">SWIFT Transfer</option>
                </select>
                <span className="text-slate-400 text-sm pr-4 shrink-0">Scope</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center overflow-hidden focus-within:border-red-500">
                <input
                  type="text"
                  value={fundDescription} onChange={(e) => setFundDescription(e.target.value)}
                  placeholder="the purpose of your transfer"
                  className="flex-1 bg-transparent text-white px-4 py-4 text-sm outline-none placeholder-slate-500"
                />
                <span className="text-slate-400 text-sm pr-4 shrink-0">Memo</span>
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">frequency</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center overflow-hidden focus-within:border-red-500">
                <input
                  type="number" min="1"
                  value={fundFrequency} onChange={(e) => setFundFrequency(e.target.value)}
                  className="flex-1 bg-transparent text-white px-4 py-4 text-sm outline-none"
                />
                <div className="border-l border-slate-700 shrink-0">
                  <select value={fundFreqUnit} onChange={(e) => setFundFreqUnit(e.target.value)} className="bg-transparent text-slate-400 text-sm outline-none px-3 py-4">
                    <option value="Frequency">Frequency</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Send Email Notification */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Send Email Notification</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center overflow-hidden focus-within:border-red-500">
                <select
                  value={fundSendEmail} onChange={(e) => setFundSendEmail(e.target.value)}
                  className="flex-1 bg-transparent text-white px-4 py-4 text-sm outline-none"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
                <span className="text-slate-400 text-sm pr-4 shrink-0">Email</span>
              </div>
            </div>

            <button
              type="submit" disabled={isFunding}
              className={`w-full ${isCredit ? "bg-[#0E3DAA] hover:bg-red-800" : "bg-red-600 hover:bg-red-700"} text-white font-semibold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              <DollarSign className="h-5 w-5" />
              {isFunding ? "Processing…" : isCredit ? "Credit Account" : "Debit Account"}
            </button>
          </form>
        </div>
      );
    }

    // Stage 1: user list table
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-white">Fund a User Account</h2>
            <p className="text-slate-400 mt-1">Select any member from this list to begin funding their account.</p>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Type in to Search"
            value={fundSearch}
            onChange={(e) => setFundSearch(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-500"
          />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900">
                {["Account Name", "Account Number", "Account balance", "Action"].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFundUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                  <td className="px-6 py-4 text-sm font-semibold text-white">{u.full_name || u.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-mono">{u.accounts[0]?.account_number || "N/A"}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white">USD {u.total_balance.toLocaleString("en-US", { minimumFractionDigits: 1 })}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => { setFundSelectedUser(u); setFundTab("credit"); setFundAmount(""); setFundDescription(""); setFundFrequency("1"); setFundFreqUnit("Frequency"); setFundSendEmail("no"); setFundTransferScope("local"); }}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                    >Fund User</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredFundUsers.length === 0 && (
            <div className="text-center py-12"><p className="text-slate-400">No users found</p></div>
          )}
        </div>
      </div>
    );
  };

  const renderSendEmailSection = () => (
    <div className="max-w-2xl">
      <div className="mb-5 sm:mb-8"><h2 className="text-xl sm:text-3xl font-bold text-white">Send Email</h2><p className="text-slate-400 mt-1">Compose and send a personalized email to any registered member</p></div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
        <form onSubmit={handleSendEmail} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Recipient <span className="text-red-400">*</span></label>
            <select value={emailUserId} onChange={(e)=>setEmailUserId(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm focus:border-red-500 outline-none" required>
              <option value="">— Select a user —</option>
              {users.map((u)=><option key={u.id} value={u.id}>{u.full_name?`${u.full_name} (${u.email})`:u.email}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">Subject <span className="text-red-400">*</span></label><input type="text" value={emailSubject} onChange={(e)=>setEmailSubject(e.target.value)} placeholder="e.g. Important account notice" className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm placeholder-slate-500 focus:border-red-500 outline-none" required /></div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">Message <span className="text-red-400">*</span></label><textarea rows={6} value={emailMessage} onChange={(e)=>setEmailMessage(e.target.value)} placeholder="Type your message here..." className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm placeholder-slate-500 focus:border-red-500 outline-none resize-none" required /></div>
          <button type="submit" disabled={isSendingEmail} className="w-full bg-[#0E3DAA] hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"><Send className="h-5 w-5" />{isSendingEmail ? "Sending..." : "Send Email"}</button>
        </form>
      </div>
    </div>
  );

  const renderKycAdminSection = () => (
    <div>
      <div className="mb-5 sm:mb-8"><h2 className="text-xl sm:text-3xl font-bold text-white">KYC Applications</h2><p className="text-slate-400 mt-1">Carefully review, then approve or reject identity verification submissions</p></div>
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-slate-700 bg-slate-900">{["User","Email","Account","Submitted","KYC Status","Actions"].map((h)=><th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {users.map((u) => {
              const kycStatus = kycStatuses[u.id];
              return (
                <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-linear-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center text-white font-bold text-xs">{(u.full_name?.[0]||u.email[0]).toUpperCase()}</div><p className="text-sm font-semibold text-white">{u.full_name||"User"}</p></div></td>
                  <td className="px-6 py-4 text-sm text-slate-300">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{u.accounts[0]?.account_number||"N/A"}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{formatDate(u.created_at)}</td>
                  <td className="px-6 py-4">
                    {kycStatus === "approved" && <span className="px-2 py-1 bg-green-900 text-green-300 text-xs font-bold rounded-full">Approved</span>}
                    {kycStatus === "rejected" && <span className="px-2 py-1 bg-red-900 text-red-300 text-xs font-bold rounded-full">Rejected</span>}
                    {!kycStatus && <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs font-bold rounded-full">Pending</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={()=>handleKycAction(u.id,"approved")} disabled={kycStatus==="approved"} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"><CheckCircle className="h-3 w-3" />Approve</button>
                      <button onClick={()=>handleKycAction(u.id,"rejected")} disabled={kycStatus==="rejected"} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"><XCircle className="h-3 w-3" />Reject</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <div className="text-center py-12"><p className="text-slate-400">No users found</p></div>}
      </div>
    </div>
  );

  const renderSupportTicketSection = () => (
    <div>
      <div className="mb-5 sm:mb-8"><h2 className="text-xl sm:text-3xl font-bold text-white">Support Tickets</h2><p className="text-slate-400 mt-1">View and respond promptly to member support requests</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {tickets.map((t) => (
            <div key={t.id} onClick={()=>setActiveTicket(t)} className={`bg-slate-800 border rounded-xl p-5 cursor-pointer hover:border-red-500/50 transition ${activeTicket?.id===t.id?"border-red-500":"border-slate-700"}`}>
              <div className="flex items-start justify-between mb-2">
                <div><p className="text-white font-semibold">{t.subject}</p><p className="text-slate-400 text-sm">{t.user} · {t.email}</p></div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.status==="open"?"bg-green-900 text-green-300":"bg-slate-700 text-slate-400"}`}>{t.status}</span>
              </div>
              <p className="text-slate-400 text-sm line-clamp-2">{t.message}</p>
              <p className="text-slate-600 text-xs mt-2">{t.date}</p>
            </div>
          ))}
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          {activeTicket ? (
            <div>
              <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-white text-sm">Reply</h3><button onClick={()=>setActiveTicket(null)} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button></div>
              <div className="bg-slate-900 rounded-lg p-3 mb-4"><p className="text-slate-300 text-sm font-semibold">{activeTicket.subject}</p><p className="text-slate-400 text-xs mt-1">{activeTicket.message}</p></div>
              <textarea rows={5} value={ticketReply} onChange={(e)=>setTicketReply(e.target.value)} placeholder="Type your reply..." className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm placeholder-slate-500 focus:border-red-500 outline-none resize-none mb-3" />
              <div className="flex gap-2">
                <button onClick={()=>handleTicketReply(activeTicket)} className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white text-sm font-semibold py-2 rounded-lg transition">Send Reply</button>
                {activeTicket.status==="open" && <button onClick={()=>handleCloseTicket(activeTicket.id)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold py-2 rounded-lg transition">Close</button>}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center"><Ticket className="h-10 w-10 text-slate-600 mb-3" /><p className="text-slate-500 text-sm">Select a ticket to view and reply</p></div>
          )}
        </div>
      </div>
    </div>
  );

  const renderGeneralSettings = () => (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-xl sm:text-3xl font-bold text-white">General Settings</h2><p className="text-slate-400 mt-1">Easily modify the core content and branding of your website using the form below.</p></div>
        <button onClick={()=>setActiveSection("users")} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">← Back</button>
      </div>

      <div className="space-y-8 max-w-4xl">
        {/* Website Setting */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-900"><h3 className="text-white font-bold">Website Setting</h3></div>
          <div className="divide-y divide-slate-700">
            {[
              { label: "Base URL", desc: 'Specify the exact url where your website is installed. (e.g "https://example.com")', value: siteUrl, setter: setSiteUrl, placeholder: "https://bluerocknational.com/" },
              { label: "Site Name", desc: "Specify the name of your website. (e.g Facebook LLC)", value: siteName, setter: setSiteName, placeholder: "BLUEROCK NATIONAL CREDIT UNION" },
              { label: "Short name", desc: "Specify the Short name of your website. (eg. facebook).", value: siteShortName, setter: setSiteShortName, placeholder: "NCU" },
              { label: "Email address", desc: "Specify the email of your website.", value: siteEmail, setter: setSiteEmail, placeholder: "info@bluerocknational.com" },
              { label: "Phone Number", desc: "Specify the Phone number of your website.", value: sitePhone, setter: setSitePhone, placeholder: "+1 669 333 8500" },
            ].map(({ label, desc, value, setter, placeholder }) => (
              <div key={label} className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 px-6 py-4">
                <div><p className="text-white font-semibold text-sm">{label}</p><p className="text-slate-400 text-xs mt-0.5">{desc}</p></div>
                <input type="text" value={value} onChange={(e)=>setter(e.target.value)} placeholder={placeholder} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none" />
              </div>
            ))}
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 px-6 py-4">
              <div><p className="text-white font-semibold text-sm">Default Currency</p><p className="text-slate-400 text-xs mt-0.5">Specify the Default Currency Of Your Website.</p></div>
              <select value={siteCurrency} onChange={(e)=>setSiteCurrency(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none">
                {["USD","EUR","GBP","CAD","AUD","JPY","CHF","NGN","GHS"].map((c)=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 px-6 py-4">
              <div><p className="text-white font-semibold text-sm">Base Country</p><p className="text-slate-400 text-xs mt-0.5">Specify the base country of your Website.</p></div>
              <select value={siteCountry} onChange={(e)=>setSiteCountry(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none">
                {["United States","United Kingdom","Canada","Australia","Germany","Nigeria","Ghana","South Africa","France","Other"].map((c)=><option key={c}>{c}</option>)}
              </select>
            </div>
            {[
              { label: "Enable/Disable Bots Blocker", desc: "This feature will restrict Over 1000 bots from accessing your website via HTTP USER AGENT.", value: botsBlocker, setter: setBotsBlocker },
            ].map(({ label, desc, value, setter }) => (
              <div key={label} className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 px-6 py-4">
                <div><p className="text-white font-semibold text-sm">{label}</p><p className="text-slate-400 text-xs mt-0.5">{desc}</p></div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={value} onChange={()=>setter(true)} className="accent-[#0E3DAA]" /><span className="text-slate-300 text-sm">Enable</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={!value} onChange={()=>setter(false)} className="accent-[#0E3DAA]" /><span className="text-slate-300 text-sm">Disable</span></label>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 px-6 py-4">
              <div><p className="text-white font-semibold text-sm">Dashboard Theme mode</p><p className="text-slate-400 text-xs mt-0.5">Select default theme mode for Admin Dashboard.</p></div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={themeMode==="light"} onChange={()=>setThemeMode("light")} className="accent-[#0E3DAA]" /><span className="text-slate-300 text-sm">Light Mode</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={themeMode==="dark"} onChange={()=>setThemeMode("dark")} className="accent-[#0E3DAA]" /><span className="text-slate-300 text-sm">Dark Mode</span></label>
              </div>
            </div>
          </div>
        </div>

        {/* Feature toggles */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-900"><h3 className="text-white font-bold">Feature Settings</h3></div>
          <div className="divide-y divide-slate-700">
            {[
              { label: "Enable or Disable Crypto Currency", desc: "Enable or disable Crypto currency feature of this application.", value: enableCrypto, setter: setEnableCrypto },
              { label: "Enable/Disable KYC", desc: "Enable or disable KYC module.", value: enableKyc, setter: setEnableKyc },
              { label: "Enable/Disable Visual Card", desc: "Enable or disable Visual Card module.", value: enableVirtualCards, setter: setEnableVirtualCards },
            ].map(({ label, desc, value, setter }) => (
              <div key={label} className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 px-6 py-4">
                <div><p className="text-white font-semibold text-sm">{label}</p><p className="text-slate-400 text-xs mt-0.5">{desc}</p></div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={value} onChange={()=>setter(true)} className="accent-[#0E3DAA]" /><span className="text-slate-300 text-sm">Enable</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={!value} onChange={()=>setter(false)} className="accent-[#0E3DAA]" /><span className="text-slate-300 text-sm">Disable</span></label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System messages */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-900"><h3 className="text-white font-bold">System Error Messages</h3></div>
          <div className="divide-y divide-slate-700">
            {[
              { label: "Suspended User Error Message", desc: "Specify the error message suspended user will get once they attempted to login into their account.", value: suspendedMsg, setter: setSuspendedMsg },
              { label: "User with suspended fund transfer Error Message", desc: "Specify the error message user will get once they attempted to carry out further transaction on their account.", value: transferBlockMsg, setter: setTransferBlockMsg },
            ].map(({ label, desc, value, setter }) => (
              <div key={label} className="grid grid-cols-1 md:grid-cols-2 items-start gap-4 px-6 py-4">
                <div><p className="text-white font-semibold text-sm">{label}</p><p className="text-slate-400 text-xs mt-0.5">{desc}</p></div>
                <textarea rows={4} value={value} onChange={(e)=>setter(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none resize-y" />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSaveGeneralSettings} className="flex items-center gap-2 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold px-8 py-3 rounded-xl transition">
          <Save className="h-5 w-5" /> Update Settings
        </button>
      </div>
    </div>
  );

  const renderLogoFavicon = () => (
    <div className="max-w-2xl">
      <div className="mb-5 sm:mb-8"><h2 className="text-xl sm:text-3xl font-bold text-white">Logo & Favicon</h2><p className="text-slate-400 mt-1">Update the logo and browser icon that represent your banking platform.</p></div>
      <div className="space-y-6">
        {[
          { label: "Site Logo", desc: "Recommended size: 200×60px. PNG or SVG with transparent background.", file: logoFile, setter: setLogoFile, accept: "image/*" },
          { label: "Site Favicon", desc: "Recommended size: 32×32px or 64×64px. ICO, PNG format.", file: faviconFile, setter: setFaviconFile, accept: "image/*,.ico" },
        ].map(({ label, desc, file, setter, accept }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-1">{label}</h3>
            <p className="text-slate-400 text-xs mb-4">{desc}</p>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 bg-slate-900 border border-slate-600 rounded-lg flex items-center justify-center">
                {file ? <img src={URL.createObjectURL(file)} alt="" className="max-w-full max-h-full object-contain rounded" /> : <ImageIcon className="h-6 w-6 text-slate-600" />}
              </div>
              <label className="flex items-center gap-2 bg-[#0E3DAA] hover:bg-red-800 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer transition">
                <Upload className="h-4 w-4" /> Upload {label}
                <input type="file" accept={accept} className="hidden" onChange={(e)=>setter(e.target.files?.[0]??null)} />
              </label>
              {file && <button onClick={()=>setter(null)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>}
            </div>
          </div>
        ))}
        <button onClick={()=>setToast("Logo and favicon settings saved.")} className="flex items-center gap-2 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold px-8 py-3 rounded-xl transition"><Save className="h-5 w-5" />Save Changes</button>
      </div>
    </div>
  );

  const renderPlugins = () => (
    <div>
      <div className="mb-5 sm:mb-8"><h2 className="text-xl sm:text-3xl font-bold text-white">Plugins</h2><p className="text-slate-400 mt-1">Effortlessly enable or disable platform features and third-party integrations.</p></div>
      <div className="space-y-3 max-w-3xl">
        {plugins.map((p) => (
          <div key={p.id} className="bg-slate-800 border border-slate-700 rounded-xl px-6 py-4 flex items-center justify-between">
            <div><p className="text-white font-semibold">{p.label}</p><p className="text-slate-400 text-sm mt-0.5">{p.desc}</p></div>
            <button onClick={()=>setPlugins((prev)=>prev.map((x)=>x.id===p.id?{...x,enabled:!x.enabled}:x))} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${p.enabled?"bg-[#0E3DAA] hover:bg-red-800 text-white":"bg-slate-700 hover:bg-slate-600 text-slate-300"}`}>
              {p.enabled?<ToggleRight className="h-4 w-4"/>:<ToggleLeft className="h-4 w-4"/>}{p.enabled?"Enabled":"Disabled"}
            </button>
          </div>
        ))}
        <button onClick={()=>setToast("Plugin settings saved.")} className="flex items-center gap-2 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold px-8 py-3 rounded-xl transition mt-4"><Save className="h-5 w-5" />Save Changes</button>
      </div>
    </div>
  );

  const SMS_PROVIDERS = [
    { value: "twilio",         label: "Twilio",              sidLabel: "Account SID",     keyLabel: "Auth Token",       secretLabel: "",              userLabel: "",          needsSid: true,  needsSecret: false, needsUser: false },
    { value: "vonage",         label: "Vonage (Nexmo)",      sidLabel: "",                keyLabel: "API Key",          secretLabel: "API Secret",    userLabel: "",          needsSid: false, needsSecret: true,  needsUser: false },
    { value: "africastalking", label: "Africa's Talking",    sidLabel: "",                keyLabel: "API Key",          secretLabel: "",              userLabel: "Username",  needsSid: false, needsSecret: false, needsUser: true  },
    { value: "telnyx",         label: "Telnyx",              sidLabel: "",                keyLabel: "API Key",          secretLabel: "",              userLabel: "",          needsSid: false, needsSecret: false, needsUser: false },
    { value: "messagebird",    label: "MessageBird",         sidLabel: "",                keyLabel: "API Key",          secretLabel: "",              userLabel: "",          needsSid: false, needsSecret: false, needsUser: false },
    { value: "plivo",          label: "Plivo",               sidLabel: "Auth ID",         keyLabel: "Auth Token",       secretLabel: "",              userLabel: "",          needsSid: true,  needsSecret: false, needsUser: false },
    { value: "clicksend",      label: "ClickSend",           sidLabel: "",                keyLabel: "API Key",          secretLabel: "",              userLabel: "Username",  needsSid: false, needsSecret: false, needsUser: true  },
    { value: "infobip",        label: "Infobip",             sidLabel: "",                keyLabel: "API Key",          secretLabel: "",              userLabel: "",          needsSid: false, needsSecret: false, needsUser: false },
    { value: "sinch",          label: "Sinch",               sidLabel: "Service Plan ID", keyLabel: "API Token",        secretLabel: "",              userLabel: "",          needsSid: true,  needsSecret: false, needsUser: false },
    { value: "bandwidth",      label: "Bandwidth",           sidLabel: "Account ID",      keyLabel: "API Token",        secretLabel: "API Secret",    userLabel: "",          needsSid: true,  needsSecret: true,  needsUser: false },
    { value: "aws-sns",        label: "AWS SNS",             sidLabel: "Access Key ID",   keyLabel: "Secret Access Key",secretLabel: "",              userLabel: "",          needsSid: true,  needsSecret: false, needsUser: false },
    { value: "textlocal",      label: "Textlocal",           sidLabel: "",                keyLabel: "API Key",          secretLabel: "",              userLabel: "",          needsSid: false, needsSecret: false, needsUser: false },
    { value: "textmagic",      label: "TextMagic",           sidLabel: "",                keyLabel: "API Key",          secretLabel: "",              userLabel: "Username",  needsSid: false, needsSecret: false, needsUser: true  },
    { value: "kaleyra",        label: "Kaleyra",             sidLabel: "SID",             keyLabel: "API Key",          secretLabel: "",              userLabel: "",          needsSid: true,  needsSecret: false, needsUser: false },
    { value: "d7networks",     label: "D7 Networks",         sidLabel: "",                keyLabel: "API Token",        secretLabel: "",              userLabel: "",          needsSid: false, needsSecret: false, needsUser: false },
    { value: "termii",         label: "Termii",              sidLabel: "",                keyLabel: "API Key",          secretLabel: "",              userLabel: "",          needsSid: false, needsSecret: false, needsUser: false },
  ];

  const activeSmsProvider = SMS_PROVIDERS.find(p => p.value === smsProvider) ?? SMS_PROVIDERS[0];

  const handleSmsTest = async () => {
    if (!smsTestPhone) { setToast("Enter a phone number to test."); return; }
    setIsSmsTestSending(true);
    setSmsTestResult(null);
    try {
      const r = await api.post("/admin/sms/test", {
        provider: smsProvider,
        api_key: smsApiKey,
        api_secret: smsApiSecret || undefined,
        account_sid: smsAccountSid || undefined,
        from_number: smsFromNumber || undefined,
        username: smsUsername || undefined,
        phone: smsTestPhone,
      });
      setSmsTestResult({ success: true, message: r.data.message });
    } catch (err: any) {
      setSmsTestResult({ success: false, message: err.response?.data?.detail || "Failed to send test SMS." });
    } finally {
      setIsSmsTestSending(false);
    }
  };

  const inp6 = "w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm placeholder-slate-600 focus:border-red-500 outline-none";
  const lbl6 = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2";

  const renderEmailSms = () => (
    <div className="max-w-3xl">
      <div className="mb-5 sm:mb-8"><h2 className="text-xl sm:text-3xl font-bold text-white">Email & SMS Configuration</h2><p className="text-slate-400 mt-1">Configure your SMTP email and SMS gateway settings with confidence.</p></div>
      <div className="space-y-6">

        {/* Resend */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-900">
            <h3 className="text-white font-bold">Resend (recommended)</h3>
            <p className="text-slate-400 text-xs mt-0.5">A Resend API key takes priority over SMTP below for every outgoing email — credit/debit alerts, login codes, everything.</p>
          </div>
          <div className="p-6">
            <label className={lbl6}>Resend API Key</label>
            <PasswordInput dark value={resendApiKey} onChange={(e)=>setResendApiKey(e.target.value)} placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" className={inp6} />
          </div>
        </div>

        {/* SMTP */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-900"><h3 className="text-white font-bold">SMTP Email Settings</h3></div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "SMTP Host",     value: smtpHost,  setter: setSmtpHost,  placeholder: "smtp.gmail.com" },
              { label: "SMTP Port",     value: smtpPort,  setter: setSmtpPort,  placeholder: "587" },
              { label: "SMTP Username", value: smtpUser,  setter: setSmtpUser,  placeholder: "your@email.com" },
              { label: "SMTP Password", value: smtpPass,  setter: setSmtpPass,  placeholder: "••••••••", type: "password" },
              { label: "From Name",     value: fromName,  setter: setFromName,  placeholder: "BLUEROCK NATIONAL CREDIT UNION" },
              { label: "From Email",    value: fromEmail, setter: setFromEmail, placeholder: "noreply@bluerocknational.com" },
            ].map(({ label, value, setter, placeholder, type }) => (
              <div key={label}>
                <label className={lbl6}>{label}</label>
                {type === "password" ? (
                  <PasswordInput dark value={value} onChange={(e)=>setter(e.target.value)} placeholder={placeholder} className={inp6} />
                ) : (
                  <input type="text" value={value} onChange={(e)=>setter(e.target.value)} placeholder={placeholder} className={inp6} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SMS Gateway */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-900">
            <h3 className="text-white font-bold">SMS Gateway Settings</h3>
            <p className="text-slate-400 text-xs mt-0.5">Select a provider, enter your credentials carefully, then send a test SMS to confirm everything works.</p>
          </div>
          <div className="p-6 space-y-4">

            {/* Provider picker */}
            <div>
              <label className={lbl6}>SMS Provider</label>
              <select value={smsProvider} onChange={(e) => { setSmsProvider(e.target.value); setSmsTestResult(null); }} className={inp6}>
                {SMS_PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account SID / Auth ID */}
              {activeSmsProvider.needsSid && (
                <div>
                  <label className={lbl6}>{activeSmsProvider.sidLabel}</label>
                  <input type="text" value={smsAccountSid} onChange={(e)=>setSmsAccountSid(e.target.value)} placeholder={activeSmsProvider.sidLabel} className={inp6} />
                </div>
              )}

              {/* Username */}
              {activeSmsProvider.needsUser && (
                <div>
                  <label className={lbl6}>{activeSmsProvider.userLabel}</label>
                  <input type="text" value={smsUsername} onChange={(e)=>setSmsUsername(e.target.value)} placeholder={activeSmsProvider.userLabel} className={inp6} />
                </div>
              )}

              {/* API Key */}
              <div>
                <label className={lbl6}>{activeSmsProvider.keyLabel}</label>
                <PasswordInput dark value={smsApiKey} onChange={(e)=>setSmsApiKey(e.target.value)} placeholder={activeSmsProvider.keyLabel} className={inp6} />
              </div>

              {/* API Secret */}
              {activeSmsProvider.needsSecret && (
                <div>
                  <label className={lbl6}>{activeSmsProvider.secretLabel}</label>
                  <PasswordInput dark value={smsApiSecret} onChange={(e)=>setSmsApiSecret(e.target.value)} placeholder={activeSmsProvider.secretLabel} className={inp6} />
                </div>
              )}

              {/* From Number */}
              <div>
                <label className={lbl6}>From Number / Sender ID</label>
                <input type="text" value={smsFromNumber} onChange={(e)=>setSmsFromNumber(e.target.value)} placeholder="+1234567890 or BluerockCU" className={inp6} />
              </div>
            </div>

            {/* Test SMS */}
            <div className="border-t border-slate-700 pt-4 mt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Send Test SMS</p>
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className={lbl6}>Test Phone Number</label>
                  <input type="tel" value={smsTestPhone} onChange={(e)=>setSmsTestPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={inp6} />
                </div>
                <button
                  onClick={handleSmsTest}
                  disabled={isSmsTestSending}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shrink-0"
                >
                  {isSmsTestSending ? "Sending…" : "Send Test SMS"}
                </button>
              </div>
              {smsTestResult && (
                <div className={`mt-3 px-4 py-3 rounded-lg text-sm font-medium ${smsTestResult.success ? "bg-green-900/40 text-green-300 border border-green-700" : "bg-red-900/40 text-red-300 border border-red-700"}`}>
                  {smsTestResult.success ? "✓" : "✗"} {smsTestResult.message}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            try {
              await api.post("/admin/config/save", {
                sms_provider: smsProvider, sms_api_key: smsApiKey,
                sms_api_secret: smsApiSecret, sms_account_sid: smsAccountSid,
                sms_from_number: smsFromNumber, sms_username: smsUsername,
                smtp_host: smtpHost, smtp_port: smtpPort,
                smtp_user: smtpUser, smtp_pass: smtpPass,
                from_name: fromName, from_email: fromEmail,
                resend_api_key: resendApiKey,
              });
              setToast("Configuration saved. Notifications are now active.");
            } catch { setToast("Failed to save configuration."); }
          }}
          className="flex items-center gap-2 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold px-8 py-3 rounded-xl transition"
        >
          <Save className="h-5 w-5" />Save Configuration
        </button>
      </div>
    </div>
  );

  const renderAuthCode = () => (
    <div className="max-w-2xl">
      <div className="mb-5 sm:mb-8"><h2 className="text-xl sm:text-3xl font-bold text-white">Manage Auth Code Name</h2><p className="text-slate-400 mt-1">Customize exactly how the transaction verification code is labeled throughout the system.</p></div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 space-y-6">
        <div><label className="block text-sm font-semibold text-slate-300 mb-2">Auth Code Label (shown to users)</label><input type="text" value={authCodeLabel} onChange={(e)=>setAuthCodeLabel(e.target.value)} placeholder="e.g. Transaction PIN, OTP, Security Code" className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm focus:border-red-500 outline-none" /></div>
        <div><label className="block text-sm font-semibold text-slate-300 mb-2">Code Length (digits)</label>
          <select value={authCodeLength} onChange={(e)=>setAuthCodeLength(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm focus:border-red-500 outline-none">
            {["4","6","8"].map((n)=><option key={n} value={n}>{n} digits</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-semibold text-slate-300 mb-2">Code Expiry (minutes)</label><input type="number" min="1" max="60" value={authCodeExpiry} onChange={(e)=>setAuthCodeExpiry(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm focus:border-red-500 outline-none" /></div>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4"><p className="text-slate-400 text-xs">Preview: Users will see "<span className="text-white font-semibold">{authCodeLabel}</span>" when prompted for verification. Codes will be <span className="text-white font-semibold">{authCodeLength} digits</span> and expire after <span className="text-white font-semibold">{authCodeExpiry} minutes</span>.</p></div>
        <button onClick={()=>setToast("Auth code settings saved.")} className="flex items-center gap-2 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold px-8 py-3 rounded-xl transition"><Save className="h-5 w-5" />Save Settings</button>
      </div>
    </div>
  );

  const renderSlider = () => (
    <div>
      <div className="mb-5 sm:mb-8"><h2 className="text-xl sm:text-3xl font-bold text-white">Slider Setting</h2><p className="text-slate-400 mt-1">Manage the homepage banner slides proudly shown to every visitor.</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {sliders.map((s, i) => (
            <div key={s.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
              <span className="text-slate-500 text-sm font-bold w-5">{i+1}</span>
              <div className="flex-1 min-w-0"><p className="text-white font-semibold truncate">{s.title}</p><p className="text-slate-400 text-sm truncate">{s.subtitle}</p></div>
              <button onClick={()=>setSliders((prev)=>prev.map((x)=>x.id===s.id?{...x,active:!x.active}:x))} className={`px-3 py-1 rounded-full text-xs font-bold ${s.active?"bg-green-900 text-green-300":"bg-slate-700 text-slate-400"}`}>{s.active?"Active":"Inactive"}</button>
              <button onClick={()=>setSliders((prev)=>prev.filter((x)=>x.id!==s.id))} className="text-slate-500 hover:text-red-400 transition"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-white font-bold mb-4">Add New Slide</h3>
          <div className="space-y-4">
            <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title *</label><input type="text" value={newSliderTitle} onChange={(e)=>setNewSliderTitle(e.target.value)} placeholder="Slide headline" className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm placeholder-slate-600 focus:border-red-500 outline-none" /></div>
            <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subtitle</label><input type="text" value={newSliderSubtitle} onChange={(e)=>setNewSliderSubtitle(e.target.value)} placeholder="Supporting text" className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm placeholder-slate-600 focus:border-red-500 outline-none" /></div>
            <button onClick={handleAddSlider} disabled={!newSliderTitle} className="w-full flex items-center justify-center gap-2 bg-[#0E3DAA] hover:bg-red-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-40"><Plus className="h-4 w-4" />Add Slide</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoan = () => (
    <div>
      <div className="mb-5 sm:mb-8"><h2 className="text-xl sm:text-3xl font-bold text-white">Loan / Credit Financing</h2><p className="text-slate-400 mt-1">Manage loan applications and credit lines for members with ease.</p></div>
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-slate-700 bg-slate-900">{["User","Loan Type","Amount","Rate","Term","Status","Action"].map((h)=><th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {users.slice(0,5).map((u,i)=>{
              const types=["Business Support","Personal Loan","Mortgage","Auto Loan","Student Loan"];
              const amounts=[4000,15000,120000,25000,8000];
              const rates=["3.5%","7.2%","4.1%","5.8%","4.5%"];
              const terms=["12 mo","36 mo","240 mo","60 mo","120 mo"];
              const statuses=["active","pending","active","rejected","active"];
              return (
                <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                  <td className="px-6 py-4 text-sm font-semibold text-white">{u.full_name||"User"}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{types[i]}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white">${amounts[i].toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{rates[i]}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{terms[i]}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${statuses[i]==="active"?"bg-green-900 text-green-300":statuses[i]==="pending"?"bg-yellow-900 text-yellow-300":"bg-red-900 text-red-300"}`}>{statuses[i]}</span></td>
                  <td className="px-6 py-4"><div className="flex gap-2"><button className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded" onClick={()=>setToast("Loan approved.")}>Approve</button><button className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded" onClick={()=>setToast("Loan rejected.")}>Reject</button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length===0&&<div className="text-center py-12 text-slate-400">No loan applications yet</div>}
      </div>
    </div>
  );

  const renderDebitAccountSection = () => {
    const filteredDebitUsers = users.filter((u) => {
      const text = [u.full_name, u.email, u.accounts[0]?.account_number].filter(Boolean).join(" ").toLowerCase();
      return text.includes(fundSearch.toLowerCase());
    });

    const resetDebitForm = () => {
      setFundSelectedUser(null);
      setFundAmount("");
      setFundTab("debit");
      setFundDescription("");
      setFundFrequency("1");
      setFundFreqUnit("Frequency");
      setFundSendEmail("no");
      setFundTransferScope("local");
    };

    // Stage 2: detailed debit/credit form (same as fund, debit tab first)
    if (fundSelectedUser) {
      const isCredit = fundTab === "credit";
      return (
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={resetDebitForm} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">← Back</button>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">Debit a User Account</h2>
              <p className="text-slate-400 text-sm mt-0.5">Deduct or credit the selected account with full accuracy</p>
            </div>
          </div>

          {/* Debit / Credit tabs (debit first) */}
          <div className="flex border-b border-slate-700 mb-8">
            <button
              type="button"
              onClick={() => setFundTab("debit")}
              className={`px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition ${!isCredit ? "border-red-500 text-red-400" : "border-transparent text-slate-400 hover:text-white"}`}
            >Debit Account</button>
            <button
              type="button"
              onClick={() => setFundTab("credit")}
              className={`px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition ${isCredit ? "border-red-500 text-red-400" : "border-transparent text-slate-400 hover:text-white"}`}
            >Credit Account</button>
          </div>

          <h3 className="text-lg sm:text-2xl font-bold text-white text-center mb-6 sm:mb-8">
            {isCredit ? "Send money to" : "Debit from"} {fundSelectedUser.full_name || fundSelectedUser.email}!
          </h3>

          <form onSubmit={handleFundSubmit} className="space-y-4">
            {/* Account card */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Account:</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold">{fundSelectedUser.full_name || fundSelectedUser.email}</p>
                  <p className="text-slate-400 text-xs">Current Balance: {fundSelectedUser.total_balance.toLocaleString("en-US", { minimumFractionDigits: 1 })}</p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Amount to {isCredit ? "Credit" : "Debit"}</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center overflow-hidden focus-within:border-red-500">
                <input
                  type="number" min="0.01" step="0.01"
                  value={fundAmount} onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent text-white px-4 py-4 text-sm outline-none"
                  required
                />
                <span className="text-slate-400 text-sm pr-4 shrink-0">USD</span>
              </div>
            </div>

            {/* Transfer Scope */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Transfer Scope</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center overflow-hidden focus-within:border-red-500">
                <select value={fundTransferScope} onChange={(e) => setFundTransferScope(e.target.value)} className="flex-1 bg-transparent text-white px-4 py-4 text-sm outline-none">
                  <option value="local">Local Transfer</option>
                  <option value="international">International Transfer</option>
                  <option value="interbank">Interbank Transfer</option>
                  <option value="swift">SWIFT Transfer</option>
                </select>
                <span className="text-slate-400 text-sm pr-4 shrink-0">Scope</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center overflow-hidden focus-within:border-red-500">
                <input
                  type="text"
                  value={fundDescription} onChange={(e) => setFundDescription(e.target.value)}
                  placeholder="the purpose of your transfer"
                  className="flex-1 bg-transparent text-white px-4 py-4 text-sm outline-none placeholder-slate-500"
                />
                <span className="text-slate-400 text-sm pr-4 shrink-0">Memo</span>
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">frequency</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center overflow-hidden focus-within:border-red-500">
                <input
                  type="number" min="1"
                  value={fundFrequency} onChange={(e) => setFundFrequency(e.target.value)}
                  className="flex-1 bg-transparent text-white px-4 py-4 text-sm outline-none"
                />
                <div className="border-l border-slate-700 shrink-0">
                  <select value={fundFreqUnit} onChange={(e) => setFundFreqUnit(e.target.value)} className="bg-transparent text-slate-400 text-sm outline-none px-3 py-4">
                    <option value="Frequency">Frequency</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Send Email Notification */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Send Email Notification</label>
              <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center overflow-hidden focus-within:border-red-500">
                <select value={fundSendEmail} onChange={(e) => setFundSendEmail(e.target.value)} className="flex-1 bg-transparent text-white px-4 py-4 text-sm outline-none">
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
                <span className="text-slate-400 text-sm pr-4 shrink-0">Email</span>
              </div>
            </div>

            <button
              type="submit" disabled={isFunding}
              className={`w-full ${isCredit ? "bg-[#0E3DAA] hover:bg-red-800" : "bg-red-600 hover:bg-red-700"} text-white font-semibold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              <ArrowUpRight className="h-5 w-5" />
              {isFunding ? "Processing…" : isCredit ? "Credit Account" : "Debit Account"}
            </button>
          </form>
        </div>
      );
    }

    // Stage 1: user list
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-white">Debit a User Account</h2>
            <p className="text-slate-400 mt-1">Select any member from this list to debit their account securely.</p>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Type in to Search"
            value={fundSearch}
            onChange={(e) => setFundSearch(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-500"
          />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900">
                {["Account Name", "Account Number", "Account balance", "Action"].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDebitUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                  <td className="px-6 py-4 text-sm font-semibold text-white">{u.full_name || u.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-mono">{u.accounts[0]?.account_number || "N/A"}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white">USD {u.total_balance.toLocaleString("en-US", { minimumFractionDigits: 1 })}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => { setFundSelectedUser(u); setFundTab("debit"); setFundAmount(""); setFundDescription(""); setFundFrequency("1"); setFundFreqUnit("Frequency"); setFundSendEmail("no"); setFundTransferScope("local"); }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                    >Debit User</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDebitUsers.length === 0 && (
            <div className="text-center py-12"><p className="text-slate-400">No users found</p></div>
          )}
        </div>
      </div>
    );
  };

  const renderPendingUsersSection = () => (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
        <div>
          <h2 className="text-xl sm:text-xl sm:text-3xl font-bold text-white">Pending Approvals</h2>
          <p className="text-slate-400 text-sm mt-1">Thoroughly review, then approve or reject new account applications</p>
        </div>
        <button onClick={fetchPendingUsers} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shrink-0">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {isPendingLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-slate-800 animate-pulse rounded-lg" />)}</div>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-16 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
          <p className="text-slate-400 text-sm">There are no pending account applications at this time — all caught up.</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900">
                {["Applicant","Email","Phone","Country","Account No.","Applied","Actions"].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 font-bold text-sm">
                        {(u.full_name?.[0] || u.email[0]).toUpperCase()}
                      </div>
                      <p className="text-sm font-semibold text-white">{u.full_name || "—"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{u.phone || "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{u.country || "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-mono">{u.account_number || "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{new Date(u.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveUser(u.id)} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                        <CheckCircle className="h-3 w-3" /> Approve
                      </button>
                      <button onClick={() => handleRejectUser(u.id)} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                        <XCircle className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCryptoSection = () => {
    const filtered = users.filter((u) => {
      const text = [u.full_name, u.email, u.accounts[0]?.account_number].filter(Boolean).join(" ").toLowerCase();
      return text.includes(cryptoSearch.toLowerCase());
    });

    const loadBalances = async (u: AdminUser) => {
      setCryptoFundUser(u);
      setCryptoCoin("BTC");
      setCryptoAmount("");
      try {
        const r = await api.get(`/crypto/admin/users/${u.id}/balances`);
        setCryptoBalances(r.data);
      } catch { setCryptoBalances({}); }
    };

    const handleFundCrypto = async (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!cryptoFundUser || !cryptoAmount || parseFloat(cryptoAmount) <= 0) { setToast("Enter a valid amount."); return; }
      setIsCryptoFunding(true);
      try {
        const r = await api.post("/crypto/admin/fund", {
          user_id: cryptoFundUser.id,
          currency_code: cryptoCoin,
          amount: parseFloat(cryptoAmount),
        });
        setToast(r.data.detail);
        setCryptoBalances((prev) => ({ ...prev, [cryptoCoin]: r.data.new_balance }));
        setCryptoAmount("");
      } catch (err) {
        const e = err as { response?: { data?: { detail?: string } } };
        setToast(e?.response?.data?.detail || "Failed to fund crypto wallet.");
      } finally { setIsCryptoFunding(false); }
    };

    if (cryptoFundUser) {
      return (
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => { setCryptoFundUser(null); setCryptoBalances({}); }} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">← Back</button>
            <div>
              <h2 className="text-2xl font-bold text-white">Fund Crypto Wallet</h2>
              <p className="text-slate-400 text-sm mt-0.5">{cryptoFundUser.full_name || cryptoFundUser.email}</p>
            </div>
          </div>

          {/* Current balances */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-5">
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Current Crypto Balances</p>
            <div className="grid grid-cols-3 gap-2">
              {CRYPTO_COINS.map((coin) => (
                <div key={coin} className={`bg-slate-900 rounded-lg p-3 cursor-pointer border-2 transition ${cryptoCoin === coin ? "border-red-500" : "border-transparent hover:border-slate-600"}`} onClick={() => setCryptoCoin(coin)}>
                  <p className="text-white font-bold text-xs">{coin}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{(cryptoBalances[coin] ?? 0).toFixed(6)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fund form */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <form onSubmit={handleFundCrypto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Cryptocurrency</label>
                <div className="grid grid-cols-4 gap-2">
                  {CRYPTO_COINS.map((coin) => (
                    <button key={coin} type="button" onClick={() => setCryptoCoin(coin)}
                      className={`py-2 px-3 rounded-lg text-sm font-bold transition border-2 ${cryptoCoin === coin ? "bg-[#0E3DAA] border-red-500 text-white" : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"}`}>
                      {coin}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amount ({cryptoCoin}) <span className="text-red-400">*</span></label>
                <div className="bg-slate-900 border border-slate-600 rounded-xl flex items-center overflow-hidden focus-within:border-red-500">
                  <input type="number" min="0" step="any" value={cryptoAmount} onChange={(e) => setCryptoAmount(e.target.value)}
                    placeholder="0.00000000" className="flex-1 bg-transparent text-white px-4 py-4 text-sm outline-none" required />
                  <span className="text-slate-400 text-sm font-bold pr-4">{cryptoCoin}</span>
                </div>
                {cryptoAmount && parseFloat(cryptoAmount) > 0 && (
                  <p className="text-slate-500 text-xs mt-1">New balance will be: {((cryptoBalances[cryptoCoin] ?? 0) + parseFloat(cryptoAmount)).toFixed(8)} {cryptoCoin}</p>
                )}
              </div>

              <button type="submit" disabled={isCryptoFunding}
                className="w-full bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
                <BitcoinIcon className="h-4 w-4" />
                {isCryptoFunding ? "Processing…" : `Credit ${cryptoCoin} to Wallet`}
              </button>
            </form>
          </div>
        </div>
      );
    }

    // User list
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-white">Crypto Currency</h2>
            <p className="text-slate-400 mt-1">Fund member crypto wallets directly and securely from the admin dashboard.</p>
          </div>
        </div>

        <div className="mb-4">
          <input type="text" placeholder="Type in to Search" value={cryptoSearch} onChange={(e) => setCryptoSearch(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-500" />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/60">
                {["Account Name", "Account Number", "Balance (USD)", "Action"].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-700/60 hover:bg-slate-700/30 transition">
                  <td className="px-6 py-4 text-sm font-semibold text-white">{u.full_name || u.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-mono">{u.accounts[0]?.account_number || "N/A"}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white">USD {u.total_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => loadBalances(u)}
                      className="bg-[#0E3DAA] hover:bg-red-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5">
                      <BitcoinIcon className="h-3.5 w-3.5" /> Fund Crypto
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12"><p className="text-slate-400">No users found</p></div>}
        </div>
      </div>
    );
  };

  const renderComingSoon = (label: string, icon: React.ElementType, desc: string) => {
    const Icon = icon;
    return (
      <div>
        <div className="mb-5 sm:mb-8"><h2 className="text-xl sm:text-3xl font-bold text-white">{label}</h2><p className="text-slate-400 mt-1">{desc}</p></div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-16 text-center"><Icon className="h-16 w-16 text-slate-600 mx-auto mb-4" /><h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3><p className="text-slate-400 max-w-sm mx-auto text-sm">This section is under development.</p><div className="mt-6 inline-flex items-center gap-2 bg-[#0E3DAA]/20 text-red-400 px-4 py-2 rounded-full text-sm"><Clock className="h-4 w-4" />In Development</div></div>
      </div>
    );
  };

  const renderAccountRequestsSection = () => (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
        <div>
          <h2 className="text-xl sm:text-xl sm:text-3xl font-bold text-white">New Account Requests</h2>
          <p className="text-slate-400 text-sm mt-1">Verify identity details and approve or reject new account requests — approved accounts are linked to the user automatically</p>
        </div>
        <button onClick={fetchAccountRequests} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shrink-0">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {isAccountRequestsLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-slate-800 animate-pulse rounded-lg" />)}</div>
      ) : accountRequests.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-16 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
          <p className="text-slate-400 text-sm">There are no account requests at this time — everything is fully up to date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accountRequests.map((r) => (
            <div key={r.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold">{r.account_type} account request</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.status === "pending" ? "bg-yellow-900/50 text-yellow-300"
                        : r.status === "approved" ? "bg-green-900/50 text-green-300"
                        : "bg-red-900/50 text-red-300"
                    }`}>{r.status}</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5">{r.user_full_name || r.user_email} &middot; {r.user_email}</p>
                  <p className="text-slate-500 text-xs mt-1">Submitted {new Date(r.submitted_at).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Identity Verification</p>
                  <div className="space-y-1 text-slate-300">
                    <p><span className="text-slate-500">Full name:</span> {r.full_name}</p>
                    <p><span className="text-slate-500">Date of birth:</span> {r.date_of_birth}</p>
                    <p><span className="text-slate-500">ID type:</span> {r.id_type}</p>
                    <p><span className="text-slate-500">ID number:</span> {r.id_number}</p>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Purpose</p>
                  <div className="space-y-1 text-slate-300">
                    <p><span className="text-slate-500">Currency:</span> {r.currency}</p>
                    <p><span className="text-slate-500">Expected activity:</span> {r.expected_activity}</p>
                    <p className="text-slate-300">{r.purpose}</p>
                  </div>
                </div>
              </div>

              {r.status === "pending" ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={requestReviewNotes[r.id] || ""}
                    onChange={(e) => setRequestReviewNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    placeholder="Optional note (shown to user)"
                    className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm placeholder-slate-500 focus:border-red-500 outline-none"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleReviewAccountRequest(r.id, "approved")} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button onClick={() => handleReviewAccountRequest(r.id, "rejected")} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ) : r.reviewer_note ? (
                <p className="text-slate-500 text-xs">Note: {r.reviewer_note}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLiveChatSection = () => {
    const activeThread = chatThreads.find((t) => t.user_id === activeChatUserId) || null;

    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <h2 className="text-xl sm:text-xl sm:text-3xl font-bold text-white">Live Chat</h2>
            <p className="text-slate-400 text-sm mt-1">Bot-assisted conversations flagged for a human reply</p>
          </div>
          <button onClick={fetchChatThreads} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shrink-0">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[32rem]">
          {/* Thread list */}
          <div className={`bg-slate-800 border border-slate-700 rounded-xl overflow-y-auto ${activeChatUserId ? "hidden lg:block" : ""}`}>
            {chatThreads.length === 0 ? (
              <div className="p-10 text-center">
                <MessageCircle className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No conversations yet.</p>
              </div>
            ) : (
              chatThreads.map((t) => (
                <button
                  key={t.user_id}
                  onClick={() => openChatThread(t.user_id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-slate-700 hover:bg-slate-700/50 transition ${activeChatUserId === t.user_id ? "bg-slate-700/70" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white font-semibold text-sm truncate">{t.user_full_name || t.user_email}</p>
                    {t.unread_count > 0 && (
                      <span className="bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                        {t.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs truncate mt-0.5">{t.last_message}</p>
                  <p className="text-slate-600 text-[11px] mt-1">{new Date(t.last_message_at).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
                </button>
              ))
            )}
          </div>

          {/* Conversation detail */}
          <div className={`lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl flex flex-col ${activeChatUserId ? "" : "hidden lg:flex"}`}>
            {!activeChatUserId ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                Select a conversation to view messages.
              </div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-slate-700 flex items-center gap-3 shrink-0">
                  <button onClick={() => setActiveChatUserId(null)} className="lg:hidden text-slate-400 hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <p className="text-white font-semibold text-sm">{activeThread?.user_full_name || activeThread?.user_email}</p>
                    <p className="text-slate-500 text-xs">{activeThread?.user_email}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {isChatThreadsLoading ? (
                    <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-12 bg-slate-700/50 animate-pulse rounded-xl" />)}</div>
                  ) : (
                    chatMessages.map((m) => {
                      const isFromUser = m.sender === "user";
                      return (
                        <div key={m.id} className={`flex ${isFromUser ? "justify-start" : "justify-end"}`}>
                          <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${
                            isFromUser ? "bg-slate-700 text-slate-100 rounded-bl-sm"
                              : m.sender === "bot" ? "bg-slate-900 border border-slate-700 text-slate-300 rounded-br-sm"
                              : "bg-[#0E3DAA] text-white rounded-br-sm"
                          }`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">
                              {m.sender === "user" ? "Customer" : m.sender === "bot" ? "Assistant" : "You"}
                            </p>
                            {m.body}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleChatReply} className="p-3 border-t border-slate-700 flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={chatReply}
                    onChange={(e) => setChatReply(e.target.value)}
                    placeholder="Reply to this customer…"
                    className="flex-1 bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 outline-none focus:border-red-500 placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={isChatReplying || !chatReply.trim()}
                    className="bg-[#0E3DAA] hover:bg-red-800 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shrink-0"
                  >
                    {isChatReplying ? "Sending…" : "Send"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "pending-users": return renderPendingUsersSection();
      case "account-requests": return renderAccountRequestsSection();
      case "live-chat": return renderLiveChatSection();
      case "transactions": return renderTransactionsSection();
      case "fund-account": return renderFundAccountSection();
      case "debit-account": return renderDebitAccountSection();
      case "send-email": return renderSendEmailSection();
      case "kyc-admin": return renderKycAdminSection();
      case "support-ticket": return renderSupportTicketSection();
      case "general-settings": return renderGeneralSettings();
      case "logo-favicon": return renderLogoFavicon();
      case "plugins": return renderPlugins();
      case "email-sms": return renderEmailSms();
      case "auth-code": return renderAuthCode();
      case "slider": return renderSlider();
      case "loan": return renderLoan();
      case "bill-payments": return renderComingSoon("Bill Payments", FileText, "Manage bill payments across all user accounts");
      case "check-deposits": return renderComingSoon("Check Deposits", CreditCard, "Review and approve check deposits submitted by users");
      case "crypto": return renderCryptoSection();
      case "virtual-cards": return renderComingSoon("Virtual Cards", Wallet, "Issue and manage virtual cards for user accounts");
      default: return renderUsersSection();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Verifying access…</p>
      </div>
    </div>
  );

  if (!user || !user.is_admin) return null;

  // Sidebar JSX — shared between mobile drawer and desktop
  const sidebarContent = (
    <>
      <div className="p-6 border-b border-slate-800">
        <button onClick={() => { setActiveSection("users"); setSidebarOpen(false); }} className="text-left w-full hover:opacity-80 transition-opacity">
          <h1 className="text-xl font-bold text-white">BLUEROCK NATIONAL <span className="text-red-500">CREDIT UNION</span></h1>
          <p className="text-xs text-slate-400 mt-1">RESERVE BANK</p>
        </button>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Quick Action</p>
          <button onClick={() => { setShowCreateModal(true); setSidebarOpen(false); }} className="w-full flex items-center gap-3 bg-[#0E3DAA] hover:bg-red-800 text-white px-4 py-3 rounded-lg text-sm font-semibold transition">
            <Plus className="h-4 w-4" />Create a user account<span className="ml-auto text-xs bg-[#0E3DAA] px-2 py-1 rounded">New</span>
          </button>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Dashboards</p>
          <nav className="space-y-0.5">
            {DASHBOARD_NAV.map(({ label, key, icon: Icon }) => {
              const chatUnread = key === "live-chat" ? chatThreads.reduce((s, t) => s + t.unread_count, 0) : 0;
              return (
                <button key={key} onClick={() => handleSectionChange(key)} className={`w-full flex items-center gap-3 text-left px-3 py-2.5 text-sm rounded-lg transition ${activeSection===key?"bg-[#0E3DAA] text-white":"text-slate-300 hover:text-white hover:bg-slate-800"}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {chatUnread > 0 && (
                    <span className="bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {chatUnread}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Settings</p>
          <nav className="space-y-0.5">
            {SETTINGS_NAV.map(({ label, key, icon: Icon }) => (
              <button key={key} onClick={() => handleSectionChange(key)} className={`w-full flex items-center gap-3 text-left px-3 py-2.5 text-sm rounded-lg transition ${activeSection===key?"bg-[#0E3DAA] text-white":"text-slate-300 hover:text-white hover:bg-slate-800"}`}>
                <Icon className="h-4 w-4 shrink-0" />{label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <button
        onClick={async () => { await logout(); setSidebarOpen(false); }}
        className="m-4 flex items-center gap-3 text-slate-400 hover:text-red-400 px-3 py-3 text-sm font-medium transition border-t border-slate-800 pt-6"
      >
        <LogOut className="h-4 w-4" />Logout
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 z-50 bg-slate-950 border-r border-slate-800 flex flex-col shadow-2xl">
            {sidebarContent}
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white transition">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-72 bg-slate-950 border-r border-slate-800 flex-col overflow-y-auto shrink-0">
        {sidebarContent}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden" onClick={() => showActionMenu && setShowActionMenu(null)}>
        {/* Mobile top bar */}
        <div className="lg:hidden bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-white shrink-0">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-white flex-1 text-sm">Admin Panel</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0E3DAA] rounded-full flex items-center justify-center shrink-0"><User className="h-4 w-4 text-white" /></div>
          </div>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:flex bg-slate-800 border-b border-slate-700 px-8 py-4 items-center justify-between shrink-0">
          <div className="flex gap-6 items-center text-sm">
            <span className="text-slate-400">Ticker <span className="text-green-400 font-semibold ml-1">+0.14%</span></span>
            <span className="text-slate-400">JPY <span className="text-white font-semibold ml-1">159.637</span> <span className="text-green-400">+0.26%</span></span>
            <span className="text-slate-400">CAD <span className="text-white font-semibold ml-1">1.38302</span> <span className="text-green-400">+0.1%</span></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0E3DAA] rounded-full flex items-center justify-center"><User className="h-4 w-4 text-white" /></div>
            <div className="text-right"><p className="text-sm font-semibold text-white">{user?.full_name || user?.email || "Administrator"}</p><p className="text-xs text-slate-400">BANK MANAGER</p></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {toast && <div className="mb-6 bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg text-sm flex items-center justify-between"><span>{toast}</span><button onClick={()=>setToast(null)}><X className="h-4 w-4" /></button></div>}
          {renderContent()}
        </div>
      </div>

      {/* Edit User Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Account Details</h2>
              <button onClick={() => setEditTarget(null)} className="text-slate-500 hover:text-white transition"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex items-center gap-3 mb-6 bg-slate-800 rounded-xl p-4">
              <div className="w-10 h-10 bg-linear-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(editTarget.full_name || editTarget.email).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{editTarget.full_name || "—"}</p>
                <p className="text-slate-400 text-xs">{editTarget.email}</p>
              </div>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone number" className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 mt-4">Reset Password</label>
                <input type="text" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Leave blank to keep current password" className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Account Type</label>
                <select value={editAccountType} onChange={(e) => setEditAccountType(e.target.value)} className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none">
                  <option value="Checking">Checking</option>
                  <option value="Savings">Savings</option>
                  <option value="Business Checking">Business Checking</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date of Birth</label>
                  <input type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Country</label>
                  <input type="text" value={editCountry} onChange={(e) => setEditCountry(e.target.value)} placeholder="Country" className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Street Address</label>
                <input type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="123 Main Street" className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">City</label>
                  <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="City" className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">State</label>
                  <input type="text" value={editState} onChange={(e) => setEditState(e.target.value)} placeholder="State" className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Zip Code</label>
                  <input type="text" value={editZip} onChange={(e) => setEditZip(e.target.value)} placeholder="Zip" className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:border-red-500 outline-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isEditSaving} className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
                  {isEditSaving ? "Saving…" : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditTarget(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 rounded-lg transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Limit Modal */}
      {limitTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Set Transaction Limit</h2>
              <button onClick={() => setLimitTarget(null)} className="text-slate-500 hover:text-white transition"><X className="h-5 w-5" /></button>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 mb-6">
              <p className="text-white font-semibold text-sm">{limitTarget.full_name || limitTarget.email}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                Current limit: {limitTarget.transaction_limit !== null ? `$${limitTarget.transaction_limit.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "No limit set"}
              </p>
            </div>
            <form onSubmit={handleSetTransactionLimit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Max Transfer Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input type="number" min="0" step="0.01" value={limitAmount} onChange={(e) => setLimitAmount(e.target.value)} placeholder="e.g. 5000.00 — leave empty to remove limit" className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg pl-8 pr-4 py-2.5 text-sm focus:border-red-500 outline-none placeholder-slate-500" />
                </div>
                <p className="text-slate-500 text-xs mt-1.5">Simply leave this blank to remove any existing limit entirely.</p>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-3">
                <p className="text-yellow-400 text-xs">This member will not be able to transfer more than this amount per single transaction. This limit is enforced immediately and without exception.</p>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-semibold py-2.5 rounded-lg transition">
                  {limitAmount === "" ? "Remove Limit" : "Set Limit"}
                </button>
                <button type="button" onClick={() => setLimitTarget(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 rounded-lg transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Freeze / Activate Confirmation Modal */}
      {freezeTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-xl font-bold text-white mb-2">
              {freezeTarget.is_active ? "Freeze Account" : "Activate Account"}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {freezeTarget.is_active
                ? `You are about to freeze ${freezeTarget.full_name || freezeTarget.email}'s account. The user will be shown your reason when they try to log in.`
                : `You are about to reactivate ${freezeTarget.full_name || freezeTarget.email}'s account. They will regain full access.`}
            </p>
            {freezeTarget.is_active && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Reason for freezing <span className="text-slate-500">(shown to user)</span></label>
                <textarea
                  rows={3}
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  placeholder="e.g. Suspicious activity detected on your account. Please contact support."
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm placeholder-slate-500 focus:border-red-500 outline-none resize-none"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleFreezeUser} disabled={isFreezeSubmitting} className={`flex-1 font-semibold py-3 rounded-lg transition text-white disabled:opacity-50 ${freezeTarget.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}>
                {isFreezeSubmitting ? "Saving..." : freezeTarget.is_active ? "Freeze Account" : "Activate Account"}
              </button>
              <button onClick={() => { setFreezeTarget(null); setFreezeReason(""); }} disabled={isFreezeSubmitting} className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate / Reactivate Confirmation Modal */}
      {deactivateTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-xl font-bold text-white mb-2">
              {deactivateTarget.is_deactivated ? "Reactivate Account" : "Deactivate Account"}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {deactivateTarget.is_deactivated
                ? `You are about to reactivate ${deactivateTarget.full_name || deactivateTarget.email}'s account. They will be able to log in again.`
                : `You are about to deactivate ${deactivateTarget.full_name || deactivateTarget.email}'s account. Unlike freezing, this blocks them from logging in at all.`}
            </p>
            {!deactivateTarget.is_deactivated && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Reason for deactivating <span className="text-slate-500">(shown if they try to log in)</span></label>
                <textarea
                  rows={3}
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  placeholder="e.g. Account closed at customer's request."
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm placeholder-slate-500 focus:border-red-500 outline-none resize-none"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleDeactivateUser} disabled={isDeactivateSubmitting} className={`flex-1 font-semibold py-3 rounded-lg transition text-white disabled:opacity-50 ${deactivateTarget.is_deactivated ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                {isDeactivateSubmitting ? "Saving..." : deactivateTarget.is_deactivated ? "Reactivate Account" : "Deactivate Account"}
              </button>
              <button onClick={() => { setDeactivateTarget(null); setDeactivateReason(""); }} disabled={isDeactivateSubmitting} className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Pause Modal */}
      {pauseTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-xl font-bold text-white mb-2">
              {pauseTarget.transfer_paused ? "Transfers Paused" : "Pause Transfers"}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {pauseTarget.transfer_paused
                ? `Transfers are currently paused for ${pauseTarget.full_name || pauseTarget.email}. Other actions (deposits, bill pay, balance) are unaffected — only sending a transfer is blocked. Update the reason below or resume transfers.`
                : `Block ${pauseTarget.full_name || pauseTarget.email} from sending transfers. Everything else on their account (deposits, balance, bill pay) keeps working normally.`}
            </p>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Reason <span className="text-slate-500">(shown to user)</span></label>
              <textarea
                rows={3}
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="e.g. Reviewing a large recent deposit. Please contact support."
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm placeholder-slate-500 focus:border-red-500 outline-none resize-none"
              />
            </div>
            <div className="flex gap-3">
              {pauseTarget.transfer_paused ? (
                <>
                  <button onClick={() => submitTransferPause(true, { close: false })} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 rounded-lg transition">
                    Update Reason
                  </button>
                  <button onClick={() => submitTransferPause(false)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition">
                    Resume Transfers
                  </button>
                </>
              ) : (
                <button onClick={() => submitTransferPause(true)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition">
                  Pause Transfers
                </button>
              )}
              <button onClick={() => { setPauseTarget(null); setPauseReason(""); }} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0E3DAA] px-5 sm:px-8 py-5 sm:py-6 flex items-center gap-3 rounded-t-xl"><User size={24} className="text-white shrink-0" /><h2 className="text-lg sm:text-2xl font-bold text-white">Fill user details correctly</h2></div>
            <form onSubmit={handleCreateUser} className="p-4 sm:p-8 space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6">Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
                  {[{label:"First Name",val:firstName,set:setFirstName,req:true},{label:"Middle Name",val:middleName,set:setMiddleName,req:false},{label:"Last Name",val:lastName,set:setLastName,req:true}].map(({label,val,set,req})=>(
                    <div key={label}><label className="block text-sm font-semibold text-slate-700 mb-2">{label}{req&&<span className="text-red-500"> *</span>}</label><input type="text" value={val} onChange={(e)=>set(e.target.value)} placeholder={label} required={req} className="w-full border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none" /></div>
                  ))}
                </div>
                <div className="mb-6"><label className="block text-sm font-semibold text-slate-700 mb-2">House Address</label><input type="text" value={houseAddress} onChange={(e)=>setHouseAddress(e.target.value)} placeholder="123 Main Street" className="w-full border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Country</label><select value={country} onChange={(e)=>setCountry(e.target.value)} className="w-full border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none"><option value="">— Select country —</option>{countryList.map((c)=><option key={c}>{c}</option>)}</select></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">State / Region</label><input type="text" value={stateVal} onChange={(e)=>setStateVal(e.target.value)} placeholder="e.g. Texas" className="w-full border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none" /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">City</label><input type="text" value={city} onChange={(e)=>setCity(e.target.value)} placeholder="e.g. Houston" className="w-full border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Zip Code</label><input type="text" value={zipCode} onChange={(e)=>setZipCode(e.target.value)} placeholder="10001" className="w-full border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none" /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label><input type="date" value={dateOfBirth} onChange={(e)=>setDateOfBirth(e.target.value)} className="w-full border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label><input type="tel" value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)} placeholder="+1 (555) 123-4567" className="w-full border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none" /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Email Address <span className="text-red-500">*</span></label><input type="email" value={emailAddress} onChange={(e)=>setEmailAddress(e.target.value)} placeholder="john@example.com" required className="w-full border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none" /></div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Banking Details</h3>
                <div className="mb-6"><label className="block text-sm font-semibold text-slate-700 mb-2">Account Number</label><input type="text" disabled placeholder="Auto-generated" className="w-full border border-slate-300 text-slate-500 rounded-lg px-4 py-2 text-sm bg-slate-100 cursor-not-allowed" /><p className="text-xs text-slate-500 mt-1">Account number will be auto-generated</p></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Account Type</label><select value={accountType} onChange={(e)=>setAccountType(e.target.value)} className="w-full border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none"><option value="CHECKING">Checking</option><option value="SAVINGS">Savings</option><option value="FIXED_DEPOSIT">Fixed Deposit</option><option value="NON_RESIDENT">Non-Resident Account</option><option value="OFFSHORE">Offshore Account</option></select></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Currency</label><select value={accountCurrency} onChange={(e)=>setAccountCurrency(e.target.value)} className="w-full border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none"><option>USD</option><option>EUR</option><option>GBP</option></select></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Password <span className="text-red-500">*</span></label><PasswordInput value={createPassword} onChange={(e)=>setCreatePassword(e.target.value)} placeholder="••••••••" required className="w-full border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none" /></div>
                </div>
                <div className="mb-8"><label className="block text-sm font-semibold text-slate-700 mb-2">Initial Balance</label><input type="number" value={createBalance} onChange={(e)=>setCreateBalance(e.target.value)} placeholder="1000" className="w-full border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none" /></div>
              </div>
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button type="submit" disabled={isSaving} className="flex-1 bg-[#0E3DAA] hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">{isSaving?"Creating...":"Create Account"}</button>
                <button type="button" onClick={()=>setShowCreateModal(false)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-3 rounded-lg transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
