// src/components/tournaments/TournamentForm.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ROUTES, TOURNAMENT_TYPE_LABELS, TOURNAMENT_STATUS_LABELS, TOURNAMENT_TYPE, TOURNAMENT_STATUS } from '@/lib/constants';
import { API } from '@/lib/constants';

const TYPE_OPTIONS = Object.entries(TOURNAMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const STATUS_OPTIONS = Object.entries(TOURNAMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }));

/**
 * TournamentForm — shared form for Create and Edit flows.
 *
 * Props:
 *   initialData — existing tournament data (for edit mode)
 *   mode        — 'create' | 'edit'
 *   tournamentId — required when mode === 'edit'
 */
export default function TournamentForm({ initialData = {}, mode = 'create', tournamentId }) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    name:            initialData.name            ?? '',
    description:     initialData.description     ?? '',
    logo_url:        initialData.logo_url         ?? '',
    tournament_type: initialData.tournament_type ?? '',
    location:        initialData.location         ?? '',
    start_date:      initialData.start_date
      ? initialData.start_date.slice(0, 10)
      : '',
    end_date:        initialData.end_date
      ? initialData.end_date.slice(0, 10)
      : '',
    status:          initialData.status           ?? 'draft',
  });

  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [globalError, setGlobalError] = useState('');

  // ── Field change ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (globalError)  setGlobalError('');
  };

  // ── Client validation ─────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name            = 'Tournament name is required.';
    else if (form.name.length > 150) e.name         = 'Name must be 150 characters or fewer.';
    if (!form.tournament_type)    e.tournament_type = 'Tournament type is required.';
    if (!form.start_date)         e.start_date      = 'Start date is required.';
    if (!form.end_date)           e.end_date        = 'End date is required.';
    if (form.start_date && form.end_date && form.end_date < form.start_date)
      e.end_date = 'End date must be on or after the start date.';
    return e;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }

    setLoading(true);
    setGlobalError('');

    try {
      const url    = isEdit ? API.TOURNAMENT(tournamentId) : API.TOURNAMENTS;
      const method = isEdit ? 'PATCH' : 'POST';

      const res  = await fetch(url, {
        method,
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({
          name:            form.name.trim(),
          description:     form.description.trim() || null,
          logo_url:        form.logo_url.trim()    || null,
          tournament_type: form.tournament_type,
          location:        form.location.trim()    || null,
          start_date:      form.start_date,
          end_date:        form.end_date,
          status:          form.status,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) setErrors(data.errors);
        setGlobalError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      // Redirect to the tournament detail page
      router.push(ROUTES.TOURNAMENT(data.tournament.id));
      router.refresh();

    } catch {
      setGlobalError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = () => {
    if (isEdit) router.push(ROUTES.TOURNAMENT(tournamentId));
    else        router.push(ROUTES.TOURNAMENTS);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {/* Global error */}
      {globalError && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-red-500 shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700 font-medium">{globalError}</p>
        </div>
      )}

      {/* ── Section: Basic Info ─────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="font-display font-bold text-slate-800 text-base">Basic Information</h2>
          <p className="text-xs text-slate-500 mt-0.5">Name and description of the tournament</p>
        </div>
        <div className="p-5 space-y-4">
          <Input
            id="name"
            name="name"
            label="Tournament Name"
            placeholder="e.g. Lagos Premier League 2025"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            required
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 000 4.5h9a2.25 2.25 0 000-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.798 49.798 0 00-6.093-.377.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
              </svg>
            }
          />

          <Input
            id="description"
            name="description"
            label="Description"
            placeholder="Briefly describe the tournament, rules, or format…"
            value={form.description}
            onChange={handleChange}
            error={errors.description}
            multiline
            rows={3}
          />

          <Input
            id="logo_url"
            name="logo_url"
            label="Logo URL"
            placeholder="https://example.com/logo.png"
            value={form.logo_url}
            onChange={handleChange}
            error={errors.logo_url}
            hint="Paste a direct link to an image (JPEG, PNG, or WebP)"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>
      </section>

      {/* ── Section: Format & Location ──────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="font-display font-bold text-slate-800 text-base">Format & Location</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tournament structure and venue</p>
        </div>
        <div className="p-5 space-y-4">
          <Select
            id="tournament_type"
            name="tournament_type"
            label="Tournament Type"
            placeholder="Select a type…"
            options={TYPE_OPTIONS}
            value={form.tournament_type}
            onChange={handleChange}
            error={errors.tournament_type}
            required
          />

          <Input
            id="location"
            name="location"
            label="Location"
            placeholder="e.g. Teslim Balogun Stadium, Lagos"
            value={form.location}
            onChange={handleChange}
            error={errors.location}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>
      </section>

      {/* ── Section: Schedule & Status ──────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="font-display font-bold text-slate-800 text-base">Schedule & Status</h2>
          <p className="text-xs text-slate-500 mt-0.5">Dates and current tournament status</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="start_date"
              name="start_date"
              type="date"
              label="Start Date"
              value={form.start_date}
              onChange={handleChange}
              error={errors.start_date}
              required
            />
            <Input
              id="end_date"
              name="end_date"
              type="date"
              label="End Date"
              value={form.end_date}
              onChange={handleChange}
              error={errors.end_date}
              required
              hint="Must be on or after start date"
            />
          </div>

          <Select
            id="status"
            name="status"
            label="Status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={handleChange}
            error={errors.status}
          />
        </div>
      </section>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="neutral"
          size="md"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
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
            : (isEdit ? 'Save Changes' : 'Create Tournament')
          }
        </Button>
      </div>
    </form>
  );
}