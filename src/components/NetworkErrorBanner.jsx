import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { FSM_STATES } from '../constants/config';
import { formatLocalTimestamp } from '../utils/timezone';

export default function NetworkErrorBanner({
  fsmState,
  errorMessage,
  lastVerifiedTime,
  onRetry
}) {
  const isStale = fsmState === FSM_STATES.STALE_ERROR;
  const isHardError = fsmState === FSM_STATES.HARD_ERROR;

  if (!isStale && !isHardError) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200 text-xs">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
          {isHardError ? <WifiOff className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        </div>
        <div>
          <div className="flex items-center gap-2 font-bold text-amber-100 text-sm">
            <span>{isHardError ? 'Network Connection Error' : 'Showing Cached Data (Network Error)'}</span>
          </div>
          <p className="text-amber-300/80 mt-0.5">
            {errorMessage || 'Unable to reach upstream market source.'}
            {isStale && lastVerifiedTime && (
              <span className="ml-1 text-amber-200 font-medium">
                Retaining last verified data from {formatLocalTimestamp(lastVerifiedTime)}.
              </span>
            )}
          </p>
        </div>
      </div>

      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-sm"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Retry</span>
      </button>
    </div>
  );
}
