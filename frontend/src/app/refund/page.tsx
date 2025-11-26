'use client';

import { useEffect, useState } from 'react';

export default function RefundPolicy() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const userEmail = sessionStorage.getItem('userEmail');
      if (userEmail) {
        setUserName(userEmail.split('@')[0]);
      }
    }
  }, []);
  
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userEmail');
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-white antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <a href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg shadow-sm"></div>
            <span className="font-semibold text-sm sm:text-base tracking-tight text-slate-900">OnlyValidEmails</span>
          </a>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {!isAuthenticated ? (
              <>
                <a href="/login" className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5 sm:px-4 sm:py-2">
                  Sign in
                </a>
                <a
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs sm:text-sm px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  Get started
                </a>
              </>
            ) : (
              <>
                <a href="/dashboard" className="hidden sm:inline-block text-sm text-slate-600 hover:text-slate-900 transition-colors px-4 py-2">
                  Dashboard
                </a>
                <div className="relative">
                  <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs sm:text-sm px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full font-medium"
                  >
                    <span className="max-w-[80px] sm:max-w-none truncate">{userName || 'Account'}</span>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                      <div className="py-1 sm:py-2">
                        <a href="/dashboard" className="block px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50">Dashboard</a>
                        <a href="/settings" className="block px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50">Settings</a>
                        <hr className="my-1 sm:my-2 border-slate-200" />
                        <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50">Logout</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-28 md:pt-36 pb-10 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-3 sm:mb-4 leading-tight tracking-tighter text-slate-900">
            Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 tracking-tight">
            Effective Date: November 27, 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8 sm:space-y-12 text-sm sm:text-base text-gray-600 leading-relaxed">
            
            {/* Money-Back Guarantee */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-green-100">
              <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">7-Day Money-Back Guarantee</h2>
              </div>
              <p className="text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed">
                We stand behind our service with a <strong>100% money-back guarantee</strong>. If you're not satisfied with OnlyValidEmails for any valid reason within 7 days of your purchase, we'll refund your payment in full—no questions asked.
              </p>
            </div>

            {/* Overview */}
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 mb-3 sm:mb-4 tracking-tight">Overview</h2>
              <p className="mb-3">At OnlyValidEmails, we're committed to providing high-quality email verification services. This Refund Policy outlines the circumstances under which you may request a refund, our refund process, and important terms you should know.</p>
              <p>All refunds are processed through Paddle, our authorized payment processor, and subject to their terms and processing times.</p>
            </div>

            {/* Eligible for Refund */}
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 mb-3 sm:mb-4 tracking-tight">Eligible for Refund</h2>
              <p className="mb-4">You may request a full refund within 7 days of purchase if:</p>
              
              <div className="space-y-3 sm:space-y-4">
                {[
                  { num: "1", title: "Service Performance Issues", desc: "Verification results don't match our advertised success rates (85-95% accuracy on major providers like Gmail, Outlook, Yahoo)" },
                  { num: "2", title: "Technical Issues", desc: "Technical issues on our end prevent you from using the Service (not including user configuration errors or third-party service issues)" },
                  { num: "3", title: "Service Unavailability", desc: "The Service is unavailable for extended periods (48+ consecutive hours) due to issues within our control" },
                  { num: "4", title: "Billing Errors", desc: "You were charged incorrectly or multiple times for the same purchase" }
                ].map((item) => (
                  <div key={item.num} className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs sm:text-sm font-semibold">{item.num}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">{item.title}</h3>
                        <p className="text-xs sm:text-sm">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Not Eligible for Refund */}
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 mb-3 sm:mb-4 tracking-tight">Not Eligible for Refund</h2>
              <p className="mb-4">Refunds will NOT be issued in the following cases:</p>
              
              <div className="bg-red-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-red-100">
                <ul className="space-y-2 sm:space-y-3">
                  {[
                    { label: "Change of Mind", text: "You no longer need the service or decided not to use the credits after purchase" },
                    { label: "Credits Already Used", text: "You have already used more than 10% of purchased credits (e.g., more than 1,000 credits from a 10,000 credit purchase)" },
                    { label: "External Factors", text: "Issues caused by third parties, including ISP blocking SMTP connections, email provider policy changes, or network connectivity issues on your end" },
                    { label: "Violation of Terms", text: "Your account was terminated for violating our Terms of Service or Acceptable Use Policy" },
                    { label: "After 7-Day Window", text: "Refund requests made more than 7 days after the original purchase date" },
                    { label: "Promo Credits", text: "Free credits obtained through promotional codes or bonuses are non-refundable" }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                      <span className="text-red-600 flex-shrink-0 mt-0.5 text-sm sm:text-base">✗</span>
                      <span><strong>{item.label}:</strong> {item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* How to Request a Refund */}
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 mb-3 sm:mb-4 tracking-tight">How to Request a Refund</h2>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 border border-blue-100">
                <p className="font-semibold text-slate-900 mb-5 sm:mb-6 text-sm sm:text-base">Follow these steps to request a refund:</p>
                
                <div className="space-y-4 sm:space-y-5">
                  {[
                    { num: "1", title: "Send an Email", desc: "Contact us at support@onlyvalidemails.com with the subject line \"Refund Request\"" },
                    { num: "2", title: "Include Required Information", desc: "Your account email address, Transaction ID or order number, Purchase date, Reason for refund request, Supporting documentation (if applicable)" },
                    { num: "3", title: "Wait for Review", desc: "Our team will review your request within 1-2 business days and respond via email" },
                    { num: "4", title: "Receive Your Refund", desc: "If approved, your refund will be processed within 7-10 business days to your original payment method via Paddle" }
                  ].map((step) => (
                    <div key={step.num} className="flex items-start gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs sm:text-sm font-bold">{step.num}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">{step.title}</h3>
                        <p className="text-xs sm:text-sm">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Refund Processing */}
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 mb-3 sm:mb-4 tracking-tight">Refund Processing</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Processing Time</h3>
                  <p className="text-xs sm:text-sm">Approved refunds are processed within <strong>7-10 business days</strong>. Depending on your bank or payment provider, it may take an additional 3-5 business days for the refund to appear in your account.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Refund Method</h3>
                  <p className="text-xs sm:text-sm">All refunds are issued to the <strong>original payment method</strong> used for the purchase through Paddle. We cannot issue refunds to different payment methods or accounts.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Partial Refunds</h3>
                  <p className="text-xs sm:text-sm">If you've used some credits, we may offer a partial refund based on unused credits.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Account Status After Refund</h3>
                  <p className="text-xs sm:text-sm mb-2">Once a refund is approved and processed:</p>
                  <ul className="space-y-1.5 ml-4 sm:ml-5 list-disc text-xs sm:text-sm">
                    <li>All purchased credits will be removed from your account</li>
                    <li>Any verification jobs in progress will be cancelled</li>
                    <li>Your account will remain active with any remaining free or promotional credits</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Special Circumstances */}
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 mb-3 sm:mb-4 tracking-tight">Special Circumstances</h2>
              
              <div className="space-y-3 sm:space-y-4">
                {[
                  { icon: "⚠️", title: "Promotional Purchases", desc: "Credits purchased during promotional periods (e.g., Black Friday, launch specials) are subject to the same 7-day refund policy. However, promotional pricing discounts may not be reapplied if you repurchase after a refund." },
                  { icon: "🔄", title: "Subscription Services (Future)", desc: "If we introduce subscription-based pricing in the future, separate refund terms will apply. You will be notified of any changes before they take effect." },
                  { icon: "💳", title: "Chargebacks", desc: "If you initiate a chargeback through your bank or payment provider without first contacting us, we reserve the right to permanently suspend your account and pursue the outstanding amount. Please contact us first—we're happy to work with you to resolve any issues." }
                ].map((item, idx) => (
                  <div key={idx} className="bg-yellow-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-yellow-100">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <span className="text-lg sm:text-xl">{item.icon}</span>
                      <span>{item.title}</span>
                    </h3>
                    <p className="text-xs sm:text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions About Refunds */}
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 border border-gray-100">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 mb-3 sm:mb-4 tracking-tight">Questions About Refunds?</h2>
              <p className="mb-4 text-xs sm:text-sm">If you have questions about our refund policy or need assistance with a refund request, please contact our support team:</p>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <p>
                  <strong className="text-slate-900">Email:</strong>{" "}
                  <a href="mailto:support@onlyvalidemails.com" className="text-blue-600 hover:underline break-all">support@onlyvalidemails.com</a>
                </p>
                <p>
                  <strong className="text-slate-900">Response Time:</strong>{" "}
                  <span className="text-slate-700">1-2 business days</span>
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4 italic">
                  We're committed to ensuring your satisfaction and will work with you to resolve any issues fairly and promptly.
                </p>
              </div>
            </div>

            {/* Policy Updates */}
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 mb-3 sm:mb-4 tracking-tight">Changes to This Policy</h2>
              <p className="text-xs sm:text-sm mb-3">We may update this Refund Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. We will notify you of significant changes via email or a prominent notice on our website.</p>
              <p className="text-xs sm:text-sm">Continued use of the Service after changes constitutes acceptance of the updated Refund Policy.</p>
            </div>

            {/* Final Note */}
            <div className="text-center pt-6 sm:pt-8 border-t border-gray-200">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-blue-100">
                <p className="font-semibold text-slate-900 text-sm sm:text-base mb-2 sm:mb-3">
                  Your Satisfaction is Our Priority
                </p>
                <p className="text-xs sm:text-sm text-slate-600">
                  We're confident you'll love OnlyValidEmails, but if you're not completely satisfied, we're here to make it right. Our 7-day money-back guarantee ensures you can try our service risk-free.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-14 px-4 sm:px-6 border-t border-gray-100 bg-gray-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 via-violet-500 to-fuchsia-400 rounded-lg shadow-sm"></div>
                <span className="font-semibold text-sm sm:text-base tracking-tight">OnlyValidEmails</span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm tracking-tight leading-relaxed">
                The simplest way to verify email addresses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm tracking-tight">Product</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li><a href="/#features" className="hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</a></li>
                <li><a href="/#faq" className="hover:text-gray-900 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm tracking-tight">Company</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li><a href="/contact" className="hover:text-gray-900 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm tracking-tight">Legal</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li><a href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</a></li>
                <li><a href="/refund" className="hover:text-gray-900 transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-gray-200 text-center text-xs sm:text-sm text-gray-500 tracking-tight">
            © 2025 OnlyValidEmails. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}