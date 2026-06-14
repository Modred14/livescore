// src/components/live/LiveScoreboard.js

'use client';

import { formatDate, formatTime } from '@/lib/helpers';

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled',  color: 'bg-blue-600',   pulse: false },
  live:      { label: 'LIVE',       color: 'bg-red-600',    pulse: true  },
  half_time: { label: 'HALF TIME',  color: 'bg-orange-500', pulse: true  },
  completed: { label: 'FULL TIME',  color: 'bg-slate-600',  pulse: false },
  postponed: { label: 'POSTPONED',  color: 'bg-yellow-600', pulse: false },
  cancelled: { label: 'CANCELLED',  color: 'bg-red-400',    pulse: false },
};

/**
 * LiveScoreboard — the hero scoreboard panel.
 * Used at the top of both the admin live page and the public events page.
 */
export default function LiveScoreboard({ match, compact = false }) {
  if (!match) return null;

  const {
    home_team_name, away_team_name,
    home_team_logo, away_team_logo,
    home_score, away_score,
    status, match_date, match_time,
    venue, round_name,
  } = match;

  const cfg    = STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled;
  const isLive = status === 'live' || status === 'half_time';
  const isDone = status === 'completed';

  if (compact) {
    return (
      <div className="bg-slate-900 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          {round_name && <span className="text-xs text-slate-400">{round_name}</span>}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white ${cfg.color}`}>
            {cfg.pulse && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-4 justify-center">
          <div className="flex-1 text-right">
            <p className="font-display font-bold text-base truncate">{home_team_name}</p>
          </div>
          <div className="font-display font-extrabold text-4xl tabular-nums text-white shrink-0 px-3">
            {isLive || isDone ? `${home_score} – ${away_score}` : 'VS'}
          </div>
          <div className="flex-1 text-left">
            <p className="font-display font-bold text-base truncate">{away_team_name}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
      {/* Live stripe */}
      {isLive && <div className="h-1 bg-red-500 w-full animate-pulse" />}

      <div className="px-6 py-6 md:px-10 md:py-8">
        {/* Top row: round + status */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slate-400">
            {round_name && <span className="font-semibold text-slate-300">{round_name}</span>}
            {round_name && venue && <span className="mx-2 text-slate-600">·</span>}
            {venue && <span>{venue}</span>}
          </div>
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold text-white ${cfg.color}`}>
            {cfg.pulse && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            {cfg.label}
          </span>
        </div>

        {/* Main scoreboard */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Home team */}
          <div className="flex-1 flex flex-col items-center gap-3">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl overflow-hidden">
              {home_team_logo
                ? <img src={home_team_logo} alt={home_team_name} className="w-full h-full object-cover" />
                : <span className="text-sm font-bold text-white">{home_team_name?.slice(0, 2).toUpperCase()}</span>
              }
            </div>
            <p className="font-display font-bold text-white text-sm md:text-base text-center leading-tight max-w-[120px]">
              {home_team_name}
            </p>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">Home</span>
          </div>

          {/* Score */}
          <div className="shrink-0 text-center">
            {(isLive || isDone) ? (
              <div className="font-display font-extrabold text-5xl md:text-7xl text-white tabular-nums leading-none">
                {home_score}
                <span className="text-slate-600 mx-2 md:mx-4">–</span>
                {away_score}
              </div>
            ) : (
              <div>
                <div className="font-display font-bold text-3xl text-slate-500">VS</div>
                <div className="text-white font-semibold text-lg mt-1">
                  {formatTime(new Date(`2000-01-01T${match_time}`))}
                </div>
                <div className="text-slate-400 text-sm mt-0.5">{formatDate(match_date)}</div>
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex flex-col items-center gap-3">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl overflow-hidden">
              {away_team_logo
                ? <img src={away_team_logo} alt={away_team_name} className="w-full h-full object-cover" />
                : <span className="text-sm font-bold text-white">{away_team_name?.slice(0, 2).toUpperCase()}</span>
              }
            </div>
            <p className="font-display font-bold text-white text-sm md:text-base text-center leading-tight max-w-[120px]">
              {away_team_name}
            </p>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">Away</span>
          </div>
        </div>

        {/* Date + venue footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span>{formatDate(match_date)}</span>
          {match_time && <><span>·</span><span>{formatTime(new Date(`2000-01-01T${match_time}`))}</span></>}
          {venue && <><span>·</span><span className="truncate max-w-[180px]">{venue}</span></>}
        </div>
      </div>
    </div>
  );
}