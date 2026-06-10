// src/app/tournaments/[id]/edit/page.js

'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TournamentForm from '@/components/tournaments/TournamentForm';
import { SectionSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import { useTournament } from '@/hooks/useTournament';
import Link from 'next/link';

function EditTournamentContent({ id }) {
  const router = useRouter();
  const { tournament, loading, error, isOwner } = useTournament(id);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <SectionSpinner message="Loading tournament…" />
      </DashboardLayout>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (error || !tournament) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12 text-slate-300">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 1.998-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.502-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div className="text-center">
            <h2 className="font-display text-lg font-bold text-slate-700">Tournament not found</h2>
            <p className="text-sm text-slate-500 mt-1">{error || 'This tournament does not exist.'}</p>
          </div>
          <Button href={ROUTES.TOURNAMENTS} variant="secondary" size="sm">
            Back to Tournaments
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Ownership guard ──────────────────────────────────────────────────────
  if (!isOwner) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-red-500">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="font-display text-lg font-bold text-slate-700">Access Denied</h2>
            <p className="text-sm text-slate-500 mt-1">You do not have permission to edit this tournament.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button href={ROUTES.TOURNAMENT(id)} variant="secondary" size="sm">
              View Tournament
            </Button>
            <Button href={ROUTES.TOURNAMENTS} variant="neutral" size="sm">
              My Tournaments
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400" aria-label="Breadcrumb">
          <Link href={ROUTES.DASHBOARD} className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
            <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
          <Link href={ROUTES.TOURNAMENTS} className="hover:text-blue-600 transition-colors">
            My Tournaments
          </Link>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
            <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
          <Link
            href={ROUTES.TOURNAMENT(id)}
            className="hover:text-blue-600 transition-colors truncate max-w-[140px]"
          >
            {tournament.name}
          </Link>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
            <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
          <span className="text-slate-600 font-medium">Edit</span>
        </nav>

        {/* ── Page header ── */}
        <div className="flex items-start gap-4">
          {/* Tournament logo / icon */}
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0 overflow-hidden">
            {tournament.logo_url
              ? <img src={tournament.logo_url} alt={tournament.name} className="w-full h-full object-cover" />
              : <span>✏️</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-slate-900 truncate">
              Edit Tournament
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 truncate">
              Editing: <span className="font-medium text-slate-700">{tournament.name}</span>
            </p>
          </div>
          <Link
            href={ROUTES.TOURNAMENT(id)}
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd" />
            </svg>
            Back to tournament
          </Link>
        </div>

        {/* ── Change-status callout ── */}
        <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-blue-500 shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-blue-700">
            You can update any tournament details below, including changing its status from <strong>Draft → Upcoming → Active → Completed</strong>.
          </p>
        </div>

        {/* ── Form (pre-filled with existing data) ── */}
        <TournamentForm
          mode="edit"
          tournamentId={id}
          initialData={tournament}
        />
      </div>
    </DashboardLayout>
  );
}

export default function EditTournamentPage({ params }) {
  return (
    <ProtectedRoute>
      <EditTournamentContent id={params.id} />
    </ProtectedRoute>
  );
}