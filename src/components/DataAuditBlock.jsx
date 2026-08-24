import React, { useState } from 'react';
import { Database, ShieldCheck, Code, CheckCircle2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { formatLocalTimestamp } from '../utils/timezone';

export default function DataAuditBlock({ data, snapshots, activeSource }) {
  const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState(0);
  const [isPayloadExpanded, setIsPayloadExpanded] = useState(false);

  if (!data && (!snapshots || snapshots.length === 0)) return null;

  const hasSnapshots = snapshots && snapshots.length > 0;
  const currentSnapshot = hasSnapshots ? snapshots[Math.min(selectedSnapshotIndex, snapshots.length - 1)] : null;
  const activeRecord = currentSnapshot || data;

  const score = activeRecord?.score;
  const activeDate = activeRecord?.date || (activeRecord?.rawTimestamp ? activeRecord.rawTimestamp.split('T')[0] : 'Today');

  const rawSample = activeRecord?.rawPayload
    ? JSON.stringify(activeRecord.rawPayload, null, 2)
    : (data?.rawPayload ? JSON.stringify(data.rawPayload, null, 2) : 'No raw payload recorded for this snapshot');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header with Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Data audit</h3>
            <p className="text-xs text-slate-400">4-stage pipeline & payload audit</p>
          </div>
        </div>

        {/* Snapshot Date Selector (Always visible when snapshots exist) */}
        {hasSnapshots && (
          <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-slate-400 font-medium">Audit date:</span>
            <select
              value={selectedSnapshotIndex}
              onChange={(e) => setSelectedSnapshotIndex(Number(e.target.value))}
              className="bg-transparent text-slate-100 text-xs font-mono font-semibold focus:outline-none cursor-pointer"
            >
              {snapshots.map((s, idx) => (
                <option key={s.id || idx} value={idx} className="bg-slate-900 text-slate-200">
                  {idx === 0 ? `Today (${s.date})` : s.date} — {s.score} pts
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4 Pipeline Stages for the Selected Date */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Stage 1: Raw Source */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold">
            <span>Stage 1: Raw API</span>
            <Code className="w-3 h-3 text-blue-400" />
          </div>
          <div className="font-mono text-base font-bold text-white">
            {typeof score === 'number' ? score.toFixed(1) : score || '—'}
          </div>
          <p className="text-[10px] text-slate-500">Unmodified upstream</p>
        </div>

        {/* Stage 2: Stored DB / Snapshot */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold">
            <span>Stage 2: Storage</span>
            <Database className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="font-mono text-base font-bold text-white">
            {typeof score === 'number' ? score.toFixed(1) : score || '—'}
          </div>
          <p className="text-[10px] text-slate-500">Idempotent record</p>
        </div>

        {/* Stage 3: Calculation Input */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold">
            <span>Stage 3: Calc input</span>
            <ShieldCheck className="w-3 h-3 text-sky-400" />
          </div>
          <div className="font-mono text-base font-bold text-white">
            {typeof score === 'number' ? score.toFixed(1) : score || '—'}
          </div>
          <p className="text-[10px] text-slate-500">Math input</p>
        </div>

        {/* Stage 4: Rendered Screen Value */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold">
            <span>Stage 4: Rendered</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="font-mono text-base font-bold text-emerald-400">
            {typeof score === 'number' ? score.toFixed(1) : score || '—'} {activeSource?.unitShort || 'pts'}
          </div>
          <p className="text-[10px] text-slate-500">Screen output</p>
        </div>
      </div>

      {/* Collapsible Raw JSON Payload Viewer */}
      <div className="pt-1">
        <button
          onClick={() => setIsPayloadExpanded(!isPayloadExpanded)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium transition-colors"
        >
          <span className="flex items-center gap-2">
            <Code className="w-3.5 h-3.5 text-blue-400" />
            Raw response JSON payload ({activeDate})
          </span>
          {isPayloadExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isPayloadExpanded && (
          <pre className="mt-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64 leading-relaxed">
            {rawSample}
          </pre>
        )}
      </div>
    </div>
  );
}
