/**
 * Returns user's local timezone identifier (e.g. 'America/New_York', 'Asia/Seoul', 'Europe/London')
 */
export function getLocalTimezone() {
  try {
    return Intl.DateTimeFormat('en-US').resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Returns formatted short time string in English (e.g. "10:29:59 AM")
 */
export function formatLocalTimeShort(input = new Date()) {
  const date = normalizeToDate(input);
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  return formatter.format(date);
}

/**
 * Returns full date & time string in English (e.g. "Aug 24, 10:29 AM EDT")
 */
export function formatLocalTimestamp(input = new Date()) {
  const date = normalizeToDate(input);
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const tzShort = getLocalTimezoneShort();
  return `${formatter.format(date)} ${tzShort}`;
}

/**
 * Returns short timezone abbreviation or city name from user's location
 */
export function getLocalTimezoneShort() {
  try {
    const tz = Intl.DateTimeFormat('en-US').resolvedOptions().timeZone;
    if (!tz) return 'Local';
    const parts = tz.split('/');
    return parts[parts.length - 1].replace('_', ' ');
  } catch {
    return 'Local';
  }
}

/**
 * Returns YYYY-MM-DD formatted date string in user's local timezone
 */
export function getLocalDateString(input = new Date()) {
  const date = normalizeToDate(input);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

/**
 * Returns YYYY-MM-DD for yesterday in user's local timezone
 */
export function getYesterdayDateString() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return getLocalDateString(yesterday);
}

/**
 * Converts various timestamp formats into a valid JS Date
 */
function normalizeToDate(input) {
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
