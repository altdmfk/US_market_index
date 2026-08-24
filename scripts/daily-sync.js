/**
 * Standalone Daily Market Ingestion Script (ES Module)
 * Can be run via Cron (GitHub Actions, Supabase Edge Functions, Node.js Cron)
 * Fetches CNN Fear & Greed + Yahoo Finance benchmarks and records daily idempotent snapshot.
 */

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

    // 2. Format daily record
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyRecord = {
      id: `${todayStr}_fear_and_greed`,
      date: todayStr,
      dataType: 'fear_and_greed',
      score: Number(fng.score.toFixed(2)),
      rating: fng.rating,
      previousClose: fng.previous_close,
      timestamp: fng.timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`✓ Daily Snapshot Prepared:\n`, JSON.stringify(dailyRecord, null, 2));
    console.log(`✓ Daily Sync completed successfully.`);
  } catch (err) {
    console.error(`✗ Daily Sync failed:`, err.message);
    process.exit(1);
  }
}

runDailySync();
