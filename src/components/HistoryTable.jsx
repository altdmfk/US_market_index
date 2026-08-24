import React from 'react';
import { Calendar, Check, History, Clock, ArrowDownToLine } from 'lucide-react';
import { getSentimentCategory } from '../constants/config';
import { getLocalDateString, getYesterdayDateString, formatLocalTimestamp } from '../utils/timezone';

export default function HistoryTable({ snapshots, activeSource }) {
  const isFearAndGreed = activeSource.id === 'fear_and_greed';
  const todayDate = getLocalDateString(new Date());
  const yesterdayDate = getYesterdayDateString();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100">
            Historical snapshots ({snapshots.length} recorded)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Recorded snapshot history
          </p>
        </div>
      </div>

      {/* Snapshot History Table */}
      {snapshots && snapshots.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                <th className="py-2.5 px-3">Downloaded (Local)</th>
                <th className="py-2.5 px-3">Index Last Updated (Market)</th>
                <th className="py-2.5 px-3">Tag</th>
                <th className="py-2.5 px-3">Value</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {snapshots.map((item) => {
                const sentiment = isFearAndGreed ? getSentimentCategory(item.score) : { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
                const isToday = item.date === todayDate;
                const isYesterday = item.date === yesterdayDate;

                // Format Downloaded vs Market timestamps
                const downloadedDisplay = item.downloadedAtFormatted || item.updatedAtLocal || `${item.date} Local`;
                const marketUpdatedDisplay = item.indexUpdatedAtFormatted || formatLocalTimestamp(item.rawTimestamp || item.date);

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* 1. Downloaded (Local Time) Column */}
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <ArrowDownToLine className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{downloadedDisplay}</span>
                      </div>
                    </td>

                    {/* 2. Index Last Updated (Market Timestamp) Column */}
                    <td className="py-2.5 px-3 text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-mono text-[11px] text-slate-300">{marketUpdatedDisplay}</span>
                      </div>
                    </td>

                    {/* 3. Tag Column */}
                    <td className="py-2.5 px-3">
                      {isToday && (
                        <span className="text-[10px] font-sans font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                          Today (Live)
                        </span>
                      )}
                      {!isToday && item.isSeeded && (
                        <span className="text-[10px] font-sans font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                          {isYesterday ? 'Seeded (Yesterday)' : `Seeded (${item.date})`}
                        </span>
                      )}
                      {!isToday && !item.isSeeded && (
                        <span className="text-[10px] font-sans font-semibold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                          {isYesterday ? 'Yesterday' : 'Historical'}
                        </span>
                      )}
                    </td>

                    {/* 4. Metric Value */}
                    <td className="py-2.5 px-3 font-bold text-sm text-white">
                      {typeof item.score === 'number' ? (isFearAndGreed ? item.score.toFixed(1) : item.score.toLocaleString()) : '—'}{' '}
                      <span className="text-[10px] font-normal text-slate-400">{item.unit || activeSource.unitShort}</span>
                    </td>

                    {/* 5. Classification */}
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded border ${sentiment.color} ${sentiment.bg} ${sentiment.border}`}>
                        {item.rating || sentiment.label || 'N/A'}
                      </span>
                    </td>

                    {/* 6. Saved Status */}
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-sans">
                        <Check className="w-3 h-3" /> Saved
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 p-5 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-1.5">
          <History className="w-5 h-5 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-400 font-medium">No snapshots recorded yet</p>
        </div>
      )}
    </div>
  );
}
