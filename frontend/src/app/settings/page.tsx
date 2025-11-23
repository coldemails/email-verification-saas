'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../lib/auth';
import PromoCodeInput from '../../../components/PromoCodeInput';
import PromoCodeHistory from '../../../components/PromoCodeHistory';

export default function SettingsPage() {
  useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'api' | 'billing' | 'promo'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Profile form
  const [fullName, setFullName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [company, setCompany] = useState('Acme Corp');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(true);
  const [lowCredits, setLowCredits] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // API settings
  const [apiKey, setApiKey] = useState('sk_live_abc123xyz789...');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const regenerateApiKey = () => {
    if (confirm('Are you sure? This will invalidate your current API key.')) {
      setApiKey('sk_live_' + Math.random().toString(36).substring(2, 15));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b-2 border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[10px] shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-semibold text-[19px] text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
              OnlyValidEmails
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="text-[15px] text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200 px-4 py-2 inline-flex items-center gap-2 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <button className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-[15px] hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300">
              JD
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-[56px] font-semibold tracking-tight text-slate-900 mb-3 leading-[1.05]">
            Account Settings
          </h1>
          <p className="text-[17px] text-slate-600 leading-relaxed">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 bg-emerald-50 border-2 border-emerald-200 rounded-[20px] p-5 flex items-center gap-3 animate-fade-in-up shadow-lg shadow-emerald-500/10">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-emerald-900 font-medium text-[15px]">Settings saved successfully!</span>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[28px] border-2 border-slate-200 p-3 sticky top-28">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-5 py-4 rounded-[14px] font-medium transition-all duration-300 flex items-center gap-3 ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-[15px]">Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('password')}
                className={`w-full text-left px-5 py-4 rounded-[14px] font-medium transition-all duration-300 flex items-center gap-3 mt-2 ${
                  activeTab === 'password'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[15px]">Password</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-5 py-4 rounded-[14px] font-medium transition-all duration-300 flex items-center gap-3 mt-2 ${
                  activeTab === 'notifications'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <span className="text-[15px]">Notifications</span>
              </button>

              <button
                onClick={() => setActiveTab('api')}
                className={`w-full text-left px-5 py-4 rounded-[14px] font-medium transition-all duration-300 flex items-center gap-3 mt-2 ${
                  activeTab === 'api'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-[15px]">API Keys</span>
              </button>

              <button
                onClick={() => setActiveTab('billing')}
                className={`w-full text-left px-5 py-4 rounded-[14px] font-medium transition-all duration-300 flex items-center gap-3 mt-2 ${
                  activeTab === 'billing'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                <span className="text-[15px]">Billing</span>
              </button>

              <button
                onClick={() => setActiveTab('promo')}
                className={`w-full text-left px-5 py-4 rounded-[14px] font-medium transition-all duration-300 flex items-center gap-3 mt-2 ${
                  activeTab === 'promo'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                <span className="text-[15px]">Promo Codes</span>
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[28px] border-2 border-slate-200 p-10">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="animate-fade-in-up">
                  <h2 className="text-[32px] font-semibold tracking-tight text-slate-900 mb-8">Profile Information</h2>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div>
                      <label className="block text-[15px] font-medium text-slate-900 mb-3">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-5 py-4 border-2 border-slate-200 rounded-[14px] text-[17px] focus:border-blue-500 focus:outline-none focus:shadow-xl focus:shadow-blue-500/10 transition-all duration-300 hover:border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[15px] font-medium text-slate-900 mb-3">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-4 border-2 border-slate-200 rounded-[14px] text-[17px] focus:border-blue-500 focus:outline-none focus:shadow-xl focus:shadow-blue-500/10 transition-all duration-300 hover:border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[15px] font-medium text-slate-900 mb-3">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-5 py-4 border-2 border-slate-200 rounded-[14px] text-[17px] focus:border-blue-500 focus:outline-none focus:shadow-xl focus:shadow-blue-500/10 transition-all duration-300 hover:border-slate-300"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full text-[17px] font-medium hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div className="animate-fade-in-up">
                  <h2 className="text-[32px] font-semibold tracking-tight text-slate-900 mb-8">Change Password</h2>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label className="block text-[15px] font-medium text-slate-900 mb-3">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-5 py-4 pr-12 border-2 border-slate-200 rounded-[14px] text-[17px] focus:border-blue-500 focus:outline-none focus:shadow-xl focus:shadow-blue-500/10 transition-all duration-300 hover:border-slate-300"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors duration-200 p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {showCurrentPassword ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            ) : (
                              <>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[15px] font-medium text-slate-900 mb-3">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-5 py-4 pr-12 border-2 border-slate-200 rounded-[14px] text-[17px] focus:border-blue-500 focus:outline-none focus:shadow-xl focus:shadow-blue-500/10 transition-all duration-300 hover:border-slate-300"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors duration-200 p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {showNewPassword ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            ) : (
                              <>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[15px] font-medium text-slate-900 mb-3">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-5 py-4 pr-12 border-2 border-slate-200 rounded-[14px] text-[17px] focus:border-blue-500 focus:outline-none focus:shadow-xl focus:shadow-blue-500/10 transition-all duration-300 hover:border-slate-300"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors duration-200 p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {showConfirmPassword ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            ) : (
                              <>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full text-[17px] font-medium hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="animate-fade-in-up">
                  <h2 className="text-[32px] font-semibold tracking-tight text-slate-900 mb-8">Notification Preferences</h2>
                  <form onSubmit={handleNotificationsSubmit} className="space-y-4">
                    {/* Email Notifications Toggle */}
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[20px] hover:bg-slate-100 transition-colors duration-300">
                      <div>
                        <div className="font-medium text-slate-900 text-[17px] mb-1">Email Notifications</div>
                        <div className="text-[15px] text-slate-600">Receive email updates</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`relative w-16 h-9 rounded-full transition-all duration-300 ${
                          emailNotifications ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/25' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full transition-transform duration-300 shadow-md ${
                            emailNotifications ? 'translate-x-7' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Verification Complete */}
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[20px] hover:bg-slate-100 transition-colors duration-300">
                      <div>
                        <div className="font-medium text-slate-900 text-[17px] mb-1">Verification Complete</div>
                        <div className="text-[15px] text-slate-600">When verification finishes</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVerificationComplete(!verificationComplete)}
                        className={`relative w-16 h-9 rounded-full transition-all duration-300 ${
                          verificationComplete ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/25' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full transition-transform duration-300 shadow-md ${
                            verificationComplete ? 'translate-x-7' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Low Credits */}
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[20px] hover:bg-slate-100 transition-colors duration-300">
                      <div>
                        <div className="font-medium text-slate-900 text-[17px] mb-1">Low Credits Alert</div>
                        <div className="text-[15px] text-slate-600">When credits are below 1,000</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLowCredits(!lowCredits)}
                        className={`relative w-16 h-9 rounded-full transition-all duration-300 ${
                          lowCredits ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/25' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full transition-transform duration-300 shadow-md ${
                            lowCredits ? 'translate-x-7' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Weekly Report */}
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[20px] hover:bg-slate-100 transition-colors duration-300">
                      <div>
                        <div className="font-medium text-slate-900 text-[17px] mb-1">Weekly Report</div>
                        <div className="text-[15px] text-slate-600">Summary of your activity</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWeeklyReport(!weeklyReport)}
                        className={`relative w-16 h-9 rounded-full transition-all duration-300 ${
                          weeklyReport ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/25' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full transition-transform duration-300 shadow-md ${
                            weeklyReport ? 'translate-x-7' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full text-[17px] font-medium hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
                      >
                        {isLoading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* API Tab */}
              {activeTab === 'api' && (
                <div className="animate-fade-in-up">
                  <h2 className="text-[32px] font-semibold tracking-tight text-slate-900 mb-3">API Keys</h2>
                  <p className="text-[17px] text-slate-600 mb-10 leading-relaxed">
                    Use these keys to integrate our verification service with your application.
                  </p>

                  <div className="space-y-8">
                    <div className="bg-slate-50 rounded-[20px] p-8 border-2 border-slate-200">
                      <label className="block text-[15px] font-medium text-slate-900 mb-4">
                        Your API Key
                      </label>
                      <div className="flex gap-3">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={apiKey}
                          readOnly
                          className="flex-1 px-5 py-4 border-2 border-slate-200 rounded-[14px] bg-white font-mono text-[15px] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="px-5 py-4 bg-slate-200 rounded-[14px] hover:bg-slate-300 transition-colors duration-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {showApiKey ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            ) : (
                              <>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </>
                            )}
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(apiKey);
                            setShowSuccess(true);
                            setTimeout(() => setShowSuccess(false), 2000);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-[14px] hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 font-medium text-[15px]"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={regenerateApiKey}
                        className="bg-red-50 text-red-600 px-8 py-4 rounded-full text-[17px] font-medium hover:bg-red-100 transition-all duration-300 border-2 border-red-200"
                      >
                        Regenerate Key
                      </button>
                      <Link
                        href="/docs"
                        className="bg-slate-100 text-slate-700 px-8 py-4 rounded-full text-[17px] font-medium hover:bg-slate-200 transition-all duration-300 border-2 border-slate-200"
                      >
                        View Documentation
                      </Link>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-[20px] p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-[15px] text-blue-900 leading-relaxed">
                          <strong className="font-semibold">Keep your API key secure!</strong> Don't share it publicly or commit it to version control.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="animate-fade-in-up">
                  <h2 className="text-[32px] font-semibold tracking-tight text-slate-900 mb-10">Billing & Usage</h2>
                  
                  <div className="space-y-8">
                    {/* Current Balance */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-[28px] p-10 border-2 border-blue-200">
                      <div className="text-[15px] text-slate-600 mb-2 font-medium">Available Credits</div>
                      <div className="text-[64px] font-semibold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6 leading-none">
                        24,580
                      </div>
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full text-[17px] font-medium hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 group"
                      >
                        Buy More Credits
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>

                    {/* Recent Purchases */}
                    <div>
                      <h3 className="font-semibold text-[21px] text-slate-900 mb-6">Recent Purchases</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[20px] hover:bg-slate-100 transition-colors duration-300">
                          <div>
                            <div className="font-medium text-[17px] text-slate-900">10,000 credits</div>
                            <div className="text-[15px] text-slate-600 mt-1">Nov 1, 2025</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[19px] text-slate-900">$9.95</div>
                            <div className="text-[13px] text-emerald-600 font-medium mt-1">Completed</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[20px] hover:bg-slate-100 transition-colors duration-300">
                          <div>
                            <div className="font-medium text-[17px] text-slate-900">25,000 credits</div>
                            <div className="text-[15px] text-slate-600 mt-1">Oct 15, 2025</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[19px] text-slate-900">$23.95</div>
                            <div className="text-[13px] text-emerald-600 font-medium mt-1">Completed</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Promo Codes Tab */}
              {activeTab === 'promo' && (
                <div className="animate-fade-in-up">
                  <h2 className="text-[32px] font-semibold tracking-tight text-slate-900 mb-4">Promo Codes</h2>
                  <p className="text-[16px] text-slate-600 mb-10">
                    Redeem promo codes to get free credits added to your account.
                  </p>
                  
                  <div className="space-y-8">
                    {/* Promo Code Input */}
                    <div className="bg-white border-2 border-slate-200 rounded-[20px] p-8">
                      <PromoCodeInput variant="full" />
                    </div>

                    {/* Promo Code History */}
                    <div className="bg-white border-2 border-slate-200 rounded-[20px] p-8">
                      <PromoCodeHistory />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}