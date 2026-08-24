import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { calculateDayOverDay } from '../utils/math';

export default function DayOverDayCard({ data, snapshots, activeSource }) {
  if (!data) return null;

  const currentVal = data.score;
  let previousVal = null;
  let previousDateLabel = 'Previous Close';

  if (snapshots && snapshots.length >= 2) {
    const prevSnapshot = snapshots[1];
    if (prevSnapshot && typeof prevSnapshot.score === 'number') {
      previousVal = prevSnapshot.score;
      previousDateLabel = `${prevSnapshot.date} KST`;
    }
  }

  if (previousVal === null && typeof data.previousClose === 'number') {
    previousVal = data.previousClose;
    previousDateLabel = 'Previous Close';
  }

  const dod = calculateDayOverDay(currentVal, previousVal, activeSource.unitShort || 'pts');

  const getDirectionIcon = () => {
    if (dod.direction === 'UP') return <TrendingUp className="w-5 h-5 text-emerald-400" />;
    if (dod.direction === 'DOWN') return <TrendingDown className="w-5 h-5 text-rose-400" />;
    return <Minus className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <h3 className="text-base font-bold text-slate-100">Day-over-Day Change</h3>
          <span className="text-xs text-slate-400 font-mono">Δ = Current - Previous</span>
        </div>

        <div className="mt-5">
          {dod.isValid ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border flex items-center justify-center ${dod.bgClass} ${dod.borderClass}`}>
                  {getDirectionIcon()}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${dod.colorClass}`}>
                      {dod.directionSymbol} {dod.absDelta.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">{dod.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className={`font-semibold px-2 py-0.5 rounded ${dod.bgClass} ${dod.colorClass}`}>
                      {dod.directionText}
                    </span>
                    {dod.percentDelta !== 0 && (
                      <span className="text-slate-400 font-mono">
                        ({dod.percentDelta > 0 ? '+' : ''}{dod.percentDelta.toFixed(2)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Current: <strong className="text-white">{dod.current.toFixed(2)}</strong></span>
                  <span>Previous ({previousDateLabel}): <strong className="text-slate-200">{dod.previous.toFixed(2)}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
              <Info className="w-5 h-5 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Insufficient Historical Snapshots</p>
              <p className="text-[11px] text-slate-400">
                To calculate DoD delta, at least 2 consecutive daily records are required.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
