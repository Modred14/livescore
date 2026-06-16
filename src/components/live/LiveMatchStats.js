// src/components/live/LiveMatchStats.js

'use client';

/**
 * LiveMatchStats — side-by-side stat comparison for both teams.
 * Shows goals, yellow cards, red cards, substitutions.
 */
export default function LiveMatchStats({ stats, match }) {
  if (!stats || !match) return null;

  const rows = [
    {
      label:  'Goals',
      home:   stats.home.goals,
      away:   stats.away.goals,
      icon:   '⚽',
      color:  'bg-green-500',
    },
    {
      label:  'Yellow Cards',
      home:   stats.home.yellow_cards,
      away:   stats.away.yellow_cards,
      icon:   '🟨',
      color:  'bg-yellow-400',
    },
    {
      label:  'Red Cards',
      home:   stats.home.red_cards,
      away:   stats.away.red_cards,
      icon:   '🟥',
      color:  'bg-red-600',
    },
    {
      label:  'Substitutions',
      home:   stats.home.substitutions,
      away:   stats.away.substitutions,
      icon:   '🔄',
      color:  'bg-blue-500',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <h3 className="font-display font-bold text-slate-800 text-sm">Match Stats</h3>
      </div>

      {/* Team header */}
      <div className="grid grid-cols-3 px-5 pt-3 pb-2 text-xs font-semibold text-slate-500">
        <span className="truncate">{match.home_team_name}</span>
        <span className="text-center" />
        <span className="text-right truncate">{match.away_team_name}</span>
      </div>

      <div className="px-5 pb-4 space-y-4">
        {rows.map((row) => {
          const total = row.home + row.away;
          const homePct = total === 0 ? 50 : Math.round((row.home / total) * 100);
          const awayPct = 100 - homePct;

          return (
            <div key={row.label}>
              {/* Label row */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display font-bold text-slate-900 text-base tabular-nums">
                  {row.home}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <span>{row.icon}</span>
                  {row.label}
                </span>
                <span className="font-display font-bold text-slate-900 text-base tabular-nums">
                  {row.away}
                </span>
              </div>

              {/* Bar */}
              <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
                {total > 0 ? (
                  <>
                    <div
                      className={`${row.color} rounded-l-full transition-all duration-500`}
                      style={{ width: `${homePct}%` }}
                    />
                    <div
                      className={`${row.color} opacity-40 rounded-r-full transition-all duration-500`}
                      style={{ width: `${awayPct}%` }}
                    />
                  </>
                ) : (
                  <div className="flex-1 bg-slate-100 rounded-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}