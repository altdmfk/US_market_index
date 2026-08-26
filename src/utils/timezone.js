import { TIMEZONE, TIMEZONE_LABEL } from '../constants/config.js';

export const TIMEZONE_OPTIONS = {
  KST: { timeZone: TIMEZONE || 'Asia/Seoul', label: 'KST' },
  EDT: { timeZone: 'America/New_York', label: 'EDT' }
};

export function normalizeToDate(input, fallbackToNow = true) {
  if (input instanceof Date) return isNaN(input.getTime()) ? (fallbackToNow ? new Date() : null) : input;
  if (typeof input === 'number' || (typeof input === 'string' && input.trim() && !isNaN(Number(input)))) {
    const numeric = typeof input === 'number' ? input : Number(input);
    const date = new Date(numeric < 1e11 ? numeric * 1000 : numeric);
    return isNaN(date.getTime()) ? (fallbackToNow ? new Date() : null) : date;
  }
  if (typeof input === 'string') {
    const date = new Date(input);
    if (!isNaN(date.getTime())) return date;
  }
  return fallbackToNow ? new Date() : null;
}

export function formatTimestamp(input, timezone = 'KST') {
  if (input === null || input === undefined || input === '') return '--:--';
  const date = normalizeToDate(input, false);
  if (!date) return typeof input === 'string' && input.trim() ? input : '--:--';
  const selected = TIMEZONE_OPTIONS[timezone] || TIMEZONE_OPTIONS.KST;
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: selected.timeZone,
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${formatter.format(date)} ${selected.label}`;
}

export function formatLocalTimeShort(input = new Date(), timezone = 'KST') {
  const date = normalizeToDate(input, false);
  if (!date) return '--:--';
  const selected = TIMEZONE_OPTIONS[timezone] || TIMEZONE_OPTIONS.KST;
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: selected.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  return formatter.format(date);
}

export const formatKSTTimestamp = (input = new Date()) => formatTimestamp(input, 'KST');
export const formatLocalTimestamp = (input = new Date()) => formatTimestamp(input, 'KST');
export const getLocalTimezone = (timezone = 'KST') => (TIMEZONE_OPTIONS[timezone] || TIMEZONE_OPTIONS.KST).timeZone;
export const getLocalTimezoneShort = (timezone = 'KST') => (TIMEZONE_OPTIONS[timezone] || TIMEZONE_OPTIONS.KST).label;

export function getLocalDateString(input = new Date(), timezone = 'KST') {
  const date = normalizeToDate(input);
  const selected = TIMEZONE_OPTIONS[timezone] || TIMEZONE_OPTIONS.KST;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: selected.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function getYesterdayDateString(timezone = 'KST') {
  return getLocalDateString(new Date(Date.now() - 86400000), timezone);
}
