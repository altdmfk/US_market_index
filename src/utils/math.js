/**
 * Day-over-Day (DoD) Delta Calculation & Mathematical Validation
 * Formula: Delta = Current Value - Previous Value
 */
export function calculateDayOverDay(currentVal, previousVal, unit = 'pts') {
  if (
    currentVal === null ||
    currentVal === undefined ||
    isNaN(Number(currentVal)) ||
    previousVal === null ||
    previousVal === undefined ||
    isNaN(Number(previousVal))
  ) {
    return {
      isValid: false,
      delta: null,
      absDelta: null,
      percentDelta: null,
      direction: 'NONE',
      directionSymbol: '-',
      directionText: 'N/A',
      colorClass: 'text-slate-400',
      bgClass: 'bg-slate-800/50',
      borderClass: 'border-slate-700',
      formulaProof: 'N/A - Insufficient History'
    };
  }

  const current = Number(currentVal);
  const previous = Number(previousVal);

  // Exact arithmetic calculation
  const rawDelta = current - previous;
  const roundedDelta = Math.round(rawDelta * 100) / 100;
  const absDelta = Math.abs(roundedDelta);
  const percentDelta = previous !== 0 ? Math.round((rawDelta / previous) * 10000) / 100 : 0;

  let direction = 'SAME';
  let directionSymbol = '—';
  let directionText = 'Unchanged';
  let colorClass = 'text-slate-300';
  let bgClass = 'bg-slate-800/60';
  let borderClass = 'border-slate-700';

  if (roundedDelta > 0.001) {
    direction = 'UP';
    directionSymbol = '▲';
    directionText = 'UP';
    colorClass = 'text-emerald-400';
    bgClass = 'bg-emerald-500/10';
    borderClass = 'border-emerald-500/30';
  } else if (roundedDelta < -0.001) {
    direction = 'DOWN';
    directionSymbol = '▼';
    directionText = 'DOWN';
    colorClass = 'text-rose-400';
    bgClass = 'bg-rose-500/10';
    borderClass = 'border-rose-500/30';
  }

  const signedDeltaStr = `${roundedDelta > 0 ? '+' : ''}${roundedDelta.toFixed(2)}`;
  const signedPercentStr = `${percentDelta > 0 ? '+' : ''}${percentDelta.toFixed(2)}%`;
  const formulaProof = `${current.toFixed(2)} - ${previous.toFixed(2)} = ${roundedDelta >= 0 ? '+' : ''}${roundedDelta.toFixed(2)} ${unit}`;

  return {
    isValid: true,
    current,
    previous,
    delta: roundedDelta,
    signedDeltaStr,
    absDelta,
    percentDelta,
    signedPercentStr,
    direction,
    directionSymbol,
    directionText,
    colorClass,
    bgClass,
    borderClass,
    formulaProof,
    unit
  };
}

/**
 * Validates that an index or metric value falls within acceptable numerical bounds
 */
export function validateMetricBounds(value, min = 0, max = 100) {
  if (value === null || value === undefined || isNaN(Number(value))) return false;
  const num = Number(value);
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
}
