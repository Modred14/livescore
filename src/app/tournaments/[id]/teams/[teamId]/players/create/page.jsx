// src/app/tournaments/[id]/teams/[teamId]/players/create/page.js

'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PlayerForm from '@/components/players/PlayerForm';
import { SectionSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import { useTeam } from '@/hooks/useTeam';

function Chevron() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
      <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function AddPlayerContent({ tournamentId, teamId }) {
  const { team, loading, error, isOwner } = useTeam(tournamentId, teamId);

  if (loading) return (
    <DashboardLayout><SectionSpinner message="Loading…" /></DashboardLayout>
  );

  if (error || !team) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-slate-500 text-sm">{error || 'Team not found.'}</p>
        <Button href={ROUTES.TEAMS(tournamentId)} variant="secondary" size="sm">Back to Teams</Button>
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
          <p className="text-sm text-slate-500 mt-1">Only the tournament owner can add players.</p>
        </div>
        <Button href={ROUTES.TEAM(tournamentId, teamId)} variant="secondary" size="sm">Back to Team</Button>
      </div>
    </DashboardLayout>
  );

  const initials = team.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
          <Link href={ROUTES.TOURNAMENT(tournamentId)} className="hover:text-blue-600 transition-colors truncate max-w-[80px]">
            {team.tournament_name ?? 'Tournament'}
          </Link>
          <Chevron />
          <Link href={ROUTES.TEAMS(tournamentId)} className="hover:text-blue-600 transition-colors">Teams</Link>
          <Chevron />
          <Link href={ROUTES.TEAM(tournamentId, teamId)} className="hover:text-blue-600 transition-colors truncate max-w-[80px]">
            {team.name}
          </Link>
          <Chevron />
          <span className="text-slate-600 font-medium">Add Player</span>
        </nav>

        {/* Page header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-brand shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Add Player</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-5 h-5 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 overflow-hidden">
                {team.logo_url
                  ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                  : <span>{initials[0]}</span>
                }
              </div>
              <p className="text-sm text-slate-500">{team.name}</p>
            </div>
          </div>
        </div>

        {/* Info callout */}
        <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-blue-500 shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-blue-700">
            Jersey numbers must be unique within <strong>{team.name}</strong>. Numbers 1–99 are available.
          </p>
        </div>

        <PlayerForm
          mode="create"
          tournamentId={tournamentId}
          teamId={teamId}
        />
      </div>
    </DashboardLayout>
  );
}

export default function AddPlayerPage({ params }) {
  return (
    <ProtectedRoute>
      <AddPlayerContent tournamentId={params.id} teamId={params.teamId} />
    </ProtectedRoute>
  );
}