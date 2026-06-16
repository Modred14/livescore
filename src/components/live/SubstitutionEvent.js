// src/components/live/SubstitutionEvent.js

'use client';

/**
 * SubstitutionEvent — substitution display with in/out players.
 */
export default function SubstitutionEvent({ event }) {
  if (!event) return null;

  const minuteLabel = event.extra_time > 0
    ? `${event.minute}+${event.extra_time}'`
    : `${event.minute}'`;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
      <div className="text-lg shrink-0">🔄</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-red-600 font-bold">OUT</span>
          <span className="text-sm font-semibold text-slate-800 truncate">
            {event.player_name ?? 'Unknown'}
            {event.player_jersey && (
              <span className="ml-1 font-normal text-slate-500">#{event.player_jersey}</span>
            )}
          </span>
        </div>
        {event.secondary_player_name && (
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <span className="text-xs text-green-600 font-bold">IN</span>
            <span className="text-sm font-semibold text-slate-800 truncate">
              {event.secondary_player_name}
              {event.secondary_player_jersey && (
                <span className="ml-1 font-normal text-slate-500">#{event.secondary_player_jersey}</span>
              )}
            </span>
          </div>
        )}
        <p className="text-xs text-blue-600 mt-0.5">{event.team_name} · {minuteLabel}</p>
      </div>
    </div>
  );
}