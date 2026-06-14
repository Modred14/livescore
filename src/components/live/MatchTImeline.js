// src/components/live/MatchTimeline.js

'use client';

import { EVENT_TYPE_LABELS } from '@/lib/constants';
import { timeAgo } from '@/lib/helpers';

const EVENT_CONFIG = {
  goal:            { icon: '⚽', label: 'Goal',          color: 'bg-green-500',  textColor: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  own_goal:        { icon: '⚽', label: 'Own Goal',      color: 'bg-red-400',    textColor: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',   suffix: '(OG)' },
  penalty_goal:    { icon: '⚽', label: 'Penalty',       color: 'bg-green-600',  textColor: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200', suffix: '(P)' },
  penalty_missed:  { icon: '✗',  label: 'Penalty Missed',color: 'bg-slate-400',  textColor: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200' },
  yellow_card:     { icon: '🟨', label: 'Yellow Card',   color: 'bg-yellow-400', textColor: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  red_card:        { icon: '🟥', label: 'Red Card',      color: 'bg-red-600',    textColor: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
  yellow_red_card: { icon: '🟥', label: 'Second Yellow', color: 'bg-red-500',    textColor: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
  substitution:    { icon: '🔄', label: 'Substitution',  color: 'bg-blue-500',   textColor: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  kick_off:        { icon: '▶',  label: 'Kick Off',      color: 'bg-slate-500',  textColor: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200' },
  half_time:       { icon: '⏸', label: 'Half Time',     color: 'bg-orange-500', textColor: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  second_half:     { icon: '▶',  label: 'Second Half',   color: 'bg-slate-500',  textColor: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200' },
  full_time:       { icon: '🏁', label: 'Full Time',     color: 'bg-slate-800',  textColor: 'text-slate-800',  bg: 'bg-slate-100', border: 'border-slate-300' },
};

/**
 * MatchTimeline — chronological list of match events.
 *
 * Props:
 *   events        — array of event objects (sorted by minute ASC)
 *   homeTeamId    — to determine left/right alignment
 *   isOwner       — show delete buttons
 *   onDelete      — callback(event)
 */
export default function MatchTimeline({
  events     = [],
  homeTeamId,
  isOwner    = false,
  onDelete,
}) {
  if (!events.length) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        No events yet. Events will appear here as the match progresses.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {events.map((event, idx) => {
        const cfg      = EVENT_CONFIG[event.event_type] ?? EVENT_CONFIG.kick_off;
        const isHome   = event.team_id === homeTeamId;
        const isSystem = !event.team_id; // lifecycle events

        const minuteLabel = event.extra_time > 0
          ? `${event.minute}+${event.extra_time}'`
          : `${event.minute}'`;

        return (
          <div
            key={event.id}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-150 group ${cfg.bg} ${cfg.border}`}
          >
            {/* Minute badge */}
            <div className={`shrink-0 w-14 text-right`}>
              <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold tabular-nums ${cfg.color} text-white`}>
                {minuteLabel}
              </span>
            </div>

            {/* Event icon */}
            <div className="shrink-0 text-base">{cfg.icon}</div>

            {/* Event description */}
            <div className="flex-1 min-w-0">
              {isSystem ? (
                <p className={`text-xs font-bold uppercase tracking-widest ${cfg.textColor}`}>
                  {cfg.label}
                </p>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {event.player_name ?? 'Unknown Player'}
                    {event.player_jersey && (
                      <span className="ml-1.5 text-xs font-normal text-slate-400">#{event.player_jersey}</span>
                    )}
                    {cfg.suffix && (
                      <span className={`ml-1.5 text-xs font-semibold ${cfg.textColor}`}>{cfg.suffix}</span>
                    )}
                  </p>
                  {event.event_type === 'substitution' && event.secondary_player_name && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      ↕ {event.secondary_player_name}
                      {event.secondary_player_jersey && ` #${event.secondary_player_jersey}`}
                    </p>
                  )}
                  <p className={`text-xs font-medium mt-0.5 ${cfg.textColor}`}>
                    {event.team_name}
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="text-slate-400">{cfg.label}</span>
                  </p>
                  {event.note && (
                    <p className="text-xs text-slate-400 mt-0.5 italic">{event.note}</p>
                  )}
                </div>
              )}
            </div>

            {/* Delete button (owner only) */}
            {isOwner && (
              <button
                type="button"
                onClick={() => onDelete?.(event)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50"
                title="Remove event"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}