// src/components/live/MatchControls.js

'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';

/**
 * MatchControls — admin panel for transitioning match status.
 * Shows the right action buttons based on current match status.
 */
export default function MatchControls({ match, onTransition, disabled = false }) {
  if (!match) return null;

  const { status } = match;

  const [confirmOpen,    setConfirmOpen]    = useState(false);
  const [pendingStatus,  setPendingStatus]  = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');

  const requestTransition = (newStatus) => {
    setPendingStatus(newStatus);
    setConfirmOpen(true);
    setError('');
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await onTransition(pendingStatus);
      if (!result?.success) {
        setError(result?.message || 'Failed to update match status.');
        return;
      }
      setConfirmOpen(false);
      setPendingStatus(null);
    } catch {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const TRANSITION_LABELS = {
    live:      { title: 'Start Match',   desc: 'This will kick off the match and start recording events.' },
    half_time: { title: 'End First Half', desc: 'The half-time whistle will be recorded automatically.' },
    completed: { title: 'End Match',     desc: 'The full-time whistle will be recorded. This cannot be undone.' },
  };

  const controls = (() => {
    switch (status) {
      case 'scheduled':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="text-center mb-2">
              <p className="text-sm font-semibold text-slate-700">Match not started yet</p>
              <p className="text-xs text-slate-500 mt-0.5">Click below to kick off the match</p>
            </div>
            <Button
              onClick={() => requestTransition('live')}
              size="lg"
              disabled={disabled}
              className="w-full sm:w-auto"
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6.39-2.908a.75.75 0 0 1 .766.027l3.5 2.25a.75.75 0 0 1 0 1.262l-3.5 2.25A.75.75 0 0 1 8 12.25v-4.5a.75.75 0 0 1 .39-.658Z" clipRule="evenodd" />
                </svg>
              }
            >
              Start Match (Kick Off)
            </Button>
          </div>
        );

      case 'live':
        return (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={() => requestTransition('half_time')}
              variant="secondary"
              size="md"
              disabled={disabled}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" />
                </svg>
              }
            >
              Half Time
            </Button>
            <Button
              onClick={() => requestTransition('completed')}
              variant="danger"
              size="md"
              disabled={disabled}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm5-2.25A.75.75 0 0 1 7.75 7h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5Z" clipRule="evenodd" />
                </svg>
              }
            >
              Full Time (End Match)
            </Button>
          </div>
        );

      case 'half_time':
        return (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={() => requestTransition('live')}
              size="md"
              disabled={disabled}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6.39-2.908a.75.75 0 0 1 .766.027l3.5 2.25a.75.75 0 0 1 0 1.262l-3.5 2.25A.75.75 0 0 1 8 12.25v-4.5a.75.75 0 0 1 .39-.658Z" clipRule="evenodd" />
                </svg>
              }
            >
              Start Second Half
            </Button>
            <Button
              onClick={() => requestTransition('completed')}
              variant="danger"
              size="md"
              disabled={disabled}
            >
              End Match
            </Button>
          </div>
        );

      case 'completed':
        return (
          <div className="text-center py-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-green-600">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              Match completed — no further changes allowed
            </div>
          </div>
        );

      default:
        return null;
    }
  })();

  if (!controls) return null;

  const confirmInfo = pendingStatus ? TRANSITION_LABELS[pendingStatus] : null;

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider">
            Match Controls
          </h3>
        </div>
        {controls}
        {error && (
          <p className="mt-3 text-xs text-red-600 font-medium text-center">{error}</p>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => !loading && setConfirmOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        title={confirmInfo?.title ?? 'Confirm Action'}
        message={confirmInfo?.desc ?? 'Are you sure?'}
        confirmLabel="Yes, Continue"
        cancelLabel="Cancel"
        variant={pendingStatus === 'completed' ? 'danger' : 'primary'}
      />
    </>
  );
}