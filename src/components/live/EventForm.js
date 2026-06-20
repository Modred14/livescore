// src/components/live/EventForm.js

'use client';

import { useState } from 'react';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const EVENT_CATEGORIES = [
  { value: 'goal',            label: '⚽ Goal'            },
  { value: 'own_goal',        label: '⚽ Own Goal'        },
  { value: 'penalty_goal',    label: '⚽ Penalty Goal'    },
  { value: 'penalty_missed',  label: '✗  Penalty Missed'  },
  { value: 'yellow_card',     label: '🟨 Yellow Card'     },
  { value: 'red_card',        label: '🟥 Red Card'        },
  { value: 'yellow_red_card', label: '🟥 Yellow-Red Card' },
  { value: 'substitution',    label: '🔄 Substitution'    },
];

const NEEDS_TEAM   = new Set(['goal','own_goal','penalty_goal','penalty_missed','yellow_card','red_card','yellow_red_card','substitution']);
const NEEDS_PLAYER = new Set(['goal','own_goal','penalty_goal','penalty_missed','yellow_card','red_card','yellow_red_card','substitution']);
const NEEDS_SECOND = new Set(['substitution']);

/**
 * EventForm — inline form for adding match events during live admin.
 *
 * Props:
 *   match    — full match object
 *   squads   — { home: [...players], away: [...players] }
 *   onSubmit — async (eventData) => { success, message, errors? }
 */
export default function EventForm({ match, squads, onSubmit }) {
  const [form, setForm] = useState({
    event_type:          '',
    team_id:             '',
    player_id:           '',
    secondary_player_id: '',
    minute:              '',
    extra_time:          '0',
    note:                '',
  });
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [success,     setSuccess]     = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Reset player when team changes
      if (name === 'team_id') {
        next.player_id           = '';
        next.secondary_player_id = '';
      }
      // Reset team/player when event type changes
      if (name === 'event_type') {
        next.team_id             = '';
        next.player_id           = '';
        next.secondary_player_id = '';
      }
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (globalError)  setGlobalError('');
    if (success)      setSuccess('');
  };

  // Build team options for dropdown
  const teamOptions = [
    { value: match.home_team_id, label: `${match.home_team_name} (Home)` },
    { value: match.away_team_id, label: `${match.away_team_name} (Away)` },
  ];

  // Build player options filtered by selected team
  const allPlayers  = [...(squads.home || []), ...(squads.away || [])];
  const teamPlayers = allPlayers.filter((p) => p.team_id === form.team_id);
  const playerOptions = teamPlayers.map((p) => ({
    value: p.id,
    label: `#${p.jersey_number} ${p.full_name}`,
  }));

  const validate = () => {
    const e = {};
    if (!form.event_type) e.event_type = 'Event type is required.';

    if (NEEDS_TEAM.has(form.event_type) && !form.team_id)
      e.team_id = 'Team is required.';

    if (NEEDS_PLAYER.has(form.event_type) && !form.player_id)
      e.player_id = 'Player is required.';

    if (NEEDS_SECOND.has(form.event_type) && !form.secondary_player_id)
      e.secondary_player_id = 'Player coming on is required.';

    if (form.minute === '' || form.minute === null)
      e.minute = 'Minute is required.';
    else {
      const m = parseInt(form.minute, 10);
      if (isNaN(m) || m < 0 || m > 130) e.minute = 'Must be 0–130.';
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }

    setLoading(true);
    setGlobalError('');
    setSuccess('');

    try {
      const result = await onSubmit({
        event_type:          form.event_type,
        team_id:             form.team_id             || null,
        player_id:           form.player_id           || null,
        secondary_player_id: form.secondary_player_id || null,
        minute:              parseInt(form.minute, 10),
        extra_time:          parseInt(form.extra_time, 10) || 0,
        note:                form.note.trim() || null,
      });

      if (!result?.success) {
        if (result?.errors) setErrors(result.errors);
        setGlobalError(result?.message || 'Failed to add event.');
        return;
      }

      setSuccess(`✓ ${form.event_type.replace(/_/g, ' ')} recorded!`);
      // Reset form but keep event_type and team for quick multi-entry
      setForm((prev) => ({
        ...prev,
        player_id:           '',
        secondary_player_id: '',
        minute:              '',
        extra_time:          '0',
        note:                '',
      }));
    } catch {
      setGlobalError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const showTeam   = NEEDS_TEAM.has(form.event_type);
  const showPlayer = NEEDS_PLAYER.has(form.event_type) && form.team_id;
  const showSecond = NEEDS_SECOND.has(form.event_type) && form.team_id;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {globalError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-red-500 shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-red-700 font-medium">{globalError}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-green-500 shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-green-700 font-semibold">{success}</p>
        </div>
      )}

      {/* Event type */}
      <Select
        id="event_type"
        name="event_type"
        label="Event Type"
        placeholder="Select event…"
        options={EVENT_CATEGORIES}
        value={form.event_type}
        onChange={handleChange}
        error={errors.event_type}
        required
      />

      {/* Team */}
      {showTeam && (
        <Select
          id="team_id"
          name="team_id"
          label="Team"
          placeholder="Select team…"
          options={teamOptions}
          value={form.team_id}
          onChange={handleChange}
          error={errors.team_id}
          required
        />
      )}

      {/* Primary player */}
      {showPlayer && (
        <Select
          id="player_id"
          name="player_id"
          label={form.event_type === 'substitution' ? 'Player Coming Off' : 'Player'}
          placeholder={teamPlayers.length ? 'Select player…' : 'No players in this team'}
          options={playerOptions}
          value={form.player_id}
          onChange={handleChange}
          error={errors.player_id}
          required
        />
      )}

      {/* Secondary player (substitution) */}
      {showSecond && (
        <Select
          id="secondary_player_id"
          name="secondary_player_id"
          label="Player Coming On"
          placeholder="Select player…"
          options={playerOptions.filter((p) => p.value !== form.player_id)}
          value={form.secondary_player_id}
          onChange={handleChange}
          error={errors.secondary_player_id}
          required
        />
      )}

      {/* Minute + extra time */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="minute"
          name="minute"
          type="number"
          label="Minute"
          placeholder="e.g. 45"
          value={form.minute}
          onChange={handleChange}
          error={errors.minute}
          required
          min={0}
          max={130}
        />
        <Input
          id="extra_time"
          name="extra_time"
          type="number"
          label="+ Added Time"
          placeholder="0"
          value={form.extra_time}
          onChange={handleChange}
          error={errors.extra_time}
          min={0}
          max={30}
          hint="e.g. 90+4 → enter 4"
        />
      </div>

      {/* Optional note */}
      <Input
        id="note"
        name="note"
        label="Note (optional)"
        placeholder="e.g. VAR review, penalty awarded…"
        value={form.note}
        onChange={handleChange}
        multiline
        rows={2}
      />

      <Button
        type="submit"
        fullWidth
        size="md"
        loading={loading}
        disabled={!form.event_type}
        leftIcon={
          !loading && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          )
        }
      >
        {loading ? 'Adding…' : 'Add Event'}
      </Button>
    </form>
  );
}