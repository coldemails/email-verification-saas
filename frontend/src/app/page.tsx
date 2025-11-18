'use client';

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Hero3D from "./Hero3D";

// Counter animation hook
function useCountUp(end: number, duration: number = 2000, shouldStart: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, shouldStart]);

  return count;
}

// Intersection Observer hook
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, isInView };
}

export default function Home() {
  const { ref: statsRef, isInView: statsInView } = useInView({ threshold: 0.3 });
  const { ref: dashboardRef, isInView: dashboardInView } = useInView({ threshold: 0.2 });
  
  const [animationKey, setAnimationKey] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const validCount = useCountUp(861, 1500, dashboardInView || isHovered);
  const invalidCount = useCountUp(8, 1500, dashboardInView || isHovered);
  const unknownCount = useCountUp(28, 1500, dashboardInView || isHovered);
  const totalCount = useCountUp(897, 1500, dashboardInView || isHovered);
  const emailsPerMin = useCountUp(1770, 1850, statsInView);
  
  const [progress, setProgress] = useState(0);

  // Reset and restart animation on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    setProgress(0);
    setAnimationKey(prev => prev + 1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (dashboardInView || isHovered) {
      setProgress(0); // Reset progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 96) {
            clearInterval(interval);
            return 96;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [dashboardInView, isHovered, animationKey]);

  return (
    <main className="min-h-screen bg-white antialiased">
      {/* Navigation */}
    {/* Navigation */}
<nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/50 z-50 transition-all duration-300">
  <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 md:py-5 flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center gap-2 md:gap-3">
      <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[10px] shadow-sm"></div>
      <span className="font-semibold text-[15px] md:text-[17px] tracking-tight text-slate-900">OnlyValidEmails</span>
    </div>
    
    {/* Desktop Menu - Hidden on mobile */}
    <div className="hidden md:flex items-center gap-10">
      <Link href="#features" className="text-[15px] text-slate-600 hover:text-slate-900 transition-colors duration-200">
        Features
      </Link>
      <Link href="#pricing" className="text-[15px] text-slate-600 hover:text-slate-900 transition-colors duration-200">
        Pricing
      </Link>
      <Link href="#faq" className="text-[15px] text-slate-600 hover:text-slate-900 transition-colors duration-200">
        FAQ
      </Link>
    </div>
    
    {/* CTA Buttons */}
    <div className="flex items-center gap-2 md:gap-4">
      {/* Hide "Sign in" on small mobile */}
      <Link href="/login" className="hidden sm:block text-[14px] md:text-[15px] text-slate-600 hover:text-slate-900 transition-colors duration-200 px-3 md:px-4 py-2">
        Sign in
      </Link>
      <Link
        href="/register"
        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[13px] md:text-[15px] px-5 md:px-6 py-2 md:py-2.5 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
      >
        Get started
      </Link>
    </div>
  </div>
</nav>

      {/* Hero Section with 3D */}
    {/* Hero Section with 3D */}
<section className="pt-28 sm:pt-32 md:pt-40 pb-16 md:pb-32 px-4 md:px-8">
  <div className="max-w-[980px] mx-auto text-center mb-12 md:mb-16">
    {/* Badge */}
    <div className="inline-block mb-6 md:mb-8 animate-fade-in-up">
      <span className="bg-cyan-50 text-cyan-700 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[12px] md:text-[14px] font-medium tracking-tight border border-cyan-200/50">
        ✨ The simplest & fastest way to verify emails
      </span>
    </div>

    {/* Main Heading */}
    <h1 className="text-[42px] sm:text-[56px] md:text-[72px] lg:text-[84px] font-semibold mb-5 md:mb-7 leading-[0.95] tracking-tighter animate-fade-in-up animation-delay-100 text-slate-900">
      Only Valid Emails.
      <br />
      <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        Every Time.
      </span>
    </h1>

    {/* Subheading */}
    <p className="text-[16px] sm:text-[18px] md:text-[21px] text-slate-600 mb-8 md:mb-12 max-w-[720px] mx-auto leading-relaxed font-normal tracking-tight animate-fade-in-up animation-delay-200 px-4 md:px-0">
      Backed by our 12-Layer Verification System — combining DNS, SMTP, spam-trap, blacklist, and risk analysis for
      unmatched accuracy.
    </p>

    {/* CTA Buttons */}
    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center mb-6 md:mb-8 animate-fade-in-up animation-delay-300 px-4 md:px-0">
      <Link
        href="/register"
        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 md:px-9 py-3.5 md:py-4 rounded-full text-[15px] md:text-[17px] font-medium hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] text-center"
      >
        Start verifying for free →
      </Link>
      <Link
        href="#pricing"
        className="bg-white border border-slate-200 text-slate-700 px-8 md:px-9 py-3.5 md:py-4 rounded-full text-[15px] md:text-[17px] font-medium hover:border-slate-300 hover:shadow-md transition-all duration-300 active:scale-[0.98] text-center"
      >
        View pricing
      </Link>
    </div>

    {/* Trust Badges */}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-[13px] md:text-[14px] text-slate-500 animate-fade-in-up animation-delay-400">
      <div className="flex items-center gap-2.5">
        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>No credit card required</span>
      </div>
      <div className="flex items-center gap-2.5">
        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>Start in seconds</span>
      </div>
    </div>
  </div>

  {/* 3D Interactive Hero */}
  <Hero3D />
</section>

      {/* Rest of your sections remain the same... I'll continue in next file to keep this manageable */}
      {/* Interactive Dashboard Preview */}
<section ref={dashboardRef} className="py-20 md:py-32 px-4 md:px-8 bg-white">
  <div className="max-w-[1400px] mx-auto">
    {/* Section Header */}
    <div className="text-center mb-12 md:mb-16">
      <h2 className="text-[32px] sm:text-[42px] md:text-[52px] font-semibold mb-4 md:mb-5 tracking-tighter">
        See it in action
      </h2>
      <p className="text-[16px] md:text-[19px] text-gray-600 tracking-tight max-w-[720px] mx-auto px-4 md:px-0">
        Watch as your emails get verified in real-time with our lightning-fast processing engine
      </p>
    </div>

    {/* Animated Dashboard Mock */}
    <div 
      className="relative max-w-[1200px] mx-auto cursor-pointer group/dashboard"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-violet-500/10 blur-3xl rounded-[40px] group-hover/dashboard:from-blue-500/20 group-hover/dashboard:to-violet-500/20 transition-all duration-500"></div>
      
      <div className="relative bg-white rounded-[24px] md:rounded-[32px] shadow-2xl border border-gray-200 p-6 md:p-8 lg:p-12 group-hover/dashboard:shadow-3xl group-hover/dashboard:border-violet-200/50 transition-all duration-500"
        key={animationKey}
      >
        {/* File Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-[12px] md:rounded-[14px] bg-blue-50 flex items-center justify-center">
              <span className="text-[20px] md:text-[24px]">📄</span>
            </div>
            <div>
              <h3 className="text-[17px] md:text-[20px] font-semibold tracking-tight">file.csv</h3>
              <p className="text-[12px] md:text-[14px] text-gray-500">Added on Just now</p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3">
            <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-600 rounded-[12px] text-[13px] md:text-[14px] font-medium hover:bg-blue-100 transition-colors">
              Export
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-[12px] text-[13px] md:text-[14px] font-medium hover:bg-blue-700 transition-colors">
              Statistics
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div>
            <p className="text-[12px] md:text-[14px] text-gray-600 mb-2 tracking-tight">Valid Emails</p>
            <p className="text-[32px] md:text-[42px] font-semibold tracking-tighter">{validCount}</p>
            <p className="text-[11px] md:text-[13px] text-gray-500">96% of total</p>
          </div>
          <div>
            <p className="text-[12px] md:text-[14px] text-gray-600 mb-2 tracking-tight">Invalid Emails</p>
            <p className="text-[32px] md:text-[42px] font-semibold tracking-tighter">{invalidCount}</p>
            <p className="text-[11px] md:text-[13px] text-gray-500">1% of total</p>
          </div>
          <div>
            <p className="text-[12px] md:text-[14px] text-gray-600 mb-2 tracking-tight">Unknown / Catch-all</p>
            <p className="text-[32px] md:text-[42px] font-semibold tracking-tighter">{unknownCount}</p>
            <p className="text-[11px] md:text-[13px] text-gray-500">3% of total</p>
          </div>
          <div>
            <p className="text-[12px] md:text-[14px] text-gray-600 mb-2 tracking-tight">Total Processed</p>
            <p className="text-[32px] md:text-[42px] font-semibold tracking-tighter">{totalCount}</p>
            <p className="text-[11px] md:text-[13px] text-green-600 font-medium flex items-center justify-start gap-2">
              {progress < 96 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
              {progress >= 96 ? '100% completed' : `${progress}% processing...`}
            </p>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="mb-6 md:mb-8">
          <div className="h-8 md:h-10 bg-gray-100 rounded-[12px] overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out flex items-center justify-center"
              style={{ width: `${progress}%` }}
            >
              {progress > 10 && (
                <span className="text-white font-semibold text-[12px] md:text-[14px]">{progress}%</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 md:gap-6 mt-3 md:mt-4 text-[12px] md:text-[13px]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Valid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Invalid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">Unknown</span>
            </div>
          </div>
        </div>

        {/* Verification Summary */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 pt-6 border-t border-gray-100">
          <div>
            <h4 className="text-[15px] md:text-[17px] font-semibold mb-3 md:mb-4 tracking-tight">Verification Summary</h4>
            <div className="space-y-2 md:space-y-3 text-[14px] md:text-[15px]">
              <div className="flex items-center gap-3">
                <span className="text-purple-600">⏱</span>
                <span className="text-gray-600">Processing Time: <strong>20s</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-purple-600">⚡</span>
                <span className="text-gray-600">Average Speed: <strong>44 emails/second</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-600">Status: <strong className="text-green-600">Completed</strong></span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[15px] md:text-[17px] font-semibold mb-3 md:mb-4 tracking-tight">Verification Methods Applied</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] md:text-[13px]">
              {['SMTP Verification', 'DNS Validation', 'Syntax Check', 'Disposable Detection', 
                'Catch All Detection', 'Blacklist Check', 'Role Account Detection', 'Typo Correction',
                'Spam Trap Check', 'Greylist Handling', 'Reputation Lookup', 'Deliverability Score'].map((method, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2 text-gray-600"
                  style={{
                    animation: dashboardInView ? `fadeIn 0.3s ease-out ${i * 0.05}s forwards` : 'none',
                    opacity: 0
                  }}
                >
                  <span className="text-green-600 text-[14px]">✓</span>
                  <span className="tracking-tight">{method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

   {/* Main Features */}
<section id="features" className="py-20 md:py-32 px-4 md:px-8 bg-white">
  <div className="max-w-[1200px] mx-auto">
    {/* Section Header */}
    <div className="text-center mb-12 md:mb-20">
      <h2 className="text-[32px] sm:text-[42px] md:text-[52px] font-semibold mb-4 md:mb-5 tracking-tighter">
        A verifier like no other
      </h2>
      <p className="text-[16px] md:text-[19px] text-gray-600 max-w-[720px] mx-auto tracking-tight leading-relaxed px-4 md:px-0">
        OnlyValidEmails makes it simple to clean your email lists. No technical skills needed—just upload and verify.
      </p>
    </div>

    {/* Features Grid */}
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
      {[
        { emoji: '⚡', color: 'purple', title: 'Lightning fast', desc: 'Process 2,500 emails per minute. Verify 100k emails in under 40 minutes.' },
        { emoji: '🎯', color: 'blue', title: '97% accuracy', desc: 'Industry-leading accuracy on Gmail, Outlook, and all major providers.' },
        { emoji: '💰', color: 'green', title: 'Best pricing', desc: 'Pay as you go. No subscriptions. Credits never expire.' },
        { emoji: '🔒', color: 'orange', title: 'Privacy first', desc: 'Your data is encrypted and automatically deleted after 30 days.' },
        { emoji: '📊', color: 'pink', title: 'Real-time results', desc: 'Watch your verification progress live with instant CSV export.' },
        { emoji: '✨', color: 'indigo', title: 'Simple to use', desc: 'Upload CSV → Verify → Download. That\'s it. No learning curve.' }
      ].map((feature, i) => (
        <div 
          key={i} 
          className={`bg-gradient-to-br from-${feature.color}-50/80 to-${feature.color === 'purple' ? 'pink' : feature.color === 'orange' ? 'yellow' : feature.color === 'indigo' ? 'purple' : feature.color}-50/80 p-8 md:p-10 rounded-[24px] md:rounded-[28px] hover:shadow-xl hover:shadow-${feature.color}-500/10 transition-all duration-500 border border-${feature.color}-100/50 group`}
        >
          <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-${feature.color}-500 to-${feature.color === 'purple' ? 'fuchsia' : feature.color === 'blue' ? 'cyan' : feature.color === 'green' ? 'emerald' : feature.color === 'orange' ? 'amber' : feature.color === 'pink' ? 'rose' : 'purple'}-500 rounded-[14px] md:rounded-[16px] flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-${feature.color}-500/25 group-hover:scale-110 transition-transform duration-300`}>
            <span className="text-[24px] md:text-[28px]">{feature.emoji}</span>
          </div>
          <h3 className="text-[20px] md:text-[24px] font-semibold mb-3 md:mb-4 tracking-tight">{feature.title}</h3>
          <p className="text-gray-600 leading-relaxed text-[15px] md:text-[16px] tracking-tight">{feature.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* How It Works */}
      <section className="py-32 px-8 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-[52px] font-semibold mb-5 tracking-tighter">Just three simple steps</h2>
            <p className="text-[21px] text-gray-600 tracking-tight">No technical knowledge required. Start verifying in seconds.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: '1', title: 'Upload your CSV', desc: 'Drag and drop your email list. We\'ll automatically detect the format.' },
              { num: '2', title: 'Watch the magic', desc: 'We verify each email with SMTP, DNS, and syntax checks in real-time.' },
              { num: '3', title: 'Download results', desc: 'Get your clean list instantly. Only valid emails, ready to send.' }
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-violet-500 to-fuchsia-400 rounded-full flex items-center justify-center text-white text-[26px] font-semibold mx-auto mb-8 shadow-xl shadow-violet-500/25 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-violet-500/30 transition-all duration-300">
                  {step.num}
                </div>
                <h3 className="text-[24px] font-semibold mb-4 tracking-tight">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-[17px] tracking-tight">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
 {/* Pricing Section */}
<section id="pricing" className="py-20 md:py-32 px-4 md:px-8 bg-white">
  <div className="max-w-[1400px] mx-auto">
    {/* Section Header */}
    <div className="text-center mb-16 md:mb-24">
      <h2 className="text-[32px] sm:text-[42px] md:text-[52px] font-semibold mb-4 md:mb-5 tracking-tighter">
        Simple, transparent pricing
      </h2>
      <p className="text-[17px] md:text-[21px] text-gray-600 max-w-[720px] mx-auto tracking-tight px-4 md:px-0">
        Pay as you go. No subscriptions. No hidden fees. Credits never expire.
      </p>
    </div>

    {/* Pricing Cards */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-[1200px] mx-auto">
      
      {/* Starter */}
      <div className="bg-white border border-gray-200 rounded-[24px] md:rounded-[28px] p-8 md:p-10 hover:border-gray-300 hover:shadow-xl transition-all duration-500">
        <div className="mb-8 md:mb-10">
          <h3 className="text-[20px] md:text-[24px] font-semibold mb-3 tracking-tight">Starter</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[48px] md:text-[56px] font-semibold tracking-tighter">$2.95</span>
          </div>
          <p className="text-gray-500 mt-3 text-[14px] md:text-[15px] tracking-tight">1,000 emails</p>
        </div>
        <Link href="/register" className="block w-full bg-gray-100 text-center text-gray-700 py-3.5 rounded-full font-medium text-[14px] md:text-[15px] hover:bg-gray-200 transition-all duration-300 mb-8 md:mb-10">
          Get started
        </Link>
        <div className="space-y-3 md:space-y-4 text-[14px] md:text-[15px]">
          {['SMTP verification', 'DNS validation', 'Instant CSV export'].map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600 tracking-tight">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Popular - 10k */}
      <div className="bg-gradient-to-br from-blue-600 via-violet-500 to-fuchsia-400 text-white rounded-[24px] md:rounded-[28px] p-8 md:p-10 relative overflow-hidden shadow-2xl md:transform md:scale-[1.05] border border-white/20">
        <div className="absolute top-4 md:top-5 right-4 md:right-5 bg-white text-purple-600 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[11px] md:text-[12px] font-semibold uppercase tracking-wide">
          Popular
        </div>
        <div className="mb-8 md:mb-10">
          <h3 className="text-[20px] md:text-[24px] font-semibold mb-3 tracking-tight">Growth</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[48px] md:text-[56px] font-semibold tracking-tighter">$9.95</span>
          </div>
          <p className="text-purple-100 mt-3 text-[14px] md:text-[15px] tracking-tight">10,000 emails</p>
        </div>
        <Link href="/register" className="block w-full bg-white text-purple-600 text-center py-3.5 rounded-full font-medium text-[14px] md:text-[15px] hover:bg-purple-50 transition-all duration-300 mb-8 md:mb-10">
          Get started
        </Link>
        <div className="space-y-3 md:space-y-4 text-[14px] md:text-[15px]">
          {['Everything in Starter', 'Disposable email detection', 'Real-time progress', 'Priority support'].map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="tracking-tight">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise - 100k */}
      <div className="bg-white border border-gray-200 rounded-[24px] md:rounded-[28px] p-8 md:p-10 hover:border-gray-300 hover:shadow-xl transition-all duration-500">
        <div className="mb-8 md:mb-10">
          <h3 className="text-[20px] md:text-[24px] font-semibold mb-3 tracking-tight">Enterprise</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[48px] md:text-[56px] font-semibold tracking-tighter">$74.95</span>
          </div>
          <p className="text-gray-500 mt-3 text-[14px] md:text-[15px] tracking-tight">100,000 emails</p>
        </div>
        <Link href="/register" className="block w-full bg-gradient-to-r from-blue-600 via-violet-500 to-fuchsia-400 text-center text-white py-3.5 rounded-full font-medium text-[14px] md:text-[15px] hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 mb-8 md:mb-10">
          Get started
        </Link>
        <div className="space-y-3 md:space-y-4 text-[14px] md:text-[15px]">
          {['Everything in Growth', 'Best value (60% savings)', 'Dedicated support'].map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600 tracking-tight">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* View All Link */}
    <div className="text-center mt-12 md:mt-16">
      <Link href="/pricing" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-[14px] md:text-[15px] hover:gap-3 transition-all duration-300">
        View all pricing options →
      </Link>
    </div>
  </div>
</section>

{/* FAQ Section */}
<section id="faq" className="py-20 md:py-32 px-4 md:px-8 bg-gray-50/50">
  <div className="max-w-[800px] mx-auto">
    {/* Section Header */}
    <div className="text-center mb-12 md:mb-20">
      <h2 className="text-[32px] sm:text-[42px] md:text-[52px] font-semibold mb-4 tracking-tighter">
        Questions & answers
      </h2>
    </div>

    {/* FAQ Items */}
    <div className="space-y-3 md:space-y-4">
      {[
        { q: 'How accurate is the verification?', a: 'We achieve 97% accuracy on Gmail, Outlook, and all major email providers. We use multiple verification methods including SMTP, DNS, and syntax validation to ensure the highest accuracy.' },
        { q: 'Do credits expire?', a: 'No! Your credits never expire. Buy once and use them whenever you need. No pressure, no subscriptions.' },
        { q: 'Is my data secure?', a: 'Absolutely. All data is encrypted in transit and at rest. We automatically delete your uploaded files after 30 days. We never share your data with third parties.' },
        { q: 'How fast is the verification?', a: 'We process 2,500 emails per minute on average. A list of 100,000 emails typically takes around 40 minutes to complete.' },
        { q: 'What file formats do you support?', a: 'We support CSV and TXT files. Your file should have one email address per line or in a column.' }
      ].map((faq, i) => (
        <details key={i} className="bg-white rounded-[16px] md:rounded-[20px] p-6 md:p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100">
          <summary className="font-semibold text-[15px] md:text-[17px] flex items-center justify-between tracking-tight">
            {faq.q}
            <span className="text-gray-400 group-open:rotate-180 transition-transform duration-300 text-[18px] md:text-[20px] ml-4">▼</span>
          </summary>
          <p className="mt-4 md:mt-5 text-gray-600 leading-relaxed text-[14px] md:text-[15px] tracking-tight">
            {faq.a}
          </p>
        </details>
      ))}
    </div>
  </div>
</section>

{/* CTA Section */}
<section className="py-20 md:py-32 px-4 md:px-8 bg-white">
  <div className="max-w-[1000px] mx-auto text-center bg-gradient-to-br from-blue-600 via-violet-500 to-fuchsia-400 rounded-[28px] md:rounded-[40px] p-10 md:p-16 lg:p-20 text-white shadow-2xl shadow-violet-500/20">
    <h2 className="text-[36px] sm:text-[46px] md:text-[56px] font-semibold mb-5 md:mb-7 tracking-tighter px-4 md:px-0">
      Ready to clean your lists?
    </h2>
    <p className="text-[17px] md:text-[21px] mb-8 md:mb-12 opacity-95 tracking-tight px-4 md:px-0">
      Join thousands of marketers who trust OnlyValidEmails to keep their lists clean.
    </p>
    <Link 
      href="/register" 
      className="inline-block bg-white text-purple-600 px-8 md:px-10 py-3.5 md:py-4 rounded-full text-[15px] md:text-[17px] font-medium hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-[0.98]"
    >
      Start verifying for free →
    </Link>
    <p className="text-[12px] md:text-[14px] mt-5 md:mt-7 opacity-80">
      No credit card required • Start in seconds
    </p>
  </div>
</section>

      {/* Footer */}
  {/* Footer */}
<footer className="py-12 md:py-16 px-4 md:px-8 border-t border-gray-100 bg-gray-50/30">
  <div className="max-w-[1400px] mx-auto">
    {/* Footer Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
      {/* Brand Column - Full width on mobile */}
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-600 via-violet-500 to-fuchsia-400 rounded-[10px] shadow-sm"></div>
          <span className="font-semibold text-[15px] md:text-[17px] tracking-tight">OnlyValidEmails</span>
        </div>
        <p className="text-gray-600 text-[13px] md:text-[14px] tracking-tight leading-relaxed">
          The simplest way to verify email addresses.
        </p>
      </div>

      {/* Product Column */}
      <div>
        <h3 className="font-semibold mb-4 md:mb-5 text-[14px] md:text-[15px] tracking-tight">Product</h3>
        <ul className="space-y-2 md:space-y-3 text-[13px] md:text-[14px] text-gray-600">
          <li>
            <Link href="#features" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">
              Features
            </Link>
          </li>
          <li>
            <Link href="#pricing" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="#faq" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">
              FAQ
            </Link>
          </li>
        </ul>
      </div>

      {/* Company Column */}
      <div>
        <h3 className="font-semibold mb-4 md:mb-5 text-[14px] md:text-[15px] tracking-tight">Company</h3>
        <ul className="space-y-2 md:space-y-3 text-[13px] md:text-[14px] text-gray-600">
          <li>
            <Link href="/about" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">
              Contact
            </Link>
          </li>
          <li>
            <Link href="/blog" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">
              Blog
            </Link>
          </li>
        </ul>
      </div>

      {/* Legal Column */}
      <div>
        <h3 className="font-semibold mb-4 md:mb-5 text-[14px] md:text-[15px] tracking-tight">Legal</h3>
        <ul className="space-y-2 md:space-y-3 text-[13px] md:text-[14px] text-gray-600">
          <li>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">
              Terms of Service
            </Link>
          </li>
        </ul>
      </div>
    </div>

    {/* Copyright */}
    <div className="pt-6 md:pt-8 border-t border-gray-200 text-center text-[12px] md:text-[13px] text-gray-500 tracking-tight">
      © 2025 OnlyValidEmails. All rights reserved.
    </div>
  </div>
</footer>


      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        .animate-fade-in-scale {
          animation: fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </main>
  );
}