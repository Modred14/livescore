// src/components/matches/MatchForm.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { SectionSpinner } from '@/components/ui/Spinner';
import { ROUTES, API, MATCH_STATUS, MATCH_STATUS_LABELS } from '@/lib/constants';

const STATUS_OPTIONS = Object.entries(MATCH_STATUS_LABELS).map(([value, label]) => ({ value, label }));

const ROUND_SUGGESTIONS = {
  league:      ['Matchday 1','Matchday 2','Matchday 3','Matchday 4','Matchday 5','Matchday 6'],
  knockout:    ['Round of 16','Quarter Final','Semi Final','Third Place Play-off','Final'],
  group_stage: ['Group A','Group B','Group C','Group D','Quarter Final','Semi Final','Final'],
  round_robin: ['Round 1','Round 2','Round 3','Round 4','Round 5'],
};

/**
 * MatchForm — shared create/edit form for match fixtures.
 *
 * Props:
 *   mode           — 'create' | 'edit'
 *   tournamentId   — always required
 *   tournamentType — used to suggest round names
 *   matchId        — required for edit
 *   initialData    — pre-filled values for edit
 */
export default function MatchForm({
  mode            = 'create',
  tournamentId,
  tournamentType  = 'league',
  matchId,
  initialData     = {},
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [teams,   setTeams]   = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  const [form, setForm] = useState({
    home_team_id: initialData.home_team_id ?? '',
    away_team_id: initialData.away_team_id ?? '',
    venue:        initialData.venue        ?? '',
    match_date:   initialData.match_date   ? initialData.match_date.slice(0, 10) : '',
    match_time:   initialData.match_time   ? initialData.match_time.slice(0, 5)  : '',
    round_name:   initialData.round_name   ?? '',
    status:       initialData.status       ?? 'scheduled',
  });

  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Load teams for dropdowns
  useEffect(() => {
    async function loadTeams() {
      try {
        const res  = await fetch(API.TOURNAMENT_TEAMS(tournamentId), { credentials: 'include' });
        const data = await res.json();
        if (res.ok) setTeams(data.teams || []);
      } catch { /* silent */ }
      finally { setTeamsLoading(false); }
    }
    if (tournamentId) loadTeams();
  }, [tournamentId]);

  const teamOptions = teams.map((t) => ({ value: t.id, label: t.name }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (globalError)  setGlobalError('');
  };

  const validate = () => {
    const e = {};
    if (!form.home_team_id) e.home_team_id = 'Home team is required.';
    if (!form.away_team_id) e.away_team_id = 'Away team is required.';
    if (form.home_team_id && form.away_team_id && form.home_team_id === form.away_team_id)
      e.away_team_id = 'Home and away teams must be different.';
    if (!form.match_date) e.match_date = 'Match date is required.';
    if (!form.match_time) e.match_time = 'Match time is required.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }

    setLoading(true);
    setGlobalError('');
    try {
      const url    = isEdit
        ? API.TOURNAMENT_MATCH(tournamentId, matchId)
        : API.TOURNAMENT_MATCHES(tournamentId);
      const method = isEdit ? 'PATCH' : 'POST';

      const res  = await fetch(url, {
        method,
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          home_team_id: form.home_team_id,
          away_team_id: form.away_team_id,
          venue:        form.venue.trim()      || null,
          match_date:   form.match_date,
          match_time:   form.match_time,
          round_name:   form.round_name.trim() || null,
          status:       form.status,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) setErrors(data.errors);
        setGlobalError(data.message || 'Something went wrong.');
        return;
      }

      router.push(ROUTES.MATCHES(tournamentId));
      router.refresh();
    } catch {
      setGlobalError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roundSuggestions = ROUND_SUGGESTIONS[tournamentType] ?? ROUND_SUGGESTIONS.league;

  if (teamsLoading) return <SectionSpinner message="Loading teams…" />;

  if (teams.length < 2) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-yellow-600">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 1.998-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.502-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-yellow-800 mb-1">Not enough teams</h3>
        <p className="text-sm text-yellow-700">You need at least 2 teams to create a match.</p>
        <Button href={ROUTES.TEAM_CREATE(tournamentId)} size="sm" variant="secondary" className="mt-4">
          Add Teams First
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {globalError && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-red-500 shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700 font-medium">{globalError}</p>
        </div>
      )}

      {/* Teams */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="font-display font-bold text-slate-800 text-base">Teams</h2>
          <p className="text-xs text-slate-500 mt-0.5">Select the home and away teams</p>
        </div>
        <div className="p-5">
          {/* Visual team selector */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-start">
            <Select
              id="home_team_id"
              name="home_team_id"
              label="Home Team"
              placeholder="Select home team…"
              options={teamOptions}
              value={form.home_team_id}
              onChange={handleChange}
              error={errors.home_team_id}
              required
            />
            <div className="hidden sm:flex items-center justify-center pt-7">
              <span className="text-slate-400 font-bold text-sm">VS</span>
            </div>
            <Select
              id="away_team_id"
              name="away_team_id"
              label="Away Team"
              placeholder="Select away team…"
              options={teamOptions}
              value={form.away_team_id}
              onChange={handleChange}
              error={errors.away_team_id}
              required
            />
          </div>

          {/* Preview */}
          {form.home_team_id && form.away_team_id && form.home_team_id !== form.away_team_id && (() => {
            const home = teams.find((t) => t.id === form.home_team_id);
            const away = teams.find((t) => t.id === form.away_team_id);
            return (
              <div className="mt-4 flex items-center justify-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 mx-auto overflow-hidden">
                    {home?.logo_url
                      ? <img src={home.logo_url} alt={home.name} className="w-full h-full object-cover" />
                      : home?.name?.slice(0,2).toUpperCase()}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-1.5 max-w-[80px] truncate">{home?.name}</p>
                  <p className="text-[10px] text-slate-400">Home</p>
                </div>
                <span className="font-display font-extrabold text-slate-300 text-2xl">–</span>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-sm font-bold text-red-700 mx-auto overflow-hidden">
                    {away?.logo_url
                      ? <img src={away.logo_url} alt={away.name} className="w-full h-full object-cover" />
                      : away?.name?.slice(0,2).toUpperCase()}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-1.5 max-w-[80px] truncate">{away?.name}</p>
                  <p className="text-[10px] text-slate-400">Away</p>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Schedule */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="font-display font-bold text-slate-800 text-base">Schedule</h2>
          <p className="text-xs text-slate-500 mt-0.5">Date, time and venue</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="match_date"
              name="match_date"
              type="date"
              label="Match Date"
              value={form.match_date}
              onChange={handleChange}
              error={errors.match_date}
              required
            />
            <Input
              id="match_time"
              name="match_time"
              type="time"
              label="Kick-off Time"
              value={form.match_time}
              onChange={handleChange}
              error={errors.match_time}
              required
            />
          </div>

          <Input
            id="venue"
            name="venue"
            label="Venue"
            placeholder="e.g. Teslim Balogun Stadium, Lagos"
            value={form.venue}
            onChange={handleChange}
            error={errors.venue}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Round & Status */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="font-display font-bold text-slate-800 text-base">Round & Status</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tournament stage and current match state</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Input
              id="round_name"
              name="round_name"
              label="Round / Stage"
              placeholder="e.g. Matchday 3, Quarter Final, Group A…"
              value={form.round_name}
              onChange={handleChange}
              error={errors.round_name}
            />
            {/* Round quick-select chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {roundSuggestions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setForm((prev) => ({ ...prev, round_name: r })); }}
                  className={`px-2 py-0.5 rounded-md text-xs font-medium border transition-colors ${
                    form.round_name === r
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <Select
            id="status"
            name="status"
            label="Match Status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={handleChange}
            error={errors.status}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
        <Button
          type="button"
          variant="neutral"
          size="md"
          onClick={() => router.push(ROUTES.MATCHES(tournamentId))}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="md"
          loading={loading}
          leftIcon={
            !loading && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                {isEdit
                  ? <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                  : <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                }
              </svg>
            )
          }
        >
          {loading
            ? (isEdit ? 'Saving…' : 'Creating…')
            : (isEdit ? 'Save Changes' : 'Create Match')
          }
        </Button>
      </div>
    </form>
  );
}