"use client";

import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";
import Link from "next/link";

export default function SolutionsPage() {
  return (
    <>
      <MarketingHeader />
      <main className="min-h-screen bg-white text-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <section className="text-center space-y-4">
          <p className="text-sm uppercase tracking-widest text-red-700 font-bold">
            What We Offer
          </p>
          <h1 className="text-4xl md:text-5xl font-bold">
            Banking solutions shaped around what actually matters to you.
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-lg">
            A full range of private banking services built to support liquidity, steady growth, and long-term wealth preservation, across both your personal and business finances.
          </p>
        </section>

        <section className="grid gap-10 lg:grid-cols-2 items-center rounded-[2rem] bg-[#0E3DAA] p-12 text-white shadow-xl">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">Looking for a strategy built specifically for you?</h2>
            <p className="text-red-100 leading-relaxed text-lg">
              Our team will build a plan around your credit, investment, and liquidity needs, with your privacy respected at every step.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[#0E3DAA] font-bold hover:bg-red-100 transition-all"
            >
              Connect With an Advisor
            </Link>
          </div>
          <div className="grid gap-6">
            <div className="rounded-[2rem] overflow-hidden shadow-sm border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1758873269276-9518d0cb4a0b?q=80&w=1200&auto=format&fit=crop"
                alt="Financial planning"
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="rounded-[2rem] overflow-hidden shadow-sm border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1746173098013-6ae3c31e073f?q=80&w=1200&auto=format&fit=crop"
                alt="Banking meeting"
                className="w-full h-72 object-cover"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          {[
            {
              title: "Private Credit & Lending",
              description:
                "Discreet lending for property purchases, business expansion, and lifestyle financing, structured around a repayment plan built specifically for you.",
            },
            {
              title: "Wealth Advisory & Planning",
              description:
                "Forward-looking wealth planning from experienced advisors, informed by strategies that reach across global markets.",
            },
            {
              title: "Digital Banking & Treasury",
              description:
                "Real-time digital access for managing accounts, moving payments instantly, and tracking cash flow, secured at every step.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm hover:shadow-xl transition-shadow"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {item.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
    <MarketingFooter />
    </>
  );
}
