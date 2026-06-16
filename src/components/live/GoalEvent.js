// src/components/live/GoalEvent.js

'use client';

/**
 * GoalEvent — a highlighted goal notification card.
 * Used when a goal is scored to show a prominent celebration block.
 */
export default function GoalEvent({ event, homeTeamId }) {
  if (!event) return null;

  const isHome    = event.team_id === homeTeamId;
  const isOwnGoal = event.event_type === 'own_goal';
  const isPenalty = event.event_type === 'penalty_goal';

  const minuteLabel = event.extra_time > 0
    ? `${event.minute}+${event.extra_time}'`
    : `${event.minute}'`;

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border-2 ${
      isOwnGoal
        ? 'bg-red-50 border-red-300'
        : 'bg-green-50 border-green-300'
    }`}>
      {/* Goal emoji */}
      <div className="text-3xl shrink-0">⚽</div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-display font-bold text-lg leading-tight ${
            isOwnGoal ? 'text-red-800' : 'text-green-800'
          }`}>
            {isOwnGoal ? 'Own Goal' : isPenalty ? 'Penalty Goal' : 'GOAL!'}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isOwnGoal ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'
          }`}>
            {minuteLabel}
          </span>
        </div>
        {event.player_name && (
          <p className={`text-sm font-semibold mt-0.5 ${
            isOwnGoal ? 'text-red-700' : 'text-green-700'
          }`}>
            {event.player_name}
            {event.player_jersey && (
              <span className="ml-1 font-normal opacity-70">#{event.player_jersey}</span>
            )}
          </p>
        )}
        <p className={`text-xs mt-0.5 ${isOwnGoal ? 'text-red-500' : 'text-green-600'}`}>
          {isOwnGoal ? `Own goal by ${event.team_name}` : event.team_name}
        </p>
      </div>

      {/* Side indicator */}
      <div className={`shrink-0 text-xs font-bold uppercase tracking-widest ${
        isOwnGoal
          ? (isHome ? 'text-red-400' : 'text-green-400')
          : (isHome ? 'text-green-600' : 'text-green-400')
      }`}>
        {isHome ? 'HM' : 'AW'}
      </div>
    </div>
  );
}