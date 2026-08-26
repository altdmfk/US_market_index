import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Clock,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  Lock,
  Unlock
} from 'lucide-react';
import { FSM_STATES } from '../constants/config';
import { formatLocalTimeShort, getLocalTimezoneShort } from '../utils/timezone';

export default function Header({
  fsmState,
  onRefresh,
  onOpenDevAuth,
  isDevUnlocked,
  activeTab,
  onTabChange,
  timezone = 'KST',
  onTimezoneToggle
}) {
  const [localTime, setLocalTime] = useState(formatLocalTimeShort(new Date()));
  const [tzLabel, setTzLabel] = useState(getLocalTimezoneShort());

  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(formatLocalTimeShort(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = () => {
    switch (fsmState) {
      case FSM_STATES.FETCHING:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" /> Fetching
          </span>
        );
      case FSM_STATES.STALE_ERROR:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> Stale
          </span>
        );
      case FSM_STATES.HARD_ERROR:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3 h-3" /> Error
          </span>
        );
      case FSM_STATES.SUCCESS:
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        );
    }
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-slate-900 border border-blue-500/30 flex items-center justify-center shadow-md shadow-blue-900/20">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">US Market Index</h1>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-400">Live market tracking</p>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2">
            {/* View Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => onTabChange('overview')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Market Overview
              </button>

              {isDevUnlocked && (
                <button
                  onClick={() => onTabChange('dev')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'dev'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  Developer Sandbox
                </button>
              )}
            </div>

            <button id="btn-timezone-toggle" type="button" data-tz={timezone} onClick={onTimezoneToggle} aria-label={`Switch timezone, currently ${timezone}`} title="Toggle KST / EDT" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-semibold hover:border-blue-500/60">{timezone}</button>

            {/* Local Computer Clock */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{localTime}</span>
              <span className="text-[10px] text-slate-500 px-1 py-0.5 rounded bg-slate-900 border border-slate-800">{tzLabel}</span>
            </div>

            {/* Lock / Unlock Icon Button */}
            <button
              onClick={onOpenDevAuth}
              title={isDevUnlocked ? 'Developer mode active (click to lock)' : 'Developer access (password required)'}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors shadow-sm ${
                isDevUnlocked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isDevUnlocked ? <Unlock className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4" />}
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={fsmState === FSM_STATES.FETCHING}
              title="Refresh live data"
              className="flex items-center justify-center p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-900/30"
            >
              <RefreshCw className={`w-4 h-4 ${fsmState === FSM_STATES.FETCHING ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

