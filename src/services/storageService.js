import { getLocalDateString, getYesterdayDateString, formatLocalTimestamp } from '../utils/timezone';
import { getSentimentCategory } from '../constants/config';

const STORAGE_KEY_SNAPSHOTS = 'pld_daily_snapshots';
const STORAGE_KEY_LAST_GOOD = 'pld_last_known_good';

/**
 * Idempotent Daily Snapshot Storage with Composite Key (date + data_type)
 * Saves live data pulled directly from the public API into local storage.
 */
export function saveDailySnapshot(record) {
  if (!record || !record.sourceId) return;

  const localDate = getLocalDateString(new Date());
  const compositeKey = `${localDate}_${record.sourceId}`;
  const now = new Date();
  const rawTs = record.rawTimestamp || now.toISOString();

  const snapshot = {
    id: compositeKey,
    date: localDate,
    dataType: record.sourceId,
    sourceName: record.sourceName,
    score: record.score,
    rating: record.rating,
    unit: record.unitShort || record.unit,
    rawTimestamp: rawTs,
    indexUpdatedAt: rawTs,
    indexUpdatedAtFormatted: formatLocalTimestamp(rawTs),
    downloadedAt: now.toISOString(),
    downloadedAtFormatted: formatLocalTimestamp(now),
    updatedAt: now.toISOString(),
    updatedAtLocal: formatLocalTimestamp(now),
    isSeeded: false, // Live data is strictly NOT seeded
    rawPayload: record.rawPayload
  };

  const snapshots = getStoredSnapshots();
  const existingIndex = snapshots.findIndex(s => s.id === compositeKey);
  if (existingIndex >= 0) {
    snapshots[existingIndex] = snapshot;
  } else {
    snapshots.unshift(snapshot);
  }

  snapshots.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(snapshots.slice(0, 30)));
  localStorage.setItem(`${STORAGE_KEY_LAST_GOOD}_${record.sourceId}`, JSON.stringify(record));

  return snapshot;
}

export function getStoredSnapshots(dataType = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    if (dataType) {
      return list.filter(item => item.dataType === dataType);
    }
    return list;
  } catch {
    return [];
  }
}

export function getLastKnownGood(sourceId = 'fear_and_greed') {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_LAST_GOOD}_${sourceId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Seeds a test record for any user-chosen date (Developer Sandbox Test Tool)
 */
export function seedCustomDateRecord(dateStr, customScore = null, sourceId = 'fear_and_greed') {
  const targetDate = dateStr || getYesterdayDateString();
  const compositeKey = `${targetDate}_${sourceId}`;
  const now = new Date();
  const rawTs = `${targetDate}T16:00:00Z`;

  const numScore = customScore !== null && !isNaN(Number(customScore))
    ? Number(Number(customScore).toFixed(2))
    : 52.49;

  const sentiment = getSentimentCategory(numScore);

  const customSnapshot = {
    id: compositeKey,
    date: targetDate,
    dataType: sourceId,
    sourceName: 'CNN Fear & Greed Index',
    score: numScore,
    rating: sentiment.label,
    unit: 'pts',
    rawTimestamp: rawTs,
    indexUpdatedAt: rawTs,
    indexUpdatedAtFormatted: formatLocalTimestamp(rawTs),
    downloadedAt: now.toISOString(),
    downloadedAtFormatted: formatLocalTimestamp(now),
    updatedAt: now.toISOString(),
    updatedAtLocal: formatLocalTimestamp(now),
    isSeeded: true, // Marked as test seeded
    rawPayload: {
      source: 'User Seeded Test Record',
      date: targetDate,
      score: numScore,
      rating: sentiment.label
    }
  };

  const snapshots = getStoredSnapshots();
  const existingIndex = snapshots.findIndex(s => s.id === compositeKey);
  if (existingIndex >= 0) {
    snapshots[existingIndex] = customSnapshot;
  } else {
    snapshots.push(customSnapshot);
  }

  snapshots.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(snapshots));

  return customSnapshot;
}

export function clearAllStorage() {
  localStorage.removeItem(STORAGE_KEY_SNAPSHOTS);
  localStorage.removeItem(`${STORAGE_KEY_LAST_GOOD}_fear_and_greed`);
  localStorage.removeItem(`${STORAGE_KEY_LAST_GOOD}_sp500`);
  localStorage.removeItem(`${STORAGE_KEY_LAST_GOOD}_qqq`);
}
