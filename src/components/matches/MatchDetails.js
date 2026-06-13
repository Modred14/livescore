// src/components/matches/MatchDetails.js

'use client';

import Link from 'next/link';
import { ROUTES, MATCH_STATUS_LABELS, TOURNAMENT_TYPE_LABELS } from '@/lib/constants';
import { formatDate, formatDateTime } from '@/lib/helpers';

const STATUS_BADGE = {
  scheduled: 'bg-blue-50   text-blue-700   border-blue-200',
  live:      'bg-red-50    text-red-700    border-red-200',
  half_time: 'bg-orange-50 text-orange-700 border-orange-200',
  completed: 'bg-slate-50  text-slate-600  border-slate-200',
  postponed: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  cancelled: 'bg-red-50    text-red-400    border-red-100',
};

/**
 * MatchDetails — sidebar detail card for the match detail page.
 * Shows match metadata, teams, and tournament info.
 */
export default function MatchDetails({ match }) {
  if (!match) return null;

  const {
    status, home_team_name, away_team_name,
    home_team_id, away_team_id, home_team_logo, away_team_logo,
    match_date, match_time, venue, round_name,
    tournament_id, tournament_name, created_at, updated_at,
    home_score, away_score,
  } = match;

  const statusLabel  = MATCH_STATUS_LABELS[status] ?? status;
  const badgeClasses = STATUS_BADGE[status] ?? STATUS_BADGE.scheduled;
  const isDone       = status === 'completed';
  const isLive       = status === 'live' || status === 'half_time';

  return (
    <div className="space-y-5">

      {/* Match Info Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="font-display font-bold text-slate-800 text-base">Match Info</h2>
        </div>
        <div className="p-5">
          <dl className="space-y-3.5">
            <DetailRow label="Status">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeClasses}`}>
                {(isLive) && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                {statusLabel}
              </span>
            </DetailRow>

            {round_name && (
              <DetailRow label="Round">{round_name}</DetailRow>
            )}

            <DetailRow label="Date">{formatDate(match_date)}</DetailRow>

            <DetailRow label="Kick-off">
              {match_time ? match_time.slice(0, 5) : '—'}
            </DetailRow>

            {venue && (
              <DetailRow label="Venue">{venue}</DetailRow>
            )}

            {(isDone || isLive) && (
              <DetailRow label="Score">
                <span className="font-display font-bold text-slate-900">
                  {home_score} – {away_score}
                </span>
              </DetailRow>
            )}

            <DetailRow label="Created">{formatDate(created_at)}</DetailRow>
          </dl>
        </div>
      </div>

      {/* Teams Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="font-display font-bold text-slate-800 text-base">Teams</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            { id: home_team_id, name: home_team_name, logo: home_team_logo, role: 'Home' },
            { id: away_team_id, name: away_team_name, logo: away_team_logo, role: 'Away' },
          ].map(({ id, name, logo, role }) => (
            <Link
              key={id}
              href={ROUTES.TEAM(tournament_id, id)}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 overflow-hidden">
                {logo
                  ? <img src={logo} alt={name} className="w-full h-full object-cover" />
                  : <span>{name?.slice(0, 2).toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{name}</p>
                <p className="text-xs text-slate-400">{role}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-400 transition-colors">
                <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Tournament Card */}
      {tournament_name && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
            <h2 className="font-display font-bold text-slate-800 text-base">Tournament</h2>
          </div>
          <div className="p-5">
            <Link
              href={ROUTES.TOURNAMENT(tournament_id)}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-blue-600">
                  <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 000 4.5h9a2.25 2.25 0 000-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.798 49.798 0 00-6.093-.377.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{tournament_name}</p>
                <p className="text-xs text-slate-400">View tournament</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-400 transition-colors">
                <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <dt className="text-slate-400 shrink-0 w-24">{label}</dt>
      <dd className="text-slate-700 font-medium text-right">{children ?? '—'}</dd>
    </div>
  );
}