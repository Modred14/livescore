// src/components/matches/MatchStats.js

'use client';

/**
 * MatchStats — summary stat strip above the match detail body.
 * In Phase 5 these show scheduling info; in Phase 6 they'll show
 * real goal/card/substitution counts pulled from match_events.
 */
export default function MatchStats({ match }) {
  if (!match) return null;

  const {
    status,
    home_score   = 0,
    away_score   = 0,
    home_team_name,
    away_team_name,
  } = match;

  const isDone = status === 'completed';
  const isLive = status === 'live' || status === 'half_time';

  const totalGoals   = home_score + away_score;
  const goalDiff     = Math.abs(home_score - away_score);
  const isDrawOrPending = !isDone && !isLive;

  const result = (() => {
    if (!isDone && !isLive) return { label: 'Not started', color: 'text-slate-500' };
    if (home_score > away_score) return { label: `${home_team_name} winning`, color: 'text-blue-600' };
    if (away_score > home_score) return { label: `${away_team_name} winning`, color: 'text-red-600' };
    return { label: isLive ? 'Level' : 'Draw', color: 'text-slate-600' };
  })();

  const stats = [
    {
      label:     'Home Goals',
      value:     isDone || isLive ? home_score : '–',
      sub:       home_team_name,
      iconColor: 'bg-blue-50',
      iconText:  'text-blue-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label:     'Away Goals',
      value:     isDone || isLive ? away_score : '–',
      sub:       away_team_name,
      iconColor: 'bg-red-50',
      iconText:  'text-red-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label:     'Total Goals',
      value:     isDone || isLive ? totalGoals : '–',
      sub:       isDone || isLive ? (totalGoals === 1 ? 'goal scored' : 'goals scored') : 'awaiting kick-off',
      iconColor: 'bg-green-50',
      iconText:  'text-green-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ),
    },
    {
      label:     'Result',
      value:     isDone ? (goalDiff === 0 ? 'DRAW' : `+${goalDiff}`) : (isLive ? 'LIVE' : 'TBD'),
      sub:       result.label,
      iconColor: isDone ? 'bg-slate-50' : isLive ? 'bg-red-50' : 'bg-slate-50',
      iconText:  isDone ? 'text-slate-500' : isLive ? 'text-red-600' : 'text-slate-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
              <p className="text-3xl font-bold font-display text-slate-900 leading-none">{s.value}</p>
              {s.sub && <p className="mt-1 text-xs text-slate-500 truncate">{s.sub}</p>}
            </div>
            <div className={`shrink-0 flex items-center justify-center w-11 h-11 rounded-xl ${s.iconColor}`}>
              <span className={s.iconText}>{s.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}