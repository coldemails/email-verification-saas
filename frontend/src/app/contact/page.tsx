'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ContactUs() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        setUserName(userEmail.split('@')[0]);
      }
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-white antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/50 z-50 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 md:py-5 flex items-center justify-between">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity duration-200">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[10px] shadow-sm"></div>
            <span className="font-semibold text-[15px] md:text-[17px] tracking-tight text-slate-900">OnlyValidEmails</span>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="hidden sm:block text-[14px] md:text-[15px] text-slate-600 hover:text-slate-900 transition-colors duration-200 px-3 md:px-4 py-2">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[13px] md:text-[15px] px-5 md:px-6 py-2 md:py-2.5 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
                >
                  Get started
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="hidden sm:block text-[14px] md:text-[15px] text-slate-600 hover:text-slate-900 transition-colors duration-200 px-3 md:px-4 py-2">
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[13px] md:text-[15px] px-4 md:px-5 py-2 md:py-2.5 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                    <span className="hidden sm:inline">{userName || 'Account'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">Dashboard</Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">Settings</Link>
                      <hr className="my-2 border-slate-200" />
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Logout</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 md:pt-40 pb-16 md:pb-20 px-4 md:px-8">
        <div className="max-w-[800px] mx-auto text-center">
          <h1 className="text-[42px] sm:text-[56px] md:text-[72px] font-semibold mb-5 md:mb-7 leading-[0.95] tracking-tighter text-slate-900">
            Get in touch
          </h1>
          <p className="text-[16px] md:text-[19px] text-gray-600 tracking-tight max-w-[600px] mx-auto leading-relaxed">
            Have questions about OnlyValidEmails? We're here to help you verify emails with confidence.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-20 md:pb-32 px-4 md:px-8">
        <div className="max-w-[1000px] mx-auto">
          
          {/* Email Contact Card */}
          <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-[28px] md:rounded-[40px] p-8 md:p-12 lg:p-16 border border-blue-100/50 text-center mb-12 md:mb-16">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[16px] md:rounded-[20px] flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg shadow-blue-500/25">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-[28px] md:text-[36px] font-semibold mb-4 md:mb-5 tracking-tight text-slate-900">Email Support</h2>
            <a 
              href="mailto:support@onlyvalidemails.com" 
              className="text-[20px] md:text-[28px] font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              support@onlyvalidemails.com
            </a>
            <p className="text-[15px] md:text-[17px] text-gray-600 mt-5 md:mt-6 tracking-tight">
              We respond to all inquiries within 1-2 business days
            </p>
          </div>

          {/* What We Can Help With */}
          <div className="mb-12 md:mb-16">
            <h2 className="text-[32px] md:text-[42px] font-semibold mb-8 md:mb-12 text-center tracking-tighter text-slate-900">
              What we can help with
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
              {[
                { emoji: '💻', color: 'purple', title: 'Technical Support', items: ['Account access issues', 'API integration', 'Verification questions', 'Feature requests'] },
                { emoji: '💳', color: 'blue', title: 'Billing & Payments', items: ['Payment issues', 'Receipt requests', 'Refund inquiries', 'Promo codes'] },
                { emoji: '📊', color: 'green', title: 'General Questions', items: ['Product information', 'Pricing plans', 'Service capabilities', 'Partnerships'] }
              ].map((section, i) => (
                <div 
                  key={i} 
                  className={`bg-gradient-to-br from-${section.color}-50/80 to-${section.color === 'purple' ? 'pink' : section.color === 'blue' ? 'cyan' : 'emerald'}-50/80 p-6 md:p-8 rounded-[24px] md:rounded-[28px] border border-${section.color}-100/50 hover:shadow-xl hover:shadow-${section.color}-500/10 transition-all duration-300`}
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-${section.color}-500 to-${section.color === 'purple' ? 'fuchsia' : section.color === 'blue' ? 'cyan' : 'emerald'}-500 rounded-[14px] md:rounded-[16px] flex items-center justify-center mb-5 md:mb-6 shadow-lg shadow-${section.color}-500/25`}>
                    <span className="text-[24px] md:text-[28px]">{section.emoji}</span>
                  </div>
                  <h3 className="text-[17px] md:text-[20px] font-semibold mb-3 md:mb-4 tracking-tight text-slate-900">{section.title}</h3>
                  <ul className="space-y-2 text-[14px] md:text-[15px] text-gray-600 tracking-tight">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <span className="text-green-600 text-[14px]">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Keywords */}
          <div className="bg-gradient-to-br from-orange-50/80 to-amber-50/80 rounded-[24px] md:rounded-[28px] p-6 md:p-8 border border-orange-100/50 mb-12 md:mb-16">
            <h3 className="text-[20px] md:text-[24px] font-semibold mb-4 md:mb-5 tracking-tight text-slate-900">⚡ For Faster Support</h3>
            <p className="text-[15px] md:text-[16px] text-gray-600 mb-5 md:mb-6 tracking-tight">Add these keywords to your email subject line for priority handling:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: 'URGENT', desc: 'Critical issues', color: 'red' },
                { label: 'BILLING', desc: 'Payment matters', color: 'blue' },
                { label: 'SECURITY', desc: 'Security concerns', color: 'purple' },
                { label: 'API', desc: 'API technical issues', color: 'cyan' }
              ].map((keyword, i) => (
                <div key={i} className={`bg-${keyword.color}-500/10 rounded-[14px] md:rounded-[16px] p-4 md:p-5 text-center border border-${keyword.color}-200/50`}>
                  <p className={`text-${keyword.color}-600 font-bold text-[14px] md:text-[15px] mb-1`}>{keyword.label}</p>
                  <p className="text-gray-600 text-[12px] md:text-[13px] tracking-tight">{keyword.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Business Hours & Response Times */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-gray-50/50 rounded-[24px] md:rounded-[28px] p-6 md:p-8 border border-gray-100">
              <h3 className="text-[20px] md:text-[24px] font-semibold mb-5 md:mb-6 tracking-tight text-slate-900">💼 Business Hours</h3>
              <div className="space-y-3 md:space-y-4 text-[15px] md:text-[16px] tracking-tight">
                <div className="flex items-center gap-3">
                  <span className="text-blue-600">📅</span>
                  <span className="text-gray-600">Monday - Friday</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-600">🕐</span>
                  <span className="text-gray-600">9:00 AM - 6:00 PM EST</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-[24px] md:rounded-[28px] p-6 md:p-8 border border-gray-100">
              <h3 className="text-[20px] md:text-[24px] font-semibold mb-5 md:mb-6 tracking-tight text-slate-900">⏱️ Response Times</h3>
              <div className="space-y-2 md:space-y-3 text-[14px] md:text-[15px] tracking-tight">
                <div className="flex justify-between">
                  <span className="text-gray-600">Urgent/Critical:</span>
                  <span className="text-green-600 font-semibold">4 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Technical Support:</span>
                  <span className="text-green-600 font-semibold">24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">General Inquiries:</span>
                  <span className="text-green-600 font-semibold">1-2 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16 md:mt-20">
            <a 
              href="mailto:support@onlyvalidemails.com"
              className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full text-[15px] md:text-[17px] font-medium hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
            >
              Send us an email →
            </a>
            <p className="text-[13px] md:text-[14px] text-gray-500 mt-5 md:mt-6 tracking-tight">
              We're here to help • Responses within 1-2 business days
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 px-4 md:px-8 border-t border-gray-100 bg-gray-50/30">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4 md:mb-5">
                <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-600 via-violet-500 to-fuchsia-400 rounded-[10px] shadow-sm"></div>
                <span className="font-semibold text-[15px] md:text-[17px] tracking-tight">OnlyValidEmails</span>
              </div>
              <p className="text-gray-600 text-[13px] md:text-[14px] tracking-tight leading-relaxed">
                The simplest way to verify email addresses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 md:mb-5 text-[14px] md:text-[15px] tracking-tight">Product</h3>
              <ul className="space-y-2 md:space-y-3 text-[13px] md:text-[14px] text-gray-600">
                <li><Link href="/#features" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">Pricing</Link></li>
                <li><Link href="/#faq" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 md:mb-5 text-[14px] md:text-[15px] tracking-tight">Company</h3>
              <ul className="space-y-2 md:space-y-3 text-[13px] md:text-[14px] text-gray-600">
                <li><Link href="/contact" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 md:mb-5 text-[14px] md:text-[15px] tracking-tight">Legal</h3>
              <ul className="space-y-2 md:space-y-3 text-[13px] md:text-[14px] text-gray-600">
                <li><Link href="/privacy" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">Terms of Service</Link></li>
                <li><Link href="/refund" className="hover:text-gray-900 transition-colors duration-200 tracking-tight">Refund Policy</Link></li>

              </ul>
            </div>
          </div>

          <div className="pt-6 md:pt-8 border-t border-gray-200 text-center text-[12px] md:text-[13px] text-gray-500 tracking-tight">
            © 2025 OnlyValidEmails. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}