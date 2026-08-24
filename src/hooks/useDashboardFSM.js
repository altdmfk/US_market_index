import { useState, useEffect, useCallback, useRef } from 'react';
import { FSM_STATES, FAILURE_MODES, getSentimentCategory } from '../constants/config';
import { fetchAllMarketData } from '../services/apiService';
import { getLocalDateString } from '../utils/timezone';
import {
  saveDailySnapshot,
  getStoredSnapshots,
  syncWithSupabase,
  getLastKnownGood,
  seedCustomDateRecord,
  clearAllStorage
} from '../services/storageService';

export function useDashboardFSM() {
  const [fsmState, setFsmState] = useState(FSM_STATES.IDLE);
  const [marketData, setMarketData] = useState({
    fearAndGreed: null,
    sp500: null,
    qqq: null
  });
  const [lastKnownGood, setLastKnownGood] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [simulationMode, setSimulationMode] = useState(FAILURE_MODES.NONE);
  const [snapshots, setSnapshots] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const isMountedRef = useRef(true);

  const refreshSnapshots = useCallback(() => {
    const stored = getStoredSnapshots('fear_and_greed');
    setSnapshots(stored);
  }, []);

  const executeFetch = useCallback(async (simMode = simulationMode) => {
    setFsmState(FSM_STATES.FETCHING);
    setErrorMessage(null);

    const existingGood = getLastKnownGood('fear_and_greed');

    try {
      const result = await fetchAllMarketData(simMode);

      if (!isMountedRef.current) return;

      if (result.fearAndGreed) {
        saveDailySnapshot(result.fearAndGreed);
      }

      setMarketData(result);
      if (result.fearAndGreed) {
        setLastKnownGood(result.fearAndGreed);
      }
      setLastFetchTime(new Date());
      setFsmState(FSM_STATES.SUCCESS);
      refreshSnapshots();
    } catch (err) {
      if (!isMountedRef.current) return;

      const message = err?.message || 'An unexpected error occurred during fetch';
      setErrorMessage(message);

      if (existingGood) {
        setMarketData(prev => ({
          ...prev,
          fearAndGreed: existingGood
        }));
        setLastKnownGood(existingGood);
        setFsmState(FSM_STATES.STALE_ERROR);
      } else {
        setMarketData({ fearAndGreed: null, sp500: null, qqq: null });
        setFsmState(FSM_STATES.HARD_ERROR);
      }
      refreshSnapshots();
    }
  }, [simulationMode, refreshSnapshots]);

  useEffect(() => {
    isMountedRef.current = true;
    const initialGood = getLastKnownGood('fear_and_greed');
    if (initialGood) {
      setLastKnownGood(initialGood);
    }
    refreshSnapshots();
    syncWithSupabase('fear_and_greed').then(synced => {
      if (isMountedRef.current && synced && synced.length > 0) {
        setSnapshots(synced);
      }
    });
    executeFetch(FAILURE_MODES.NONE);

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleRetry = useCallback(() => {
    setSimulationMode(FAILURE_MODES.NONE);
    executeFetch(FAILURE_MODES.NONE);
  }, [executeFetch]);

  const triggerSimulation = useCallback((mode) => {
    setSimulationMode(mode);
    executeFetch(mode);
  }, [executeFetch]);

  const handleSeedCustomDate = useCallback((dateStr, score = null) => {
    // 1. Ensure live record exists in snapshot store
    if (marketData.fearAndGreed) {
      saveDailySnapshot(marketData.fearAndGreed);
    }

    // 2. Seed the requested target date
    const seeded = seedCustomDateRecord(dateStr, score, 'fear_and_greed');

    // 3. Immediately apply to active state
    setMarketData(prev => {
      if (!prev || !prev.fearAndGreed) return prev;
      return {
        ...prev,
        fearAndGreed: {
          ...prev.fearAndGreed,
          previousClose: seeded.score
        }
      };
    });

    refreshSnapshots();
  }, [marketData.fearAndGreed, refreshSnapshots]);

  /**
   * Deterministic 9-Fixture Replay Handler according to README.md contract:
   * 1. D1-A: score 100, 1 row
   * 2. D1-B: same date score 105, 1 row
   * 3. D2: next date score 120, 2 rows, delta +15
   * 4. RECOVER-D2: restores fresh / none, next date score 120, 2 rows, delta +15
   */
  const handlePlayFixture = useCallback((fixtureType) => {
    const todayStr = getLocalDateString(new Date());
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    const d2Str = getLocalDateString(nextDate);

    const createPayload = (score, rawTs, prevClose = null) => {
      const sentiment = getSentimentCategory(score);
      return {
        sourceId: 'fear_and_greed',
        sourceName: 'CNN Fear & Greed Index',
        score,
        rating: sentiment.label,
        unit: 'pts',
        unitShort: 'pts',
        rawTimestamp: rawTs,
        fetchedAt: new Date().toISOString(),
        previousClose: prevClose,
        rawPayload: {
          fear_and_greed: {
            score,
            rating: sentiment.label.toLowerCase(),
            timestamp: rawTs,
            previous_close: prevClose
          }
        }
      };
    };

    switch (fixtureType) {
      case 'D1_A': {
        const snap = seedCustomDateRecord(todayStr, 100.0, 'fear_and_greed');
        const payload = createPayload(100.0, snap.rawTimestamp, null);
        setFsmState(FSM_STATES.SUCCESS);
        setErrorMessage(null);
        setSimulationMode(FAILURE_MODES.NONE);
        setLastKnownGood(payload);
        setMarketData(prev => ({
          ...prev,
          fearAndGreed: payload
        }));
        break;
      }

      case 'D1_B': {
        const snap = seedCustomDateRecord(todayStr, 105.0, 'fear_and_greed');
        const payload = createPayload(105.0, snap.rawTimestamp, null);
        setFsmState(FSM_STATES.SUCCESS);
        setErrorMessage(null);
        setSimulationMode(FAILURE_MODES.NONE);
        setLastKnownGood(payload);
        setMarketData(prev => ({
          ...prev,
          fearAndGreed: payload
        }));
        break;
      }

      case 'D2': {
        const snap = seedCustomDateRecord(d2Str, 120.0, 'fear_and_greed');
        const payload = createPayload(120.0, snap.rawTimestamp, 105.0);
        setFsmState(FSM_STATES.SUCCESS);
        setErrorMessage(null);
        setSimulationMode(FAILURE_MODES.NONE);
        setLastKnownGood(payload);
        setMarketData(prev => ({
          ...prev,
          fearAndGreed: payload
        }));
        break;
      }

      case 'RECOVER_D2': {
        const snap = seedCustomDateRecord(d2Str, 120.0, 'fear_and_greed');
        const payload = createPayload(120.0, snap.rawTimestamp, 105.0);
        setFsmState(FSM_STATES.SUCCESS);
        setErrorMessage(null);
        setSimulationMode(FAILURE_MODES.NONE);
        setLastKnownGood(payload);
        setMarketData(prev => ({
          ...prev,
          fearAndGreed: payload
        }));
        break;
      }

      default:
        break;
    }

    refreshSnapshots();
  }, [refreshSnapshots]);

  const handleClearStorage = useCallback(() => {
    clearAllStorage();
    setMarketData({ fearAndGreed: null, sp500: null, qqq: null });
    setLastKnownGood(null);
    setSnapshots([]);
    setErrorMessage(null);
    setFsmState(FSM_STATES.IDLE);
    setSimulationMode(FAILURE_MODES.NONE);
  }, []);

  return {
    fsmState,
    marketData,
    lastKnownGood,
    errorMessage,
    simulationMode,
    snapshots,
    lastFetchTime,
    executeFetch,
    handleRetry,
    triggerSimulation,
    handleSeedCustomDate,
    handlePlayFixture,
    handleClearStorage,
    refreshSnapshots
  };
}
