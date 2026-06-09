// src/app/tournaments/create/page.js

'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TournamentForm from '@/components/tournaments/TournamentForm';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

function CreateTournamentContent() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400" aria-label="Breadcrumb">
          <Link href={ROUTES.DASHBOARD} className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
          <Link href={ROUTES.TOURNAMENTS} className="hover:text-blue-600 transition-colors">My Tournaments</Link>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
          <span className="text-slate-600 font-medium">Create Tournament</span>
        </nav>

        {/* ── Page header ── */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-brand shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 000 4.5h9a2.25 2.25 0 000-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.798 49.798 0 00-6.093-.377.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Create Tournament</h1>
            <p className="text-sm text-slate-500 mt-0.5">Set up a new tournament to manage teams, matches and live scoring.</p>
          </div>
        </div>

        {/* ── Form ── */}
        <TournamentForm mode="create" />
      </div>
    </DashboardLayout>
  );
}

export default function CreateTournamentPage() {
  return (
    <ProtectedRoute>
      <CreateTournamentContent />
    </ProtectedRoute>
  );
}