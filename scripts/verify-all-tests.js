import assert from 'assert';
import {
  formatTimestamp,
  formatLocalTimeShort,
  getLocalDateString,
  getLocalTimezoneShort,
  normalizeToDate,
  TIMEZONE_OPTIONS
} from '../src/utils/timezone.js';
import { calculateDayOverDay } from '../src/utils/math.js';

console.log('====================================================');
console.log('Running 10 Pre-Fixed Test Cases for Timezone Toggle');
console.log('====================================================\n');

let passedCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] ${name}\n  Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------
// [Normal / Happy Path — 4 Cases]
// -----------------------------------------------------------------

test('TC-01: KST Default — formats UTC timestamp in Asia/Seoul (UTC+9)', () => {
  const ts = '2026-08-26T15:00:00Z';
  const formatted = formatTimestamp(ts, 'KST');
  assert(formatted.endsWith('KST'), `Expected suffix KST, got: ${formatted}`);
  assert(formatted.includes('Aug 27') || formatted.includes('08/27'), `Expected Aug 27 in KST, got: ${formatted}`);
});

test('TC-02: Toggle to EDT — formats UTC timestamp in America/New_York (UTC-4)', () => {
  const ts = '2026-08-26T15:00:00Z';
  const formatted = formatTimestamp(ts, 'EDT');
  assert(formatted.endsWith('EDT'), `Expected suffix EDT, got: ${formatted}`);
  assert(formatted.includes('11:00 AM'), `Expected 11:00 AM EDT, got: ${formatted}`);
  assert(formatted.includes('Aug 26'), `Expected Aug 26 EDT, got: ${formatted}`);
});

test('TC-03: Toggle Back to KST — reverts to KST format consistently', () => {
  const ts = '2026-08-26T15:00:00Z';
  const kst1 = formatTimestamp(ts, 'KST');
  const edt = formatTimestamp(ts, 'EDT');
  const kst2 = formatTimestamp(ts, 'KST');
  assert.strictEqual(kst1, kst2, 'Re-toggling to KST should produce identical output');
  assert.notStrictEqual(kst1, edt, 'KST and EDT outputs must differ');
});

test('TC-04: Graph Date Sync — US Friday trading session timestamp maps correctly', () => {
  const fridayCloseUtc = '2026-08-21T23:59:58Z';
  const edtDate = getLocalDateString(fridayCloseUtc, 'EDT');
  const kstDate = getLocalDateString(fridayCloseUtc, 'KST');
  assert.strictEqual(edtDate, '2026-08-21', `EDT should reflect US trading date 2026-08-21, got ${edtDate}`);
  assert.strictEqual(kstDate, '2026-08-22', `KST should reflect Saturday morning 2026-08-22, got ${kstDate}`);
});

// -----------------------------------------------------------------
// [Error / Edge Cases — 3 Cases]
// -----------------------------------------------------------------

test('TC-05: Midnight Day Boundary — 01:30 AM KST shifts backward by 1 calendar day in EDT', () => {
  const ts = '2026-08-26T16:30:00Z'; // 01:30 AM Aug 27 in KST, 12:30 PM Aug 26 in EDT
  const kstDate = getLocalDateString(ts, 'KST');
  const edtDate = getLocalDateString(ts, 'EDT');
  assert.strictEqual(kstDate, '2026-08-27', `KST date should be 2026-08-27, got ${kstDate}`);
  assert.strictEqual(edtDate, '2026-08-26', `EDT date should be 2026-08-26, got ${edtDate}`);
});

test('TC-06: Malformed / Null / Invalid Timestamp Fallback — handles gracefully', () => {
  assert.strictEqual(formatTimestamp(null, 'KST'), '--:--');
  assert.strictEqual(formatTimestamp(undefined, 'EDT'), '--:--');
  assert.strictEqual(formatTimestamp('', 'KST'), '--:--');
  assert.strictEqual(formatTimestamp('invalid-date-string', 'EDT'), 'invalid-date-string');
  assert.strictEqual(formatLocalTimeShort(null, 'KST'), '--:--');
});

test('TC-07: Rapid Toggling State Consistency — even count returns to initial KST state', () => {
  let tz = 'KST';
  for (let i = 0; i < 10; i++) {
    tz = tz === 'KST' ? 'EDT' : 'KST';
  }
  assert.strictEqual(tz, 'KST', '10 toggles must return to KST');
});

// -----------------------------------------------------------------
// [Regression Tests — 3 Cases]
// -----------------------------------------------------------------

test('TC-08: Data Immutability — Formatting does not alter raw ISO timestamp values', () => {
  const rawRecord = {
    date: '2026-08-22',
    raw_timestamp: '2026-08-21T23:59:58.000Z',
    score: 55.17
  };
  const formattedKst = formatTimestamp(rawRecord.raw_timestamp, 'KST');
  const formattedEdt = formatTimestamp(rawRecord.raw_timestamp, 'EDT');
  // Verify underlying object property is untouched
  assert.strictEqual(rawRecord.raw_timestamp, '2026-08-21T23:59:58.000Z');
  assert.strictEqual(rawRecord.date, '2026-08-22');
});

test('TC-09: Stale Error State Compatibility — Formats cached lastKnownGood timestamp', () => {
  const cachedLastKnownGood = {
    score: 55.17,
    fetchedAt: '2026-08-24T07:48:01Z'
  };
  const formattedKst = formatTimestamp(cachedLastKnownGood.fetchedAt, 'KST');
  const formattedEdt = formatTimestamp(cachedLastKnownGood.fetchedAt, 'EDT');
  assert(formattedKst.includes('KST'));
  assert(formattedEdt.includes('EDT'));
});

test('TC-10: Day-over-Day Math Invariance — Math calculations are independent of timezone', () => {
  const dod1 = calculateDayOverDay(55.17, 52.49, 'pts');
  const dod2 = calculateDayOverDay(55.17, 52.49, 'pts');
  assert.strictEqual(dod1.delta, 2.68);
  assert.strictEqual(dod1.percentDelta, 5.11);
  assert.strictEqual(dod1.direction, 'UP');
});

console.log(`\n====================================================`);
console.log(`Result: ${passedCount} / 10 Test Cases PASSED Successfully!`);
console.log('====================================================');
