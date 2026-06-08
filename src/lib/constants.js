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
  TOURNAMENT_SETTINGS:(id) => `/tournaments/${id}/settings`,

  TEAMS:         (tournamentId) => `/tournaments/${tournamentId}/teams`,
  TEAM_CREATE:   (tournamentId) => `/tournaments/${tournamentId}/teams/create`,

  PLAYERS:       (tournamentId) => `/tournaments/${tournamentId}/players`,

  MATCHES:       (tournamentId) => `/tournaments/${tournamentId}/matches`,
  MATCH_CREATE:  (tournamentId) => `/tournaments/${tournamentId}/matches/create`,
  MATCH:         (tournamentId, matchId) => `/tournaments/${tournamentId}/matches/${matchId}`,
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
  },
  TOURNAMENTS: '/api/tournaments',
  TOURNAMENT:  (id) => `/api/tournaments/${id}`,
  TEAMS:       '/api/teams',
  TEAM:        (id) => `/api/teams/${id}`,
  PLAYERS:     '/api/players',
  PLAYER:      (id) => `/api/players/${id}`,
  MATCHES:     '/api/matches',
  MATCH:       (id) => `/api/matches/${id}`,
  STANDINGS:   '/api/standings',
  EVENTS:      '/api/events',
};

// ── Tournament ────────────────────────────────────────────────────────────────
export const TOURNAMENT_STATUS = {
  DRAFT:      'draft',
  UPCOMING:   'upcoming',
  ACTIVE:     'active',
  COMPLETED:  'completed',
  CANCELLED:  'cancelled',
};

export const TOURNAMENT_FORMAT = {
  LEAGUE:        'league',
  KNOCKOUT:      'knockout',
  GROUP_KNOCKOUT: 'group_knockout',
};

export const TOURNAMENT_STATUS_LABELS = {
  [TOURNAMENT_STATUS.DRAFT]:     'Draft',
  [TOURNAMENT_STATUS.UPCOMING]:  'Upcoming',
  [TOURNAMENT_STATUS.ACTIVE]:    'Active',
  [TOURNAMENT_STATUS.COMPLETED]: 'Completed',
  [TOURNAMENT_STATUS.CANCELLED]: 'Cancelled',
};

export const TOURNAMENT_FORMAT_LABELS = {
  [TOURNAMENT_FORMAT.LEAGUE]:         'League',
  [TOURNAMENT_FORMAT.KNOCKOUT]:       'Knockout',
  [TOURNAMENT_FORMAT.GROUP_KNOCKOUT]: 'Group + Knockout',
};

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
  GOAL:         'goal',
  OWN_GOAL:     'own_goal',
  PENALTY:      'penalty',
  YELLOW_CARD:  'yellow_card',
  RED_CARD:     'red_card',
  YELLOW_RED:   'yellow_red',
  SUBSTITUTION: 'substitution',
  KICK_OFF:     'kick_off',
  FULL_TIME:    'full_time',
  HALF_TIME:    'half_time',
};

export const EVENT_TYPE_LABELS = {
  [EVENT_TYPE.GOAL]:         'Goal',
  [EVENT_TYPE.OWN_GOAL]:     'Own Goal',
  [EVENT_TYPE.PENALTY]:      'Penalty',
  [EVENT_TYPE.YELLOW_CARD]:  'Yellow Card',
  [EVENT_TYPE.RED_CARD]:     'Red Card',
  [EVENT_TYPE.YELLOW_RED]:   'Yellow-Red Card',
  [EVENT_TYPE.SUBSTITUTION]: 'Substitution',
  [EVENT_TYPE.KICK_OFF]:     'Kick Off',
  [EVENT_TYPE.FULL_TIME]:    'Full Time',
  [EVENT_TYPE.HALF_TIME]:    'Half Time',
};

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