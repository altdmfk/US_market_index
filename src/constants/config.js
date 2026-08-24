export const TIMEZONE = 'Asia/Seoul';
export const TIMEZONE_LABEL = 'KST (UTC+9)';

export const SUPABASE_CONFIG = {
  url: 'https://qdgzfzxvlxoalkcvbwcd.supabase.co',
  anonKey: 'sb_publishable__kAlkIw3SeH4XKH5MZJCMw_yJqb7Qne'
};

export const DATA_SOURCES = {
  FEAR_AND_GREED: {
    id: 'fear_and_greed',
    name: 'CNN Fear & Greed Index',
    shortName: 'Fear & Greed',
    sourceName: 'CNN Business Markets',
    sourceUrl: 'https://www.cnn.com/markets/fear-and-greed',
    directEndpoint: '/api/cnn/index/fearandgreed/graphdata',
    externalEndpoint: 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata',
    unit: '0-100 scale',
    unitShort: 'pts',
    min: 0,
    max: 100,
    description: 'Measures market emotion & sentiment driving US stock prices'
  },
  SP500: {
    id: 'sp500',
    name: 'S&P 500',
    shortName: 'S&P 500',
    sourceName: 'S&P Dow Jones Indices / Yahoo Finance',
    sourceUrl: 'https://finance.yahoo.com/quote/%5EGSPC/',
    directEndpoint: '/api/yahoo/v8/finance/chart/%5EGSPC?interval=1d&range=5d',
    externalEndpoint: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=5d',
    unit: 'USD',
    unitShort: 'USD',
    min: null,
    max: null,
    description: 'Benchmark index tracking 500 leading publicly traded US companies'
  },
  QQQ: {
    id: 'qqq',
    name: 'Invesco QQQ Trust (QQQ)',
    shortName: 'Nasdaq QQQ',
    sourceName: 'Invesco / Nasdaq / Yahoo Finance',
    sourceUrl: 'https://finance.yahoo.com/quote/QQQ/',
    directEndpoint: '/api/yahoo/v8/finance/chart/QQQ?interval=1d&range=5d',
    externalEndpoint: 'https://query1.finance.yahoo.com/v8/finance/chart/QQQ?interval=1d&range=5d',
    unit: 'USD',
    unitShort: 'USD',
    min: null,
    max: null,
    description: 'Tracks the Nasdaq-100 Index with heavy technology exposure'
  }
};

export const FAILURE_MODES = {
  NONE: 'NONE',
  TIMEOUT: 'TIMEOUT',
  AUTH_401: 'AUTH_401',
  AUTH_403: 'AUTH_403',
  RATE_LIMIT_429: 'RATE_LIMIT_429',
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  MALFORMED_SCHEMA: 'MALFORMED_SCHEMA'
};

export const FAILURE_MODE_CONFIG = {
  [FAILURE_MODES.TIMEOUT]: {
    label: 'Timeout (5000ms Abort)',
    badge: '408 / Timeout',
    description: 'Simulates slow connection exceeding timeout budget (>5000ms abort)'
  },
  [FAILURE_MODES.AUTH_401]: {
    label: 'Auth 401 Unauthorized',
    badge: '401 Unauthorized',
    description: 'Simulates missing or invalid authentication token'
  },
  [FAILURE_MODES.AUTH_403]: {
    label: 'Auth 403 Forbidden',
    badge: '403 Forbidden',
    description: 'Simulates insufficient permissions or IP block'
  },
  [FAILURE_MODES.RATE_LIMIT_429]: {
    label: 'Rate Limit 429 Too Many Requests',
    badge: '429 Rate Limit',
    description: 'Simulates rate limit quota exhaustion (Retry-After: 60s)'
  },
  [FAILURE_MODES.NETWORK_OFFLINE]: {
    label: 'Offline / Network Disconnection',
    badge: 'Offline Net Error',
    description: 'Simulates device offline (navigator.onLine = false / DNS error)'
  },
  [FAILURE_MODES.MALFORMED_SCHEMA]: {
    label: 'Malformed Response / Schema Violation',
    badge: 'Schema Violation',
    description: 'Simulates broken JSON or unexpected fields failing runtime validation'
  }
};

export const FSM_STATES = {
  IDLE: 'IDLE',
  FETCHING: 'FETCHING',
  SUCCESS: 'SUCCESS',
  STALE_ERROR: 'STALE_ERROR',
  HARD_ERROR: 'HARD_ERROR'
};

export const SENTIMENT_LEVELS = [
  { min: 0, max: 24.99, label: 'Extreme Fear', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  { min: 25, max: 44.99, label: 'Fear', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { min: 45, max: 55.0, label: 'Neutral', color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/30' },
  { min: 55.01, max: 74.99, label: 'Greed', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  { min: 75, max: 100, label: 'Extreme Greed', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
];

export const getSentimentCategory = (score) => {
  if (typeof score !== 'number' || isNaN(score)) return { label: 'Unknown', color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' };
  if (score >= 75) return SENTIMENT_LEVELS[4]; // Extreme Greed (>= 75)
  if (score <= 24.99) return SENTIMENT_LEVELS[0]; // Extreme Fear (<= 24.99)
  return SENTIMENT_LEVELS.find((l) => score >= l.min && score <= l.max) || SENTIMENT_LEVELS[2];
};
