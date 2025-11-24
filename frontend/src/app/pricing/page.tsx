'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PricingPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  
  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Optionally fetch user name from localStorage or API
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        setUserName(userEmail.split('@')[0]); // Use first part of email as name
      }
    }
  }, []);
  
  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserName('');
    window.location.reload(); // Refresh to update UI
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[10px] shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-semibold text-[19px] text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
              OnlyValidEmails
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-[15px] text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
              Features
            </Link>
            <Link href="/pricing" className="text-[15px] text-slate-900 font-semibold">
              Pricing
            </Link>
            <Link href="/#faq" className="text-[15px] text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
              FAQ
            </Link>
          </div>
          
          {/* CTA Buttons - Conditional based on auth state */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                {/* Not logged in - Show Sign in & Get started */}
                <Link 
                  href="/login" 
                  className="text-[15px] text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200 px-4 py-2"
                >
                  Sign in
                </Link>
                <Link 
                  href="/register" 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2.5 rounded-full text-[15px] font-medium hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300"
                >
                  Get started free
                </Link>
              </>
            ) : (
              <>
                {/* Logged in - Show Dashboard & User menu */}
                <Link 
                  href="/dashboard"
                  className="hidden sm:block text-[15px] text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200 px-4 py-2"
                >
                  Dashboard
                </Link>
                
                {/* User Menu Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2.5 rounded-full text-[15px] font-medium hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
                    <span className="hidden sm:inline">{userName || 'Account'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Settings
                      </Link>
                      <hr className="my-2 border-slate-200" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-8 animate-fade-in-up">
            <span className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-full text-[15px] font-semibold border border-blue-100 inline-flex items-center gap-2">
              💰 Simple, transparent pricing
            </span>
          </div>
          
          <h1 className="text-[72px] md:text-[84px] font-semibold mb-8 leading-[1] tracking-tight animate-fade-in-up animation-delay-100">
            Pay as you go.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              No subscriptions.
            </span>
          </h1>
          
          <p className="text-[21px] text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            One-time payment. Credits never expire. No contracts, no hassle.
            Start with any package and upgrade anytime.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-8 text-[15px] text-slate-600 animate-fade-in-up animation-delay-300">
            <div className="flex items-center gap-2.5 group">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Credits never expire</span>
            </div>
            <div className="flex items-center gap-2.5 group">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">No monthly fees</span>
            </div>
            <div className="flex items-center gap-2.5 group">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* All Pricing Tiers */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1,000 emails */}
            <div className="bg-white border-2 border-slate-200 rounded-[28px] p-10 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-[1.02] transition-all duration-500 group">
              <div className="mb-8">
                <h3 className="text-[24px] font-semibold text-slate-900 mb-3">Starter</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-[56px] font-semibold tracking-tight text-slate-900">$2.95</span>
                </div>
                <p className="text-[17px] text-slate-600 font-medium">1,000 emails</p>
                <p className="text-[14px] text-slate-400 mt-1.5">$0.00295 per email</p>
              </div>
              <Link 
                href={isAuthenticated ? "/dashboard/credits" : "/register"}
                className="block w-full bg-slate-100 text-center text-slate-700 py-4 rounded-full text-[17px] font-medium hover:bg-slate-200 transition-all duration-300 mb-8 group-hover:scale-105"
              >
                {isAuthenticated ? 'Add Credits' : 'Get started'}
              </Link>
              <div className="space-y-4 text-[15px]">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">SMTP verification</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">DNS validation</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Instant CSV export</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Email support</span>
                </div>
              </div>
            </div>

            {/* 5,000 emails */}
            <div className="bg-white border-2 border-slate-200 rounded-[28px] p-10 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-[1.02] transition-all duration-500 group">
              <div className="mb-8">
                <h3 className="text-[24px] font-semibold text-slate-900 mb-3">Basic</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-[56px] font-semibold tracking-tight text-slate-900">$9.95</span>
                </div>
                <p className="text-[17px] text-slate-600 font-medium">5,000 emails</p>
                <p className="text-[14px] text-slate-400 mt-1.5">$0.00119 per email</p>
              </div>
              <Link 
                href={isAuthenticated ? "/dashboard/credits" : "/register"}
                className="block w-full bg-slate-100 text-center text-slate-700 py-4 rounded-full text-[17px] font-medium hover:bg-slate-200 transition-all duration-300 mb-8 group-hover:scale-105"
              >
                {isAuthenticated ? 'Add Credits' : 'Get started'}
              </Link>
              <div className="space-y-4 text-[15px]">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Everything in Starter</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Disposable email detection</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Real-time progress</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Priority support</span>
                </div>
              </div>
            </div>

            {/* 10,000 emails - POPULAR */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-[28px] p-10 pt-16 relative overflow-hidden shadow-2xl shadow-blue-500/30 md:col-span-2 lg:col-span-1 transform hover:scale-[1.05] transition-all duration-500">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white text-blue-600 px-4 py-1.5 rounded-full text-[13px] font-bold shadow-lg">
                MOST POPULAR
              </div>
              
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10">
                <div className="mb-8">
                  <h3 className="text-[24px] font-semibold mb-3">Growth</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-[56px] font-semibold tracking-tight">$24.95</span>
                  </div>
                  <p className="text-[17px] text-blue-100 font-medium">10,000 emails</p>
                  <p className="text-[14px] text-blue-200 mt-1.5">$0.00099 per email</p>
                </div>
                <Link 
                  href={isAuthenticated ? "/dashboard/credits" : "/register"}
                  className="block w-full bg-white text-blue-600 text-center py-4 rounded-full text-[17px] font-medium hover:bg-blue-50 hover:shadow-xl transition-all duration-300 mb-8 hover:scale-105"
                >
                  {isAuthenticated ? 'Add Credits' : 'Get started'}
                </Link>
                <div className="space-y-4 text-[15px]">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="leading-relaxed">Everything in Basic</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="leading-relaxed">Catch-all detection</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="leading-relaxed">Role account detection</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="leading-relaxed">Live chat support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 30,000 emails */}
            <div className="bg-white border-2 border-slate-200 rounded-[28px] p-10 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-[1.02] transition-all duration-500 group">
              <div className="mb-8">
                <h3 className="text-[24px] font-semibold text-slate-900 mb-3">Professional</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-[56px] font-semibold tracking-tight text-slate-900">$44.95</span>
                </div>
                <p className="text-[17px] text-slate-600 font-medium">30,000 emails</p>
                <p className="text-[14px] text-slate-400 mt-1.5">$0.00095 per email</p>
              </div>
              <Link 
                href={isAuthenticated ? "/dashboard/credits" : "/register"}
                className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-center text-white py-4 rounded-full text-[17px] font-medium hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 mb-8 group-hover:scale-105"
              >
                {isAuthenticated ? 'Add Credits' : 'Get started'}
              </Link>
              <div className="space-y-4 text-[15px]">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Everything in Growth</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Bulk processing priority</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Dedicated support</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">30-day history</span>
                </div>
              </div>
            </div>

            {/* 50,000 emails */}
            <div className="bg-white border-2 border-slate-200 rounded-[28px] p-10 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-[1.02] transition-all duration-500 group">
              <div className="mb-8">
                <h3 className="text-[24px] font-semibold text-slate-900 mb-3">Business</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-[56px] font-semibold tracking-tight text-slate-900">$69.95</span>
                </div>
                <p className="text-[17px] text-slate-600 font-medium">50,000 emails</p>
                <p className="text-[14px] text-slate-400 mt-1.5">$0.00089 per email</p>
              </div>
              <Link 
                href={isAuthenticated ? "/dashboard/credits" : "/register"}
                className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-center text-white py-4 rounded-full text-[17px] font-medium hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 mb-8 group-hover:scale-105"
              >
                {isAuthenticated ? 'Add Credits' : 'Get started'}
              </Link>
              <div className="space-y-4 text-[15px]">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Everything in Professional</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Best value (70% savings)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">90-day history</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Phone support</span>
                </div>
              </div>
            </div>

            {/* 100,000 emails - BEST VALUE */}
            <div className="bg-white border-2 border-emerald-300 rounded-[28px] p-10 pt-16 hover:shadow-xl hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-500 relative group">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full text-[13px] font-bold">
                BEST VALUE
              </div>
              <div className="mb-8">
                <h3 className="text-[24px] font-semibold text-slate-900 mb-3">Enterprise</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-[56px] font-semibold tracking-tight text-slate-900">$99.95</span>
                </div>
                <p className="text-[17px] text-slate-600 font-medium">100,000 emails</p>
                <p className="text-[14px] text-slate-400 mt-1.5">$0.00075 per email</p>
              </div>
              <Link 
                href={isAuthenticated ? "/dashboard/credits" : "/register"}
                className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-center text-white py-4 rounded-full text-[17px] font-medium hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 mb-8 group-hover:scale-105"
              >
                {isAuthenticated ? 'Add Credits' : 'Get started'}
              </Link>
              <div className="space-y-4 text-[15px]">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Everything in Business</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Lowest cost per email</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Unlimited history</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600 leading-relaxed">Priority processing</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[32px] p-20 text-white relative overflow-hidden shadow-2xl shadow-blue-500/30">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-[56px] font-semibold mb-8 leading-[1.1] tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-[21px] mb-12 text-blue-100 leading-relaxed max-w-2xl mx-auto">
              Choose a package and start verifying in seconds.
            </p>
            <Link 
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-5 rounded-full text-[19px] font-medium hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start verifying now'}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t-2 border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[15px] text-slate-500">
            © 2025 OnlyValidEmails. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}