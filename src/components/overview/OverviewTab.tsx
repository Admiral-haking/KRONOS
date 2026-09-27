import React from 'react';
import { 
  Activity, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Server, 
  Flame, 
  Play, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { Language, translations } from '../../locales/translations';
import { Job, JobRun, QueueMetric, WorkerNode, ClusterNode, SystemMetrics } from '../../types';

interface OverviewTabProps {
  language: Language;
  jobs: Job[];
  jobRuns: JobRun[];
  workers: WorkerNode[];
  clusterNodes: ClusterNode[];
  queueMetrics: QueueMetric[];
  metrics: SystemMetrics;
  onTriggerJob: (id: string) => void;
  onTriggerSpike: () => void;
  onCrashLeader: () => void;
  onToggleChaos: () => void;
  chaosMode: boolean;
  onSelectRun: (run: JobRun) => void;
  onNavigateTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  language,
  jobs,
  jobRuns,
  workers,
  clusterNodes,
  queueMetrics,
  metrics,
  onTriggerJob,
  onTriggerSpike,
  onCrashLeader,
  onToggleChaos,
  chaosMode,
  onSelectRun,
  onNavigateTab
}) => {
  const t = translations[language];
  const leader = clusterNodes.find(n => n.role === 'leader');
  const healthyWorkers = workers.filter(w => w.status === 'healthy').length;
  const totalQueued = queueMetrics.reduce((acc, q) => acc + q.waiting, 0);

  // SVG Sparkline calculation for throughput history
  const throughputPoints = metrics.throughputHistory;
  const maxRate = Math.max(...throughputPoints.map(p => p.rate), 60);
  const minRate = Math.min(...throughputPoints.map(p => p.rate), 20);
  const range = maxRate - minRate || 1;
  const svgWidth = 320;
  const svgHeight = 64;

  const pointsString = throughputPoints.map((p, idx) => {
    const x = (idx / (throughputPoints.length - 1)) * svgWidth;
    const y = svgHeight - ((p.rate - minRate) / range) * (svgHeight - 12) - 6;
    return `${x},${y}`;
  }).join(' ');

  const currentRate = throughputPoints[throughputPoints.length - 1]?.rate || 42;

  return (
    <div className="space-y-6">
      {/* 1. System State Banner & Quick Chaos Operations */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-[#0D121C] border border-slate-800 rounded-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-tight">{t.clusterStatus}</h2>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-mono">
                {t.leader}: <span className="text-indigo-400 font-semibold">{leader?.id || 'none'}</span>
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-mono">Term {leader?.term || 14}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Consensus protocol active · Lease renewed every 5000ms · {healthyWorkers} workers ready across 3 regions
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onTriggerSpike}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{t.thunderingHerd}</span>
          </button>

          <button
            onClick={onCrashLeader}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-lg transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t.crashLeader}</span>
          </button>

          <button
            onClick={onToggleChaos}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              chaosMode
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'text-slate-300 bg-slate-900 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t.toggleChaos}</span>
          </button>
        </div>
      </div>

      {/* 2. Four Master KPI Cards (Zero-Pill, Single Elevation, Tabular Numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Jobs */}
        <div className="p-4 bg-[#0D121C] border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.kpiActiveJobs}</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {jobs.length}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>{jobs.filter(j => j.status === 'active').length} active</span>
              <span>·</span>
              <span>{jobs.filter(j => j.type === 'cron').length} cron schedules</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Runs */}
        <div className="p-4 bg-[#0D121C] border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.kpiRunsExecuted}</span>
            <Activity className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {metrics.totalRunsExecuted.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <span>+{Math.floor(metrics.uptimeSeconds / 12)} runs today</span>
              <span>·</span>
              <span className="text-slate-500 font-mono">100% exactly-once</span>
            </div>
          </div>
        </div>

        {/* Card 3: Success Rate */}
        <div className="p-4 bg-[#0D121C] border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.kpiSuccessRate}</span>
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {metrics.successRatePercent}%
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>{queueMetrics.reduce((a, b) => a + b.failed, 0)} DLQ failures</span>
              <span>·</span>
              <span>exponential backoff</span>
            </div>
          </div>
        </div>

        {/* Card 4: p95 Latency */}
        <div className="p-4 bg-[#0D121C] border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.kpiP95Latency}</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {metrics.p95LatencyMs}ms
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>p50: {metrics.p50LatencyMs}ms</span>
              <span>·</span>
              <span>p99: {metrics.p99LatencyMs}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Real-time Throughput & Queue Depth Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Throughput Sparkline */}
        <div className="lg:col-span-2 p-5 bg-[#0D121C] border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Cluster Processing Throughput</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time dispatched jobs/sec across all worker pools</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-mono text-indigo-400 tabular-nums">{currentRate}</span>
              <span className="text-xs text-slate-500 ml-1">jobs/sec</span>
            </div>
          </div>

          {/* SVG Sparkline */}
          <div className="my-4 py-2 border-y border-slate-800/60 relative">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-24 overflow-visible">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Fill area */}
              <polygon
                points={`0,${svgHeight} ${pointsString} ${svgWidth},${svgHeight}`}
                fill="url(#lineGrad)"
              />
              {/* Stroke line */}
              <polyline
                fill="none"
                stroke="#6366F1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>24 ticks window</span>
            <span>Min: {minRate} j/s · Max: {maxRate} j/s</span>
            <span>Tick loop: 500ms</span>
          </div>
        </div>

        {/* Right: Queue Depth Matrix */}
        <div className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Queue Partitions</h3>
            <button 
              onClick={() => onNavigateTab('queues')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {queueMetrics.map((queue) => (
              <div key={queue.name} className="p-3 bg-[#090D14] border border-slate-800/80 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      queue.name === 'critical' ? 'bg-rose-500' : queue.name === 'default' ? 'bg-indigo-500' : 'bg-slate-400'
                    }`} />
                    <span className="text-xs font-semibold text-white uppercase font-mono">{queue.name}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 tabular-nums">
                    {queue.throughputPerSec} req/s
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
                  <div className="bg-slate-900/60 p-1 rounded">
                    <div className="text-slate-500 text-[10px]">Wait</div>
                    <div className="text-slate-200 font-bold tabular-nums">{queue.waiting}</div>
                  </div>
                  <div className="bg-slate-900/60 p-1 rounded">
                    <div className="text-slate-500 text-[10px]">Active</div>
                    <div className="text-indigo-400 font-bold tabular-nums">{queue.active}</div>
                  </div>
                  <div className="bg-slate-900/60 p-1 rounded">
                    <div className="text-slate-500 text-[10px]">Retry</div>
                    <div className="text-amber-400 font-bold tabular-nums">{queue.delayed}</div>
                  </div>
                  <div className="bg-slate-900/60 p-1 rounded">
                    <div className="text-slate-500 text-[10px]">DLQ</div>
                    <div className="text-rose-400 font-bold tabular-nums">{queue.failed}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-500 flex justify-between font-mono">
            <span>Total Buffer Depth:</span>
            <span className="text-slate-200 font-semibold">{totalQueued} items</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Live Runs Stream & Worker Fleet Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Job Runs */}
        <div className="lg:col-span-2 p-5 bg-[#0D121C] border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Live Dispatched Runs</h3>
              <p className="text-xs text-slate-400 mt-0.5">Execution trace with idempotency tokens and fencing guarantees</p>
            </div>
            <button 
              onClick={() => onNavigateTab('jobs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-800/60 overflow-hidden">
            {jobRuns.slice(0, 5).map((run) => (
              <div 
                key={run.id}
                onClick={() => onSelectRun(run)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  {/* Status Indicator Icon */}
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    run.status === 'completed' ? 'bg-emerald-500' :
                    run.status === 'running' ? 'bg-indigo-500 animate-pulse' :
                    run.status === 'retrying' ? 'bg-amber-500' :
                    run.status === 'dlq' ? 'bg-rose-500' : 'bg-slate-400'
                  }`} />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {run.jobName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        #{run.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>Token: {run.fencingToken}</span>
                      <span>·</span>
                      <span>Node: {run.workerHostname || 'unassigned'}</span>
                      <span>·</span>
                      <span>Attempt {run.attempt}/{run.maxAttempts}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    run.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    run.status === 'running' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    run.status === 'dlq' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {run.status.toUpperCase()}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    {run.durationMs ? `${run.durationMs}ms` : 'active...'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Worker Fleet Snapshot */}
        <div className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Worker Fleet Status</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distributed execution pool</p>
            </div>
            <button 
              onClick={() => onNavigateTab('workers')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Fleet View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {workers.map((worker) => (
              <div key={worker.id} className="p-2.5 bg-[#090D14] border border-slate-800/80 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${worker.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-xs font-mono text-slate-200 font-semibold">{worker.id}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    CPU {worker.cpuUsage}%
                  </span>
                </div>

                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                    <span>Concurrency Slot</span>
                    <span className="text-slate-300 tabular-nums">{worker.activeJobsCount} / {worker.concurrency}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (worker.activeJobsCount / worker.concurrency) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>{worker.datacenter}</span>
                  <span>{worker.processedTotal} tasks total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
