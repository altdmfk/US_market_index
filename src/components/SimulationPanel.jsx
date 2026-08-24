import React from 'react';
import {
  Clock,
  KeyRound,
  ShieldX,
  WifiOff,
  FileCode,
  AlertOctagon,
  RotateCcw
} from 'lucide-react';
import { FAILURE_MODES } from '../constants/config';

export default function SimulationPanel({
  activeMode,
  onTriggerSimulation,
  onResetToLive,
  errorMessage
}) {
  const isFailureActive = activeMode !== FAILURE_MODES.NONE || !!errorMessage;

  const failureOptions = [
    {
      mode: FAILURE_MODES.TIMEOUT,
      title: 'Timeout',
      desc: '>5000ms abort',
      icon: <Clock className="w-3.5 h-3.5 text-amber-400" />
    },
    {
      mode: FAILURE_MODES.AUTH_401,
      title: 'Auth 401/403',
      desc: '401 Unauthorized',
      icon: <KeyRound className="w-3.5 h-3.5 text-rose-400" />
    },
    {
      mode: FAILURE_MODES.RATE_LIMIT_429,
      title: 'Rate limit 429',
      desc: 'Too Many Requests',
      icon: <ShieldX className="w-3.5 h-3.5 text-purple-400" />
    },
    {
      mode: FAILURE_MODES.NETWORK_OFFLINE,
      title: 'Network offline',
      desc: 'No connection',
      icon: <WifiOff className="w-3.5 h-3.5 text-sky-400" />
    },
    {
      mode: FAILURE_MODES.MALFORMED_SCHEMA,
      title: 'Malformed schema',
      desc: 'Schema break',
      icon: <FileCode className="w-3.5 h-3.5 text-rose-400" />
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Error simulation</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test Stale-While-Revalidate and 5 network failure modes
          </p>
        </div>

        <button
          onClick={onResetToLive}
          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
          <span>Reset to live</span>
        </button>
      </div>

      {/* Active Error Bar */}
      {isFailureActive && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-rose-300">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-mono text-[11px] truncate">{errorMessage || 'Active failure simulation running'}</span>
          </div>

          <button
            onClick={onResetToLive}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors self-start sm:self-auto shrink-0"
          >
            Retry live fetch
          </button>
        </div>
      )}

      {/* 5 Failure Mode Synthetic Replay Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {failureOptions.map((opt) => {
          const isActive = activeMode === opt.mode;

          return (
            <button
              key={opt.mode}
              onClick={() => onTriggerSimulation(opt.mode)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between text-xs ${
                isActive
                  ? 'bg-rose-600/20 border-rose-500/60 ring-1 ring-rose-500/40 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                {opt.icon}
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
              </div>
              <span className="font-bold mt-2 text-[11px] text-slate-200">{opt.title}</span>
              <span className="text-[10px] text-slate-400">{opt.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
