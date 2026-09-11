'use client';

import React from 'react';
import Link from 'next/link';
import MarketingHeader from '@/components/layout/MarketingHeader';
import MarketingFooter from '@/components/layout/MarketingFooter';

export default function AboutPage() {
  return (
    <>
      <MarketingHeader />
      <main className="min-h-screen bg-white text-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <section className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-widest text-red-700 font-bold">Who We Are</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">A member-first institution built on real trust, quiet discretion, and service that never feels like just a transaction.</h1>
            <p className="text-gray-600 leading-relaxed text-lg">
              We started BLUEROCK NATIONAL CREDIT UNION around one idea: good financial guidance shouldn&apos;t come at the cost of warmth or transparency. We work with members through customized wealth management, private lending, and banking designed for people whose lives cross time zones and borders. It starts with listening — our advisors combine strong digital tools with a genuinely personal approach, so every member moves toward their goals with real confidence, at every stage.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-red-50 p-6 shadow-sm">
                <h2 className="text-3xl font-bold text-[#0E3DAA]">45+</h2>
                <p className="text-gray-600 mt-2">Decades of combined experience behind every conversation we have with members.</p>
              </div>
              <div className="rounded-3xl bg-red-50 p-6 shadow-sm">
                <h2 className="text-3xl font-bold text-[#0E3DAA]">Global</h2>
                <p className="text-gray-600 mt-2">A support network reaching the world&apos;s major financial centers, on hand whenever you need it.</p>
              </div>
            </div>
            <Link href="/loan" className="inline-flex items-center gap-2 rounded-full bg-[#0E3DAA] px-8 py-4 text-white font-bold hover:bg-red-900 transition-all">
              Explore Our Lending Options
            </Link>
          </div>
          <div className="grid gap-6">
            <img src="https://images.unsplash.com/photo-1758448500688-3ababa93fd67?q=80&w=1000&auto=format&fit=crop" alt="Private banking team" className="rounded-[2rem] shadow-2xl object-cover h-96 w-full" />
            <img src="https://images.unsplash.com/photo-1746173098013-6ae3c31e073f?q=80&w=1000&auto=format&fit=crop" alt="Client consultation" className="rounded-[2rem] shadow-2xl object-cover h-72 w-full" />
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-3">
          {[
            {
              title: 'Private Wealth Management',
              description: 'Carefully built portfolios and multi-generational succession planning, designed for members whose assets and ambitions cross borders.',
            },
            {
              title: 'Tailored Credit Solutions',
              description: 'Lending structured around your investment timeline, upcoming purchases, and the life you are building for your family.',
            },
            {
              title: 'Concierge Banking',
              description: 'An always-available service team ready for custom banking requests, treasury needs, and even complicated travel arrangements.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[2rem] bg-white p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </section>

        <section id="diversity" className="bg-gray-50 rounded-[2rem] p-10 shadow-sm">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">Built with sustainability, real inclusion, and shared prosperity in mind for every member we serve.</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                We reinvest directly in the people, businesses, and neighborhoods that make up our community. Quality private banking shouldn&apos;t be reserved for a select few — it should be open to a wide, diverse membership, without ever cutting corners on compliance, trust, or how responsibly we manage what is entrusted to us.
              </p>
            </div>
            <div className="grid gap-6">
              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-3">Invested in the Communities We Serve</h3>
                <p className="text-gray-600 leading-relaxed">We work directly with local entrepreneurs, small businesses, and charitable foundations to create impact that goes beyond a balance sheet, all while protecting member privacy and staying financially sound.</p>
              </div>
              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-3">Transparent, Accountable Stewardship</h3>
                <p className="text-gray-600 leading-relaxed">Careful risk management and firm ethical standards mean every recommendation we make stays aligned with what actually matters to you and your family&apos;s future.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    <MarketingFooter />
    </>
  );
}
