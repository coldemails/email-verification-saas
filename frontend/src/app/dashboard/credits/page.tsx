'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface User {
  name: string;
  email: string;
  credits: number;
}

interface PricingTier {
  name: string;
  credits: number;
  price: number;
  pricePerEmail: number;
  savings?: string;
  popular?: boolean;
  features: string[];
}

export default function CreditsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

  // Pricing tiers with new pricing
  const pricingTiers: PricingTier[] = [
    {
      name: 'Starter',
      credits: 1000,
      price: 2.95,
      pricePerEmail: 0.00295,
      features: ['SMTP verification', 'DNS validation', 'Instant CSV export', 'Email support']
    },
    {
      name: 'Basic',
      credits: 5000,
      price: 9.95,
      pricePerEmail: 0.00199,
      savings: '32% off',
      features: ['Everything in Starter', 'Disposable detection', 'Spam trap detection', 'Priority support']
    },
    {
      name: 'Growth',
      credits: 10000,
      price: 24.95,
      pricePerEmail: 0.002495,
      savings: '15% off',
      popular: true,
      features: ['Everything in Basic', 'Catch-all detection', 'Role account detection', 'Live chat support']
    },
    {
      name: 'Professional',
      credits: 30000,
      price: 44.95,
      pricePerEmail: 0.001498,
      savings: '49% off',
      features: ['Everything in Growth', 'Bulk processing priority', 'Dedicated support', '30-day history']
    },
    {
      name: 'Business',
      credits: 50000,
      price: 69.95,
      pricePerEmail: 0.001399,
      savings: '53% off',
      features: ['Everything in Professional', 'Best value', '90-day history', 'Phone support']
    },
    {
      name: 'Enterprise',
      credits: 100000,
      price: 99.95,
      pricePerEmail: 0.000999,
      savings: '66% off',
      features: ['Everything in Business', 'Priority processing', 'Custom integration', 'Dedicated account manager']
    },
    {
      name: 'Elite',
      credits: 250000,
      price: 199.95,
      pricePerEmail: 0.000799,
      savings: '73% off',
      features: ['Everything in Enterprise', 'White-glove service', 'Custom API limits', 'SLA guarantee']
    }
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCredits = (tier: PricingTier) => {
    setSelectedTier(tier);
    setShowComingSoon(true);
  };

  const closeModal = () => {
    setShowComingSoon(false);
    setSelectedTier(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if credits are low (less than 2000)
  const isLowCredits = (user?.credits || 0) < 2000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300"></div>
              <span className="font-bold text-xl text-slate-900">OnlyValidEmails</span>
            </Link>
            
            <Link 
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200 px-4 py-2 inline-flex items-center gap-2 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Low Credits Warning Banner */}
        {isLowCredits && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-[28px] p-6 flex items-center justify-between shadow-lg shadow-amber-500/10 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900">Running Low on Credits!</h3>
                <p className="text-sm text-amber-700">You have {user?.credits.toLocaleString()} credits remaining. Buy more to keep verifying.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header with Credit Balance */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-[56px] font-bold mb-4 text-slate-900 tracking-tight">
            Get Credits
          </h1>
          <p className="text-[17px] text-slate-600 mb-8">
            Choose the perfect package for your email verification needs
          </p>

          {/* Current Balance Card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-[28px] p-10 border-2 border-blue-200 max-w-md">
            <div className="text-sm text-slate-600 mb-2 font-medium">Your Available Credits</div>
            <div className="text-[64px] font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 leading-none">
              {user?.credits.toLocaleString()}
            </div>
            <p className="text-sm text-slate-500">
              {user?.credits > 0 
                ? `You can verify ${user?.credits.toLocaleString()} more emails`
                : 'Purchase credits to start verifying emails'}
            </p>
          </div>
        </div>

        {/* Pricing Tiers Grid */}
        <div className="mb-16">
          <h2 className="text-[32px] font-bold text-slate-900 mb-8 tracking-tight">One-Time Credit Packages</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pricingTiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`relative bg-white rounded-[28px] p-8 border-2 transition-all duration-500 hover:scale-105 animate-fade-in-up ${
                  tier.popular
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    MOST POPULAR
                  </div>
                )}

                {tier.savings && !tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    {tier.savings}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{tier.name}</h3>
                  <div className="text-5xl font-bold text-slate-900 mb-2">
                    ${tier.price}
                  </div>
                  <p className="text-base text-slate-600 font-medium mb-1">
                    {tier.credits.toLocaleString()} credits
                  </p>
                  <p className="text-xs text-slate-400">
                    ${tier.pricePerEmail.toFixed(5)} per email
                  </p>
                </div>

                <button
                  onClick={() => handleBuyCredits(tier)}
                  className={`w-full py-3.5 rounded-full text-base font-semibold transition-all duration-300 mb-6 ${
                    tier.popular
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Buy Now
                </button>

                <div className="space-y-3 text-sm">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-[28px] p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">💰 Credits Never Expire</h3>
              <p className="text-blue-800 leading-relaxed">
                All credits are one-time purchases with no expiration date. Use them whenever you need. 
                No subscriptions, no monthly fees, no hidden charges. Buy once, use forever.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl animate-scale-up">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Payment Integration Coming Soon! 🚀
              </h2>
              
              {selectedTier && (
                <div className="bg-blue-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
                  <p className="text-slate-600 mb-3">You selected:</p>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {selectedTier.name} Plan
                  </div>
                  <div className="text-lg text-slate-700">
                    {selectedTier.credits.toLocaleString()} credits - ${selectedTier.price}
                  </div>
                </div>
              )}
              
              <p className="text-slate-600 mb-8 leading-relaxed">
                We're finalizing our Stripe integration to provide you with a secure payment experience. 
                This feature will be available very soon!
              </p>
              
              <button
                onClick={closeModal}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}