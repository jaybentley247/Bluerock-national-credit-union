'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function MarketingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* CTA strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white max-w-xl leading-tight">
            Let&apos;s build your financial future, together.
          </h2>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#0E3DAA] px-7 py-4 text-sm font-semibold tracking-wide text-white hover:bg-red-900 transition-colors shrink-0"
          >
            Open an Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-5">
          <Link href="/" className="flex items-center gap-2">
            <img src="/blue.png" alt="BLUEROCK NATIONAL CREDIT UNION" className="h-14 w-auto object-contain bg-white rounded p-1" />
            <span className="font-display text-base font-semibold text-white">BLUEROCK NATIONAL</span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
            Distinguished private banking built on trust, discretion, and genuine personal attention.
          </p>
        </div>

        <div className="space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-widest text-slate-500">Company</h5>
          <ul className="space-y-3 text-sm">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/why-us" className="hover:text-white transition-colors">Why Us</Link></li>
            <li><Link href="/career" className="hover:text-white transition-colors">Careers</Link></li>
            <li><Link href="/blog" className="hover:text-white transition-colors">Insights</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-widest text-slate-500">Support</h5>
          <ul className="space-y-3 text-sm">
            <li><Link href="/support" className="hover:text-white transition-colors">Security & Fraud</Link></li>
            <li><Link href="/support" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link href="/about#diversity" className="hover:text-white transition-colors">Diversity & Inclusion</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-widest text-slate-500">Reach Us</h5>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-slate-500" /> +1 (859) 868-6917</li>
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-slate-500" /> info@bluerocknational.com</li>
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-slate-500" /> George Town, Cayman Islands</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© Copyright 2026 BLUEROCK NATIONAL CREDIT UNION. All rights Reserved</p>
          <div className="flex items-center gap-5">
            <Link href="/faq" className="hover:text-slate-300 transition-colors">Faq</Link>
            <Link href="/career" className="hover:text-slate-300 transition-colors">Career</Link>
            <Link href="/support" className="hover:text-slate-300 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
