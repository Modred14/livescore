// src/components/matches/MatchHeader.js

'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ROUTES, MATCH_STATUS_LABELS } from '@/lib/constants';
import { formatDate, formatTime } from '@/lib/helpers';

const STATUS_CONFIG = {
  scheduled:  { label: 'Scheduled',  badge: 'bg-blue-50   text-blue-700   border-blue-200',   dot: 'bg-blue-400',   pulse: false },
  live:       { label: 'LIVE',       badge: 'bg-red-50    text-red-700    border-red-200',    dot: 'bg-red-500',    pulse: true  },
  half_time:  { label: 'Half Time',  badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-400', pulse: true  },
  completed:  { label: 'Full Time',  badge: 'bg-slate-50  text-slate-600  border-slate-200',  dot: 'bg-slate-400',  pulse: false },
  postponed:  { label: 'Postponed',  badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400', pulse: false },
  cancelled:  { label: 'Cancelled',  badge: 'bg-red-50    text-red-400    border-red-100',    dot: 'bg-red-300',    pulse: false },
};

export default function MatchHeader({ match, tournament, isOwner = false, onDelete }) {
  if (!match) return null;

  const {
    id, status, home_team_name, away_team_name,
    home_team_logo, away_team_logo,
    home_score, away_score,
    match_date, match_time, venue, round_name,
    tournament_id,
  } = match;

  const cfg       = STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled;
  const tid       = tournament_id ?? tournament?.id;
  const isLive    = status === 'live' || status === 'half_time';
  const showScore = isLive || status === 'completed';

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container-app pt-6 pb-0">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-4 flex-wrap">
          <Link href={ROUTES.DASHBOARD} className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <Chevron />
          <Link href={ROUTES.TOURNAMENTS} className="hover:text-blue-600 transition-colors">Tournaments</Link>
          <Chevron />
          <Link href={ROUTES.TOURNAMENT(tid)} className="hover:text-blue-600 transition-colors truncate max-w-[100px]">
            {tournament?.name ?? match.tournament_name}
          </Link>
          <Chevron />
          <Link href={ROUTES.MATCHES(tid)} className="hover:text-blue-600 transition-colors">Matches</Link>
          <Chevron />
          <span className="text-slate-600 font-medium truncate max-w-[140px]">
            {home_team_name} vs {away_team_name}
          </span>
        </nav>

        {/* Live indicator */}
        {isLive && (
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {status === 'half_time' ? 'HALF TIME' : 'LIVE NOW'}
            </span>
          </div>
        )}

        {/* Main scoreboard */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6">

          {/* Scoreboard */}
          <div className="flex-1 flex items-center gap-4 sm:gap-8 justify-center w-full">

            {/* Home team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 overflow-hidden shadow-sm">
                {home_team_logo
                  ? <img src={home_team_logo} alt={home_team_name} className="w-full h-full object-cover" />
                  : <span className="text-sm">{home_team_name?.slice(0, 2).toUpperCase()}</span>}
              </div>
              <p className="font-display font-bold text-slate-900 text-base text-center leading-tight max-w-[120px]">
                {home_team_name}
              </p>
              <span className="text-xs text-slate-400 font-medium">Home</span>
            </div>

            {/* Score / time */}
            <div className="shrink-0 text-center">
              {showScore ? (
                <div className="font-display font-extrabold text-5xl sm:text-6xl text-slate-900 tabular-nums leading-none">
                  {home_score}
                  <span className="text-slate-200 mx-2">–</span>
                  {away_score}
                </div>
              ) : (
                <div>
                  <div className="font-display text-3xl font-bold text-slate-300">VS</div>
                  <div className="text-slate-600 font-semibold text-base mt-1">
                    {formatTime(new Date(`2000-01-01T${match_time}`))}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{formatDate(match_date)}</div>
                </div>
              )}

              {/* Status badge */}
              <div className="mt-3 flex justify-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
                  {cfg.label}
                </span>
              </div>
            </div>

            {/* Away team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-2xl font-bold text-red-700 overflow-hidden shadow-sm">
                {away_team_logo
                  ? <img src={away_team_logo} alt={away_team_name} className="w-full h-full object-cover" />
                  : <span className="text-sm">{away_team_name?.slice(0, 2).toUpperCase()}</span>}
              </div>
              <p className="font-display font-bold text-slate-900 text-base text-center leading-tight max-w-[120px]">
                {away_team_name}
              </p>
              <span className="text-xs text-slate-400 font-medium">Away</span>
            </div>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <Button href={ROUTES.MATCH_EDIT(tid, id)} variant="secondary" size="sm">
                Edit Match
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete?.(match)}>
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Meta strip */}
        <div className="border-t border-slate-100 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
          {round_name && (
            <span className="flex items-center gap-1.5 font-semibold text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 000 4.5h9a2.25 2.25 0 000-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.798 49.798 0 00-6.093-.377.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
              </svg>
              {round_name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M5.75 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM5 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM8 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM7.25 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM10.25 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4 1a.75.75 0 0 1 .75.75V3h6.5V1.75a.75.75 0 0 1 1.5 0V3A2 2 0 0 1 14 5v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75A.75.75 0 0 1 4 1Z" />
            </svg>
            {formatDate(match_date)} at {formatTime(new Date(`2000-01-01T${match_time}`))}
          </span>
          {venue && (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M8 1.5A4.5 4.5 0 0 0 3.5 6c0 3.16 3.44 6.66 4.14 7.33a.5.5 0 0 0 .72 0C9.06 12.66 12.5 9.16 12.5 6A4.5 4.5 0 0 0 8 1.5ZM8 7.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" clipRule="evenodd" />
              </svg>
              {venue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
      <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}