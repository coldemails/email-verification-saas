'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TermsOfService() {
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
          <h1 className="text-[42px] sm:text-[56px] md:text-[72px] font-semibold mb-4 md:mb-5 leading-[0.95] tracking-tighter text-slate-900">
            Terms of Service
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
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">1. Agreement to Terms</h2>
              <p>By accessing or using OnlyValidEmails ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use our Service.</p>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">2. Description of Service</h2>
              <p>OnlyValidEmails is a B2B email verification service that provides:</p>
              <ul className="space-y-2 ml-5 list-disc mt-3">
                <li><strong>Email Verification:</strong> 12-layer verification engine validation</li>
                <li><strong>Bulk Processing:</strong> Up to 1,770 emails per minute</li>
                <li><strong>API Access:</strong> Programmatic access to verification services</li>
                <li><strong>Real-Time Results:</strong> Live results via Socket.IO and dashboard</li>
                <li><strong>File Upload:</strong> CSV and Excel support for bulk verification</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">3. Eligibility</h2>
              <p>To use our Service, you must:</p>
              <ul className="space-y-2 ml-5 list-disc mt-3">
                <li>Be at least 18 years of age</li>
                <li>Have legal capacity to enter binding contracts</li>
                <li>Use the Service for lawful business purposes only</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">4. Account Registration</h2>
              <ul className="space-y-2 ml-5 list-disc">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain confidentiality of account credentials</li>
                <li>You're responsible for all activities under your account</li>
                <li>Notify us immediately of unauthorized use: support@onlyvalidemails.com</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">5. Pricing and Billing</h2>
              <p className="font-semibold text-slate-900 mb-4">Credit-Based System: 1 credit = 1 email verification</p>

              <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-[24px] md:rounded-[28px] p-6 md:p-8 border border-blue-100/50">
                <h3 className="text-[17px] md:text-[20px] font-semibold text-slate-900 mb-4 tracking-tight">Current Pricing Tiers</h3>
                <div className="space-y-2 text-[14px] md:text-[15px]">
                  <div className="flex justify-between"><span>Starter (1,000 credits)</span><span className="font-semibold">$2.95</span></div>
                  <div className="flex justify-between"><span>Basic (5,000 credits)</span><span className="font-semibold">$9.95</span></div>
                  <div className="flex justify-between"><span>Growth (10,000 credits)</span><span className="font-semibold">$24.95</span></div>
                  <div className="flex justify-between"><span>Professional (30,000 credits)</span><span className="font-semibold">$44.95</span></div>
                  <div className="flex justify-between"><span>Business (50,000 credits)</span><span className="font-semibold">$69.95</span></div>
                  <div className="flex justify-between"><span>Enterprise (100,000 credits)</span><span className="font-semibold">$99.95</span></div>
                  <div className="flex justify-between"><span>Elite (250,000 credits)</span><span className="font-semibold">$199.95</span></div>
                </div>
              </div>

              <h3 className="text-[17px] md:text-[20px] font-semibold text-slate-900 mb-3 mt-6 tracking-tight">Payment Terms</h3>
              <ul className="space-y-2 ml-5 list-disc">
                <li>All payments processed through Paddle (PCI-DSS compliant)</li>
                <li>Prices in USD unless otherwise specified</li>
                <li>All fees non-refundable (except as required by law)</li>
                <li>Credits never expire while account is active</li>
              </ul>

              <h3 className="text-[17px] md:text-[20px] font-semibold text-slate-900 mb-3 mt-6 tracking-tight">Refund Policy</h3>
              <p>Credits are non-refundable once purchased. Refunds may be provided at our discretion for:</p>
              <ul className="space-y-2 ml-5 list-disc mt-2">
                <li>Service outages lasting more than 24 hours</li>
                <li>Technical errors preventing verification</li>
                <li>Billing errors or duplicate charges</li>
              </ul>
              <p className="mt-2">Contact support@onlyvalidemails.com within 7 days of purchase to request a refund.</p>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">6. Acceptable Use Policy</h2>
              <p className="font-semibold text-slate-900 mb-3">You may NOT:</p>
              <ul className="space-y-2 ml-5 list-disc">
                <li>Verify email addresses obtained illegally or without consent</li>
                <li>Use the Service for spam, phishing, or harassment</li>
                <li>Violate CAN-SPAM, GDPR, CCPA, or other laws</li>
                <li>Circumvent usage or rate limits</li>
                <li>Reverse engineer or decompile the Service</li>
                <li>Resell or redistribute without authorization</li>
                <li>Share account credentials or API keys</li>
              </ul>

              <h3 className="text-[17px] md:text-[20px] font-semibold text-slate-900 mb-3 mt-6 tracking-tight">Email List Requirements</h3>
              <ul className="space-y-2 ml-5 list-disc">
                <li>You must have legal right to process all submitted email addresses</li>
                <li>Emails must be collected in compliance with applicable laws</li>
                <li>Maintain proper consent records</li>
                <li>Honor unsubscribe requests</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">7. API Usage</h2>
              <h3 className="text-[17px] md:text-[20px] font-semibold text-slate-900 mb-3 tracking-tight">Rate Limits</h3>
              <ul className="space-y-2 ml-5 list-disc">
                <li>Maximum processing speed: 1,770 emails per minute</li>
                <li>Daily capacity: 10,000-25,000 emails</li>
                <li>Exceeding limits may result in throttling</li>
                <li>Contact us for enterprise-level limits</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">8. Verification Results</h2>
              <p>We strive for accurate results using our 12-layer verification engine. However:</p>
              <ul className="space-y-2 ml-5 list-disc mt-3">
                <li>Results are provided "as is" without guarantees of absolute accuracy</li>
                <li>Email deliverability can change due to factors outside our control</li>
                <li>We're not responsible for decisions made based on results</li>
              </ul>

              <h3 className="text-[17px] md:text-[20px] font-semibold text-slate-900 mb-3 mt-6 tracking-tight">12 Verification Layers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[14px] mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Syntax validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Domain verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>MX record checking</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>SMTP validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Disposable detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Role-based detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Free provider detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Spam trap detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Catch-all detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Greylisting detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Mailbox verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Deliverability scoring</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">9. Limitation of Liability</h2>
              <div className="bg-gradient-to-br from-red-50/80 to-orange-50/80 rounded-[24px] md:rounded-[28px] p-6 md:p-8 border border-red-100/50">
                <p className="font-semibold text-slate-900 mb-3">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
                <ul className="space-y-2 ml-5 list-disc">
                  <li>We're not liable for indirect, incidental, special, or consequential damages</li>
                  <li>Total liability shall not exceed amount paid in preceding 12 months, or $100, whichever is greater</li>
                  <li>This applies to loss of profits, data, business opportunities, service interruptions, or any other matter</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">10. Disclaimer of Warranties</h2>
              <div className="bg-gradient-to-br from-yellow-50/80 to-amber-50/80 rounded-[24px] md:rounded-[28px] p-6 md:p-8 border border-yellow-100/50">
                <p className="font-semibold text-slate-900 mb-3">THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES:</p>
                <ul className="space-y-2 ml-5 list-disc">
                  <li>No warranties of merchantability or fitness for particular purpose</li>
                  <li>No warranties of accuracy, reliability, or completeness of results</li>
                  <li>No warranties of uninterrupted or error-free service</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">11. Termination</h2>
              <p>You may cancel anytime by contacting support@onlyvalidemails.com. We may suspend or terminate immediately for:</p>
              <ul className="space-y-2 ml-5 list-disc mt-3">
                <li>Violation of Terms or Acceptable Use Policy</li>
                <li>Fraudulent, illegal, or abusive activities</li>
                <li>Legal requirements or security risks</li>
              </ul>
              <p className="mt-4">Upon termination: access disabled, unused credits forfeited, data deleted per Privacy Policy.</p>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">12. Payment Processing</h2>
              <p>All payments are processed by Paddle, our authorized payment processor. By making a purchase, you agree to Paddle's Terms of Service and Privacy Policy.</p>
            </div>

            <div>
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">13. Changes to Terms</h2>
              <p>We may modify these Terms at any time. Changes effective 30 days after notification via email or website announcement. Continued use constitutes acceptance.</p>
            </div>

            <div className="bg-gray-50/50 rounded-[24px] md:rounded-[28px] p-8 md:p-10 border border-gray-100">
              <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 mb-4 md:mb-5 tracking-tight">Contact Information</h2>
              <p className="mb-4">For questions about these Terms:</p>
              <p className="text-[17px]">
                <strong className="text-slate-900">Email:</strong>{" "}
                <a href="mailto:support@onlyvalidemails.com" className="text-blue-600 hover:underline">support@onlyvalidemails.com</a>
              </p>
              <p className="text-gray-500 text-[14px] mt-4">Response Time: 1-2 business days</p>
            </div>

            <div className="text-center pt-8 border-t border-gray-200">
              <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-[20px] md:rounded-[24px] p-6 md:p-8 border border-blue-100/50">
                <p className="font-semibold text-slate-900 text-[16px] md:text-[17px]">
                  By using OnlyValidEmails, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </div>
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