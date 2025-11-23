'use client';

import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface PromoCodeInputProps {
  variant?: 'compact' | 'full';
  onSuccess?: (creditsAdded: number, totalCredits: number) => void;
}

export default function PromoCodeInput({ variant = 'full', onSuccess }: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter a promo code' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      setMessage(null);

      const response = await axios.post(
        `${API_URL}/api/promo/apply`,
        { code: promoCode.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ 
        type: 'success', 
        text: response.data.message || `${response.data.creditsAdded.toLocaleString()} credits added!` 
      });
      
      setPromoCode('');
      
      // Callback for parent to refresh credits
      if (onSuccess) {
        onSuccess(response.data.creditsAdded, response.data.totalCredits);
      }

      // Auto-hide success message after 5 seconds
      setTimeout(() => setMessage(null), 5000);

    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to apply promo code';
      setMessage({ type: 'error', text: errorMsg });
      
      // Auto-hide error message after 8 seconds
      setTimeout(() => setMessage(null), 8000);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="relative">
        <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="PROMO CODE"
            className="w-32 px-3 py-2 border-2 border-slate-200 rounded-xl text-[13px] font-mono font-bold focus:border-cyan-500 focus:outline-none uppercase"
            disabled={loading}
            maxLength={20}
          />
          <button
            type="submit"
            disabled={loading || !promoCode.trim()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-[13px] font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Applying...' : 'Apply'}
          </button>
        </form>

        {/* Compact Message - Positioned absolutely */}
        {message && (
          <div className={`absolute top-full mt-2 right-0 w-72 p-3 rounded-xl shadow-lg border-2 animate-fade-in-down z-50 ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <p className={`text-[13px] font-medium ${
                message.type === 'success' ? 'text-emerald-900' : 'text-red-900'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant for Settings page
  return (
    <div className="space-y-4">
      <form onSubmit={handleApplyPromo} className="space-y-4">
        <div>
          <label className="block text-[15px] font-medium text-slate-900 mb-3">
            Enter Promo Code
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="WELCOME2024"
              className="flex-1 px-5 py-4 border-2 border-slate-200 rounded-[14px] text-[17px] font-mono font-bold focus:border-cyan-500 focus:outline-none focus:shadow-xl focus:shadow-cyan-500/10 transition-all duration-300 hover:border-slate-300 uppercase"
              disabled={loading}
              maxLength={20}
            />
            <button
              type="submit"
              disabled={loading || !promoCode.trim()}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[14px] text-[15px] font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Applying...' : 'Apply Code'}
            </button>
          </div>
          <p className="text-[13px] text-slate-500 mt-2">
            Enter your promo code to receive free credits. Each account can only redeem one promo code.
          </p>
        </div>
      </form>

      {/* Full Message */}
      {message && (
        <div className={`p-5 rounded-[14px] border-2 animate-fade-in-up ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            {message.type === 'success' ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <p className={`text-[15px] font-semibold mb-1 ${
                message.type === 'success' ? 'text-emerald-900' : 'text-red-900'
              }`}>
                {message.type === 'success' ? 'Success!' : 'Unable to Apply'}
              </p>
              <p className={`text-[14px] ${
                message.type === 'success' ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}