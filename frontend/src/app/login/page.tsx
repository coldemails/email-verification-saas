'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched({ ...touched, [field]: true });
    if (field === 'email') {
      setErrors({ ...errors, email: validateEmail(email) });
    } else {
      setErrors({ ...errors, password: validatePassword(password) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
        general: ''
      });
      setTouched({ email: true, password: true });
      return;
    }

    setErrors({ email: '', password: '', general: '' });
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      const status = err.response?.status;
      
      if (status === 429) {
        setErrors({ ...errors, general: 'Too many login attempts. Please try again after 15 minutes.' });
        setAttemptsLeft(0);
      } else if (status === 401) {
        const currentAttempts = parseInt(err.response?.headers['x-ratelimit-remaining'] || '4');
        setAttemptsLeft(Math.max(0, currentAttempts));
        
        if (currentAttempts > 0) {
          setErrors({ ...errors, general: `Invalid email or password. ${currentAttempts} attempt${currentAttempts !== 1 ? 's' : ''} remaining.` });
        } else {
          setErrors({ ...errors, general: 'Account locked. Too many failed attempts. Try again in 15 minutes.' });
        }
      } else {
        setErrors({ ...errors, general: err.response?.data?.error || 'Login failed. Please try again.' });
      }
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

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-[56px] font-semibold tracking-tight text-slate-900 mb-4 leading-[1.05] animate-fade-in-up">
              Welcome back
            </h1>
            <p className="text-[17px] text-slate-600 leading-relaxed animate-fade-in-up animation-delay-100">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-blue-600 hover:text-cyan-600 font-medium transition-colors duration-200 inline-flex items-center gap-1 group"
              >
                Sign up for free
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </p>
          </div>

          {/* Error Messages */}
          {errors.general && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-[20px] p-5 flex items-start gap-3 animate-fade-in-up">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-red-900 text-[15px] font-medium leading-relaxed">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Warning Message */}
          {attemptsLeft !== null && attemptsLeft > 0 && attemptsLeft < 5 && (
            <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-[20px] p-5 flex items-start gap-3 animate-fade-in-up">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-amber-900 text-[15px] font-medium leading-relaxed">
                  ⚠️ {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before 15-minute lockout
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up animation-delay-200">
            {/* Email Field */}
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
                    if (touched.email) {
                      setErrors({ ...errors, email: validateEmail(e.target.value) });
                    }
                  }}
                  onBlur={() => handleBlur('email')}
                  className={`w-full px-5 py-4 rounded-[14px] border-2 text-[17px] transition-all duration-300 ${
                    touched.email && errors.email
                      ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:bg-white focus:shadow-lg focus:shadow-red-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:shadow-xl focus:shadow-blue-500/10'
                  } focus:outline-none placeholder:text-slate-400`}
                  placeholder="you@company.com"
                />
                {!errors.email && email && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              {touched.email && errors.email && (
                <p className="mt-2.5 text-[14px] text-red-600 flex items-center gap-2 animate-fade-in-up">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="password" className="block text-[15px] font-medium text-slate-900">
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-[15px] text-blue-600 hover:text-cyan-600 font-medium transition-colors duration-200 inline-flex items-center gap-1 group"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) {
                      setErrors({ ...errors, password: validatePassword(e.target.value) });
                    }
                  }}
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-5 py-4 rounded-[14px] border-2 text-[17px] transition-all duration-300 pr-12 ${
                    touched.password && errors.password
                      ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:bg-white focus:shadow-lg focus:shadow-red-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:shadow-xl focus:shadow-blue-500/10'
                  } focus:outline-none placeholder:text-slate-400`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-100"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="mt-2.5 text-[14px] text-red-600 flex items-center gap-2 animate-fade-in-up">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center group cursor-pointer">
              <input
                id="remember"
                type="checkbox"
                className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer transition-all duration-200"
              />
              <label htmlFor="remember" className="ml-3 text-[15px] text-slate-600 cursor-pointer select-none group-hover:text-slate-900 transition-colors duration-200">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
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
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10 animate-fade-in-up animation-delay-300">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 bg-white text-[15px] text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in-up animation-delay-400">
            <button className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-slate-200 rounded-[14px] hover:border-blue-200 hover:bg-slate-50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-[15px] text-slate-900">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-slate-200 rounded-[14px] hover:border-blue-200 hover:bg-slate-50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span className="font-medium text-[15px] text-slate-900">GitHub</span>
            </button>
          </div>

          {/* Terms */}
          <div className="mt-10 text-center text-[14px] text-slate-500 leading-relaxed animate-fade-in-up animation-delay-400">
            <p>
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-cyan-600 transition-colors duration-200 font-medium">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-cyan-600 transition-colors duration-200 font-medium">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero */}
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
              <span className="text-6xl group-hover:scale-110 transition-transform duration-500">✨</span>
            </div>
            <h2 className="text-[64px] font-semibold mb-8 leading-[1.05] tracking-tight">
              Clean email lists<br />in minutes
            </h2>
            <p className="text-[21px] text-blue-100 leading-relaxed">
              Join thousands of marketers who trust OnlyValidEmails to keep their lists clean and deliverability high.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-5 mb-12">
            {[
              { value: '97%', label: 'Accuracy Rate', delay: '0s' },
              { value: '1.7k', label: 'Emails/Minute', delay: '0.1s' },
              { value: '10M+', label: 'Verified', delay: '0.2s' },
              { value: '99.9%', label: 'Uptime', delay: '0.3s' },
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-[24px] p-8 hover:bg-white/15 transition-all duration-500 hover:scale-[1.05] border border-white/10 group cursor-pointer animate-fade-in-up"
                style={{ animationDelay: stat.delay }}
              >
                <div className="text-[56px] font-semibold mb-2 tracking-tight leading-none group-hover:scale-110 transition-transform duration-500">
                  {stat.value}
                </div>
                <div className="text-blue-100 text-[15px] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-[32px] p-10 border border-white/10 hover:bg-white/15 transition-all duration-500 hover:scale-[1.02] animate-fade-in-up animation-delay-400">
            <div className="flex items-center gap-1 mb-5">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className="w-5 h-5 fill-yellow-400 hover:scale-125 transition-transform duration-300" 
                  viewBox="0 0 20 20"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <p className="text-[17px] text-white mb-7 leading-relaxed">
              "OnlyValidEmails saved us hours of manual work. The accuracy is incredible and the interface is so simple to use!"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center font-semibold text-[19px] shadow-xl shadow-blue-900/30 hover:scale-110 transition-transform duration-300">
                SM
              </div>
              <div>
                <div className="font-semibold text-[17px] mb-0.5">Sarah Mitchell</div>
                <div className="text-[15px] text-blue-100">Marketing Director at TechFlow</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}