import React from 'react';
import { ExternalLink, Clock, ShieldCheck, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { getSentimentCategory, FSM_STATES } from '../constants/config';
import { formatKSTTimestamp } from '../utils/timezone';

export default function CoreMetricCard({ data, activeSource, fsmState, onRetry, lastFetchTime }) {
  if (!data) return null;

  const isFearAndGreed = activeSource.id === 'fear_and_greed';
  const score = data.score;
  const sentiment = isFearAndGreed ? getSentimentCategory(score) : { label: data.rating?.toUpperCase() || 'NORMAL', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
  const isStale = fsmState === FSM_STATES.STALE_ERROR;

  // Calculate needle angle for Fear & Greed gauge (0 to 180 degrees)
  const gaugePercent = isFearAndGreed ? Math.max(0, Math.min(100, score)) : 50;
  const needleAngle = -90 + (gaugePercent / 100) * 180;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Deep Blue subtle radial glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Stale Warning Banner if in STALE_ERROR mode */}
      {isStale && (
        <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-300">
          <div className="flex items-center gap-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-amber-200">Stale / Outdated Data Active</p>
              <p className="text-amber-300/80">
                Network error occurred. Retaining Last Known Good value from {formatKSTTimestamp(data.fetchedAt || data.rawTimestamp)}.
              </p>
            </div>
          </div>
          <button
            onClick={onRetry}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Fetch
          </button>
        </div>
      )}

      {/* Card Header & Source Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-slate-100">{activeSource.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{activeSource.description}</p>
        </div>

        {/* Source Link */}
        <a
          href={activeSource.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-slate-950/60 hover:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors self-start sm:self-center"
        >
          <span>Source: {activeSource.sourceName}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Metric Display & Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-6">
        {/* Left Score Block */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white font-mono">
              {typeof score === 'number' ? (isFearAndGreed ? score.toFixed(1) : score.toLocaleString(undefined, { minimumFractionDigits: 2 })) : '—'}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-400">{activeSource.unit}</span>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border mt-1 w-fit ${sentiment.color} ${sentiment.bg} ${sentiment.border}`}>
                {sentiment.label}
              </span>
            </div>
          </div>

          {/* Timestamp Display */}
          <div className="pt-2 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-300 font-medium">Last Reference Timestamp:</span>
              <span className="font-mono text-slate-200">{formatKSTTimestamp(data.rawTimestamp || data.fetchedAt)}</span>
            </div>
          </div>
        </div>

        {/* Right Visual Gauge / Progress Bar (For Fear & Greed) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          {isFearAndGreed ? (
            <div className="w-full max-w-xs flex flex-col items-center">
              {/* Semi-circular gauge */}
              <div className="relative w-48 h-24 overflow-hidden">
                <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Gauge Background Segments */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray="31.4 251.2" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="31.4 251.2" strokeDashoffset="-31.4" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="12" strokeDasharray="15.7 251.2" strokeDashoffset="-62.8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#38bdf8" strokeWidth="12" strokeDasharray="31.4 251.2" strokeDashoffset="-78.5" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="31.4 251.2" strokeDashoffset="-109.9" />
                </svg>
                {/* Needle pointer */}
                <div
                  className="absolute bottom-0 left-1/2 w-1 h-20 bg-white origin-bottom transform transition-transform duration-700 ease-out shadow-lg"
                  style={{ transform: `translateX(-50%) rotate(${needleAngle}deg)` }}
                />
                <div className="absolute bottom-0 left-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-900 -translate-x-1/2 translate-y-1/2" />
              </div>

              {/* Gauge Scale Labels */}
              <div className="w-full flex justify-between text-[10px] font-mono text-slate-500 mt-2 px-2">
                <span className="text-rose-400 font-semibold">0 Fear</span>
                <span className="text-amber-400">25</span>
                <span className="text-sky-400">50 Neutral</span>
                <span className="text-emerald-400">75</span>
                <span className="text-emerald-500 font-semibold">100 Greed</span>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Previous Day Close:</span>
                <span className="font-mono text-slate-200 font-semibold">
                  {data.previousClose ? data.previousClose.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'} {data.unitShort}
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, ((score - (data.previousClose || score) * 0.95) / ((data.previousClose || score) * 0.1)) * 100))}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">Tracked via public market feeds with zero secret tokens</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
