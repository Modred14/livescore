// src/app/tournaments/[id]/matches/create/page.js

'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MatchForm from '@/components/matches/MatchForm';
import { SectionSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import { useTournament } from '@/hooks/useTournament';
import useAuth from '@/hooks/useAuth';

function Chevron() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
      <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function CreateMatchContent({ tournamentId }) {
  const { user }                          = useAuth();
  const { tournament, loading }           = useTournament(tournamentId);
  const isOwner = !!user && tournament?.owner_id === user.id;

  if (loading) return <DashboardLayout><SectionSpinner message="Loading…" /></DashboardLayout>;

  if (!tournament) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-slate-500 text-sm">Tournament not found.</p>
        <Button href={ROUTES.TOURNAMENTS} variant="secondary" size="sm">Back to Tournaments</Button>
      </div>
    </DashboardLayout>
  );

  if (!isOwner) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-red-500">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="font-display font-bold text-slate-700">Access Denied</h2>
          <p className="text-sm text-slate-500 mt-1">Only the tournament owner can schedule matches.</p>
        </div>
        <Button href={ROUTES.MATCHES(tournamentId)} variant="secondary" size="sm">Back to Matches</Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
          <Link href={ROUTES.TOURNAMENT(tournamentId)} className="hover:text-blue-600 transition-colors truncate max-w-[100px]">
            {tournament.name}
          </Link>
          <Chevron />
          <Link href={ROUTES.MATCHES(tournamentId)} className="hover:text-blue-600 transition-colors">Matches</Link>
          <Chevron />
          <span className="text-slate-600 font-medium">Schedule Match</span>
        </nav>

        {/* Page header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-brand shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Schedule Match</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Adding to <span className="font-medium text-slate-700">{tournament.name}</span>
            </p>
          </div>
        </div>

        <MatchForm
          mode="create"
          tournamentId={tournamentId}
          tournamentType={tournament.tournament_type}
        />
      </div>
    </DashboardLayout>
  );
}

export default function CreateMatchPage({ params }) {
  return <ProtectedRoute><CreateMatchContent tournamentId={params.id} /></ProtectedRoute>;
}