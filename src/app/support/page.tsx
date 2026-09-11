'use client';

import MarketingHeader from '@/components/layout/MarketingHeader';
import MarketingFooter from '@/components/layout/MarketingFooter';

const resources = [
  {
    title: 'Safety & Fraud Prevention',
    summary: 'The practices we use to keep your accounts protected, and how to report suspicious activity as soon as you spot it.',
  },
  {
    title: 'Lost or Stolen Cards',
    summary: 'Lock your card instantly from anywhere and get a replacement quickly, so your funds stay secure without delay.',
  },
  {
    title: 'Terms & Conditions',
    summary: 'Account terms, lending disclosures, and how we handle your privacy, all gathered clearly in one place.',
  },
];

export default function SupportPage() {
  return (
    <>
      <MarketingHeader />
      <main className="min-h-screen bg-white text-gray-900 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm uppercase tracking-widest text-red-700 font-bold">Member Support</p>
          <h1 className="text-4xl md:text-5xl font-bold">Support that's actually ready when you need it.</h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-lg">
            From everyday account questions to loan applications, digital access, card security, and compliance — our support team is here to help.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {resources.map((resource) => (
            <div key={resource.title} className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{resource.title}</h2>
              <p className="text-gray-600 leading-relaxed">{resource.summary}</p>
            </div>
          ))}
        </div>

        <section className="mt-16 rounded-[2rem] bg-[#0E3DAA] p-12 text-white shadow-xl">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Emergency support, available around the clock.</h2>
              <p className="text-red-100 leading-relaxed text-lg">
                Suspected fraud, a card that needs immediate replacement, or any urgent account issue — our team is on call every day of the year to secure your account and restore access quickly.
              </p>
            </div>
            <div className="space-y-4 text-red-100">
              <div>
                <p className="text-sm uppercase tracking-widest text-red-200 font-semibold">Phone</p>
                <p className="text-2xl font-bold">+1 (859) 868-6917</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-red-200 font-semibold">Email</p>
                <p className="text-2xl font-bold">info@bluerocknational.com</p>
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
