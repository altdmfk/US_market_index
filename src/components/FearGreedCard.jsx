import React from 'react';
import { ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getSentimentCategory } from '../constants/config';
import { getLocalDateString, getYesterdayDateString, formatTimestamp } from '../utils/timezone';
import { calculateDayOverDay } from '../utils/math';
import FearGreedGauge from './FearGreedGauge';
import FearGreedTrendGraph from './FearGreedTrendGraph';

export default function FearGreedCard({ data, snapshots, timezone = 'KST' }) {
  if (!data) return null;

  const score = data.score;
  const sentiment = getSentimentCategory(score);

  // Discover previous baseline strictly from stored historical snapshots (timezone-invariant)
  let previousVal = null;
  let previousLabel = null;

  if (snapshots && snapshots.length > 0) {
    if (snapshots.length >= 2) {
      previousVal = snapshots[1].score;
      previousLabel = `previous (${snapshots[1].date})`;
    } else if (snapshots.length === 1) {
      previousVal = snapshots[0].score;
      previousLabel = `previous (${snapshots[0].date})`;
    }
  }

  const dod = calculateDayOverDay(score, previousVal, 'pts');

  const getDirectionIcon = () => {
    if (dod.direction === 'UP') return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
    if (dod.direction === 'DOWN') return <TrendingDown className="w-3.5 h-3.5 text-rose-400" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Fear & Greed Index</h2>
          <p className="text-xs text-slate-400 mt-0.5">Market sentiment index</p>
        </div>

        <a
          href="https://www.cnn.com/markets/fear-and-greed"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-slate-950/60 hover:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors self-start sm:self-center"
        >
          <span>CNN Business Markets</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Body */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
        {/* Left Side: Prominent Score & Details */}
        <div className="md:col-span-6 space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-400">Current Score</span>
            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="text-5xl sm:text-6xl font-black font-mono text-white tracking-tight">
                {typeof score === 'number' ? score.toFixed(1) : '—'}
              </span>
              <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${sentiment.color} ${sentiment.bg} ${sentiment.border}`}>
                {sentiment.label}
              </span>
            </div>
          </div>

          {/* Day-over-Day Delta */}
          {dod.isValid && (
            <div className="pt-1">
              <span className="text-xs font-medium text-slate-400 block mb-1.5">Day-over-Day change</span>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono border ${dod.bgClass} ${dod.borderClass} ${dod.colorClass}`}>
                  {getDirectionIcon()}
                  <span>{dod.signedDeltaStr} pts</span>
                  {dod.percentDelta !== 0 && (
                    <span className="opacity-90 font-normal">({dod.signedPercentStr})</span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  vs {previousLabel} ({dod.previous.toFixed(1)})
                </span>
              </div>
            </div>
          )}

          {/* Reference Timestamp */}
          <div className="pt-3 text-xs text-slate-400 flex items-center gap-2 border-t border-slate-800/60">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Updated:</span>
            <span className="font-mono text-slate-300">{formatTimestamp(data.rawTimestamp || data.timestamp || data.fetchedAt || data.indexUpdatedAt, timezone)}</span>
          </div>
        </div>

        {/* Right Side: Clean Gauge Arc */}
        <div className="md:col-span-6 flex items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <FearGreedGauge score={score} />
        </div>
      </div>

      {/* Embedded Historical Trend Line Graph with Day-over-Day Differences */}
      <FearGreedTrendGraph data={data} snapshots={snapshots} timezone={timezone} />
    </div>
  );
}

