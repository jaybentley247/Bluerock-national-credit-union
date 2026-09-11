"use client";

import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";
import Link from "next/link";

export default function WhyUsPage() {
  return (
    <>
      <MarketingHeader />
      <main className="min-h-screen bg-white text-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <section className="text-center space-y-4">
            <p className="text-sm uppercase tracking-widest text-red-700 font-bold">
              Why Members Choose Us
            </p>
            <h1 className="text-4xl md:text-5xl font-bold">
              Private banking done differently — personal, secure, and fast when speed actually matters.
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-lg">
              What sets us apart is a combination most institutions can&apos;t pull off together: senior advisors who actually know you, digital tools that work when you need them, and a genuinely discreet relationship with members located anywhere in the world.
            </p>
          </section>

          <section className="rounded-[2rem] bg-[#F8FAFC] p-12 shadow-sm border border-gray-200">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  A partner behind every major financial decision you make.
                </h2>
                <p className="text-gray-600 leading-relaxed mt-4">
                  We guide members through complex financial decisions with solutions built around legacy planning, long-term portfolio growth, and whatever lifestyle financing your goals require.
                </p>
              </div>
              <div>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0E3DAA] px-8 py-4 text-white font-bold hover:bg-red-900 transition-all"
                >
                  Talk to Our Team
                </Link>
              </div>
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                title: "Senior Attention, Every Time",
                detail:
                  "Every member works directly with experienced relationship managers and credit specialists who take the time to actually understand your situation — never a call center, never a stranger.",
              },
              {
                title: "Real Global Reach",
                detail:
                  "Cross-border banking and investment expertise ready wherever your plans take you, across the world's key financial centers.",
              },
              {
                title: "Security & Privacy, By Design",
                detail:
                  "From how our systems are built to how our teams operate day to day, everything is designed to protect your information and keep every interaction confidential.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm hover:shadow-xl transition-shadow"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>

          <section className="space-y-10">
            <div className="grid gap-8 lg:grid-cols-3">
              {[
                {
                  title: "Why Private Banking Matters Right Now",
                  excerpt:
                    "How custom credit structuring, discretion, and hands-on advisory work together to protect and grow your wealth when markets get shaky.",
                  image:
                    "https://images.unsplash.com/photo-1752159684779-0639174cdfac?q=80&w=1200&auto=format&fit=crop",
                },
                {
                  title: "How Tailored Service Builds Real Trust",
                  excerpt:
                    "Why a relationship-first model leads to faster decisions, better advice, and more confidence in every financial move you make.",
                  image:
                    "https://images.unsplash.com/photo-1686771416282-3888ddaf249b?q=80&w=1200&auto=format&fit=crop",
                },
                {
                  title: "Secure Access, Wherever You Are",
                  excerpt:
                    "How secure digital tools, backed by real human oversight, keep your accounts reachable and protected no matter where you travel.",
                  image:
                    "https://images.unsplash.com/photo-1758522484646-c8694d1784fa?q=80&w=1200&auto=format&fit=crop",
                },
              ].map((article) => (
                <article
                  key={article.title}
                  className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div className="h-52 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <section className="grid gap-8 lg:grid-cols-2 items-center rounded-[2rem] bg-[#F8FAFC] p-8 shadow-sm border border-gray-200">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-widest text-red-700 font-bold">
                  In-Depth Perspective
                </p>
                <h2 className="text-3xl font-bold text-gray-900">
                  Straightforward perspective from our team and the partners we work with every day.
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Case studies, editorial commentary, and real examples of how we build lasting private banking relationships focused on steady growth, available liquidity, and solid security.
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0E3DAA] px-8 py-4 text-white font-bold hover:bg-red-900 transition-all"
                >
                  Read Our Insights
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm h-48 sm:h-56">
                  <img
                    src="https://images.unsplash.com/photo-1758691737543-09a1b2b715fa?q=80&w=1200&auto=format&fit=crop"
                    alt="Executive working with client"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm h-48 sm:h-56">
                  <img
                    src="https://images.unsplash.com/photo-1758518729240-7162d07427b8?q=80&w=1200&auto=format&fit=crop"
                    alt="Secure digital banking interface"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="sm:col-span-2 overflow-hidden rounded-[2rem] bg-white shadow-sm h-56 sm:h-64">
                  <img
                    src="https://images.unsplash.com/photo-1763729805496-b5dbf7f00c79?q=80&w=1200&auto=format&fit=crop"
                    alt="Private banking consultation"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </section>
          </section>
        </div>
      </main>
    <MarketingFooter />
    </>
  );
}
