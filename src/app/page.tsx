"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  MapPin,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Globe,
  Smartphone,
  Wallet,
  CheckCircle2,
  Star,
  Quote,
} from "lucide-react";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

export default function LandingPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [fadeOut, setFadeOut] = React.useState(false);
  const [heroSlide, setHeroSlide] = React.useState(0);
  const [activeSolution, setActiveSolution] = React.useState(0);
  const [showAllTestimonials, setShowAllTestimonials] = React.useState(false);

  const TESTIMONIALS = [
    { name: "Eleanor Whitfield", role: "Family Office Principal", quote: "From the first call, it was clear this wasn't going to be an ordinary banking relationship. Everything here feels attentive, quietly personal, and carefully thought through." },
    { name: "Julian Meyers", role: "Tech Entrepreneur", quote: "My relationship manager understood my situation better after one meeting than my old bank did after years. The attention to detail is on a different level." },
    { name: "Carmen Ibáñez", role: "Physician & Investor", quote: "The tax planning team found more savings in the first twelve months than I'd budgeted for over the next five years." },
    { name: "Diego Delgado", role: "Real Estate Investor", quote: "International transfers used to be a constant headache with my old bank. Here, the whole process just works without me having to think about it." },
    { name: "Elena Vidal", role: "Retired Executive", quote: "I've banked with a handful of private institutions over the years, and none of them matched the discretion and genuine attentiveness I get here." },
    { name: "Thomas Hughes", role: "Business Owner", quote: "The app is every bit as polished as the people behind it — and given how good the service is, that's a real compliment." },
    { name: "Camille Fontaine", role: "Art Collector & Philanthropist", quote: "Settling a complicated estate is never simple, but their concierge team handled it with more patience and precision than I expected." },
    { name: "Antoine Rousseau", role: "Private Equity Partner", quote: "The investment committee brings a level of institutional discipline to individual portfolios that I haven't seen matched anywhere else in the industry." },
    { name: "Isabelle Laurent", role: "Family Business Heir", quote: "They took real time to understand what our family actually values before recommending anything — that groundwork made all the difference." },
    { name: "Marcus Bennett", role: "Serial Entrepreneur", quote: "Multi-currency accounts, sharp FX guidance, and dependable trade finance, all handled under one roof and done properly." },
    { name: "Grace Whitmore", role: "Retired Judge", quote: "Trust isn't handed out quickly in my line of work. This institution earned mine within the first year of working together." },
    { name: "Julien Béranger", role: "Global Fund Manager", quote: "Managing assets spread across three continents finally feels manageable, thanks to how far their network reaches." },
    { name: "Naomi Clarke", role: "Wealth Advisory Client", quote: "The advice tends to show up before I even realize I need it — that kind of foresight is exactly why I've stayed a member." },
    { name: "Andres Villanueva", role: "Hospitality Group Owner", quote: "Every unusual request I've thrown at them, no matter the timeline, has been met with the same calm professionalism." },
    { name: "Charlotte Bishop", role: "Independent Consultant", quote: "Security was my biggest worry going in. Their layered authentication and account monitoring put that concern to rest almost immediately." },
    { name: "Henry Caldwell", role: "Shipping Magnate", quote: "After decades of banking relationships across my career, this is the first one that feels like an actual partnership instead of a transaction." },
    { name: "Lillian Hartley", role: "Venture Capitalist", quote: "Their advisory team has a habit of flagging market shifts before they happen, which has made a real difference to my portfolio." },
    { name: "Frederick Ashworth", role: "Multi-Generational Client", quote: "Two generations of my family have banked here, and the standard of service has never once dropped." },
  ];

  const SOLUTIONS = [
    {
      title: "Tax Optimization and Advisory",
      image: "https://images.unsplash.com/photo-1763729805496-b5dbf7f00c79?q=80&w=1200&auto=format&fit=crop",
      description:
        "Our tax specialists build detailed, cross-jurisdictional plans designed to help high-net-worth members keep more of what they earn. Every strategy is shaped around your specific situation to reduce liabilities, capture the deductions you're entitled to, and stay compliant as regulations shift around the world.",
      items: [
        "Tailored Tax Strategies",
        "Cross-Border Tax Planning",
        "Estate and Inheritance Tax Planning",
        "Tax-Efficient Investment Strategies",
        "Philanthropy and Charitable Giving",
        "Ongoing Tax Monitoring",
      ],
    },
    {
      title: "Exclusive Investment Opportunities",
      image: "https://images.unsplash.com/photo-1767424412548-1a1ac7f4b9bc?q=80&w=1200&auto=format&fit=crop",
      description:
        "Members get direct access to investment vehicles that rarely reach conventional retail channels — private equity, structured credit, and direct co-investment alongside our institutional partners. Every allocation goes through careful due diligence and is matched to your long-term wealth goals.",
      items: [
        "Private Equity Access",
        "Structured Credit Solutions",
        "Co-Investment Opportunities",
        "Alternative Asset Allocation",
        "Portfolio Diversification Strategy",
        "Dedicated Investment Committee Review",
      ],
    },
    {
      title: "Global Banking Services",
      image: "https://images.unsplash.com/photo-1764591696226-ea4e8d655bc7?q=80&w=1200&auto=format&fit=crop",
      description:
        "Banking shouldn't stop at a border. We support members running international lives and businesses with straightforward multi-currency accounts, cross-border settlement, and a global network built to move your money quickly and securely, wherever it needs to go.",
      items: [
        "Multi-Currency Accounts",
        "Cross-Border Wire Transfers",
        "International Trade Finance",
        "Foreign Exchange Advisory",
        "Offshore Account Structuring",
        "24/7 Global Relationship Support",
      ],
    },
    {
      title: "Exclusive Concierge Services",
      image: "https://images.unsplash.com/photo-1686771416282-3888ddaf249b?q=80&w=1200&auto=format&fit=crop",
      description:
        "Beyond everyday banking, our concierge team takes care of the details that shape daily life — travel arrangements, property coordination, and access to select private events. A dedicated relationship manager handles every request personally, day or night.",
      items: [
        "Dedicated Relationship Manager",
        "Private Travel Coordination",
        "Real Estate & Property Sourcing",
        "Exclusive Event Access",
        "Luxury Lifestyle Management",
        "24/7 Priority Support Line",
      ],
    },
  ];

  const HERO_SLIDES = [
    {
      src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop",
      alt: "City financial district",
    },
  ];

  useEffect(() => {
    if (sessionStorage.getItem('cbl_splash')) {
      setIsLoading(false);
      return;
    }
    sessionStorage.setItem('cbl_splash', '1');
    const fadeTimer = setTimeout(() => setFadeOut(true), 3600);
    const hideTimer = setTimeout(() => setIsLoading(false), 4300);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  return (
    <>
      {/* ── Shimmer Loading Screen ─────────────────────────────────────────── */}
      {isLoading && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "#ffffff",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.85s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none",
        }}>
          <style>{`
            @keyframes cbl-shimmer {
              0%   { transform: translateX(-160%) skewX(-20deg); }
              100% { transform: translateX(360%)  skewX(-20deg); }
            }
            @keyframes cbl-fill {
              0%   { width: 0%;  }
              40%  { width: 45%; }
              70%  { width: 72%; }
              90%  { width: 90%; }
              100% { width: 100%; }
            }
            @keyframes cbl-bar-shine {
              0%   { left: -80%; }
              100% { left: 180%; }
            }
            @keyframes cbl-in    {
              from { opacity:0; transform: translateY(14px); }
              to   { opacity:1; transform: translateY(0);    }
            }
            @keyframes cbl-logo-in {
              0%   { opacity:0; transform: scale(.7) translateY(10px); }
              100% { opacity:1; transform: scale(1) translateY(0); }
            }
            @keyframes cbl-logo-pulse {
              0%, 100% { transform: scale(1);     filter: drop-shadow(0 0 0 rgba(14,61,170,0)); }
              50%      { transform: scale(1.045); filter: drop-shadow(0 10px 24px rgba(14,61,170,.28)); }
            }
            @keyframes cbl-ring-spin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            @media (max-width: 480px) {
              .cbl-ring { width:230px !important; height:230px !important; }
              .cbl-logo-img { width:170px !important; height:auto !important; }
              .cbl-progress { width:180px !important; }
            }
          `}</style>

          {/* Background glow */}
          <div style={{position:"absolute",top:"-15%",left:"-10%",width:"55%",height:"55%",borderRadius:"50%",background:"radial-gradient(circle,rgba(14,61,170,.05) 0%,transparent 70%)",filter:"blur(70px)"}}/>

          {/* ── Logo cluster ── */}
          <div className="cbl-ring" style={{
            position:"relative",width:320,height:320,
            display:"flex",alignItems:"center",justifyContent:"center",
            animation:"cbl-logo-in .9s cubic-bezier(.34,1.56,.64,1) both",
          }}>
            {/* Rolling ring */}
            <div style={{
              position:"absolute",inset:0,borderRadius:"50%",
              border:"3px solid rgba(14,61,170,.12)",
              borderTopColor:"#0E3DAA",
              animation:"cbl-ring-spin 1.6s linear infinite",
            }}/>
            <div style={{position:"relative",textAlign:"center",overflow:"hidden"}}>
              <img
                src="/blue.png"
                alt="BLUEROCK NATIONAL CREDIT UNION"
                className="cbl-logo-img"
                style={{width:240,height:"auto",objectFit:"contain",margin:"0 auto",display:"block",animation:"cbl-logo-pulse 2.6s ease-in-out 1s infinite"}}
              />
              {/* Shimmer sweep across the logo */}
              <div style={{
                position:"absolute",top:0,bottom:0,width:"45%",
                background:"linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent)",
                animation:"cbl-shimmer 2.8s ease-in-out infinite",
                left:0,mixBlendMode:"overlay",
              }}/>
            </div>
          </div>

          {/* Thin divider */}
          <div style={{
            margin:"20px auto 0",width:52,height:1,
            background:"linear-gradient(90deg,transparent,rgba(14,61,170,.5),transparent)",
            animation:"cbl-in .8s ease .4s both",
          }}/>

          {/* Tagline */}
          <p style={{
            margin:"10px 0 0",color:"rgba(14,61,170,.45)",
            fontSize:13,letterSpacing:".06em",fontFamily:"system-ui",
            animation:"cbl-in .8s ease .7s both",
          }}>
            Your financial future, built together
          </p>

          {/* Progress bar */}
          <div className="cbl-progress" style={{
            position:"absolute",bottom:44,left:"50%",transform:"translateX(-50%)",
            width:230,
          }}>
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",marginBottom:7}}>
              <span style={{color:"rgba(0,0,0,.3)",fontSize:9,letterSpacing:".15em",fontFamily:"system-ui"}}>LOADING</span>
            </div>
            <div style={{height:2,background:"rgba(0,0,0,.08)",borderRadius:2,overflow:"hidden",position:"relative"}}>
              {/* Fill */}
              <div style={{
                position:"absolute",inset:0,
                background:"linear-gradient(90deg,#0E3DAA,#3B82F6,#93C5FD)",
                animation:"cbl-fill 3.1s cubic-bezier(.25,.46,.45,.94) forwards",
                borderRadius:2,
              }}/>
              {/* Bar shimmer */}
              <div style={{
                position:"absolute",top:0,bottom:0,width:"35%",
                background:"linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent)",
                animation:"cbl-bar-shine 1.4s ease-in-out infinite",
                left:0,zIndex:1,
              }}/>
            </div>
          </div>

        </div>
      )}
      {/* ── End Loading Screen ──────────────────────────────────────────────── */}

    <div className="min-h-screen bg-white font-sans text-gray-900">
      <MarketingHeader />

      {/* Hero Section — split screen: copy panel + rotating image panel */}
      <section id="hero" className="relative overflow-hidden">
        <style>{`
          @keyframes hero-kb {
            0%   { transform: scale(1.04); }
            100% { transform: scale(1.12); }
          }
          @keyframes hero-kb-alt {
            0%   { transform: scale(1.04) translateX(0%); }
            100% { transform: scale(1.12) translateX(-1.5%); }
          }
          @keyframes shape-blink {
            0%, 100% { opacity: 0; }
            20%, 80%  { opacity: 0.5; }
            50%       { opacity: 0.15; }
          }
        `}</style>

        <div className="relative h-[640px] sm:h-[600px] lg:h-[680px] w-full">
          {/* Rotating full-bleed slides */}
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                opacity: heroSlide === i ? 1 : 0,
                transition: "opacity 1.2s cubic-bezier(0.4,0,0.2,1)",
                zIndex: heroSlide === i ? 1 : 0,
              }}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover"
                style={{
                  animation: heroSlide === i ? `${i % 2 === 0 ? "hero-kb" : "hero-kb-alt"} 6s ease-in-out forwards` : "none",
                }}
              />
            </div>
          ))}

          {/* Gradient overlays for text contrast */}
          <div className="absolute inset-0 bg-black/55 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

          {/* Decorative shape — blinks in on page load */}
          <img
            src="/shape-3.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -right-10 w-64 sm:w-80 lg:w-96 z-10"
            style={{ animation: "shape-blink 3.2s ease-in-out 1" }}
          />

          {/* Copy — headline anchored left, supporting content anchored right */}
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
                {/* Headline — left */}
                <h1 className="font-display text-3xl sm:text-4xl lg:text-6xl font-semibold text-white leading-tight max-w-xl text-left">
                  Wealth management that puts your goals first.{" "}
                  <span className="text-red-400">Real results, member after member.</span>
                </h1>

                {/* Supporting copy, CTAs, stats — right */}
                <div className="max-w-2xl lg:ml-auto space-y-5 sm:space-y-6 text-right">
                  <p className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed">
                    Personal guidance and steady support at every stage of your financial life — from opening your first account to planning what you'll eventually pass on.
                  </p>

                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-end gap-3">
                    <Link
                      href="/loan"
                      className="bg-[#0E3DAA] text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded font-bold text-xs sm:text-sm lg:text-base whitespace-nowrap hover:bg-red-900 transition-all flex items-center gap-2 shadow-lg shadow-black/30"
                    >
                      Apply for a Loan Today
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/contact"
                      className="border-2 border-white/40 text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded font-bold text-xs sm:text-sm lg:text-base whitespace-nowrap hover:border-white hover:bg-white/10 transition-all"
                    >
                      Speak With an Advisor
                    </Link>
                  </div>

                  {/* Trust stats */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-white/20">
                    <div>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">45+</p>
                      <p className="text-[10px] sm:text-xs text-gray-300 font-medium">Years Serving Our Members</p>
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">24/7</p>
                      <p className="text-[10px] sm:text-xs text-gray-300 font-medium">Digital Access, Day or Night</p>
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Bank-Grade</p>
                      <p className="text-[10px] sm:text-xs text-gray-300 font-medium">Encryption &amp; Continuous Monitoring</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="why-us" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h6 className="text-red-700 font-bold uppercase tracking-widest text-sm">
              Why Members Stay
            </h6>
            <h2 className="text-4xl font-bold text-gray-900">
              Banking That <span className="text-red-700">Works Around You</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
              <div className="h-16 w-16 bg-red-50 rounded-lg flex items-center justify-center mb-8 group-hover:bg-red-700 transition-colors">
                <ShieldCheck className="h-8 w-8 text-red-700 group-hover:text-white" />
              </div>
              <h4 className="text-xl font-bold mb-4">Security Built Into Every Step</h4>
              <p className="text-gray-500 leading-relaxed text-sm">
                Security isn't an add-on here, it's the foundation. Strong encryption, layered multi-factor authentication, and regular audits work together continuously to protect your data and every transaction you make.
              </p>
            </div>

            <div className="bg-white p-10 rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
              <div className="h-16 w-16 bg-red-50 rounded-lg flex items-center justify-center mb-8 group-hover:bg-red-700 transition-colors">
                <Wallet className="h-8 w-8 text-red-700 group-hover:text-white" />
              </div>
              <h4 className="text-xl font-bold mb-4">
                Wealth Investment Rewards
              </h4>
              <p className="text-gray-500 leading-relaxed text-sm">
                Our Wealth Investment Rewards program recognizes member loyalty and long-term investment success, pairing personalized strategy with solutions built around where you're actually headed.
              </p>
            </div>

            <div className="bg-white p-10 rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
              <div className="h-16 w-16 bg-red-50 rounded-lg flex items-center justify-center mb-8 group-hover:bg-red-700 transition-colors">
                <Globe className="h-8 w-8 text-red-700 group-hover:text-white" />
              </div>
              <h4 className="text-xl font-bold mb-4">Digital Banking That Keeps Up</h4>
              <p className="text-gray-500 leading-relaxed text-sm">
                Manage your finances from anywhere with a platform built for speed and clarity — instant account access, real-time insight, and secure transactions, all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative border-4 border-red-50">
                <img
                  src="https://images.unsplash.com/photo-1758873269276-9518d0cb4a0b?q=80&w=1000&auto=format&fit=crop"
                  alt="About Us"
                  className="relative w-full"
                />
              </div>
            </div>
            <div className="lg:w-1/2 space-y-6">
              <h6 className="text-red-700 font-bold uppercase tracking-widest text-sm">
                BLUEROCK NATIONAL CREDIT UNION
              </h6>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold leading-tight">
                Building together,{" "}
                <span className="text-red-700">
                  what your wealth can truly become
                </span>
              </h2>
              <p className="text-gray-600 leading-relaxed">
                BLUEROCK NATIONAL CREDIT UNION is a private banking institution built around the specific needs of ambitious, high-net-worth members. Every relationship we form rests on decades of earned trust, and every strategy — wealth management, investment planning, or everyday banking — is shaped around you, not a template.
              </p>
              <div className="pt-4">
                <Link
                  href="/about"
                  className="bg-[#0E3DAA] text-white px-8 py-3.5 rounded font-bold hover:bg-red-900 transition-all flex items-center gap-2 w-fit"
                >
                  Discover More
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row-reverse items-center gap-16 mt-32">
            <div className="lg:w-1/2">
              <div className="relative border-4 border-red-50">
                <img
                  src="https://images.unsplash.com/photo-1758691737543-09a1b2b715fa?q=80&w=1000&auto=format&fit=crop"
                  alt="Values"
                  className="relative w-full"
                />
                <div className="absolute bottom-0 -left-6 bg-slate-950 p-8 shadow-xl z-20 hidden md:block">
                  <h2 className="font-display text-4xl font-semibold text-white">
                    45 <span className="text-xl">Years</span>
                  </h2>
                  <p className="text-slate-400 font-medium">
                    Bank & Finance Service
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-6">
              <h6 className="text-red-700 font-bold uppercase tracking-widest text-sm">
                BLUEROCK NATIONAL CREDIT UNION
              </h6>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Banking That{" "}
                <span className="text-red-700">Actually Adds Value</span>
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We go beyond standard banking to offer a set of solutions built for the realities of managing significant wealth. Each service we craft is designed to strengthen your finances, simplify your day-to-day, and open up new paths for sustained growth.
              </p>
              <div className="pt-4">
                <Link
                  href="/loan"
                  className="bg-[#0E3DAA] text-white px-8 py-3.5 rounded font-bold hover:bg-red-900 transition-all flex items-center gap-2 w-fit"
                >
                  Learn More Today
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Tabs Section */}
      <section id="solutions" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3 space-y-8">
              <div className="space-y-4">
                <h6 className="text-red-700 font-bold uppercase tracking-widest text-sm">
                  Our Services
                </h6>
                <h2 className="text-4xl font-bold">
                  Solutions Built{" "}
                  <span className="text-red-700">Around You, Not a Template</span>
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {SOLUTIONS.map((solution, i) => (
                  <button
                    key={solution.title}
                    onClick={() => setActiveSolution(i)}
                    aria-pressed={activeSolution === i}
                    className={`flex items-center justify-between px-6 py-4 rounded-lg font-bold text-left transition-all group ${
                      activeSolution === i
                        ? "bg-white shadow-sm text-red-700"
                        : "bg-transparent text-gray-700 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    {solution.title}
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:w-2/3">
              <div className="bg-white p-8 lg:p-12 rounded-2xl shadow-sm border border-gray-100">
                <img
                  src={SOLUTIONS[activeSolution].image}
                  alt={SOLUTIONS[activeSolution].title}
                  className="w-full h-72 object-cover rounded-xl mb-10 shadow-lg"
                />
                <h2 className="text-3xl font-bold mb-6">
                  {SOLUTIONS[activeSolution].title}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                  {SOLUTIONS[activeSolution].description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SOLUTIONS[activeSolution].items.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-red-700" />
                      <span className="font-medium text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#0E3DAA] text-white p-10 lg:p-16 shadow-xl overflow-hidden">
            <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-widest text-red-100 font-bold">
                  Featured Insight
                </p>
                <h2 className="text-4xl lg:text-5xl font-bold">
                  So what actually makes BLUEROCK NATIONAL CREDIT UNION different?
                </h2>
                <p className="max-w-2xl text-lg leading-relaxed text-red-100">
                  It comes down to a simple philosophy: discreet advice, smooth digital execution, and genuinely attentive service, working together at every stage of your financial journey.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      title: "Bespoke advisory",
                      description:
                        "Senior relationship managers build complete plans spanning credit, wealth-building, and legacy planning for the next generation.",
                    },
                    {
                      title: "Global execution",
                      description:
                        "Cross-border banking handled with the privacy, speed, and regulatory precision your situation calls for.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-white/10 bg-white/10 p-5"
                    >
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-red-50/90 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/why-us"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-[#0E3DAA] font-bold hover:bg-red-100 transition-all"
                >
                  Read Why Members Choose Us
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4">
                <div className="overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1758518730384-be3d205838e8?q=80&w=1200&auto=format&fit=crop"
                    alt="Private banking conversation"
                    className="h-72 w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1758518729240-7162d07427b8?q=80&w=1200&auto=format&fit=crop"
                    alt="Client insights meeting"
                    className="h-72 w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h6 className="text-red-700 font-bold uppercase tracking-widest text-sm">
              In Members&apos; Own Words
            </h6>
            <h2 className="text-4xl font-bold text-gray-900">
              What our members{" "}
              <span className="text-red-700">actually say about us</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.slice(0, showAllTestimonials ? 18 : 6).map((t) => (
              <div
                key={t.name}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col"
              >
                <Quote className="h-8 w-8 text-red-100 mb-4" fill="currentColor" />
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-red-700" fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed italic flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                  <div className="h-11 w-11 rounded-full bg-red-50 text-red-700 font-bold flex items-center justify-center shrink-0">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setShowAllTestimonials((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#0E3DAA] text-red-700 px-8 py-3 font-bold hover:bg-[#0E3DAA] hover:text-white transition-all"
            >
              {showAllTestimonials ? "Show Less" : "Read More Member Testimonials"}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showAllTestimonials ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Digital Banking Banner */}
      <section className="py-24 bg-[#0E3DAA] text-white relative overflow-hidden">
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl hidden lg:block"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-6">
              <h6 className="text-red-200 font-bold uppercase tracking-widest text-sm">
                Banking Made Simple
              </h6>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Your Whole Account,{" "}
                <span className="text-red-200">In Your Pocket</span>
              </h2>
              <p className="text-red-100 leading-relaxed text-lg opacity-80">
                Handle every account, transfer, and statement from one secure platform, built to keep pace with your life wherever it takes you next.
              </p>
            </div>
            <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all">
                <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6 text-[#0E3DAA]" />
                </div>
                <h5 className="text-lg font-bold mb-3">
                  Multi-Factor Authentication
                </h5>
                <p className="text-red-100/70 text-sm">
                  An extra layer of protection that confirms it's really you, every single time you sign in.
                </p>
              </div>
              <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all">
                <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center mb-6">
                  <Smartphone className="h-6 w-6 text-[#0E3DAA]" />
                </div>
                <h5 className="text-lg font-bold mb-3">Real-Time Monitoring</h5>
                <p className="text-red-100/70 text-sm">
                  Round-the-clock account monitoring that catches unusual
                  activity early, before it turns into a problem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h6 className="text-red-700 font-bold uppercase tracking-widest text-sm">
              From the BLUEROCK Journal
            </h6>
            <h2 className="text-4xl font-bold text-gray-900">
              Insight, commentary,{" "}
              <span className="text-red-700">and market perspective</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 flex flex-col h-full"
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={`https://images.unsplash.com/photo-${i === 1 ? "1752159684779-0639174cdfac" : i === 2 ? "1758522484646-c8694d1784fa" : "1750277120336-ca98ec2e2f90"}?q=80&w=800&auto=format&fit=crop`}
                    alt="Blog post"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#0E3DAA]">
                    Finance
                  </div>
                </div>
                <div className="p-8 space-y-4 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> By admin
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Oct 19, 2024
                    </span>
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-red-700 transition-colors">
                    {i === 1
                      ? "How to Pick the Checking Account That Actually Fits You"
                      : i === 2
                        ? "What Goes Into Service That Actually Stands Out"
                        : "Modern Approaches to Better Financial Planning"}
                  </h3>
                  <div className="pt-4 mt-auto">
                    <Link
                      href="/loan"
                      className="text-gray-900 font-bold flex items-center gap-2 group-hover:text-red-700 transition-colors"
                    >
                      Discover More Today
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
    </>
  );
}
