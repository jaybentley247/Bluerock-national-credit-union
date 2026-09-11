'use client';

import MarketingHeader from '@/components/layout/MarketingHeader';
import MarketingFooter from '@/components/layout/MarketingFooter';
import Link from 'next/link';

const articles = [
  {
    title: "What's Next for Private Banking in a Digital World",
    description: 'How private banking is changing through secure apps, data-driven insight, and a concierge experience built for members with genuinely global lives.',
  },
  {
    title: 'Choosing the Right Loan Structure for Your Business',
    description: 'A practical look at loan terms, collateral choices, and repayment models suited to business growth and steady liquidity.',
  },
  {
    title: 'Why Wealth Managers Are Moving Toward Sustainable Strategies',
    description: 'Why more high-net-worth investors are turning to ESG frameworks, and how private institutions are responding.',
  },
];

export default function BlogPage() {
  return (
    <>
      <MarketingHeader />
      <main className="min-h-screen bg-white text-gray-900 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <section className="text-center space-y-4">
          <p className="text-sm uppercase tracking-widest text-red-700 font-bold">Insights & News</p>
          <h1 className="text-4xl md:text-5xl font-bold">Perspective on where modern private finance is headed.</h1>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-lg">
            Commentary on private lending, wealth strategy, digital banking, and the market trends that matter most to our members.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          {articles.map((post) => (
            <article key={post.title} className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{post.description}</p>
              <Link href="/loan" className="font-semibold text-[#0E3DAA] hover:text-red-700 transition-colors">
                Read more
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
    <MarketingFooter />
    </>
  );
}
