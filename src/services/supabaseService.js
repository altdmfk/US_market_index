/**
 * Supabase Cloud Database Client for Permanent Snapshot Synchronization
 */
import { SUPABASE_CONFIG } from '../constants/config';
import { formatLocalTimestamp } from '../utils/timezone';

const HEADERS = {
  'apikey': SUPABASE_CONFIG.anonKey,
  'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates,return=representation'
};

/**
 * Fetches all permanent snapshots from Supabase Cloud DB
 */
export async function fetchSupabaseSnapshots(dataType = null) {
  try {
    const url = dataType
      ? `${SUPABASE_CONFIG.url}/rest/v1/daily_market_snapshots?data_type=eq.${dataType}&select=*&order=date.desc&limit=10`
      : `${SUPABASE_CONFIG.url}/rest/v1/daily_market_snapshots?select=*&order=date.desc&limit=10`;

    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map(row => ({
      id: `${row.date}_${row.data_type}`,
      date: row.date,
      dataType: row.data_type,
      sourceName: row.source_name,
      score: Number(row.score),
      rating: row.rating,
      unit: row.unit,
      rawTimestamp: row.raw_timestamp,
      indexUpdatedAt: row.raw_timestamp,
      indexUpdatedAtFormatted: row.raw_timestamp ? formatLocalTimestamp(row.raw_timestamp) : '',
      downloadedAt: row.created_at,
      downloadedAtFormatted: row.created_at ? formatLocalTimestamp(row.created_at) : '',
      updatedAt: row.updated_at,
      updatedAtLocal: row.updated_at ? formatLocalTimestamp(row.updated_at) : '',
      isSeeded: false,
      rawPayload: row.raw_payload
    }));
  } catch {
    return [];
  }
}

/**
 * Upserts a live daily snapshot to Supabase Cloud DB
 */
export async function upsertSupabaseSnapshot(snapshot) {
  if (!snapshot) return false;

  try {
    const row = {
      date: snapshot.date,
      data_type: snapshot.dataType || snapshot.sourceId,
      score: Number(snapshot.score),
      rating: snapshot.rating || 'neutral',
      unit: snapshot.unit || snapshot.unitShort || 'pts',
      raw_timestamp: snapshot.rawTimestamp || new Date().toISOString(),
      source_name: snapshot.sourceName || 'CNN Business Markets',
      raw_payload: snapshot.rawPayload || {}
    };

    const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/daily_market_snapshots?on_conflict=date,data_type`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(row)
    });

    return response.ok;
  } catch {
    return false;
  }
}
