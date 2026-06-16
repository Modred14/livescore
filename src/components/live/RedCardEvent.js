// src/components/live/RedCardEvent.js

'use client';

/**
 * RedCardEvent — red card discipline display.
 */
export default function RedCardEvent({ event }) {
  if (!event) return null;

  const minuteLabel = event.extra_time > 0
    ? `${event.minute}+${event.extra_time}'`
    : `${event.minute}'`;

  const isYellowRed = event.event_type === 'yellow_red_card';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
      {isYellowRed ? (
        <div className="flex shrink-0">
          <div className="w-4 h-6 rounded-sm bg-yellow-400 shadow-sm -mr-1 rotate-[-8deg]" />
          <div className="w-4 h-6 rounded-sm bg-red-600 shadow-sm rotate-[8deg]" />
        </div>
      ) : (
        <div className="w-5 h-7 rounded-sm bg-red-600 shadow-sm shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-900 truncate">
          {event.player_name ?? 'Unknown'}
          {event.player_jersey && (
            <span className="ml-1 font-normal text-red-700">#{event.player_jersey}</span>
          )}
        </p>
        <p className="text-xs text-red-700">{event.team_name} · {minuteLabel}</p>
      </div>
      <span className="shrink-0 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
        {isYellowRed ? '2nd Yellow' : 'Red Card'}
      </span>
    </div>
  );
}