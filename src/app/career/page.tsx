"use client";

import React from "react";
import Link from "next/link";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

export default function CareerPage() {
  return (
    <>
      <MarketingHeader />
      <main className="min-h-screen bg-white text-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <section className="text-center space-y-4">
            <p className="text-sm uppercase tracking-widest text-red-700 font-bold">
              Careers
            </p>
            <h1 className="text-4xl md:text-5xl font-bold">
              Build a career that actually matters, at the center of modern private banking.
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-lg">
              We're looking for talented people who hold themselves to a high standard — across member service, credit analysis, digital product, and wealth advisory. If you want to do the best work of your career, we'd like to talk.
            </p>
          </section>

          <section className="grid gap-8 lg:grid-cols-3">
            {[
              {
                title: "Private Banking Advisor",
                location: "New York, NY",
                description:
                  "Work directly with members to build lending and wealth-building strategies shaped around their long-term personal and financial goals.",
              },
              {
                title: "Credit Risk Analyst",
                location: "London, UK",
                description:
                  "Evaluate complex lending proposals and structure financing solutions that hold up under real market pressure.",
              },
              {
                title: "Digital Product Lead",
                location: "Remote",
                description:
                  "Take secure, member-focused digital banking products from early concept all the way through to public launch.",
              },
            ].map((job) => (
              <div
                key={job.title}
                className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm hover:shadow-xl transition-shadow"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {job.title}
                </h2>
                <p className="text-red-700 font-semibold mb-4">
                  {job.location}
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {job.description}
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0E3DAA] px-6 py-3 text-white font-semibold hover:bg-red-900 transition-all"
                >
                  Start Application
                </Link>
              </div>
            ))}
          </section>
        </div>
      </main>
    <MarketingFooter />
    </>
  );
}
