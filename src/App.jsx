import React, { useState } from 'react';
import Header from './components/Header';
import FearGreedCard from './components/FearGreedCard';
import MarketIndexCard from './components/MarketIndexCard';
import SubIndicatorsGrid from './components/SubIndicatorsGrid';
import NetworkErrorBanner from './components/NetworkErrorBanner';
import DevSandboxTab from './components/DevSandboxTab';
import DevAuthModal from './components/DevAuthModal';
import EmptyState from './components/EmptyState';
import { useDashboardFSM } from './hooks/useDashboardFSM';
import { FSM_STATES, FAILURE_MODES } from './constants/config';

export default function App() {
  const {
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
    handleClearStorage
  } = useDashboardFSM();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'dev'
  const [isDevAuthOpen, setIsDevAuthOpen] = useState(false);
  const [isDevUnlocked, setIsDevUnlocked] = useState(false);
  const [timezone, setTimezone] = useState('KST');

  const hasData = marketData.fearAndGreed !== null || marketData.sp500 !== null || marketData.qqq !== null;

  const handleDevUnlockSuccess = () => {
    setIsDevUnlocked(true);
    setActiveTab('dev');
  };

  const handleLockDev = () => {
    setIsDevUnlocked(false);
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        fsmState={fsmState}
        onRefresh={() => executeFetch(FAILURE_MODES.NONE)}
        onOpenDevAuth={() => {
          if (isDevUnlocked) {
            handleLockDev();
          } else {
            setIsDevAuthOpen(true);
          }
        }}
        isDevUnlocked={isDevUnlocked}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        timezone={timezone}
        onTimezoneToggle={() => setTimezone(current => current === 'KST' ? 'EDT' : 'KST')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Network Error / Stale Banner (Above S&P 500 and QQQ) */}
        <NetworkErrorBanner
          fsmState={fsmState}
          errorMessage={errorMessage}
          lastVerifiedTime={lastFetchTime || marketData.fearAndGreed?.fetchedAt}
          onRetry={handleRetry}
        />

        {/* Dynamic State View */}
        {hasData ? (
          <>
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* 1. S&P 500 & Nasdaq QQQ Grid (Top) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* S&P 500 Card */}
                  <MarketIndexCard
                    title="S&P 500"
                    sourceName="Yahoo Finance"
                    sourceUrl="https://finance.yahoo.com/quote/%5EGSPC/"
                    data={marketData.sp500}
                    unit="USD"
                    timezone={timezone}
                  />

                  {/* Nasdaq QQQ Card */}
                  <MarketIndexCard
                    title="Nasdaq QQQ"
                    sourceName="Yahoo Finance"
                    sourceUrl="https://finance.yahoo.com/quote/QQQ/"
                    data={marketData.qqq}
                    unit="USD"
                    timezone={timezone}
                  />
                </div>

                {/* 2. Fear & Greed Hero Card (Under S&P and QQQ) */}
                <FearGreedCard
                  data={marketData.fearAndGreed}
                  fsmState={fsmState}
                  onRetry={handleRetry}
                  snapshots={snapshots}
                  timezone={timezone}
                />

                {/* 3. CNN 7 Market Driver Indicators */}
                {marketData.fearAndGreed && (
                  <SubIndicatorsGrid data={marketData.fearAndGreed} />
                )}
              </div>
            ) : (
              /* Developer Sandbox Tab (Only accessible when unlocked) */
              <DevSandboxTab
                simulationMode={simulationMode}
                onTriggerSimulation={triggerSimulation}
                onResetToLive={() => triggerSimulation(FAILURE_MODES.NONE)}
                fsmState={fsmState}
                errorMessage={errorMessage}
                snapshots={snapshots}
                onSeedCustomDate={handleSeedCustomDate}
                onClearStorage={handleClearStorage}
                marketData={marketData}
              />
            )}
          </>
        ) : (
          <EmptyState
            fsmState={fsmState}
            errorMessage={errorMessage}
            onRetry={handleRetry}
            onSeedYesterday={() => handleSeedCustomDate()}
            activeSource={{ name: 'US Market Index' }}
          />
        )}
      </main>

      {/* Developer Password Unlock Modal */}
      <DevAuthModal
        isOpen={isDevAuthOpen}
        onClose={() => setIsDevAuthOpen(false)}
        onUnlockSuccess={handleDevUnlockSuccess}
      />

      {/* Clean Minimal Footer */}
      <footer className="bg-slate-900/30 border-t border-slate-900 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          <span>US Market Index</span>
          <span className="mx-2">•</span>
          <span>Live market data refreshed locally</span>
        </div>
      </footer>
    </div>
  );
}

