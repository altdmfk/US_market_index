import { TIMEZONE, TIMEZONE_LABEL } from '../constants/config';

/**
 * Returns KST timezone identifier ('Asia/Seoul')
 */
export function getLocalTimezone() {
  return TIMEZONE || 'Asia/Seoul';
}

/**
 * Returns formatted short time string in KST (e.g. "03:44:59 PM KST")
 */
export function formatLocalTimeShort(input = new Date()) {
  const date = normalizeToDate(input);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE || 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  return `${formatter.format(date)} ${TIMEZONE_LABEL || 'KST'}`;
}

/**
 * Returns full date & time string in KST (e.g. "Aug 24, 03:44 PM KST")
 */
export function formatLocalTimestamp(input = new Date()) {
  const date = normalizeToDate(input);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE || 'Asia/Seoul',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${formatter.format(date)} ${TIMEZONE_LABEL || 'KST'}`;
}

/**
 * Returns short timezone abbreviation
 */
export function getLocalTimezoneShort() {
  return TIMEZONE_LABEL || 'KST';
}

/**
 * Returns YYYY-MM-DD formatted date string strictly in Asia/Seoul (KST)
 */
export function getLocalDateString(input = new Date()) {
  const date = normalizeToDate(input);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE || 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

/**
 * Returns YYYY-MM-DD for yesterday in Asia/Seoul (KST)
 */
export function getYesterdayDateString() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return getLocalDateString(yesterday);
}

/**
 * Converts various timestamp formats into a valid JS Date
 */
export function normalizeToDate(input) {
  if (input instanceof Date) return input;
  if (typeof input === 'number') {
    return new Date(input < 1e11 ? input * 1000 : input);
  }
  if (typeof input === 'string') {
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) return parsed;
    const num = Number(input);
    if (!isNaN(num)) return new Date(num < 1e11 ? num * 1000 : num);
  }
  return new Date();
}
