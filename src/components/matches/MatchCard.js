// src/components/matches/MatchCard.js

'use client';

import Link from 'next/link';
import { ROUTES, MATCH_STATUS } from '@/lib/constants';
import { formatDate, formatTime } from '@/lib/helpers';

const STATUS_CONFIG = {
  scheduled:  { label: 'Scheduled',  dot: 'bg-blue-400',   badge: 'bg-blue-50   text-blue-700   border-blue-200',  pulse: false },
  live:       { label: 'LIVE',       dot: 'bg-red-500',    badge: 'bg-red-50    text-red-700    border-red-200',   pulse: true  },
  half_time:  { label: 'Half Time',  dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700 border-orange-200',pulse: true  },
  completed:  { label: 'FT',         dot: 'bg-slate-400',  badge: 'bg-slate-50  text-slate-600  border-slate-200', pulse: false },
  postponed:  { label: 'Postponed',  dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',pulse: false },
  cancelled:  { label: 'Cancelled',  dot: 'bg-red-300',    badge: 'bg-red-50    text-red-400    border-red-100',   pulse: false },
};

/**
 * MatchCard — a single fixture tile for use in lists and grids.
 *
 * Props:
 *   match        — full match object from API
 *   tournamentId — for building href
 *   isOwner      — show edit/delete actions
 *   onDelete     — callback(match)
 *   view         — 'card' | 'row'
 */
export default function MatchCard({
  match,
  tournamentId,
  isOwner  = false,
  onDelete,
  view     = 'card',
}) {
  if (!match) return null;

  const {
    id, home_team_name, away_team_name,
    home_team_logo, away_team_logo,
    home_score, away_score,
    match_date, match_time,
    venue, round_name, status,
  } = match;

  const cfg       = STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled;
  const isLive    = status === MATCH_STATUS.LIVE || status === MATCH_STATUS.HALF_TIME;
  const isDone    = status === MATCH_STATUS.COMPLETED;
  const showScore = isLive || isDone;

  const TeamLogo = ({ logo, name, align = 'left' }) => (
    <div className={`flex flex-col items-center gap-1.5 flex-1 ${align === 'right' ? 'items-center' : 'items-center'}`}>
      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg overflow-hidden">
        {logo
          ? <img src={logo} alt={name} className="w-full h-full object-cover" />
          : <span className="text-sm font-bold text-slate-500">{name?.slice(0, 2).toUpperCase()}</span>
        }
      </div>
      <span className="text-xs font-semibold text-slate-700 text-center leading-tight max-w-[80px] line-clamp-2">{name}</span>
    </div>
  );

  if (view === 'row') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div className="shrink-0 w-20">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
              {cfg.label}
            </span>
          </div>

          {/* Teams + score */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-slate-800 truncate flex-1 text-right">{home_team_name}</span>
            <div className="shrink-0 flex items-center gap-1">
              {showScore ? (
                <span className="font-display font-bold text-lg text-slate-900 tabular-nums leading-none px-2">
                  {home_score} – {away_score}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400 px-2">vs</span>
              )}
            </div>
            <span className="text-sm font-semibold text-slate-800 truncate flex-1">{away_team_name}</span>
          </div>

          {/* Meta */}
          <div className="hidden md:flex flex-col items-end gap-0.5 shrink-0">
            <span className="text-xs font-medium text-slate-600">{formatDate(match_date)}</span>
            <span className="text-xs text-slate-400">{formatTime(new Date(`2000-01-01T${match_time}`))}</span>
          </div>

          {round_name && (
            <span className="hidden lg:block text-xs text-slate-400 shrink-0 max-w-[90px] truncate">{round_name}</span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={ROUTES.MATCH(tournamentId, id)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              View
            </Link>
            {isOwner && (
              <>
                <Link
                  href={ROUTES.MATCH_EDIT(tournamentId, id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete?.(match)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Card view (default) ──────────────────────────────────────────────────────
  return (
    <div className={`group bg-white border rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 overflow-hidden ${isLive ? 'border-red-200' : 'border-slate-200'}`}>
      {/* Live stripe */}
      {isLive && <div className="h-1 bg-red-500 w-full animate-pulse" />}

      {/* Card header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
            {cfg.label}
          </span>
        </div>
        {round_name && (
          <span className="text-xs text-slate-400 truncate max-w-[110px]">{round_name}</span>
        )}
      </div>

      {/* Teams and score */}
      <Link href={ROUTES.MATCH(tournamentId, id)} className="block px-4 py-4">
        <div className="flex items-center gap-3">
          <TeamLogo logo={home_team_logo} name={home_team_name} />

          {/* Score / vs */}
          <div className="shrink-0 text-center">
            {showScore ? (
              <div className="font-display font-extrabold text-3xl text-slate-900 tabular-nums leading-none">
                {home_score}
                <span className="text-slate-300 mx-1">–</span>
                {away_score}
              </div>
            ) : (
              <div>
                <div className="font-display font-bold text-slate-400 text-sm">VS</div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">
                  {formatTime(new Date(`2000-01-01T${match_time}`))}
                </div>
              </div>
            )}
          </div>

          <TeamLogo logo={away_team_logo} name={away_team_name} />
        </div>
      </Link>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-50">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M5.75 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM5 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM8 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM7.25 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM10.25 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4 1a.75.75 0 0 1 .75.75V3h6.5V1.75a.75.75 0 0 1 1.5 0V3A2 2 0 0 1 14 5v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75A.75.75 0 0 1 4 1Z" />
            </svg>
            {formatDate(match_date)}
          </span>
          {venue && (
            <span className="flex items-center gap-1 truncate max-w-[100px]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
                <path fillRule="evenodd" d="M8 1.5A4.5 4.5 0 0 0 3.5 6c0 3.16 3.44 6.66 4.14 7.33a.5.5 0 0 0 .72 0C9.06 12.66 12.5 9.16 12.5 6A4.5 4.5 0 0 0 8 1.5ZM8 7.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" clipRule="evenodd" />
              </svg>
              {venue}
            </span>
          )}
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Link href={ROUTES.MATCH_EDIT(tournamentId, id)} className="text-blue-500 hover:text-blue-700 font-semibold">Edit</Link>
            <span className="text-slate-200">|</span>
            <button type="button" onClick={() => onDelete?.(match)} className="text-red-400 hover:text-red-600 font-semibold">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}