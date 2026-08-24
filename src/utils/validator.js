/**
 * Runtime schema validator for incoming raw API payloads
 */
export function validatePayload(sourceId, rawData) {
  if (!rawData || typeof rawData !== 'object') {
    return { isValid: false, error: 'Malformed payload: Root response is not a valid JSON object' };
  }

  if (sourceId === 'fear_and_greed') {
    const fng = rawData.fear_and_greed;
    if (!fng || typeof fng !== 'object') {
      return { isValid: false, error: 'Malformed schema: Missing "fear_and_greed" primary root object' };
    }
    if (typeof fng.score !== 'number' || isNaN(fng.score) || fng.score < 0 || fng.score > 100) {
      return { isValid: false, error: `Invalid score value: Expected number in range [0, 100], received "${fng.score}"` };
    }
    if (!fng.rating || typeof fng.rating !== 'string') {
      return { isValid: false, error: 'Missing or invalid "rating" classification string' };
    }
    if (!fng.timestamp) {
      return { isValid: false, error: 'Missing "timestamp" in fear_and_greed payload' };
    }
    return { isValid: true };
  }

  if (sourceId === 'sp500' || sourceId === 'qqq') {
    const chart = rawData.chart;
    if (!chart || !Array.isArray(chart.result) || chart.result.length === 0) {
      return { isValid: false, error: 'Malformed schema: Missing "chart.result" array' };
    }
    const meta = chart.result[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== 'number' || isNaN(meta.regularMarketPrice)) {
      return { isValid: false, error: 'Invalid market price: Expected numeric regularMarketPrice in chart meta' };
    }
    return { isValid: true };
  }

  return { isValid: true };
}
