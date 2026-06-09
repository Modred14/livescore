// src/app/login/page.js

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input, { PasswordInput } from '@/components/ui/Input';

// export const metadata = {
//   title: 'Sign In',
// };

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Auth logic will be wired in Phase 2
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.email)    newErrors.email    = 'Email is required.';
    if (!form.password) newErrors.password = 'Password is required.';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    // TODO Phase 2: call authService.login()
    console.log('Login submitted:', form);
  };

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
          No account?{' '}
          <Link href={ROUTES.REGISTER} className="text-blue-600 font-semibold hover:underline">
            Sign up free
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
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Welcome back</h1>
              <p className="text-sm text-slate-500 mt-1.5">Sign in to manage your tournaments</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
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

              <div>
                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  autoComplete="current-password"
                />
                <div className="flex justify-end mt-1.5">
                  <Link
                    href="#"
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" fullWidth size="lg" className="mt-2">
                Sign in
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">or continue with</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* OAuth placeholder buttons */}
            <div className="grid grid-cols-2 gap-3">
              {['Google', 'GitHub'].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Coming soon"
                >
                  {provider === 'Google' && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  {provider === 'GitHub' && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-slate-800">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  )}
                  {provider}
                </button>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link href={ROUTES.REGISTER} className="text-blue-600 font-semibold hover:underline">
              Create one for free
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}