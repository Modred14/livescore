// src/lib/constants.js

// ── App meta ─────────────────────────────────────────────────────────────────
export const APP_NAME        = 'TournaLive';
export const APP_DESCRIPTION = 'Tournament Live Score Platform';
export const APP_VERSION     = '1.0.0';

// ── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME:       '/',
  LOGIN:      '/login',
  REGISTER:   '/register',
  DASHBOARD:  '/dashboard',

  TOURNAMENTS:        '/tournaments',
  TOURNAMENT_CREATE:  '/tournaments/create',
  TOURNAMENT:         (id) => `/tournaments/${id}`,
  TOURNAMENT_EDIT:    (id) => `/tournaments/${id}/edit`,
  TOURNAMENT_SETTINGS:(id) => `/tournaments/${id}/settings`,

  TEAMS:              (tournamentId)                    => `/tournaments/${tournamentId}/teams`,
  TEAM_CREATE:        (tournamentId)                    => `/tournaments/${tournamentId}/teams/create`,
  TEAM:               (tournamentId, teamId)            => `/tournaments/${tournamentId}/teams/${teamId}`,
  TEAM_EDIT:          (tournamentId, teamId)            => `/tournaments/${tournamentId}/teams/${teamId}/edit`,
  TEAM_PLAYER_CREATE: (tournamentId, teamId)            => `/tournaments/${tournamentId}/teams/${teamId}/players/create`,
  TEAM_PLAYER_EDIT:   (tournamentId, teamId, playerId)  => `/tournaments/${tournamentId}/teams/${teamId}/players/${playerId}/edit`,

  PLAYERS:       (tournamentId) => `/tournaments/${tournamentId}/players`,

  MATCHES:       (tournamentId) => `/tournaments/${tournamentId}/matches`,
  MATCH_CREATE:  (tournamentId) => `/tournaments/${tournamentId}/matches/create`,
  MATCH:         (tournamentId, matchId) => `/tournaments/${tournamentId}/matches/${matchId}`,
  MATCH_EDIT:    (tournamentId, matchId) => `/tournaments/${tournamentId}/matches/${matchId}/edit`,
  MATCH_LIVE:    (tournamentId, matchId) => `/tournaments/${tournamentId}/matches/${matchId}/live`,
  MATCH_EVENTS:  (tournamentId, matchId) => `/tournaments/${tournamentId}/matches/${matchId}/events`,

  STANDINGS: (tournamentId) => `/tournaments/${tournamentId}/standings`,
  BRACKET:   (tournamentId) => `/tournaments/${tournamentId}/bracket`,
};

// ── API endpoints ─────────────────────────────────────────────────────────────
export const API = {
  AUTH: {
    LOGIN:    '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT:   '/api/auth/logout',
    ME:       '/api/auth/me',
  },
  TOURNAMENTS: '/api/tournaments',
  TOURNAMENT:  (id) => `/api/tournaments/${id}`,
  TEAMS:              '/api/teams',
  TEAM:               (id) => `/api/teams/${id}`,
  TOURNAMENT_TEAMS:   (tournamentId)          => `/api/tournaments/${tournamentId}/teams`,
  TOURNAMENT_TEAM:    (tournamentId, teamId)  => `/api/tournaments/${tournamentId}/teams/${teamId}`,
  TEAM_PLAYERS:       (tournamentId, teamId)  => `/api/tournaments/${tournamentId}/teams/${teamId}/players`,
  TEAM_PLAYER:        (tournamentId, teamId, playerId) => `/api/tournaments/${tournamentId}/teams/${teamId}/players/${playerId}`,
  PLAYERS:     '/api/players',
  PLAYER:      (id) => `/api/players/${id}`,
  MATCHES:              '/api/matches',
  MATCH:                (id) => `/api/matches/${id}`,
  TOURNAMENT_MATCHES:   (tournamentId)            => `/api/tournaments/${tournamentId}/matches`,
  TOURNAMENT_MATCH:     (tournamentId, matchId)   => `/api/tournaments/${tournamentId}/matches/${matchId}`,
  MATCH_STATUS_URL: (tournamentId, matchId) => `/api/tournaments/${tournamentId}/matches/${matchId}/status`,
  MATCH_EVENTS:     (tournamentId, matchId) => `/api/tournaments/${tournamentId}/matches/${matchId}/events`,
  MATCH_EVENT:      (tournamentId, matchId, eventId) => `/api/tournaments/${tournamentId}/matches/${matchId}/events/${eventId}`,
  STANDINGS:   '/api/standings',
  EVENTS:      '/api/events',
};

// ── Tournament ────────────────────────────────────────────────────────────────
export const TOURNAMENT_STATUS = {
  DRAFT:      'draft',
  UPCOMING:   'upcoming',
  ACTIVE:     'active',
  COMPLETED:  'completed',
  FINISHED:   'completed',  // alias used in UI labels
};

export const TOURNAMENT_TYPE = {
  LEAGUE:      'league',
  KNOCKOUT:    'knockout',
  GROUP_STAGE: 'group_stage',
  ROUND_ROBIN: 'round_robin',
};

// Keep TOURNAMENT_FORMAT as alias for backward compat
export const TOURNAMENT_FORMAT = TOURNAMENT_TYPE;

export const TOURNAMENT_STATUS_LABELS = {
  [TOURNAMENT_STATUS.DRAFT]:     'Draft',
  [TOURNAMENT_STATUS.UPCOMING]:  'Upcoming',
  [TOURNAMENT_STATUS.ACTIVE]:    'Active',
  [TOURNAMENT_STATUS.COMPLETED]: 'Completed',
};

export const TOURNAMENT_TYPE_LABELS = {
  [TOURNAMENT_TYPE.LEAGUE]:      'League',
  [TOURNAMENT_TYPE.KNOCKOUT]:    'Knockout',
  [TOURNAMENT_TYPE.GROUP_STAGE]: 'Group Stage',
  [TOURNAMENT_TYPE.ROUND_ROBIN]: 'Round Robin',
};

// Keep TOURNAMENT_FORMAT_LABELS as alias
export const TOURNAMENT_FORMAT_LABELS = TOURNAMENT_TYPE_LABELS;

// ── Match ─────────────────────────────────────────────────────────────────────
export const MATCH_STATUS = {
  SCHEDULED:  'scheduled',
  LIVE:       'live',
  HALF_TIME:  'half_time',
  COMPLETED:  'completed',
  POSTPONED:  'postponed',
  CANCELLED:  'cancelled',
};

export const MATCH_STATUS_LABELS = {
  [MATCH_STATUS.SCHEDULED]:  'Scheduled',
  [MATCH_STATUS.LIVE]:       'Live',
  [MATCH_STATUS.HALF_TIME]:  'Half Time',
  [MATCH_STATUS.COMPLETED]:  'Completed',
  [MATCH_STATUS.POSTPONED]:  'Postponed',
  [MATCH_STATUS.CANCELLED]:  'Cancelled',
};

// ── Events ────────────────────────────────────────────────────────────────────
export const EVENT_TYPE = {
  GOAL:           'goal',
  OWN_GOAL:       'own_goal',
  PENALTY_GOAL:   'penalty_goal',
  PENALTY_MISSED: 'penalty_missed',
  YELLOW_CARD:    'yellow_card',
  RED_CARD:       'red_card',
  YELLOW_RED:     'yellow_red_card',
  SUBSTITUTION:   'substitution',
  KICK_OFF:       'kick_off',
  HALF_TIME_EVT:  'half_time',
  SECOND_HALF:    'second_half',
  FULL_TIME:      'full_time',
  // legacy aliases
  PENALTY:        'penalty_goal',
};

export const EVENT_TYPE_LABELS = {
  goal:            'Goal',
  own_goal:        'Own Goal',
  penalty_goal:    'Penalty Goal',
  penalty_missed:  'Penalty Missed',
  yellow_card:     'Yellow Card',
  red_card:        'Red Card',
  yellow_red_card: 'Yellow-Red Card',
  substitution:    'Substitution',
  kick_off:        'Kick Off',
  half_time:       'Half Time',
  second_half:     'Second Half',
  full_time:       'Full Time',
};

/** Which event types increase the score? */
export const SCORING_EVENTS = new Set(['goal', 'penalty_goal', 'own_goal']);
/** Which events are card events? */
export const CARD_EVENTS    = new Set(['yellow_card', 'red_card', 'yellow_red_card']);
/** Which events are match lifecycle events? */
export const LIFECYCLE_EVENTS = new Set(['kick_off','half_time','second_half','full_time']);

// ── Player ────────────────────────────────────────────────────────────────────
export const PLAYER_POSITION = {
  GK:  'goalkeeper',
  DEF: 'defender',
  MID: 'midfielder',
  FWD: 'forward',
};

export const PLAYER_POSITION_LABELS = {
  [PLAYER_POSITION.GK]:  'Goalkeeper',
  [PLAYER_POSITION.DEF]: 'Defender',
  [PLAYER_POSITION.MID]: 'Midfielder',
  [PLAYER_POSITION.FWD]: 'Forward',
};

// ── Standings points system ───────────────────────────────────────────────────
export const POINTS = {
  WIN:  3,
  DRAW: 1,
  LOSS: 0,
};

// ── Pagination ────────────────────────────────────────────────────────────────
export const PAGE_SIZE         = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ── Roles ─────────────────────────────────────────────────────────────────────
export const USER_ROLE = {
  ADMIN:   'admin',
  MANAGER: 'manager',
  VIEWER:  'viewer',
};

export const USER_ROLE_LABELS = {
  [USER_ROLE.ADMIN]:   'Admin',
  [USER_ROLE.MANAGER]: 'Manager',
  [USER_ROLE.VIEWER]:  'Viewer',
};

// ── Date / time ───────────────────────────────────────────────────────────────
export const DATE_FORMAT     = 'dd MMM yyyy';
export const DATETIME_FORMAT = 'dd MMM yyyy, HH:mm';
export const TIME_FORMAT     = 'HH:mm';

// ── Misc ──────────────────────────────────────────────────────────────────────
export const DEFAULT_AVATAR_URL = '/images/default-avatar.png';
export const DEFAULT_BADGE_URL  = '/images/default-badge.png';
export const MAX_UPLOAD_SIZE_MB = 5;
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];