// src/components/live/YellowCardEvent.js

'use client';

/**
 * YellowCardEvent — compact card discipline display.
 */
export default function YellowCardEvent({ event }) {
  if (!event) return null;

  const minuteLabel = event.extra_time > 0
    ? `${event.minute}+${event.extra_time}'`
    : `${event.minute}'`;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
      <div className="w-5 h-7 rounded-sm bg-yellow-400 shadow-sm shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-yellow-900 truncate">
          {event.player_name ?? 'Unknown'}
          {event.player_jersey && (
            <span className="ml-1 font-normal text-yellow-700">#{event.player_jersey}</span>
          )}
        </p>
        <p className="text-xs text-yellow-700">{event.team_name} · {minuteLabel}</p>
      </div>
      <span className="shrink-0 text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-200">
        Yellow
      </span>
    </div>
  );
}