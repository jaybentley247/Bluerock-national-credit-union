"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Users, CheckCircle, Copy } from "lucide-react";
import MarketingHeader from "@/components/layout/MarketingHeader";
import PasswordInput from "@/components/ui/PasswordInput";

let _cachedCountries: string[] = [];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","Other",
];

const CURRENCIES = [
  "America (United States) Dollars – USD",
  "British Pound Sterling – GBP",
  "Euro – EUR",
  "Canadian Dollar – CAD",
  "Australian Dollar – AUD",
  "Swiss Franc – CHF",
  "Japanese Yen – JPY",
  "Chinese Yuan – CNY",
  "Nigerian Naira – NGN",
  "Ghanaian Cedi – GHS",
  "South African Rand – ZAR",
  "Indian Rupee – INR",
  "UAE Dirham – AED",
  "Saudi Riyal – SAR",
];

export default function RegisterFormPage() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [houseAddress, setHouseAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [ssn, setSsn] = useState("");
  const [accountType, setAccountType] = useState("");
  const [accountCurrency, setAccountCurrency] = useState("America (United States) Dollars – USD");
  const [pin2fa, setPin2fa] = useState("");
  const [enableOtp, setEnableOtp] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ account_number: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [countryList, setCountryList] = useState<string[]>(_cachedCountries);

  useEffect(() => {
    if (_cachedCountries.length) { setCountryList(_cachedCountries); return; }
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((r) => r.json())
      .then((data: { name: { common: string } }[]) => {
        const names = data.map((c) => c.name.common).sort();
        _cachedCountries = names;
        setCountryList(names);
      })
      .catch(() => {
        const fallback = ["United States","United Kingdom","Canada","Australia","Germany","France","Nigeria","Ghana","India","China","Brazil","South Africa","Japan","Mexico","Italy","Spain","Netherlands","Sweden","Norway","Switzerland","Singapore","UAE","Saudi Arabia","Kenya","Egypt","Pakistan","Bangladesh","Indonesia","Malaysia","Philippines","Other"];
        _cachedCountries = fallback;
        setCountryList(fallback);
      });
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPassportPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setFirstName(""); setMiddleName(""); setLastName("");
    setCountry(""); setStateVal(""); setCity("");
    setZipCode(""); setDateOfBirth(""); setHouseAddress("");
    setPhone(""); setEmail("");
    setOccupation(""); setAnnualIncome("");
    setSsn(""); setAccountType(""); setAccountCurrency("America (United States) Dollars – USD");
    setPin2fa(""); setEnableOtp(false); setPassword(""); setConfirmPassword("");
    setPassportPreview(null);
    setError("");
    if (photoRef.current) photoRef.current.value = "";
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validate and scroll to the first missing field
    if (!firstName) {
      setError("First Name is required.");
      document.getElementById("field-firstName")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!lastName) {
      setError("Last Name is required.");
      document.getElementById("field-lastName")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!email) {
      setError("Email address is required.");
      document.getElementById("field-email")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!password) {
      setError("Password is required.");
      document.getElementById("field-password")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      document.getElementById("field-confirmPassword")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      document.getElementById("field-password")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsLoading(true);
    try {
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
      const response = await api.post("/auth/register", {
        full_name: fullName,
        email,
        password,
        phone: phone || undefined,
        date_of_birth: dateOfBirth || undefined,
        address: houseAddress || undefined,
        city: city || undefined,
        state: stateVal || undefined,
        country: country || undefined,
        zip_code: zipCode || undefined,
        enable_otp: enableOtp,
      });
      setResult({ account_number: response.data.account_number });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <>
        <MarketingHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
          <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Your Application Has Been Submitted!</h2>
            <p className="text-gray-600 text-sm">
              Your application is now <strong>pending admin approval</strong>. You will be able to log in and start banking the moment your account is approved.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Your Account Number</p>
              <p className="text-3xl font-bold text-red-700 tracking-widest">{result.account_number}</p>
              <button
                onClick={handleCopy}
                className="mt-3 flex items-center gap-2 mx-auto text-sm text-red-700 hover:text-red-800 font-medium"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy account number"}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Please save your account number somewhere safe — you will need it to log in once your account has been approved.
            </p>
            <Link href="/login" className="inline-block w-full py-3 bg-[#0E3DAA] hover:bg-red-800 text-white font-semibold rounded-lg text-sm transition">
              Go to Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  const inp = "w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500 bg-white";
  const sel = "w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-red-500 bg-white";
  const lbl = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <>
      <MarketingHeader />
      <div className="min-h-screen bg-black py-6 px-4 pb-24">
        <div className="max-w-5xl mx-auto">

          {/* Blue banner */}
          <div className="bg-[#0E3DAA] text-white py-4 px-6 flex items-center justify-center gap-3">
            <Users className="h-5 w-5 shrink-0" />
            <span className="font-semibold text-sm sm:text-base text-center">
              Please fill in the information below so we can set up your new BLUEROCK NATIONAL CREDIT UNION account.
            </span>
          </div>

          {/* White form body */}
          <div className="bg-white px-6 sm:px-10 py-6">
            <form id="register-form" onSubmit={handleSubmit}>

              {/* ── Personal Details ── */}
              <p className="text-sm font-bold text-gray-700 mb-1">Personal Details</p>
              <hr className="border-gray-300 mb-4" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div id="field-firstName">
                  <label className={lbl}>First Name <span className="text-red-500">*</span></label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Middle name</label>
                  <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Middle Name" className={inp} />
                </div>
                <div id="field-lastName">
                  <label className={lbl}>Last Name <span className="text-red-500">*</span></label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className={inp} />
                </div>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-3">Address</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={lbl}>Country</label>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className={sel}>
                    <option value="">Select Country</option>
                    {countryList.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>State</label>
                  <select value={stateVal} onChange={(e) => setStateVal(e.target.value)} className={sel}>
                    <option value="">Select State</option>
                    {US_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>City</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inp} />
                </div>
              </div>

              <div className="grid grid-cols-[130px_140px_1fr] gap-4 mb-4">
                <div>
                  <label className={lbl}>Zip code</label>
                  <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="zipcode/postal code" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Date of Birth</label>
                  <input type="text" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} placeholder="Date of Birth" className={inp} />
                </div>
                <div>
                  <label className={lbl}>House Address</label>
                  <input type="text" value={houseAddress} onChange={(e) => setHouseAddress(e.target.value)} placeholder="House address" className={inp} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={lbl}>Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className={inp} />
                </div>
                <div id="field-email">
                  <label className={lbl}>Email address <span className="text-red-500">*</span></label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email address" className={inp} />
                </div>
              </div>

              {/* ── Employment Information ── */}
              <p className="text-sm font-bold text-red-700 mb-1">Employment information</p>
              <hr className="border-gray-300 mb-4" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={lbl}>Occupation</label>
                  <select value={occupation} onChange={(e) => setOccupation(e.target.value)} className={sel}>
                    <option value="">Select Type of Employment</option>
                    <option>Employed (Full-time)</option>
                    <option>Employed (Part-time)</option>
                    <option>Self-Employed</option>
                    <option>Business Owner</option>
                    <option>Student</option>
                    <option>Retired</option>
                    <option>Unemployed</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Annual Income range</label>
                  <select value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} className={sel}>
                    <option value="">Select Salary Range</option>
                    <option>Under $25,000</option>
                    <option>$25,000 – $50,000</option>
                    <option>$50,000 – $75,000</option>
                    <option>$75,000 – $100,000</option>
                    <option>$100,000 – $150,000</option>
                    <option>$150,000 – $250,000</option>
                    <option>$250,000+</option>
                  </select>
                </div>
              </div>

              {/* ── Banking Details ── */}
              <p className="text-sm font-bold text-red-700 mb-1">Banking Details</p>
              <hr className="border-gray-300 mb-4" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={lbl}>SSN/TIN (Or equivalence)</label>
                  <input type="text" value={ssn} onChange={(e) => setSsn(e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Account Type</label>
                  <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className={sel}>
                    <option value="">Please select Account Type</option>
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="fixed_deposit">Fixed Deposit</option>
                    <option value="non_resident">Non-Resident</option>
                    <option value="offshore">Offshore</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Account Currency</label>
                  <select value={accountCurrency} onChange={(e) => setAccountCurrency(e.target.value)} className={sel}>
                    {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={lbl}>2FA PIN</label>
                  <PasswordInput value={pin2fa} onChange={(e) => setPin2fa(e.target.value)} className={inp} />
                </div>
                <div id="field-password">
                  <label className={lbl}>Password <span className="text-red-500">*</span></label>
                  <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} className={inp} />
                </div>
                <div id="field-confirmPassword">
                  <label className={lbl}>Confirm Password <span className="text-red-500">*</span></label>
                  <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className={inp} />
                </div>
              </div>

              <label className="flex items-start gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableOtp}
                  onChange={(e) => setEnableOtp(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-red-700"
                />
                <span className="text-sm text-gray-700">
                  Email me a one-time verification code every time I log in <span className="text-gray-400">(optional — you can turn this on or off later in Settings)</span>
                </span>
              </label>

              {/* Passport Photo */}
              <div className="mb-4">
                <label className={lbl}>Passport Photograph</label>
                <div
                  className="border border-gray-300 rounded w-64 h-48 flex items-center justify-center cursor-pointer bg-gray-50 overflow-hidden mb-2"
                  onClick={() => photoRef.current?.click()}
                >
                  {passportPreview
                    ? <img src={passportPreview} alt="Passport preview" className="w-full h-full object-cover" />
                    : <span className="text-gray-300 text-5xl select-none">🖼</span>
                  }
                </div>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1 cursor-pointer"
                />
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black py-3 px-8 flex items-center gap-4 z-50 border-t border-gray-800 flex-wrap">
        <button
          type="submit"
          form="register-form"
          disabled={isLoading}
          className="bg-[#0E3DAA] hover:bg-red-800 text-white font-bold px-8 py-2.5 rounded text-sm disabled:opacity-50 transition shrink-0"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-2.5 rounded text-sm transition shrink-0"
        >
          Reset
        </button>
        <Link href="/register" className="text-white text-sm flex items-center gap-1 hover:text-red-100 transition ml-2 shrink-0">
          ← back
        </Link>
        {error && (
          <span className="text-red-400 text-sm font-medium ml-auto">⚠ {error}</span>
        )}
      </div>
    </>
  );
}
