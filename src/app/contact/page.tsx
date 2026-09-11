"use client";

import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <MarketingHeader />
      <main className="min-h-screen bg-white text-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <section className="text-center space-y-4">
            <p className="text-sm uppercase tracking-widest text-red-700 font-bold">
              Get in Touch
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold">
              Reach our private banking team whenever and wherever you need us.
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-lg">
              Whether you're applying for a loan, looking for portfolio guidance, or just have questions about what we offer, our team is ready to help quickly and in complete confidence.
            </p>
          </section>

          <section className="grid gap-10 lg:grid-cols-2 items-start">
            <div className="space-y-8">
              <div className="rounded-[2rem] bg-red-50 p-10 shadow-sm border border-red-100">
                <div className="flex items-center gap-4 mb-6">
                  <MapPin className="h-8 w-8 text-[#0E3DAA]" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      Corporate Headquarters
                    </h2>
                    <p className="text-gray-600">
                      Fort Street Chambers, 45 Fort Street, George Town, Grand Cayman KY1-1106, Cayman Islands
                    </p>
                  </div>
                </div>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-red-700 mt-1" />
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p>+1 (859) 868-6917</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-red-700 mt-1" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p>info@bluerocknational.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-red-700 mt-1" />
                    <div>
                      <p className="font-semibold">Business Hours</p>
                      <p>Mon – Fri, 8:30 AM – 6:00 PM (Cayman Islands Time, UTC-5)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-gray-50 p-10 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <MapPin className="h-8 w-8 text-[#0E3DAA]" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      Branch Office — New York
                    </h2>
                    <p className="text-gray-600">
                      1180 Avenue of the Americas, 8th Floor, New York, NY 10036, United States
                    </p>
                  </div>
                </div>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-red-700 mt-1" />
                    <div>
                      <p className="font-semibold">Business Hours</p>
                      <p>Mon – Fri, 9:00 AM – 5:30 PM (Eastern Time, ET)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1758448093806-88b2089068ab?q=80&w=1200&auto=format&fit=crop"
                  alt="Office lobby"
                  className="w-full h-72 object-cover"
                />
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-gray-100">
              <h2 className="text-3xl font-bold mb-6">Need help right now? We&apos;re here.</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Our concierge service handles credit applications, new account setup, and transaction support. Submit your request below and a senior advisor will follow up within one business day — often sooner.
              </p>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <p className="font-bold text-gray-900">
                    Private Lending Inquiries
                  </p>
                  <p className="text-gray-600 mt-2">
                    Get clear answers on loan options, borrowing structures, and exactly what documentation you&apos;ll need before applying.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <p className="font-bold text-gray-900">
                    Wealth Advisory Services
                  </p>
                  <p className="text-gray-600 mt-2">
                    Sit down with an experienced advisor to talk through investment strategy, tax planning, and long-term estate planning for your family.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <p className="font-bold text-gray-900">
                    Account Setup & Onboarding
                  </p>
                  <p className="text-gray-600 mt-2">
                    Start a guided onboarding process for a personal or business account, handled start to finish by a member of our team.
                  </p>
                </div>
              </div>
              <div className="mt-10">
                <Link
                  href="/loan"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0E3DAA] px-8 py-4 text-white font-bold hover:bg-red-900 transition-all"
                >
                  Start Your Loan Application
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
