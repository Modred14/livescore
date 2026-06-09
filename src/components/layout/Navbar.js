// src/components/layout/Navbar.js

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import Button from '@/components/ui/Button';

const NAV_LINKS = [
  { label: 'Tournaments', href: ROUTES.TOURNAMENTS },
  { label: 'Dashboard',   href: ROUTES.DASHBOARD },
];

export default function Navbar() {
  const pathname    = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="container-app">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Logo ── */}
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="TournaLive home"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </span>
            <span className="font-display font-bold text-xl text-slate-900 tracking-tight">
              Tourna<span className="text-blue-600">Live</span>
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive(link.href)
                    ? 'text-blue-700 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50',
                ].join(' ')}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Desktop CTA ── */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={ROUTES.LOGIN}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Sign in
            </Link>
            <Button href={ROUTES.REGISTER} size="sm">
              Get started
            </Button>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white animate-fade-in">
          <div className="container-app py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={[
                  'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-blue-700 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50',
                ].join(' ')}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-100 mt-2 pt-3 flex flex-col gap-2 pb-2">
              <Link
                href={ROUTES.LOGIN}
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Sign in
              </Link>
              <div className="px-4">
                <Button href={ROUTES.REGISTER} size="sm" fullWidth onClick={() => setOpen(false)}>
                  Get started free
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}