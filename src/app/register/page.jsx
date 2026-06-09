// src/app/register/page.js

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { validatePassword, isValidEmail } from '@/lib/helpers';
import Button from '@/components/ui/Button';
import Input, { PasswordInput } from '@/components/ui/Input';

// export const metadata = {
//   title: 'Create Account',
// };

const STEPS = ['Account', 'Profile', 'Done'];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
    agreedToTerms:   false,
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim())
      newErrors.name = 'Full name is required.';

    if (!form.email.trim())
      newErrors.email = 'Email address is required.';
    else if (!isValidEmail(form.email))
      newErrors.email = 'Enter a valid email address.';

    const pwCheck = validatePassword(form.password);
    if (!pwCheck.valid)
      newErrors.password = pwCheck.message;

    if (!form.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match.';

    if (!form.agreedToTerms)
      newErrors.agreedToTerms = 'You must accept the terms to continue.';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    // TODO Phase 2: call authService.register()
    console.log('Register submitted:', form);
    await new Promise((r) => setTimeout(r, 800)); // UI demo only
    setLoading(false);
  };

  /* ── Password strength ── */
  const pwStrength = (() => {
    const { password } = form;
    if (!password) return null;
    let score = 0;
    if (password.length >= 8)          score++;
    if (/[A-Z]/.test(password))        score++;
    if (/[0-9]/.test(password))        score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: 'Weak',   color: 'bg-red-500',    width: 'w-1/4' };
    if (score === 2) return { label: 'Fair',   color: 'bg-yellow-400', width: 'w-2/4' };
    if (score === 3) return { label: 'Good',   color: 'bg-blue-500',   width: 'w-3/4' };
    return             { label: 'Strong', color: 'bg-green-500',  width: 'w-full' };
  })();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* Top bar */}
      <div className="flex items-center justify-between h-16 px-6 md:px-10 border-b border-slate-200 bg-white">
        <Link href={ROUTES.HOME} className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </span>
          <span className="font-display font-bold text-lg text-slate-900">
            Tourna<span className="text-blue-600">Live</span>
          </span>
        </Link>
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link href={ROUTES.LOGIN} className="text-blue-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 md:p-10">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-blue-600">
                  <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 000 4.5h9a2.25 2.25 0 000-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.798 49.798 0 00-6.093-.377.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Create your account</h1>
              <p className="text-sm text-slate-500 mt-1.5">Start running tournaments in minutes</p>
            </div>

            {/* Benefits list */}
            <ul className="mb-7 grid grid-cols-1 gap-2">
              {[
                'Free to get started',
                'Unlimited tournaments',
                'Live scoring & standings',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-green-500 shrink-0">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              <Input
                id="name"
                name="name"
                type="text"
                label="Full name"
                placeholder="Emeka Okafor"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                required
                autoComplete="name"
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                  </svg>
                }
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                required
                autoComplete="email"
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                }
              />

              {/* Password with strength meter */}
              <div>
                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  autoComplete="new-password"
                />
                {/* Strength indicator */}
                {pwStrength && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${pwStrength.color} ${pwStrength.width}`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Strength: <span className="font-semibold">{pwStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
              />

              {/* Terms checkbox */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={form.agreedToTerms}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 leading-snug">
                    I agree to the{' '}
                    <Link href="#" className="text-blue-600 hover:underline font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="#" className="text-blue-600 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreedToTerms && (
                  <p className="mt-1 text-xs text-red-500" role="alert">{errors.agreedToTerms}</p>
                )}
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                className="mt-2"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className="text-blue-600 font-semibold hover:underline">
              Sign in instead
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}