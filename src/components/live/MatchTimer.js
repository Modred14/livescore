// src/components/live/MatchTimer.js

'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * MatchTimer — counts up from match start or shows elapsed time.
 *
 * For live matches it increments every second.
 * For half_time it freezes at 45.
 * For completed it shows FT.
 * For scheduled it shows scheduled kick-off time.
 *
 * Props:
 *   status      — match status
 *   matchTime   — TIME string from DB e.g. "15:00:00"
 *   events      — match event array (used to derive kick-off time)
 */
export default function MatchTimer({ status, matchTime, events = [] }) {
  const [elapsed, setElapsed] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (status !== 'live') {
      clearInterval(timerRef.current);
      return;
    }

    // Find kick-off event time to compute elapsed
    const kickOff = events.find((e) => e.event_type === 'kick_off');
    const startedAt = kickOff ? new Date(kickOff.created_at) : new Date();

    const tick = () => {
      const diffMs  = Date.now() - startedAt.getTime();
      const diffMin = Math.floor(diffMs / 60_000);
      setElapsed(Math.min(diffMin, 130));
    };

    tick();
    timerRef.current = setInterval(tick, 1_000);
    return () => clearInterval(timerRef.current);
  }, [status, events]);

  const display = (() => {
    if (status === 'scheduled')  return formatKickOff(matchTime);
    if (status === 'half_time')  return { label: 'HT', sub: 'Half Time', color: 'text-orange-400' };
    if (status === 'completed')  return { label: 'FT', sub: 'Full Time',  color: 'text-slate-400' };
    if (status === 'postponed')  return { label: 'PP', sub: 'Postponed',  color: 'text-yellow-400' };
    if (status === 'cancelled')  return { label: '–',  sub: 'Cancelled',  color: 'text-red-400' };
    if (status === 'live' && elapsed !== null) {
      return {
        label: `${elapsed}'`,
        sub:   elapsed >= 90 ? '90+ minutes' : `${elapsed} minutes`,
        color: 'text-red-400',
      };
    }
    return { label: '0\'', sub: 'Live', color: 'text-red-400' };
  })();

  return (
    <div className="flex flex-col items-center justify-center">
      {(status === 'live' || status === 'half_time') && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Live</span>
        </div>
      )}
      <div className={`font-display font-extrabold text-4xl md:text-5xl tabular-nums leading-none ${display.color}`}>
        {display.label}
      </div>
      <div className="text-xs text-slate-500 mt-1 font-medium">{display.sub}</div>
    </div>
  );
}

function formatKickOff(timeStr) {
  if (!timeStr) return { label: 'TBD', sub: 'Kick-off time', color: 'text-slate-400' };
  try {
    const d = new Date(`2000-01-01T${timeStr}`);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return { label: `${h}:${m}`, sub: 'Kick-off', color: 'text-blue-400' };
  } catch {
    return { label: timeStr.slice(0, 5), sub: 'Kick-off', color: 'text-blue-400' };
  }
}