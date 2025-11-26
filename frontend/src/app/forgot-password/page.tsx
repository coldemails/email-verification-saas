'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔄 Sending forgot password request to:', `${API_URL}/api/auth/forgot-password`);
      
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      console.log('📥 Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      // Success - show success screen
      setIsSuccess(true);
      
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend email');
      }

      // Could show a toast notification here
      console.log('✅ Email resent successfully');
      
    } catch (error: any) {
      console.error('❌ Resend error:', error);
      setError(error.message || 'Failed to resend email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-50 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="w-full max-w-[480px] relative z-10">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 mb-16 group w-fit"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[10px] shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-semibold text-[19px] text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
              OnlyValidEmails
            </span>
          </Link>

          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="mb-12 animate-fade-in-up">
                <h1 className="text-[56px] font-semibold tracking-tight text-slate-900 mb-4 leading-[1.05]">
                  Reset your password
                </h1>
                <p className="text-[17px] text-slate-600 leading-relaxed">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-[20px] p-5 flex items-start gap-3 animate-fade-in-up">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-900 text-[15px] font-medium leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up animation-delay-100">
                <div>
                  <label htmlFor="email" className="block text-[15px] font-medium text-slate-900 mb-3">
                    Email address
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="you@company.com"
                      className={`w-full px-5 py-4 rounded-[14px] border-2 text-[17px] transition-all duration-300 ${
                        error
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:bg-white focus:shadow-lg focus:shadow-red-500/10'
                          : 'border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:shadow-xl focus:shadow-blue-500/10'
                      } focus:outline-none placeholder:text-slate-400`}
                      required
                    />
                    {!error && email && validateEmail(email) && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center animate-fade-in-up">
                          <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full text-[17px] font-medium hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none group relative overflow-hidden"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending reset link...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Send reset link
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              {/* Back to login */}
              <div className="mt-8 text-center animate-fade-in-up animation-delay-200">
                <Link 
                  href="/login" 
                  className="text-[15px] text-blue-600 hover:text-cyan-600 font-medium inline-flex items-center gap-2 group transition-colors duration-200"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center animate-fade-in-up">
                {/* Success Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/30 animate-fade-in-up">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <h2 className="text-[48px] font-semibold tracking-tight text-slate-900 mb-4 leading-[1.1] animate-fade-in-up animation-delay-100">
                  Check your email
                </h2>
                <p className="text-[17px] text-slate-600 mb-3 animate-fade-in-up animation-delay-200">
                  We've sent a password reset link to:
                </p>
                <p className="text-[19px] font-semibold text-slate-900 mb-8 animate-fade-in-up animation-delay-200">
                  {email}
                </p>
                
                {/* Info Box */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-[20px] p-6 mb-8 text-left animate-fade-in-up animation-delay-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] text-blue-900 leading-relaxed">
                        <strong className="font-semibold">Important:</strong> The link will expire in 1 hour. Check your spam folder if you don't see it within a few minutes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 animate-fade-in-up animation-delay-400">
                  <button
                    onClick={handleResend}
                    disabled={isLoading}
                    className="w-full bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-full text-[17px] font-medium hover:border-blue-200 hover:bg-slate-50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Resending...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Resend email
                      </span>
                    )}
                  </button>
                  
                  <Link 
                    href="/login"
                    className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full text-[17px] font-medium hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to login
                    </span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Hero (keeping same as before) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-16 items-center justify-center relative overflow-hidden">
        {/* Animated Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl opacity-10 animate-ocean-wave"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-300 rounded-full blur-3xl opacity-10" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-400 rounded-full blur-3xl opacity-10" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 text-white max-w-xl animate-fade-in-up animation-delay-200">
          {/* Icon Badge */}
          <div className="mb-12">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-[24px] flex items-center justify-center mb-10 shadow-2xl shadow-blue-900/30 border border-white/10 group hover:scale-110 hover:bg-white/15 transition-all duration-500">
              <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🔒</span>
            </div>
            <h2 className="text-[64px] font-semibold mb-8 leading-[1.05] tracking-tight">
              Don't worry!<br />We've got you
            </h2>
            <p className="text-[21px] text-blue-100 leading-relaxed">
              Password resets happen to the best of us. We'll get you back into your account in no time.
            </p>
          </div>

          {/* Security Features */}
          <div className="space-y-6 mb-12">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ),
                title: 'Secure Process',
                description: 'Your reset link is encrypted and expires after 1 hour',
                delay: '0s',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                ),
                title: 'Email Notification',
                description: "We'll notify you whenever a password reset is requested",
                delay: '0.1s',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                ),
                title: 'Need Help?',
                description: 'Contact support@onlyvalidemails.com if you have issues',
                delay: '0.2s',
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-[20px] border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] animate-fade-in-up"
                style={{ animationDelay: feature.delay }}
              >
                <div className="w-12 h-12 bg-white/10 rounded-[14px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[17px] mb-1">{feature.title}</h3>
                  <p className="text-[15px] text-blue-100 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Badge */}
          <div className="pt-8 border-t-2 border-white/10 animate-fade-in-up animation-delay-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-[15px] text-blue-100">
                Your account security is our top priority
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}