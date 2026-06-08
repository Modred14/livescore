// src/lib/helpers.js

import {
  MATCH_STATUS,
  TOURNAMENT_STATUS,
  EVENT_TYPE,
  POINTS,
} from './constants';

// ── String helpers ────────────────────────────────────────────────────────────

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert a string to title case.
 * @param {string} str
 * @returns {string}
 */
export function toTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncate a string to a given length, appending '…' if truncated.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 60) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

/**
 * Generate a URL-safe slug from a string.
 * @param {string} str
 * @returns {string}
 */
export function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate random initials from a name (up to 2 chars).
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ── Date / time helpers ───────────────────────────────────────────────────────

/**
 * Format a date to a readable string.
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
    ...options,
  });
}

/**
 * Format a date-time to a readable string.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format only the time portion of a date.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatTime(date) {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Return a human-readable relative time string (e.g. "2 hours ago").
 * @param {string|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  if (!date) return '';
  const d   = typeof date === 'string' ? new Date(date) : date;
  const now = Date.now();
  const diff = now - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  const weeks   = Math.floor(days / 7);
  const months  = Math.floor(days / 30);
  const years   = Math.floor(days / 365);

  if (seconds < 60)  return 'just now';
  if (minutes < 60)  return `${minutes}m ago`;
  if (hours   < 24)  return `${hours}h ago`;
  if (days    < 7)   return `${days}d ago`;
  if (weeks   < 4)   return `${weeks}w ago`;
  if (months  < 12)  return `${months}mo ago`;
  return `${years}y ago`;
}

// ── Number helpers ────────────────────────────────────────────────────────────

/**
 * Pad a number with leading zeros.
 * @param {number} num
 * @param {number} size
 * @returns {string}
 */
export function padNumber(num, size = 2) {
  return String(num).padStart(size, '0');
}

/**
 * Clamp a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate goal difference.
 * @param {number} goalsFor
 * @param {number} goalsAgainst
 * @returns {string}  e.g. "+3" | "-1" | "0"
 */
export function goalDiff(goalsFor, goalsAgainst) {
  const diff = (goalsFor ?? 0) - (goalsAgainst ?? 0);
  if (diff > 0) return `+${diff}`;
  return String(diff);
}

// ── Match helpers ─────────────────────────────────────────────────────────────

/**
 * Check if a match is currently live.
 * @param {Object} match
 * @returns {boolean}
 */
export function isMatchLive(match) {
  return match?.status === MATCH_STATUS.LIVE;
}

/**
 * Check if a match is completed.
 * @param {Object} match
 * @returns {boolean}
 */
export function isMatchCompleted(match) {
  return match?.status === MATCH_STATUS.COMPLETED;
}

/**
 * Return the match result from the perspective of a given team.
 * @param {Object} match
 * @param {string} teamId
 * @returns {'win'|'draw'|'loss'|null}
 */
export function getMatchResult(match, teamId) {
  if (!isMatchCompleted(match)) return null;
  const { home_team_id, away_team_id, home_score, away_score } = match;
  if (home_score === away_score) return 'draw';
  if (teamId === home_team_id) return home_score > away_score ? 'win' : 'loss';
  if (teamId === away_team_id) return away_score > home_score ? 'win' : 'loss';
  return null;
}

/**
 * Get the points earned by a team in a completed match.
 * @param {Object} match
 * @param {string} teamId
 * @returns {number}
 */
export function getMatchPoints(match, teamId) {
  const result = getMatchResult(match, teamId);
  if (result === 'win')  return POINTS.WIN;
  if (result === 'draw') return POINTS.DRAW;
  if (result === 'loss') return POINTS.LOSS;
  return 0;
}

// ── Tournament helpers ────────────────────────────────────────────────────────

/**
 * Check if a tournament is currently active.
 * @param {Object} tournament
 * @returns {boolean}
 */
export function isTournamentActive(tournament) {
  return tournament?.status === TOURNAMENT_STATUS.ACTIVE;
}

// ── Event helpers ─────────────────────────────────────────────────────────────

/**
 * Check if an event is a scoring event.
 * @param {string} eventType
 * @returns {boolean}
 */
export function isScoringEvent(eventType) {
  return [EVENT_TYPE.GOAL, EVENT_TYPE.OWN_GOAL, EVENT_TYPE.PENALTY].includes(eventType);
}

/**
 * Check if an event is a card event.
 * @param {string} eventType
 * @returns {boolean}
 */
export function isCardEvent(eventType) {
  return [
    EVENT_TYPE.YELLOW_CARD,
    EVENT_TYPE.RED_CARD,
    EVENT_TYPE.YELLOW_RED,
  ].includes(eventType);
}

// ── Colour helpers ────────────────────────────────────────────────────────────

/**
 * Return a Tailwind text-color class for a tournament/match status.
 * @param {string} status
 * @returns {string}
 */
export function statusColor(status) {
  const map = {
    live:       'text-red-600',
    active:     'text-green-600',
    upcoming:   'text-blue-600',
    scheduled:  'text-blue-600',
    completed:  'text-slate-500',
    draft:      'text-slate-400',
    postponed:  'text-yellow-600',
    cancelled:  'text-red-400',
    half_time:  'text-orange-500',
  };
  return map[status] ?? 'text-slate-500';
}

/**
 * Return a Tailwind bg-color class for a tournament/match status badge.
 * @param {string} status
 * @returns {string}
 */
export function statusBgColor(status) {
  const map = {
    live:       'bg-red-50   text-red-700   border-red-200',
    active:     'bg-green-50 text-green-700 border-green-200',
    upcoming:   'bg-blue-50  text-blue-700  border-blue-200',
    scheduled:  'bg-blue-50  text-blue-700  border-blue-200',
    completed:  'bg-slate-50 text-slate-600 border-slate-200',
    draft:      'bg-slate-50 text-slate-400 border-slate-200',
    postponed:  'bg-yellow-50 text-yellow-700 border-yellow-200',
    cancelled:  'bg-red-50   text-red-500   border-red-100',
    half_time:  'bg-orange-50 text-orange-700 border-orange-200',
  };
  return map[status] ?? 'bg-slate-50 text-slate-500 border-slate-200';
}

// ── Validation helpers ────────────────────────────────────────────────────────

/**
 * Simple email format check.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Check if a password meets minimum requirements.
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }
  return { valid: true, message: '' };
}

// ── Array helpers ─────────────────────────────────────────────────────────────

/**
 * Group an array of objects by a key.
 * @param {Array}  arr
 * @param {string} key
 * @returns {Object}
 */
export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
}

/**
 * Sort an array of objects by a key.
 * @param {Array}  arr
 * @param {string} key
 * @param {'asc'|'desc'} direction
 * @returns {Array}
 */
export function sortBy(arr, key, direction = 'asc') {
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// ── Misc ──────────────────────────────────────────────────────────────────────

/**
 * Sleep for n milliseconds (useful in async flows / retry logic).
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely parse JSON without throwing.
 * @param {string} str
 * @param {*}      fallback
 * @returns {*}
 */
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Generate a simple random ID (not cryptographically secure — for UI keys only).
 * @param {number} length
 * @returns {string}
 */
export function randomId(length = 8) {
  return Math.random().toString(36).slice(2, 2 + length);
}

/**
 * Build a query string from an object, omitting null/undefined values.
 * @param {Object} params
 * @returns {string}  e.g. "?page=2&status=active"
 */
export function buildQueryString(params) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `?${qs}` : '';
}