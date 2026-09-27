import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { OverviewTab } from './components/overview/OverviewTab';
import { JobsTab } from './components/jobs/JobsTab';
import { WorkflowsTab } from './components/workflows/WorkflowsTab';
import { QueuesTab } from './components/queues/QueuesTab';
import { WorkersTab } from './components/workers/WorkersTab';
import { ConsensusTab } from './components/consensus/ConsensusTab';
import { TenantsTab } from './components/tenants/TenantsTab';
import { AuditTab } from './components/audit/AuditTab';
import { ObservabilityTab } from './components/observability/ObservabilityTab';
import { ArchitectureTab } from './components/architecture/ArchitectureTab';
import { ReadmeTab } from './components/readme/ReadmeTab';
import { CommandPalette } from './components/common/CommandPalette';
import { RunDetailsModal } from './components/jobs/RunDetailsModal';
import { useSimulator } from './hooks/useSimulator';
import { Language } from './locales/translations';
import { JobRun } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [language, setLanguage] = useState<Language>('en');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<JobRun | null>(null);

  const {
    jobs,
    jobRuns,
    workflows,
    workflowRuns,
    workers,
    clusterNodes,
    locks,
    queueMetrics,
    metrics,
    logs,
    tenants,
    auditLogs,
    webhooks,
    clockSpeed,
    isEngineRunning,
    chaosMode,
    setClockSpeed,
    toggleEngineRunning,
    toggleChaosMode,
    triggerJobManually,
    registerJob,
    toggleJobStatus,
    triggerWorkflow,
    triggerThunderingHerd,
    simulateLeaderCrash,
    killWorker,
    spawnWorker,
    replayDlq,
    purgeDlq,
    toggleQueuePause,
    clearLogs,
    registerTenant,
    addWebhook,
    toggleWebhook,
    testWebhookDelivery
  } = useSimulator();

  const leaderNode = clusterNodes.find(n => n.role === 'leader');

  return (
    <div 
      className="min-h-screen bg-[#080B10] text-[#E2E8F0] flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200"
      dir={language === 'fa' ? 'rtl' : 'ltr'}
    >
      {/* Universal Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        language={language}
        onLanguageToggle={() => setLanguage(language === 'en' ? 'fa' : 'en')}
        isEngineRunning={isEngineRunning}
        onToggleEngine={toggleEngineRunning}
        clockSpeed={clockSpeed}
        onSetClockSpeed={setClockSpeed}
        chaosMode={chaosMode}
        onToggleChaos={toggleChaosMode}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        leaderNodeId={leaderNode?.id}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'overview' && (
          <OverviewTab
            language={language}
            jobs={jobs}
            jobRuns={jobRuns}
            workers={workers}
            clusterNodes={clusterNodes}
            queueMetrics={queueMetrics}
            metrics={metrics}
            onTriggerJob={triggerJobManually}
            onTriggerSpike={triggerThunderingHerd}
            onCrashLeader={simulateLeaderCrash}
            onToggleChaos={toggleChaosMode}
            chaosMode={chaosMode}
            onSelectRun={(run) => setSelectedRun(run)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'jobs' && (
          <JobsTab
            language={language}
            jobs={jobs}
            jobRuns={jobRuns}
            onTriggerJob={triggerJobManually}
            onToggleJobStatus={toggleJobStatus}
            onRegisterJob={registerJob}
          />
        )}

        {currentTab === 'workflows' && (
          <WorkflowsTab
            language={language}
            workflows={workflows}
            workflowRuns={workflowRuns}
            onTriggerWorkflow={triggerWorkflow}
          />
        )}

        {currentTab === 'queues' && (
          <QueuesTab
            language={language}
            queueMetrics={queueMetrics}
            jobRuns={jobRuns}
            onToggleQueuePause={toggleQueuePause}
            onReplayDlq={replayDlq}
            onPurgeDlq={purgeDlq}
            onSelectRun={(run) => setSelectedRun(run)}
          />
        )}

        {currentTab === 'workers' && (
          <WorkersTab
            language={language}
            workers={workers}
            onSpawnWorker={spawnWorker}
            onKillWorker={killWorker}
          />
        )}

        {currentTab === 'consensus' && (
          <ConsensusTab
            language={language}
            clusterNodes={clusterNodes}
            locks={locks}
            onCrashLeader={simulateLeaderCrash}
          />
        )}

        {currentTab === 'tenants' && (
          <TenantsTab
            language={language}
            tenants={tenants}
            onRegisterTenant={registerTenant}
          />
        )}

        {currentTab === 'audit' && (
          <AuditTab
            language={language}
            auditLogs={auditLogs}
            webhooks={webhooks}
            tenants={tenants}
            onAddWebhook={addWebhook}
            onToggleWebhook={toggleWebhook}
            onTestWebhookDelivery={testWebhookDelivery}
          />
        )}

        {currentTab === 'observability' && (
          <ObservabilityTab
            language={language}
            logs={logs}
            metrics={metrics}
            queueMetrics={queueMetrics}
            workers={workers}
            clusterNodes={clusterNodes}
            onClearLogs={clearLogs}
          />
        )}

        {currentTab === 'architecture' && (
          <ArchitectureTab language={language} />
        )}

        {currentTab === 'readme' && (
          <ReadmeTab language={language} />
        )}
      </main>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setCurrentTab}
        onTriggerSpike={triggerThunderingHerd}
        onCrashLeader={simulateLeaderCrash}
        onToggleChaos={toggleChaosMode}
        onReplayDlq={replayDlq}
        onSpawnWorker={spawnWorker}
        language={language}
      />

      {/* Global Run Details Modal */}
      <RunDetailsModal
        run={selectedRun}
        onClose={() => setSelectedRun(null)}
      />
    </div>
  );
}
