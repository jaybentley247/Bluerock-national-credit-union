"use client";

import { useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MarketingHeader from "@/components/layout/MarketingHeader";

const SCROLL_KEY = "tc_scroll";

export default function RegisterTermsPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPos = useRef(0);

  // Restore scroll position before every paint — works against any re-render
  useLayoutEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) scrollPos.current = Number(saved);
    if (scrollRef.current) scrollRef.current.scrollTop = scrollPos.current;
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    scrollPos.current = e.currentTarget.scrollTop;
    sessionStorage.setItem(SCROLL_KEY, String(scrollPos.current));
  };

  const handleAccept = () => {
    sessionStorage.removeItem(SCROLL_KEY);
    router.push("/register/apply");
  };

  return (
    <>
      <MarketingHeader />
      <div className="min-h-screen bg-black flex items-start justify-center py-10 px-4">
        <div className="bg-white w-full max-w-lg rounded shadow-lg overflow-hidden">
          <div className="flex flex-col items-center pt-8 pb-8 px-6">

            {/* Logo */}
            <div className="mb-6">
              <img src="/blue.png" alt="BLUEROCK NATIONAL CREDIT UNION" className="h-40 w-auto object-contain" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 self-start mb-4">Enroll a new Account</h2>

            <div className="w-full border-l-4 border-red-500 bg-white shadow-sm rounded px-4 py-3 mb-5">
              <p className="text-sm text-gray-700">
                Before you continue, Kindly read and accept our terms and conditions.
              </p>
            </div>

            <p className="text-lg font-black text-[#0E3DAA] tracking-wide mb-3 self-start">
              TERMS AND CONDITIONS
            </p>

            {/* Scrollable T&C */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              style={{ height: "224px", overflowY: "scroll", overscrollBehavior: "contain", touchAction: "pan-y" }}
              className="w-full border border-gray-300 rounded p-4 text-sm text-gray-700 leading-relaxed bg-gray-50 mb-6"
            >
              <p className="mb-3">
                Before opening an account with us, please read through the conditions below. Take your time with each one before deciding whether to accept. If you're ready to move forward, select{" "}
                <strong>I Accept</strong>. Choosing{" "}
                <strong>Decline</strong> instead will stop your registration where it stands. We recommend keeping a copy of this agreement for your own records going forward.
              </p>
              <p className="mb-3">
                <strong>1. Eligibility.</strong> To open and hold an account with BLUEROCK NATIONAL CREDIT UNION, you must be at least 18 years old and a legal resident of the country where you're applying.
              </p>
              <p className="mb-3">
                <strong>2. Accuracy of Information.</strong> The information you provide during registration needs to be accurate and current, and you agree to update it whenever it changes.
              </p>
              <p className="mb-3">
                <strong>3. Account Security.</strong> Keeping your login credentials confidential is your responsibility. Let us know right away if you notice any unauthorized use of your account or suspect a security issue.
              </p>
              <p className="mb-3">
                <strong>4. Acceptable Use.</strong> Your account may not be used for unlawful purposes, including money laundering, fraud, or financing illegal activity of any kind. BLUEROCK NATIONAL CREDIT UNION may suspend or close any account connected to suspicious or prohibited activity.
              </p>
              <p className="mb-3">
                <strong>5. Privacy.</strong> We collect and process your personal information according to our Privacy Policy. Registering with us means you consent to that collection and use.
              </p>
              <p className="mb-3">
                <strong>6. Electronic Communications.</strong> Opening an account means agreeing to receive electronic communications from us, including statements, important notices, and occasional promotional messages about our products and services.
              </p>
              <p className="mb-3">
                <strong>7. Limitation of Liability.</strong> BLUEROCK NATIONAL CREDIT UNION is not liable for indirect, incidental, special, or consequential damages arising from your use of the service.
              </p>
              <p className="mb-3">
                <strong>8. Amendments.</strong> We may update these terms at any time at our discretion. Continuing to use the service after changes take effect means you accept the updated terms.
              </p>
              <p>
                <strong>9. Governing Law.</strong> These terms are governed by applicable law, and any disputes will be resolved through binding arbitration or, where relevant, the courts of the appropriate jurisdiction.
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={handleAccept}
                className="flex-1 bg-[#0E3DAA] hover:bg-red-800 text-white font-bold py-2.5 rounded text-sm transition"
              >
                I Accept
              </button>
              <Link
                href="/login"
                className="flex-1 text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2.5 rounded text-sm transition"
              >
                Decline
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
