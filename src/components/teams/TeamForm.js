// src/components/teams/TeamForm.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ROUTES, API } from '@/lib/constants';

/**
 * TeamForm — shared form for create and edit.
 * Props:
 *   mode          — 'create' | 'edit'
 *   tournamentId  — always required
 *   teamId        — required for edit
 *   initialData   — pre-filled values for edit
 */
export default function TeamForm({
  mode         = 'create',
  tournamentId,
  teamId,
  initialData  = {},
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    name:       initialData.name       ?? '',
    logo_url:   initialData.logo_url   ?? '',
    coach_name: initialData.coach_name ?? '',
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
    if (!form.name.trim())       e.name = 'Team name is required.';
    else if (form.name.length > 100) e.name = 'Team name must be 100 characters or fewer.';
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
        ? API.TOURNAMENT_TEAM(tournamentId, teamId)
        : API.TOURNAMENT_TEAMS(tournamentId);
      const method = isEdit ? 'PATCH' : 'POST';

      const res  = await fetch(url, {
        method,
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name:       form.name.trim(),
          logo_url:   form.logo_url.trim()   || null,
          coach_name: form.coach_name.trim() || null,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) setErrors(data.errors);
        setGlobalError(data.message || 'Something went wrong.');
        return;
      }

      router.push(ROUTES.TEAMS(tournamentId));
      router.refresh();
    } catch {
      setGlobalError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Basic Info */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="font-display font-bold text-slate-800 text-base">Team Information</h2>
          <p className="text-xs text-slate-500 mt-0.5">Name, logo and coaching staff</p>
        </div>
        <div className="p-5 space-y-4">
          <Input
            id="name"
            name="name"
            label="Team Name"
            placeholder="e.g. Eagles FC"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            required
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
              </svg>
            }
          />

          <Input
            id="logo_url"
            name="logo_url"
            label="Team Logo URL"
            placeholder="https://example.com/team-logo.png"
            value={form.logo_url}
            onChange={handleChange}
            error={errors.logo_url}
            hint="Paste a direct link to the team badge or crest image"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
            }
          />

          <Input
            id="coach_name"
            name="coach_name"
            label="Head Coach"
            placeholder="e.g. Samuel Okafor"
            value={form.coach_name}
            onChange={handleChange}
            error={errors.coach_name}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
              </svg>
            }
          />

          {/* Logo preview */}
          {form.logo_url && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <img
                src={form.logo_url}
                alt="Logo preview"
                className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <p className="text-xs text-slate-500">Logo preview</p>
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
          onClick={() => router.push(ROUTES.TEAMS(tournamentId))}
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
            : (isEdit ? 'Save Changes' : 'Create Team')
          }
        </Button>
      </div>
    </form>
  );
}