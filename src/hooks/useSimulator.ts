import { useState, useEffect } from 'react';
import { simulator, SimulatorState } from '../services/simulatorEngine';

export function useSimulator() {
  const [state, setState] = useState<SimulatorState>(simulator.getState());

  useEffect(() => {
    const unsubscribe = simulator.subscribe(newState => {
      setState({ ...newState });
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    setClockSpeed: (speed: number) => simulator.setClockSpeed(speed),
    toggleEngineRunning: () => simulator.toggleEngineRunning(),
    toggleChaosMode: () => simulator.toggleChaosMode(),
    stepTick: () => simulator.stepTick(),
    triggerJobManually: (id: string) => simulator.triggerJobManually(id),
    registerJob: (job: any) => simulator.registerJob(job),
    toggleJobStatus: (id: string) => simulator.toggleJobStatus(id),
    triggerWorkflow: (id: string) => simulator.triggerWorkflow(id),
    triggerThunderingHerd: () => simulator.triggerThunderingHerd(),
    simulateLeaderCrash: () => simulator.simulateLeaderCrash(),
    killWorker: (id: string) => simulator.killWorker(id),
    spawnWorker: () => simulator.spawnWorker(),
    replayDlq: () => simulator.replayDlq(),
    purgeDlq: () => simulator.purgeDlq(),
    toggleQueuePause: (q: any) => simulator.toggleQueuePause(q),
    clearLogs: () => simulator.clearLogs(),
    registerTenant: (tenant: any) => simulator.registerTenant(tenant),
    addWebhook: (wh: any) => simulator.addWebhook(wh),
    toggleWebhook: (id: string) => simulator.toggleWebhook(id),
    testWebhookDelivery: (id: string) => simulator.testWebhookDelivery(id),
  };
}
