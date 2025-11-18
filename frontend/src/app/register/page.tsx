'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../lib/api';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: '',
    general: ''
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    agreeToTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    
    if (strength <= 25) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 50) return { strength, label: 'Fair', color: 'bg-amber-500' };
    if (strength <= 75) return { strength, label: 'Good', color: 'bg-blue-500' };
    return { strength, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  // Validation functions
  const validateName = (name: string) => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must include a number';
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const validateTerms = (agreeToTerms: boolean) => {
    if (!agreeToTerms) return 'You must agree to the terms';
    return '';
  };

  // Handle blur and change
  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });

    let error = '';
    switch (field) {
      case 'name':
        error = validateName(formData.name);
        break;
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'password':
        error = validatePassword(formData.password);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.confirmPassword, formData.password);
        break;
      case 'agreeToTerms':
        error = validateTerms(formData.agreeToTerms);
        break;
    }

    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (touched[name as keyof typeof touched]) {
      let error = '';
      switch (name) {
        case 'name':
          error = validateName(value);
          break;
        case 'email':
          error = validateEmail(value);
          break;
        case 'password':
          error = validatePassword(value);
          if (touched.confirmPassword) {
            const confirmError = validateConfirmPassword(formData.confirmPassword, value);
            setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
          }
          break;
        case 'confirmPassword':
          error = validateConfirmPassword(value, formData.password);
          break;
        case 'agreeToTerms':
          error = validateTerms(checked);
          break;
      }
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    const termsError = validateTerms(formData.agreeToTerms);

    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      agreeToTerms: termsError,
      general: ''
    });

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeToTerms: true
    });

    if (nameError || emailError || passwordError || confirmPasswordError || termsError) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register(formData.name, formData.email, formData.password);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      router.push('/dashboard');
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        general: error.response?.data?.error || 'Registration failed. Please try again.'
      }));
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
            className="flex items-center gap-3 mb-12 group w-fit"
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
          <div className="mb-10">
            <h1 className="text-[56px] font-semibold tracking-tight text-slate-900 mb-4 leading-[1.05] animate-fade-in-up">
              Get started free
            </h1>
            <p className="text-[17px] text-slate-600 leading-relaxed animate-fade-in-up animation-delay-100">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-cyan-600 font-medium transition-colors duration-200 inline-flex items-center gap-1 group"
              >
                Sign in
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up animation-delay-200">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-[15px] font-medium text-slate-900 mb-3">
                Full name
              </label>
              <div className="relative group">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur('name')}
                  className={`w-full px-5 py-4 rounded-[14px] border-2 text-[17px] transition-all duration-300 ${
                    touched.name && errors.name
                      ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:bg-white focus:shadow-lg focus:shadow-red-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:shadow-xl focus:shadow-blue-500/10'
                  } focus:outline-none placeholder:text-slate-400`}
                  placeholder="John Doe"
                />
                {!errors.name && formData.name && formData.name.length >= 2 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              {touched.name && errors.name && (
                <p className="mt-2.5 text-[14px] text-red-600 flex items-center gap-2 animate-fade-in-up">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[15px] font-medium text-slate-900 mb-3">
                Email address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  className={`w-full px-5 py-4 rounded-[14px] border-2 text-[17px] transition-all duration-300 ${
                    touched.email && errors.email
                      ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:bg-white focus:shadow-lg focus:shadow-red-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:shadow-xl focus:shadow-blue-500/10'
                  } focus:outline-none placeholder:text-slate-400`}
                  placeholder="you@company.com"
                />
                {!errors.email && formData.email && validateEmail(formData.email) === '' && (
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
              <label htmlFor="password" className="block text-[15px] font-medium text-slate-900 mb-3">
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-5 py-4 rounded-[14px] border-2 text-[17px] transition-all duration-300 pr-12 ${
                    touched.password && errors.password
                      ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:bg-white focus:shadow-lg focus:shadow-red-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:shadow-xl focus:shadow-blue-500/10'
                  } focus:outline-none placeholder:text-slate-400`}
                  placeholder="Create a strong password"
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
              
              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-3 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-slate-600">Password strength</span>
                    <span className={`text-[13px] font-medium ${
                      passwordStrength.label === 'Weak' ? 'text-red-600' :
                      passwordStrength.label === 'Fair' ? 'text-amber-600' :
                      passwordStrength.label === 'Good' ? 'text-blue-600' :
                      'text-emerald-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-500 ease-out`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {touched.password && errors.password && (
                <p className="mt-2.5 text-[14px] text-red-600 flex items-center gap-2 animate-fade-in-up">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[15px] font-medium text-slate-900 mb-3">
                Confirm password
              </label>
              <div className="relative group">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full px-5 py-4 rounded-[14px] border-2 text-[17px] transition-all duration-300 pr-12 ${
                    touched.confirmPassword && errors.confirmPassword
                      ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:bg-white focus:shadow-lg focus:shadow-red-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:shadow-xl focus:shadow-blue-500/10'
                  } focus:outline-none placeholder:text-slate-400`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-100"
                >
                  {showConfirmPassword ? (
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
                {!errors.confirmPassword && formData.confirmPassword && formData.confirmPassword === formData.password && (
                  <div className="absolute right-14 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-2.5 text-[14px] text-red-600 flex items-center gap-2 animate-fade-in-up">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start group cursor-pointer pt-2">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                onBlur={() => handleBlur('agreeToTerms')}
                className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer transition-all duration-200 mt-0.5"
              />
              <label htmlFor="agreeToTerms" className="ml-3 text-[15px] text-slate-600 cursor-pointer select-none group-hover:text-slate-900 transition-colors duration-200 leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:text-cyan-600 font-medium transition-colors duration-200">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-cyan-600 font-medium transition-colors duration-200">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {touched.agreeToTerms && errors.agreeToTerms && (
              <p className="mt-2 text-[14px] text-red-600 flex items-center gap-2 animate-fade-in-up">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.agreeToTerms}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full text-[17px] font-medium hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none group relative overflow-hidden mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create account
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8 animate-fade-in-up animation-delay-300">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 bg-white text-[15px] text-slate-500 font-medium">Or sign up with</span>
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
              <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🚀</span>
            </div>
            <h2 className="text-[64px] font-semibold mb-8 leading-[1.05] tracking-tight">
              Start verifying<br />in seconds
            </h2>
            <p className="text-[21px] text-blue-100 leading-relaxed">
              Join thousands of marketers and businesses using OnlyValidEmails to maintain perfect email lists.
            </p>
          </div>

          {/* Features Grid */}
          <div className="space-y-6 mb-12">
            {[
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Verify up to 1,770 emails per minute',
                gradient: 'from-cyan-500 to-sky-500',
                delay: '0s',
              },
              {
                icon: '🎯',
                title: '97% Accuracy',
                description: 'Industry-leading verification accuracy',
                gradient: 'from-blue-500 to-cyan-500',
                delay: '0.1s',
              },
              {
                icon: '🔒',
                title: 'Secure & Private',
                description: 'GDPR compliant with bank-level encryption',
                gradient: 'from-emerald-500 to-teal-500',
                delay: '0.2s',
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-start gap-5 p-6 bg-white/5 backdrop-blur-sm rounded-[20px] border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] animate-fade-in-up"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-[28px]">{feature.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[19px] mb-1">{feature.title}</h3>
                  <p className="text-[15px] text-blue-100 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="pt-8 border-t-2 border-white/10 animate-fade-in-up animation-delay-300">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full border-2 border-blue-600 flex items-center justify-center font-semibold shadow-lg">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[17px] font-semibold">Join 10,000+ users</p>
                <p className="text-[14px] text-blue-100">Already verifying millions of emails</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}