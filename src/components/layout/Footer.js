// src/components/layout/Footer.js

import Link from 'next/link';
import { ROUTES, APP_NAME } from '@/lib/constants';

const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: [
      { label: 'Tournaments', href: ROUTES.TOURNAMENTS },
      { label: 'Dashboard',   href: ROUTES.DASHBOARD },
      { label: 'Live Scores', href: ROUTES.TOURNAMENTS },
      { label: 'Standings',   href: ROUTES.TOURNAMENTS },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign in',        href: ROUTES.LOGIN },
      { label: 'Create account', href: ROUTES.REGISTER },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',   href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms',   href: '#' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* ── Main footer grid ── */}
      <div className="container-app py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand column */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href={ROUTES.HOME} className="inline-flex items-center gap-2.5 mb-4 group">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </span>
            <span className="font-display font-bold text-xl text-white tracking-tight">
              Tourna<span className="text-blue-400">Live</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
            The all-in-one platform to create, manage, and broadcast football tournaments with live scoring.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3 mt-5">
            {[
              {
                label: 'Twitter',
                href: '#',
                path: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84',
              },
              {
                label: 'GitHub',
                href: '#',
                path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z',
              },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_LINKS.map((section) => (
          <div key={section.heading}>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
              {section.heading}
            </h3>
            <ul className="space-y-2.5">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-slate-800">
        <div className="container-app py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {year} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}