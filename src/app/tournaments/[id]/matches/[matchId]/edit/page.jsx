// src/app/tournaments/[id]/matches/[matchId]/edit/page.js

'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MatchForm from '@/components/matches/MatchForm';
import { SectionSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ROUTES, MATCH_STATUS_LABELS } from '@/lib/constants';
import { formatDate, formatTime } from '@/lib/helpers';
import { useMatch } from '@/hooks/useMatch';
import { useTournament } from '@/hooks/useTournament';

function Chevron() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
      <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function EditMatchContent({ tournamentId, matchId }) {
  const { tournament }                   = useTournament(tournamentId);
  const { match, loading, error, isOwner } = useMatch(tournamentId, matchId);

  if (loading) return (
    <DashboardLayout><SectionSpinner message="Loading match…" /></DashboardLayout>
  );

  if (error || !match) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-slate-500 text-sm">{error || 'Match not found.'}</p>
        <Button href={ROUTES.MATCHES(tournamentId)} variant="secondary" size="sm">
          Back to Fixtures
        </Button>
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
          <p className="text-sm text-slate-500 mt-1">Only the tournament owner can edit matches.</p>
        </div>
        <Button href={ROUTES.MATCH(tournamentId, matchId)} variant="secondary" size="sm">
          View Match
        </Button>
      </div>
    </DashboardLayout>
  );

  const statusLabel = MATCH_STATUS_LABELS[match.status] ?? match.status;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
          <Link href={ROUTES.TOURNAMENT(tournamentId)} className="hover:text-blue-600 transition-colors truncate max-w-[80px]">
            {tournament?.name ?? match.tournament_name}
          </Link>
          <Chevron />
          <Link href={ROUTES.MATCHES(tournamentId)} className="hover:text-blue-600 transition-colors">
            Matches
          </Link>
          <Chevron />
          <Link href={ROUTES.MATCH(tournamentId, matchId)} className="hover:text-blue-600 transition-colors truncate max-w-[120px]">
            {match.home_team_name} vs {match.away_team_name}
          </Link>
          <Chevron />
          <span className="text-slate-600 font-medium">Edit</span>
        </nav>

        {/* Page header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0">
            ⚽
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-slate-900">Edit Match</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-sm text-slate-500 truncate">
                <span className="font-medium text-slate-700">{match.home_team_name}</span>
                <span className="text-slate-400 mx-1.5">vs</span>
                <span className="font-medium text-slate-700">{match.away_team_name}</span>
              </p>
              <Badge status={match.status} dot size="xs">{statusLabel}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatDate(match.match_date)} · {match.match_time?.slice(0, 5)}
              {match.venue && ` · ${match.venue}`}
            </p>
          </div>
          <Link
            href={ROUTES.MATCH(tournamentId, matchId)}
            className="shrink-0 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd" />
            </svg>
            Back
          </Link>
        </div>

        {/* Live match warning */}
        {(match.status === 'live' || match.status === 'half_time') && (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-red-500 shrink-0 mt-0.5">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">
              <strong>This match is currently live.</strong> Editing teams or schedule may cause inconsistencies with live event data.
            </p>
          </div>
        )}

        {/* Info callout */}
        <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-blue-500 shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-blue-700">
            You can update any match details including status, teams, schedule, and venue.
          </p>
        </div>

        {/* Pre-filled form */}
        <MatchForm
          mode="edit"
          tournamentId={tournamentId}
          tournamentType={tournament?.tournament_type}
          matchId={matchId}
          initialData={match}
        />
      </div>
    </DashboardLayout>
  );
}

export default function EditMatchPage({ params }) {
  return (
    <ProtectedRoute>
      <EditMatchContent tournamentId={params.id} matchId={params.matchId} />
    </ProtectedRoute>
  );
}