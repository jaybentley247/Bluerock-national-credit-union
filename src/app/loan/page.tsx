"use client";

import React from "react";
import Link from "next/link";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

const loanProducts = [
  {
    title: "Luxury Home Financing",
    description:
      "Meticulously structured mortgage solutions built exclusively for premium residential properties, with repayment schedules and dedicated advisory support shaped entirely around your circumstances.",
    image:
      "https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Business Expansion Loans",
    description:
      "Serious capital structured for ambitious, growing private enterprises — confidently funding acquisitions, strategic expansion, and everything in between.",
    image:
      "https://images.unsplash.com/photo-1764591696226-ea4e8d655bc7?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Ultra-Private Personal Credit",
    description:
      "Remarkably discreet credit lines for lifestyle needs, on-demand liquidity, and travel — delivered with a member experience every bit as refined as the credit itself.",
    image:
      "https://images.unsplash.com/photo-1686771416282-3888ddaf249b?q=80&w=1200&auto=format&fit=crop",
  },
];

const loanArticles = [
  {
    title: "How Private Mortgages Deliver Dramatically Better Terms",
    excerpt:
      "Discover how meticulously tailored private mortgage underwriting can unlock lower rates and payment structures that genuinely flex with you, well beyond anything standard lending could ever offer.",
  },
  {
    title: "Funding Ambitious Business Growth with Confidential Credit",
    excerpt:
      "Find out precisely how discreet credit facilities empower businesses to scale efficiently and confidently, all without ever trading away privacy or speed.",
  },
  {
    title: "Smart, Strategic Borrowing for Asset-Rich Members",
    excerpt:
      "Understand why portfolio-backed loan structures help maintain robust liquidity while keeping your long-term investment goals fully and completely intact.",
  },
];

export default function LoanPage() {
  return (
    <>
      <MarketingHeader />
      <main className="min-h-screen bg-white text-gray-900">
        <section className="relative overflow-hidden text-white py-24">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1758448500688-3ababa93fd67?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              <p className="text-sm uppercase tracking-widest text-red-200 font-bold">
                Private Lending, Elevated
              </p>
              <h1 className="text-5xl lg:text-6xl font-bold">
                Lending intelligently built for the way high-net-worth members actually borrow.
              </h1>
              <p className="text-lg leading-relaxed text-red-100">
                Remarkably discreet credit structures, seasoned expert underwriting, and approvals that move with genuine speed — engineered for residential, business, and lifestyle financing alike, without compromise.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[#0E3DAA] font-bold hover:bg-red-100 transition-all"
                >
                  Begin Your Application Today
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 py-4 text-white font-semibold hover:bg-white/20 transition-all"
                >
                  Speak Directly With an Advisor
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-3">
              {loanProducts.map((product) => (
                <div
                  key={product.title}
                  className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm transition-shadow hover:shadow-xl"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-64 w-full object-cover"
                  />
                  <div className="p-8 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {product.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm uppercase tracking-widest text-red-700 font-bold">
                Loan Insights & Expert Commentary
              </p>
              <h2 className="text-4xl font-bold text-gray-900">
                Essential recent reading, curated for borrowing with genuine confidence.
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {loanArticles.map((article) => (
                <article
                  key={article.title}
                  className="rounded-[2rem] bg-white p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {article.excerpt}
                  </p>
                  <Link
                    href="/contact"
                    className="font-semibold text-[#0E3DAA] hover:text-red-700 transition-colors"
                  >
                    Read more
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-gray-900">
                  Here&apos;s exactly what our loan team does for you, every step of the way.
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Senior private bankers, veteran credit analysts, and dedicated member services specialists collaboratively review every single request together, keeping the entire process fast, radically transparent, and tightly aligned with your broader financial plan.
                </p>
                <ul className="space-y-4">
                  {[
                    "Loan structures thoughtfully recommended around your unique, specific situation",
                    "Underwriting handled with the very highest standards of privacy and discretion",
                    "One dedicated relationship manager with you through the entire loan lifecycle",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-gray-600"
                    >
                      <span className="mt-1 text-red-700">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1758518730384-be3d205838e8?q=80&w=1200&auto=format&fit=crop"
                  alt="Loan advisor"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    <MarketingFooter />
    </>
  );
}
