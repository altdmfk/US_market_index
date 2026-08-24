import React from 'react';
import { ShieldAlert, RefreshCw, Sparkles, Inbox, Clock } from 'lucide-react';
import { FSM_STATES } from '../constants/config';

export default function EmptyState({ fsmState, errorMessage, onRetry, onSeedYesterday, activeSource }) {
  const isFetching = fsmState === FSM_STATES.FETCHING;
  const isHardError = fsmState === FSM_STATES.HARD_ERROR;

  if (isFetching) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Core Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-64 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-32 h-4 bg-slate-800 rounded" />
            <div className="w-64 h-6 bg-slate-800 rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-16 bg-slate-800 rounded-xl" />
            <div className="space-y-2">
              <div className="w-40 h-4 bg-slate-800 rounded" />
              <div className="w-28 h-3 bg-slate-800 rounded" />
            </div>
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-48" />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center shadow-xl space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
        {isHardError ? (
          <ShieldAlert className="w-8 h-8 text-rose-400" />
        ) : (
          <Inbox className="w-8 h-8 text-blue-400" />
        )}
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <h3 className="text-lg font-bold text-slate-100">
          {isHardError ? 'Unable to Retrieve Market Data' : 'No Live Data Loaded'}
        </h3>
        <p className="text-xs text-slate-400">
          {isHardError
            ? errorMessage || 'The upstream source failed to return a valid payload and no prior cached snapshot exists.'
            : 'No live data available. Click below to fetch the latest values.'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 transition-colors shadow-md shadow-blue-900/30"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isHardError ? 'Retry Connection' : 'Fetch Live Data'}
        </button>

        <button
          onClick={onSeedYesterday}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs flex items-center gap-2 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Seed Test Baseline
        </button>
      </div>
    </div>
  );
}
