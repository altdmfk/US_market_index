import React from 'react';
import { ExternalLink, TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import { formatLocalTimestamp } from '../utils/timezone';
import { calculateDayOverDay } from '../utils/math';

export default function MarketIndexCard({
  title,
  sourceUrl,
  sourceName,
  data,
  unit = 'pts'
}) {
  if (!data) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg animate-pulse h-48 flex flex-col justify-between">
        <div className="w-28 h-4 bg-slate-800 rounded" />
        <div className="w-36 h-8 bg-slate-800 rounded" />
        <div className="w-48 h-3 bg-slate-800 rounded" />
      </div>
    );
  }

  const currentPrice = data.score;
  const prevClose = data.previousClose;
  const dod = calculateDayOverDay(currentPrice, prevClose, unit);

  const getDirectionIcon = () => {
    if (dod.direction === 'UP') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (dod.direction === 'DOWN') return <TrendingDown className="w-4 h-4 text-rose-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-colors">
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <h3 className="text-base font-bold text-slate-100 tracking-tight">{title}</h3>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-slate-950/60 hover:bg-slate-950 px-2 py-1 rounded-md border border-slate-800 transition-colors"
          >
            <span>{sourceName}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Price & Day-over-Day Row */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              {typeof currentPrice === 'number'
                ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">{unit}</span>
          </div>

          {/* Delta Pill */}
          {dod.isValid && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono border ${dod.bgClass} ${dod.borderClass} ${dod.colorClass}`}>
                {getDirectionIcon()}
                <span>{dod.directionSymbol} {dod.absDelta.toFixed(2)}</span>
                {dod.percentDelta !== 0 && (
                  <span className="opacity-90">
                    ({dod.percentDelta > 0 ? '+' : ''}{dod.percentDelta.toFixed(2)}%)
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                vs previous close {prevClose?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Timestamp */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          <Clock className="w-3 h-3 text-slate-500" />
          {formatLocalTimestamp(data.rawTimestamp || data.fetchedAt)}
        </span>
      </div>
    </div>
  );
}
