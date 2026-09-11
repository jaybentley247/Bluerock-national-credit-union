"use client";

import React from "react";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

const faqItems = [
  {
    question: "How can I apply for a private loan?",
    answer:
      "Head to our loan page and fill out the online request form. A senior advisor will review your situation and get back to you within one business day.",
  },
  {
    question: "What documents are required for loan approval?",
    answer:
      "You'll typically need proof of income, valid identification, credit history, and collateral documentation where applicable. Our team will confirm exactly what's needed for your loan type before you start.",
  },
  {
    question: "Can I manage my account entirely digitally?",
    answer:
      "Yes — our digital platform gives you secure, around-the-clock access to balances, transfers, and your full transaction history, wherever you are.",
  },
  {
    question: "How do I reach support outside of normal business hours?",
    answer:
      "Use the contact form on our support page for anything urgent, or call our emergency line directly for card security and account protection issues — we're available around the clock.",
  },
];

export default function FAQPage() {
  return (
    <>
      <MarketingHeader />
      <main className="min-h-screen bg-white text-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest text-red-700 font-bold">
              Frequently Asked Questions
            </p>
            <h1 className="text-4xl md:text-5xl font-bold">
              Straight answers to the questions we hear most from members.
            </h1>
          </div>

          <div className="grid gap-6">
            {faqItems.map((item) => (
              <div
                key={item.question}
                className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {item.question}
                </h2>
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    <MarketingFooter />
    </>
  );
}
