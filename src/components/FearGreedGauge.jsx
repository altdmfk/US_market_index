import React from 'react';

export default function FearGreedGauge({ score = 50 }) {
  const clampedScore = Math.max(0, Math.min(100, typeof score === 'number' ? score : 50));

  // Geometry
  const cx = 130;
  const cy = 115;
  const r = 85;
  const strokeWidth = 14;

  // 0 = 180 deg (left), 100 = 0 deg (right)
  const angleDeg = 180 - (clampedScore / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;

  const needleLen = 68;
  const needleTipX = cx + needleLen * Math.cos(angleRad);
  const needleTipY = cy - needleLen * Math.sin(angleRad);

  // SVG Arc generator with flat (butt) linecaps to prevent weird round distortion
  const describeArc = (startVal, endVal) => {
    const startAngle = (180 - (startVal / 100) * 180) * (Math.PI / 180);
    const endAngle = (180 - (endVal / 100) * 180) * (Math.PI / 180);

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy - r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy - r * Math.sin(endAngle);

    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col items-center justify-center select-none w-full max-w-[270px]">
      <svg viewBox="0 0 260 135" className="w-full h-auto overflow-visible">
        {/* Background Track */}
        <path
          d={describeArc(0, 100)}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />

        {/* 1. Extreme Fear (0 - 25, 25% span) */}
        <path
          d={describeArc(0, 25)}
          fill="none"
          stroke="#ef4444"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />

        {/* 2. Fear (25 - 45, 20% span) */}
        <path
          d={describeArc(25, 45)}
          fill="none"
          stroke="#f97316"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />

        {/* 3. Neutral (45 - 55, 10% span) */}
        <path
          d={describeArc(45, 55)}
          fill="none"
          stroke="#eab308"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />

        {/* 4. Greed (55 - 75, 20% span) */}
        <path
          d={describeArc(55, 75)}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />

        {/* 5. Extreme Greed (75 - 100, 25% span) - Flat clean end */}
        <path
          d={describeArc(75, 100)}
          fill="none"
          stroke="#059669"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />

        {/* Boundary separator tick lines between segments */}
        {[25, 45, 55, 75].map((val) => {
          const a = (180 - (val / 100) * 180) * (Math.PI / 180);
          const xInner = cx + (r - strokeWidth / 2) * Math.cos(a);
          const yInner = cy - (r - strokeWidth / 2) * Math.sin(a);
          const xOuter = cx + (r + strokeWidth / 2) * Math.cos(a);
          const yOuter = cy - (r + strokeWidth / 2) * Math.sin(a);
          return (
            <line
              key={val}
              x1={xInner}
              y1={yInner}
              x2={xOuter}
              y2={yOuter}
              stroke="#0f172a"
              strokeWidth="2"
            />
          );
        })}

        {/* Numeric Ticks */}
        <text x="32" y="130" textAnchor="middle" className="text-[10px] font-mono fill-rose-400 font-bold">0</text>
        <text x="64" y="52" textAnchor="middle" className="text-[9px] font-mono fill-amber-400 font-medium">25</text>
        <text x="130" y="18" textAnchor="middle" className="text-[9px] font-mono fill-yellow-400 font-medium">50</text>
        <text x="196" y="52" textAnchor="middle" className="text-[9px] font-mono fill-emerald-400 font-medium">75</text>
        <text x="228" y="130" textAnchor="middle" className="text-[10px] font-mono fill-emerald-400 font-bold">100</text>

        {/* Needle Shadow */}
        <line
          x1={cx}
          y1={cy}
          x2={needleTipX}
          y2={needleTipY}
          stroke="#020617"
          strokeWidth="5"
          strokeLinecap="round"
          className="opacity-70"
        />

        {/* Active Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleTipX}
          y2={needleTipY}
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Center Hub */}
        <circle cx={cx} cy={cy} r="7" fill="#ffffff" />
        <circle cx={cx} cy={cy} r="4" fill="#0f172a" />
      </svg>

      {/* Legend below the arc */}
      <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-medium px-2 mt-2">
        <span className="text-rose-400">Extreme Fear</span>
        <span className="text-yellow-400">Neutral</span>
        <span className="text-emerald-400">Extreme Greed</span>
      </div>
    </div>
  );
}
