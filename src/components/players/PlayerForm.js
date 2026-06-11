// src/components/players/PlayerForm.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ROUTES, API, PLAYER_POSITION, PLAYER_POSITION_LABELS } from '@/lib/constants';

const POSITION_OPTIONS = Object.entries(PLAYER_POSITION_LABELS).map(([, label], i) => ({
  value: Object.values(PLAYER_POSITION)[i],
  label,
}));

/**
 * PlayerForm — shared create/edit form for players.
 * Props:
 *   mode         — 'create' | 'edit'
 *   tournamentId — always required
 *   teamId       — always required
 *   playerId     — required for edit
 *   initialData  — pre-filled values for edit
 */
export default function PlayerForm({
  mode         = 'create',
  tournamentId,
  teamId,
  playerId,
  initialData  = {},
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    full_name:     initialData.full_name     ?? '',
    jersey_number: initialData.jersey_number ?? '',
    position:      initialData.position      ?? '',
    photo_url:     initialData.photo_url     ?? '',
  });
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [globalError, setGlobalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (globalError)  setGlobalError('');
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim())     e.full_name     = 'Player name is required.';
    const j = parseInt(form.jersey_number, 10);
    if (!form.jersey_number)        e.jersey_number = 'Jersey number is required.';
    else if (isNaN(j) || j < 1 || j > 99) e.jersey_number = 'Jersey number must be between 1 and 99.';
    if (!form.position)             e.position      = 'Position is required.';
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
        ? API.TEAM_PLAYER(tournamentId, teamId, playerId)
        : API.TEAM_PLAYERS(tournamentId, teamId);
      const method = isEdit ? 'PATCH' : 'POST';

      const res  = await fetch(url, {
        method,
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          full_name:     form.full_name.trim(),
          jersey_number: parseInt(form.jersey_number, 10),
          position:      form.position,
          photo_url:     form.photo_url.trim() || null,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) setErrors(data.errors);
        setGlobalError(data.message || 'Something went wrong.');
        return;
      }

      router.push(ROUTES.TEAM(tournamentId, teamId));
      router.refresh();
    } catch {
      setGlobalError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const JERSEY_NUMBERS = Array.from({ length: 99 }, (_, i) => ({
    value: String(i + 1),
    label: `#${i + 1}`,
  }));

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

      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="font-display font-bold text-slate-800 text-base">Player Details</h2>
          <p className="text-xs text-slate-500 mt-0.5">Name, number and position on the pitch</p>
        </div>
        <div className="p-5 space-y-4">
          <Input
            id="full_name"
            name="full_name"
            label="Full Name"
            placeholder="e.g. Emeka Okafor"
            value={form.full_name}
            onChange={handleChange}
            error={errors.full_name}
            required
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
              </svg>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="jersey_number"
              name="jersey_number"
              label="Jersey Number"
              placeholder="Select number…"
              options={JERSEY_NUMBERS}
              value={String(form.jersey_number)}
              onChange={handleChange}
              error={errors.jersey_number}
              required
            />
            <Select
              id="position"
              name="position"
              label="Position"
              placeholder="Select position…"
              options={POSITION_OPTIONS}
              value={form.position}
              onChange={handleChange}
              error={errors.position}
              required
            />
          </div>

          <Input
            id="photo_url"
            name="photo_url"
            label="Player Photo URL"
            placeholder="https://example.com/player.jpg"
            value={form.photo_url}
            onChange={handleChange}
            error={errors.photo_url}
            hint="Optional — direct link to player photo"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
            }
          />

          {/* Photo preview */}
          {form.photo_url && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <img
                src={form.photo_url}
                alt="Preview"
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <p className="text-xs text-slate-500">Photo preview</p>
            </div>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
        <Button
          type="button"
          variant="neutral"
          size="md"
          onClick={() => router.push(ROUTES.TEAM(tournamentId, teamId))}
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
            ? (isEdit ? 'Saving…' : 'Adding…')
            : (isEdit ? 'Save Changes' : 'Add Player')
          }
        </Button>
      </div>
    </form>
  );
}