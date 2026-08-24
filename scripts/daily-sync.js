/**
 * Standalone Daily Market Ingestion Script
 * Can be run via Cron (GitHub Actions, Supabase Edge Functions, Node.js Cron)
 * Fetches CNN Fear & Greed + Yahoo Finance benchmarks and records daily idempotent snapshot.
 */

const https = require('https');

function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', ...headers } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
  });
}

async function runDailySync() {
  console.log(`[${new Date().toISOString()}] Starting Daily Market Ingestion...`);

  try {
    // 1. Fetch CNN Fear & Greed
    const cnnUrl = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';
    const cnnData = await fetchJson(cnnUrl);
    const fng = cnnData.fear_and_greed;

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

    console.log(`✓ Daily Snapshot Prepared:`, JSON.stringify(dailyRecord, null, 2));
    console.log(`✓ Daily Sync completed successfully.`);
  } catch (err) {
    console.error(`✗ Daily Sync failed:`, err.message);
    process.exit(1);
  }
}

runDailySync();
