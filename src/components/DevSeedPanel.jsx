import React, { useState } from 'react';
import { Calendar, Sparkles, Trash2, Clock } from 'lucide-react';
import { getLocalDateString, getYesterdayDateString } from '../utils/timezone';

export default function DevSeedPanel({ onSeedCustomDate, onClearStorage, snapshotsCount }) {
  const yesterdayStr = getYesterdayDateString();
  const [selectedDate, setSelectedDate] = useState(yesterdayStr);
  const [customScore, setCustomScore] = useState('52.5');

  const getDaysAgoStr = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return getLocalDateString(d);
  };

  const handleSeed = (e) => {
    e.preventDefault();
    if (!selectedDate) return;
    onSeedCustomDate(selectedDate, customScore ? parseFloat(customScore) : null);
  };

  const isSelectedYesterday = selectedDate === yesterdayStr;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Test tools</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Seed test baselines or purge storage ({snapshotsCount} stored)
          </p>
        </div>
      </div>

      {/* Date Quick Presets & Date Input Form */}
      <form onSubmit={handleSeed} className="space-y-3">
        {/* Quick Date Presets */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium text-xs flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => setSelectedDate(yesterdayStr)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              isSelectedYesterday
                ? 'bg-blue-600/30 border-blue-500/60 text-blue-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Yesterday ({yesterdayStr})
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(getDaysAgoStr(2))}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              selectedDate === getDaysAgoStr(2)
                ? 'bg-blue-600/30 border-blue-500/60 text-blue-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            2 Days Ago ({getDaysAgoStr(2)})
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(getDaysAgoStr(3))}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              selectedDate === getDaysAgoStr(3)
                ? 'bg-blue-600/30 border-blue-500/60 text-blue-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            3 Days Ago ({getDaysAgoStr(3)})
          </button>
        </div>

        {/* Input Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Custom Date Input */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none text-xs font-mono font-semibold"
            />
          </div>

          {/* Custom Score Input */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Score:</span>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={customScore}
              onChange={(e) => setCustomScore(e.target.value)}
              placeholder="52.5"
              className="w-14 bg-transparent text-slate-200 focus:outline-none text-xs font-mono font-bold"
            />
          </div>

          {/* Seed Button */}
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seed record for {selectedDate}</span>
          </button>

          {/* Purge Storage Button */}
          <button
            type="button"
            onClick={onClearStorage}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Purge storage</span>
          </button>
        </div>
      </form>
    </div>
  );
}
