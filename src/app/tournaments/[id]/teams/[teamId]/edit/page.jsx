// src/app/tournaments/[id]/teams/[teamId]/edit/page.js

'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TeamForm from '@/components/teams/TeamForm';
import { SectionSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import { useTeam } from '@/hooks/useTeam';

function EditTeamContent({ tournamentId, teamId }) {
  const { team, loading, error, isOwner } = useTeam(tournamentId, teamId);

  if (loading) return (
    <DashboardLayout><SectionSpinner message="Loading team…" /></DashboardLayout>
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
          <p className="text-sm text-slate-500 mt-1">Only the tournament owner can edit teams.</p>
        </div>
        <Button href={ROUTES.TEAM(tournamentId, teamId)} variant="secondary" size="sm">View Team</Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link href={ROUTES.TOURNAMENT(tournamentId)} className="hover:text-blue-600 transition-colors truncate max-w-[100px]">
            {team.tournament_name ?? 'Tournament'}
          </Link>
          <Chevron />
          <Link href={ROUTES.TEAMS(tournamentId)} className="hover:text-blue-600 transition-colors">Teams</Link>
          <Chevron />
          <Link href={ROUTES.TEAM(tournamentId, teamId)} className="hover:text-blue-600 transition-colors truncate max-w-[100px]">
            {team.name}
          </Link>
          <Chevron />
          <span className="text-slate-600 font-medium">Edit</span>
        </nav>

        {/* Page header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl font-bold text-blue-700 shrink-0 overflow-hidden">
            {team.logo_url
              ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
              : <span>{team.name.slice(0, 2).toUpperCase()}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-slate-900">Edit Team</h1>
            <p className="text-sm text-slate-500 mt-0.5 truncate">
              Editing: <span className="font-medium text-slate-700">{team.name}</span>
            </p>
          </div>
          <Link
            href={ROUTES.TEAM(tournamentId, teamId)}
            className="shrink-0 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd" />
            </svg>
            Back
          </Link>
        </div>

        <TeamForm
          mode="edit"
          tournamentId={tournamentId}
          teamId={teamId}
          initialData={team}
        />
      </div>
    </DashboardLayout>
  );
}

function Chevron() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
      <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

export default function EditTeamPage({ params }) {
  return (
    <ProtectedRoute>
      <EditTeamContent tournamentId={params.id} teamId={params.teamId} />
    </ProtectedRoute>
  );
}