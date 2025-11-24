'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PrivacyPolicy() {
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
      {/* Navigation - Same as landing page */}
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
          <h1 className="text-[42px] sm:text-[56px] md:text-[72px] font-semibold mb-4 md:mb-5 leading-[0.95] tracking-tighter text-slate-900">
            Privacy Policy
          </h1>
          <p className="text-[14px] md:text-[15px] text-gray-600 tracking-tight">
            Effective Date: November 24, 2024 • Last Updated: November 24, 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 md:pb-32 px-4 md:px-8">
        <div className="max-w-[800px] mx-auto">
          <div className="space-y-12 md:space-y-16 text-[15px] md:text-[16px] text-gray-600 leading-relaxed tracking-tight">
            
            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">Introduction</h2>
              <p>OnlyValidEmails ("we," "our," or "us") operates onlyvalidemails.com (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our B2B email verification service.</p>
              <p className="mt-3">By using our Service, you agree to the collection and use of information in accordance with this policy.</p>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">Information We Collect</h2>
              
              <h3 className="text-[17px] md:text-[20px] font-semibold text-slate-900 mb-3 tracking-tight">Information You Provide</h3>
              <ul className="space-y-2 ml-5 list-disc">
                <li><strong>Account Information:</strong> Name, email address, and company name (optional)</li>
                <li><strong>Email Lists:</strong> Email addresses you upload for verification</li>
                <li><strong>Payment Information:</strong> Processed securely through Paddle (we don't store complete card details)</li>
              </ul>

              <h3 className="text-[17px] md:text-[20px] font-semibold text-slate-900 mb-3 mt-6 tracking-tight">Automatically Collected Information</h3>
              <ul className="space-y-2 ml-5 list-disc">
                <li><strong>Usage Data:</strong> API calls, verification requests, and feature usage</li>
                <li><strong>Log Data:</strong> IP addresses, browser type, pages visited, timestamps</li>
                <li><strong>Cookies:</strong> Session tracking and activity monitoring</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">How We Use Your Information</h2>
              <ul className="space-y-2 ml-5 list-disc">
                <li><strong>Service Delivery:</strong> Processing email verifications through our 12-layer engine</li>
                <li><strong>Account Management:</strong> Managing accounts, processing payments, customer support</li>
                <li><strong>Service Improvement:</strong> Analyzing usage patterns and developing new features</li>
                <li><strong>Communication:</strong> Service announcements and marketing (opt-out available)</li>
                <li><strong>Security:</strong> Detecting fraud, preventing abuse, addressing technical issues</li>
                <li><strong>Compliance:</strong> Meeting legal obligations and enforcing Terms of Service</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">Data Processing</h2>
              <p>Email addresses are processed through our 12-layer verification engine at up to 1,770 emails per minute. Verification results include validity status, deliverability scores, and technical data.</p>
              
              <h3 className="text-[17px] md:text-[20px] font-semibold text-slate-900 mb-3 mt-6 tracking-tight">Data Retention</h3>
              <ul className="space-y-2 ml-5 list-disc">
                <li><strong>Account Data:</strong> Duration of active account + 90 days</li>
                <li><strong>Verification Results:</strong> 12 months or while account is active</li>
                <li><strong>Billing Records:</strong> 7 years (tax/accounting compliance)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">Data Sharing</h2>
              <p className="font-semibold text-slate-900">We do not sell your personal information.</p>
              
              <h3 className="text-[17px] md:text-[20px] font-semibold text-slate-900 mb-3 mt-6 tracking-tight">Service Providers</h3>
              <ul className="space-y-2 ml-5 list-disc">
                <li><strong>Payment Processing:</strong> Paddle (PCI-DSS compliant)</li>
                <li><strong>Infrastructure:</strong> Hetzner (hosting), DigitalOcean (database/Redis), AWS S3 (storage)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">Data Security</h2>
              <ul className="space-y-2 ml-5 list-disc">
                <li><strong>Encryption:</strong> SSL/TLS for data in transit, industry-standard encryption at rest</li>
                <li><strong>Authentication:</strong> JWT-based auth with bcrypt password hashing</li>
                <li><strong>Monitoring:</strong> Regular security assessments and vulnerability scanning</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">Your Rights</h2>
              <ul className="space-y-2 ml-5 list-disc">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update inaccurate information via account settings</li>
                <li><strong>Deletion:</strong> Request account and data deletion</li>
                <li><strong>Data Portability:</strong> Request data in CSV or Excel format</li>
              </ul>
              <p className="mt-4">Contact: <a href="mailto:support@onlyvalidemails.com" className="text-blue-600 hover:underline">support@onlyvalidemails.com</a></p>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">California & GDPR Compliance</h2>
              <p><strong>California residents (CCPA)</strong> and <strong>EU/EEA users (GDPR)</strong> have additional privacy rights including right to know, delete, and opt-out.</p>
              <p className="mt-3">Email <a href="mailto:support@onlyvalidemails.com" className="text-blue-600 hover:underline">support@onlyvalidemails.com</a> with "CCPA Request" or "GDPR Request" in the subject line.</p>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">Payment Processing</h2>
              <p>All payments are processed by Paddle (PCI-DSS Level 1 compliant). Your payment information goes directly to Paddle's secure servers. We only receive transaction confirmations.</p>
            </div>

            <div className="bg-gray-50/50 rounded-[24px] md:rounded-[28px] p-8 md:p-10 border border-gray-100">
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">Contact Us</h2>
              <p className="mb-4">For questions about this Privacy Policy:</p>
              <p className="text-[17px]">
                <strong className="text-slate-900">Email:</strong>{" "}
                <a href="mailto:support@onlyvalidemails.com" className="text-blue-600 hover:underline">support@onlyvalidemails.com</a>
              </p>
              <p className="text-gray-500 text-[14px] mt-4">Response Time: We will respond within 30 days.</p>
            </div>

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