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

  // ✅ Validation functions
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

  // ✅ Handle blur and change
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

  // ✅ Updated handleSubmit — connects to backend
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

  // ✅ JSX stays same (UI unchanged)
  return (
    <main className="min-h-screen flex">
      {/* Left gradient and illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-white max-w-md">
          <h2 className="text-4xl font-bold mb-4">Start verifying emails in seconds</h2>
          <p className="text-lg text-purple-100">No credit card required. Try it free with instant credits.</p>
        </div>
      </div>

      {/* Right form section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl"></div>
            <span className="font-bold text-2xl">OnlyValidEmails</span>
          </Link>

          <h1 className="text-4xl font-bold mb-2">Create your account</h1>
          <p className="text-gray-600 mb-6">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">Sign in</Link>
          </p>

          {errors.general && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 text-sm">{errors.general}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                  touched.name && errors.name
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-purple-500'
                } focus:outline-none`}
              />
              {touched.name && errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="you@company.com"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                  touched.email && errors.email
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-purple-500'
                } focus:outline-none`}
              />
              {touched.email && errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                  touched.password && errors.password
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-purple-500'
                } focus:outline-none`}
              />
              {touched.password && errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-purple-500'
                } focus:outline-none`}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                onBlur={() => handleBlur('agreeToTerms')}
                className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-purple-600 hover:text-purple-700">Terms</Link> and{' '}
                <Link href="/privacy" className="text-purple-600 hover:text-purple-700">Privacy Policy</Link>
              </label>
            </div>
            {touched.agreeToTerms && errors.agreeToTerms && (
              <p className="mt-2 text-sm text-red-600">{errors.agreeToTerms}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
