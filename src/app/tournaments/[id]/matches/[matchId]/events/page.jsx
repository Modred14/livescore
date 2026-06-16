// src/app/tournaments/[id]/matches/[matchId]/events/page.js

'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LiveScoreboard from '@/components/live/LiveScoreboard';
import MatchTimer from '@/components/live/MatchTimer';
import MatchTimeline from '@/components/live/MatchTimeline';
import LiveMatchStats from '@/components/live/LiveMatchStats';
import GoalEvent from '@/components/live/GoalEvent';
import YellowCardEvent from '@/components/live/YellowCardEvent';
import RedCardEvent from '@/components/live/RedCardEvent';
import SubstitutionEvent from '@/components/live/SubstitutionEvent';
import { SectionSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import useLiveMatch from '@/hooks/useLiveMatch';
import Link from 'next/link';

function EventsPageContent({ tournamentId, matchId }) {
  const {
    match, events, stats,
    loading, error, lastPoll,
    isOwner, isLive,
  } = useLiveMatch(tournamentId, matchId);

  if (loading) return (
    <DashboardLayout>
      <SectionSpinner message="Loading match events…" />
    </DashboardLayout>
  );

  if (error || !match) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-slate-500 text-sm">{error || 'Match not found.'}</p>
        <Button href={ROUTES.MATCHES(tournamentId)} variant="secondary" size="sm">
          Back to Matches
        </Button>
      </div>
    </DashboardLayout>
  );

  // Latest 3 goals for the highlights strip
  const goals = events.filter((e) =>
    ['goal', 'own_goal', 'penalty_goal'].includes(e.event_type)
  );
  const yellowCards = events.filter((e) => e.event_type === 'yellow_card');
  const redCards    = events.filter((e) => ['red_card','yellow_red_card'].includes(e.event_type));
  const subs        = events.filter((e) => e.event_type === 'substitution');

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
              <Link href={ROUTES.MATCHES(tournamentId)} className="hover:text-blue-600 transition-colors">
                Matches
              </Link>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-600 font-medium">Match Events</span>
            </nav>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {match.home_team_name} vs {match.away_team_name}
            </h1>
            {isLive && lastPoll && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Auto-refreshing every 5 seconds · Last updated {lastPoll.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <Button href={`${ROUTES.MATCH(tournamentId, matchId)}/live`} size="sm">
                Admin Panel
              </Button>
            )}
            <Button href={ROUTES.MATCH(tournamentId, matchId)} variant="secondary" size="sm">
              Match Info
            </Button>
          </div>
        </div>

        {/* Scoreboard */}
        <LiveScoreboard match={match} />

        {/* Live timer (only for live matches) */}
        {isLive && (
          <div className="bg-slate-900 rounded-xl p-5 flex items-center justify-center">
            <MatchTimer
              status={match.status}
              matchTime={match.match_time}
              events={events}
            />
          </div>
        )}

        {/* Goals highlights */}
        {goals.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              ⚽ Goals
              <span className="text-slate-400 font-normal text-sm">({goals.length})</span>
            </h2>
            <div className="space-y-2">
              {goals.map((e) => (
                <GoalEvent key={e.id} event={e} homeTeamId={match.home_team_id} />
              ))}
            </div>
          </section>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Full timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <h2 className="font-display font-bold text-slate-800">
                  Match Timeline
                  <span className="ml-2 text-slate-400 font-normal text-sm">({events.length} events)</span>
                </h2>
                {isLive && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <div className="p-5">
                <MatchTimeline
                  events={events}
                  homeTeamId={match.home_team_id}
                  isOwner={false}
                />
              </div>
            </div>
          </div>

          {/* Sidebar: stats + discipline */}
          <div className="space-y-5">
            <LiveMatchStats stats={stats} match={match} />

            {/* Yellow cards */}
            {yellowCards.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                  <h3 className="font-display font-bold text-slate-800 text-sm">🟨 Yellow Cards ({yellowCards.length})</h3>
                </div>
                <div className="p-4 space-y-2">
                  {yellowCards.map((e) => (
                    <YellowCardEvent key={e.id} event={e} />
                  ))}
                </div>
              </div>
            )}

            {/* Red cards */}
            {redCards.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                  <h3 className="font-display font-bold text-slate-800 text-sm">🟥 Red Cards ({redCards.length})</h3>
                </div>
                <div className="p-4 space-y-2">
                  {redCards.map((e) => (
                    <RedCardEvent key={e.id} event={e} />
                  ))}
                </div>
              </div>
            )}

            {/* Substitutions */}
            {subs.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                  <h3 className="font-display font-bold text-slate-800 text-sm">🔄 Substitutions ({subs.length})</h3>
                </div>
                <div className="p-4 space-y-2">
                  {subs.map((e) => (
                    <SubstitutionEvent key={e.id} event={e} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {events.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <div className="text-3xl mb-3">⚽</div>
                <p className="text-sm font-semibold text-slate-600">No events yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  {isLive ? 'Events will appear here in real time.' : 'Match has not started yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function MatchEventsPage({ params }) {
  return (
    <ProtectedRoute>
      <EventsPageContent tournamentId={params.id} matchId={params.matchId} />
    </ProtectedRoute>
  );
}