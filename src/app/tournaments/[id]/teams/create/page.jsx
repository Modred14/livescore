// src/app/tournaments/[id]/teams/create/page.js

'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TeamForm from '@/components/teams/TeamForm';
import { SectionSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import { useTournament } from '@/hooks/useTournament';
import useAuth from '@/hooks/useAuth';

function CreateTeamContent({ tournamentId }) {
  const { user } = useAuth();
  const { tournament, loading } = useTournament(tournamentId);
  const isOwner = !!user && tournament?.owner_id === user.id;

  if (loading) return <DashboardLayout><SectionSpinner message="Loading…" /></DashboardLayout>;

  if (!tournament) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-slate-500">Tournament not found.</p>
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
          <p className="text-sm text-slate-500 mt-1">Only the tournament owner can add teams.</p>
        </div>
        <Button href={ROUTES.TEAMS(tournamentId)} variant="secondary" size="sm">Back to Teams</Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link href={ROUTES.TOURNAMENT(tournamentId)} className="hover:text-blue-600 transition-colors truncate max-w-[120px]">
            {tournament.name}
          </Link>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
          <Link href={ROUTES.TEAMS(tournamentId)} className="hover:text-blue-600 transition-colors">Teams</Link>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
          <span className="text-slate-600 font-medium">Add Team</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-brand shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Add Team</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Adding to <span className="font-medium text-slate-700">{tournament.name}</span>
            </p>
          </div>
        </div>

        <TeamForm mode="create" tournamentId={tournamentId} />
      </div>
    </DashboardLayout>
  );
}

export default function CreateTeamPage({ params }) {
  return <ProtectedRoute><CreateTeamContent tournamentId={params.id} /></ProtectedRoute>;
}