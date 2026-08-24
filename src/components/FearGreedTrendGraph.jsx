import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, LineChart } from 'lucide-react';
import { getSentimentCategory } from '../constants/config';
import { getLocalDateString } from '../utils/timezone';

export default function FearGreedTrendGraph({ data, snapshots }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Strictly use ONLY the actual stored snapshots in the database / local storage
  const trendPoints = useMemo(() => {
    if (!Array.isArray(snapshots) || snapshots.length === 0) {
      return [];
    }

    const pointsMap = new Map();

    // Ingest only actual stored snapshots
    snapshots.forEach((s) => {
      if (s && s.date && typeof s.score === 'number') {
        pointsMap.set(s.date, {
          date: s.date,
          score: Number(s.score.toFixed(1)),
          rating: s.rating || getSentimentCategory(s.score).label,
          isSeeded: !!s.isSeeded
        });
      }
    });

    // Ensure today's live data is included if not in snapshots
    if (data && typeof data.score === 'number') {
      const todayStr = getLocalDateString(new Date());
      if (!pointsMap.has(todayStr)) {
        pointsMap.set(todayStr, {
          date: todayStr,
          score: Number(data.score.toFixed(1)),
          rating: data.rating || getSentimentCategory(data.score).label,
          isSeeded: false
        });
      }
    }

    // Sort strictly ascending by date (oldest to newest)
    const sorted = Array.from(pointsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Compute Day-over-Day delta between consecutive recorded points
    return sorted.map((p, idx, arr) => {
      const prev = idx > 0 ? arr[idx - 1] : null;
      const delta = prev ? Number((p.score - prev.score).toFixed(2)) : 0;
      return {
        ...p,
        delta,
        prevScore: prev ? prev.score : p.score
      };
    });
  }, [data, snapshots]);

  // If fewer than 2 data points are stored, show informative placeholder
  if (!trendPoints || trendPoints.length < 2) {
    return (
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-300">
          <LineChart className="w-3.5 h-3.5 text-blue-400" />
          <span>Historical Difference Line Graph</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-400">
          <span>{trendPoints.length} snapshot stored. Seed or record at least 2 dates to view difference line graph.</span>
        </div>
      </div>
    );
  }

  // SVG dimensions
  const svgWidth = 560;
  const svgHeight = 140;
  const padLeft = 45;
  const padRight = 35;
  const padTop = 20;
  const padBottom = 28;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const getY = (val) => padTop + chartH - (val / 100) * chartH;
  const getX = (idx) => padLeft + (idx / (trendPoints.length - 1)) * chartW;

  // Build SVG path
  const pathD = trendPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.score)}`)
    .join(' ');

  const areaD = `${pathD} L ${getX(trendPoints.length - 1)} ${padTop + chartH} L ${getX(0)} ${padTop + chartH} Z`;

  const activePoint = hoveredIndex !== null ? trendPoints[hoveredIndex] : trendPoints[trendPoints.length - 1];

  return (
    <div className="mt-5 pt-4 border-t border-slate-800/80">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <LineChart className="w-3.5 h-3.5 text-blue-400" />
          <h3 className="text-xs font-bold text-slate-200">Historical Difference Line Graph</h3>
          <span className="text-[11px] text-slate-400 font-mono">({trendPoints.length} records)</span>
        </div>

        {/* Active Hover / Latest Status */}
        {activePoint && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">{activePoint.date}:</span>
            <span className="font-bold text-white">{activePoint.score.toFixed(1)} pts</span>
            {activePoint.delta !== 0 && (
              <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${activePoint.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {activePoint.delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {activePoint.delta > 0 ? '+' : ''}{activePoint.delta.toFixed(2)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* SVG Line Graph */}
      <div className="relative w-full rounded-xl bg-slate-950/60 border border-slate-800 p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="storedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference Lines (25, 50, 75) */}
          {[
            { val: 75, stroke: '#10b981' },
            { val: 50, stroke: '#eab308' },
            { val: 25, stroke: '#ef4444' }
          ].map((ref) => {
            const y = getY(ref.val);
            return (
              <g key={ref.val} className="opacity-30">
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke={ref.stroke}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] font-mono fill-slate-400"
                >
                  {ref.val}
                </text>
              </g>
            );
          })}

          {/* Gradient Fill */}
          <path d={areaD} fill="url(#storedGradient)" />

          {/* Primary Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {trendPoints.map((p, idx) => {
            const cx = getX(idx);
            const cy = getY(p.score);
            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={p.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
              >
                {/* Hit target */}
                <circle cx={cx} cy={cy} r="14" fill="transparent" />

                {/* Outer Glow */}
                {isHovered && (
                  <circle cx={cx} cy={cy} r="8" className="fill-blue-400/30 animate-ping" />
                )}

                {/* Center Node */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? '6' : '4.5'}
                  fill={p.isSeeded ? '#f59e0b' : '#38bdf8'}
                  stroke="#0f172a"
                  strokeWidth="2"
                />

                {/* Score value above point */}
                <text
                  x={cx}
                  y={cy - 9}
                  textAnchor="middle"
                  className={`text-[10px] font-mono font-bold ${isHovered ? 'fill-white' : 'fill-slate-300'}`}
                >
                  {p.score.toFixed(1)}
                </text>

                {/* Date Label on X Axis */}
                <text
                  x={cx}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-slate-400 font-medium"
                >
                  {p.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
