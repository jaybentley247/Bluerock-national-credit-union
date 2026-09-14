'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, ShieldCheck, Phone, MapPin } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/context/auth-context';
import GoogleTranslate from './GoogleTranslate';

const LINKS = [
  { href: '/solutions', label: 'Solutions' },
  { href: '/why-us', label: 'Why Us' },
  { href: '/about', label: 'Our Story' },
  { href: '/contact', label: 'Contact' },
  { href: '/blog', label: 'Blog' },
];

export default function MarketingHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="bg-[#0E3DAA] text-white py-2 hidden md:block">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href="mailto:info@bluerocknational.com" className="flex items-center gap-2 hover:text-red-100 transition-colors">
              <ShieldCheck className="h-4 w-4" />
              <span>info@bluerocknational.com</span>
            </a>
            <a href="tel:+18598686917" className="flex items-center gap-2 hover:text-red-100 transition-colors">
              <Phone className="h-4 w-4" />
              <span>+1 (859) 868-6917</span>
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>George Town, Cayman Islands</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <GoogleTranslate />
            <Link href="/faq" className="hover:text-red-100 transition-colors">Faq</Link>
            <Link href="/career" className="hover:text-red-100 transition-colors">Career</Link>
            <Link href="/support" className="hover:text-red-100 transition-colors">Support</Link>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <Link href="/" className="flex items-center shrink-0 h-full py-1">
            <img src="/blue.png" alt="BLUEROCK NATIONAL CREDIT UNION" className="h-full w-auto object-contain" />
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors ${
                    active ? "text-[#0E3DAA] font-bold" : "text-gray-600 hover:text-[#0E3DAA]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <GoogleTranslate />
            </div>
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="lg:hidden p-2 text-gray-700"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link
              href={user ? '/dashboard' : '/login'}
              className="hidden sm:inline-flex items-center gap-2 border border-gray-900 px-5 py-2.5 text-sm font-semibold tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
            >
              {user ? 'Dashboard' : 'Sign In'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={user ? '/dashboard' : '/register'}
              className="hidden sm:inline-flex items-center gap-2 bg-[#0E3DAA] px-5 py-2.5 text-sm font-semibold tracking-wide text-white hover:bg-red-900 transition-colors"
            >
              {user ? 'My Account' : 'Open an Account'}
            </Link>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-2 py-2.5 text-sm font-medium ${
                  active ? "text-[#0E3DAA] font-bold" : "text-gray-700 hover:text-[#0E3DAA]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={user ? '/dashboard' : '/login'}
            onClick={() => setIsMenuOpen(false)}
            className="block px-2 py-2.5 text-sm font-semibold text-[#0E3DAA]"
          >
            {user ? 'Go to Dashboard' : 'Sign In'}
          </Link>
        </div>
      )}
    </header>
  );
}
