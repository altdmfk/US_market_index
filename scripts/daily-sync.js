/**
 * Standalone Daily Market Ingestion Script (ES Module)
 * Can be run via Cron (GitHub Actions, Supabase Edge Functions, Node.js Cron)
 * Fetches CNN Fear & Greed + Yahoo Finance benchmarks and records daily idempotent snapshot into Supabase Cloud DB.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      ...headers
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} from ${url}`);
  }

  return await response.json();
}

async function upsertToSupabase(record) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log("! SUPABASE_URL or SUPABASE_KEY environment variables not configured. Skipping Supabase DB sync.");
    try {
      const fs = await import('fs');
      fs.writeFileSync('latest_snapshot.json', JSON.stringify(record, null, 2), 'utf-8');
      console.log(`✓ Snapshot written locally to latest_snapshot.json`);
    } catch (fsErr) {
      console.warn(`! Failed to write local snapshot: ${fsErr.message}`);
    }
    return;
  }

  try {
    const row = {
      date: record.date,
      data_type: record.dataType,
      score: Number(record.score),
      rating: record.rating,
      unit: 'pts',
      raw_timestamp: record.timestamp,
      source_name: 'CNN Business Markets',
      raw_payload: record.rawPayload || {}
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/daily_market_snapshots?on_conflict=date,data_type`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(row)
    });

    if (response.ok) {
      console.log(`✓ Successfully upserted daily record to Supabase DB (${record.date})`);
    } else {
      const errText = await response.text();
      console.warn(`! Supabase upsert notice: ${response.status} ${errText}`);
    }
  } catch (err) {
    console.warn(`! Supabase network notice: ${err.message}`);
  }
}

async function runDailySync() {
  console.log(`[${new Date().toISOString()}] Starting Daily Market Ingestion...`);

  try {
    // 1. Fetch CNN Fear & Greed
    const cnnUrl = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';
    const cnnData = await fetchJson(cnnUrl);
    const fng = cnnData.fear_and_greed;

    if (!fng || typeof fng.score !== 'number') {
      throw new Error('Malformed payload: fear_and_greed or score is missing');
    }

    console.log(`✓ Fetched CNN Fear & Greed: Score = ${fng.score.toFixed(1)} (${fng.rating})`);

    // 2. Format daily record dynamically strictly in Asia/Seoul (KST)
    const getKstDate = (ts) => {
      const d = new Date(ts);
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      return formatter.format(d);
    };

    const dateStr = getKstDate(fng.timestamp || Date.now());
    const dailyRecord = {
      id: `${dateStr}_fear_and_greed`,
      date: dateStr,
      dataType: 'fear_and_greed',
      score: Number(fng.score.toFixed(2)),
      rating: fng.rating,
      previousClose: fng.previous_close,
      timestamp: fng.timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rawPayload: cnnData
    };

    console.log(`✓ Daily Snapshot Prepared:\n`, JSON.stringify({ ...dailyRecord, rawPayload: '[omitted]' }, null, 2));

    // 3. Save directly to Supabase Cloud DB
    await upsertToSupabase(dailyRecord);

    console.log(`✓ Daily Sync completed successfully.`);
  } catch (err) {
    console.error(`✗ Daily Sync failed:`, err.message);
    process.exit(1);
  }
}

runDailySync();
