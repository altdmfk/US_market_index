import React from 'react';
import SimulationPanel from './SimulationPanel';
import HistoryTable from './HistoryTable';
import DevSeedPanel from './DevSeedPanel';
import DataAuditBlock from './DataAuditBlock';

export default function DevSandboxTab({
  simulationMode,
  onTriggerSimulation,
  onResetToLive,
  fsmState,
  errorMessage,
  snapshots,
  onSeedCustomDate,
  onClearStorage,
  marketData
}) {
  return (
    <div className="space-y-6">
      {/* 1. Error Simulation Block */}
      <SimulationPanel
        activeMode={simulationMode}
        onTriggerSimulation={onTriggerSimulation}
        onResetToLive={onResetToLive}
        errorMessage={errorMessage}
      />

      {/* 2. Test Tools Block */}
      <DevSeedPanel
        onSeedCustomDate={onSeedCustomDate}
        onClearStorage={onClearStorage}
        snapshotsCount={snapshots.length}
      />

      {/* 3. Embedded Data Audit Block (Multi-date audit) */}
      <DataAuditBlock
        data={marketData?.fearAndGreed}
        snapshots={snapshots}
        activeSource={{ name: 'CNN Fear & Greed Index', unitShort: 'pts' }}
      />

      {/* 4. Historical Snapshots Table Block */}
      <HistoryTable
        snapshots={snapshots}
        activeSource={{ id: 'fear_and_greed', unitShort: 'pts' }}
      />
    </div>
  );
}
