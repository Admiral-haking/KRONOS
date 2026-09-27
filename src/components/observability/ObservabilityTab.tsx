import React, { useState } from 'react';
import { 
  Activity, 
  Terminal, 
  Copy, 
  Check, 
  Search, 
  Trash2, 
  Filter, 
  ExternalLink,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';
import { Language, translations } from '../../locales/translations';
import { LogEntry, SystemMetrics, QueueMetric, WorkerNode, ClusterNode } from '../../types';

interface ObservabilityTabProps {
  language: Language;
  logs: LogEntry[];
  metrics: SystemMetrics;
  queueMetrics: QueueMetric[];
  workers: WorkerNode[];
  clusterNodes: ClusterNode[];
  onClearLogs: () => void;
}

export const ObservabilityTab: React.FC<ObservabilityTabProps> = ({
  language,
  logs,
  metrics,
  queueMetrics,
  workers,
  clusterNodes,
  onClearLogs
}) => {
  const t = translations[language];
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all');
  const [logSearch, setLogSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'prometheus' | 'traces'>('logs');

  const filteredLogs = logs.filter(log => {
    const matchesLevel = logFilter === 'all' || logFilter === log.level;
    const matchesSearch = log.message.toLowerCase().includes(logSearch.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const leader = clusterNodes.find(n => n.role === 'leader');

  const prometheusText = `# HELP kronos_jobs_registered_total Total count of registered scheduled jobs
# TYPE kronos_jobs_registered_total gauge
kronos_jobs_registered_total ${metrics.totalJobsRegistered}

# HELP kronos_runs_total Total count of job executions partitioned by terminal status
# TYPE kronos_runs_total counter
kronos_runs_total{status="completed"} ${Math.floor(metrics.totalRunsExecuted * 0.994)}
kronos_runs_total{status="dlq"} ${Math.floor(metrics.totalRunsExecuted * 0.006)}
kronos_runs_total{status="in_flight"} ${queueMetrics.reduce((a, b) => a + b.active, 0)}

# HELP kronos_queue_depth Instantaneous waiting buffer depth per queue
# TYPE kronos_queue_depth gauge
kronos_queue_depth{queue="critical"} ${queueMetrics.find(q => q.name === 'critical')?.waiting || 0}
kronos_queue_depth{queue="default"} ${queueMetrics.find(q => q.name === 'default')?.waiting || 0}
kronos_queue_depth{queue="background"} ${queueMetrics.find(q => q.name === 'background')?.waiting || 0}

# HELP kronos_worker_pool_nodes Worker nodes discovered with healthy heartbeats
# TYPE kronos_worker_pool_nodes gauge
kronos_worker_pool_nodes{status="healthy"} ${workers.filter(w => w.status === 'healthy').length}
kronos_worker_pool_nodes{status="dead"} ${workers.filter(w => w.status === 'dead').length}

# HELP kronos_leader_term Monotonic Raft consensus term
# TYPE kronos_leader_term counter
kronos_leader_term{leader_id="${leader?.id || 'none'}"} ${leader?.term || 14}

# HELP kronos_execution_latency_ms Percentile latencies in milliseconds
# TYPE kronos_execution_latency_ms summary
kronos_execution_latency_ms{quantile="0.5"} ${metrics.p50LatencyMs}
kronos_execution_latency_ms{quantile="0.95"} ${metrics.p95LatencyMs}
kronos_execution_latency_ms{quantile="0.99"} ${metrics.p99LatencyMs}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prometheusText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Mode Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#0D121C] border border-slate-800 rounded-xl gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Observability & Diagnostics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Distributed tracing, Prometheus metric scrapers, and structured logging
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center bg-[#090D14] p-1 border border-slate-800 rounded-lg text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1 rounded-md transition-colors ${activeSubTab === 'logs' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Structured Logs
          </button>
          <button
            onClick={() => setActiveSubTab('prometheus')}
            className={`px-3 py-1 rounded-md transition-colors ${activeSubTab === 'prometheus' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Prometheus Metrics
          </button>
          <button
            onClick={() => setActiveSubTab('traces')}
            className={`px-3 py-1 rounded-md transition-colors ${activeSubTab === 'traces' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            OpenTelemetry Spans
          </button>
        </div>
      </div>

      {activeSubTab === 'logs' ? (
        /* Logs Viewer */
        <div className="bg-[#0D121C] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          {/* Controls Bar */}
          <div className="p-3 bg-[#090D14] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search logs by keyword..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Level Segmented Filter */}
              <div className="flex items-center bg-slate-900 p-0.5 border border-slate-800 rounded-lg text-[11px] font-mono">
                {['all', 'info', 'warn', 'error', 'debug'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLogFilter(lvl as any)}
                    className={`px-2.5 py-1 rounded uppercase ${
                      logFilter === lvl ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <button
                onClick={onClearLogs}
                title="Clear Logs"
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Logs Feed */}
          <div className="p-4 bg-[#090D14] font-mono text-xs space-y-2 max-h-[500px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 italic">No logs match your filter criteria.</div>
            ) : (
              filteredLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 hover:bg-slate-900/60 p-1.5 rounded transition-colors">
                  <span className="text-slate-500 shrink-0 text-[10px]">
                    {new Date(log.timestamp).toISOString().split('T')[1].slice(0, 8)}
                  </span>
                  <span className={`text-[10px] font-bold uppercase shrink-0 px-1 rounded ${
                    log.level === 'error' ? 'text-rose-400 bg-rose-500/10' :
                    log.level === 'warn' ? 'text-amber-400 bg-amber-500/10' :
                    log.level === 'debug' ? 'text-slate-400 bg-slate-800' :
                    'text-indigo-400 bg-indigo-500/10'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-slate-300 leading-relaxed">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : activeSubTab === 'prometheus' ? (
        /* Prometheus Metrics View */
        <div className="bg-[#0D121C] border border-slate-800 rounded-xl overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Prometheus Exporter Output</h3>
              <p className="text-xs text-slate-400 mt-0.5">Live scrape endpoint format: <code className="text-indigo-400">GET /metrics</code></p>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Metrics'}</span>
            </button>
          </div>

          <pre className="p-4 bg-[#090D14] border border-slate-800 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto max-h-[460px]">
            {prometheusText}
          </pre>
        </div>
      ) : (
        /* OpenTelemetry Spans */
        <div className="bg-[#0D121C] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white">OpenTelemetry Distributed Trace Flamegraph</h3>
            <p className="text-xs text-slate-400 mt-0.5">Execution timeline of a single job run across distributed cluster layers</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Span 1 */}
            <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg space-y-1">
              <div className="flex justify-between text-slate-300">
                <span className="font-bold text-indigo-400">1. kronos.scheduler.tick_evaluation</span>
                <span className="text-slate-500">Duration: 4ms</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[15%]" />
              </div>
            </div>

            {/* Span 2 */}
            <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg space-y-1 ml-4 border-l-2 border-l-indigo-500">
              <div className="flex justify-between text-slate-300">
                <span className="font-bold text-indigo-400">2. redis.priority_queue.push</span>
                <span className="text-slate-500">Duration: 2ms</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[10%]" />
              </div>
            </div>

            {/* Span 3 */}
            <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg space-y-1 ml-8 border-l-2 border-l-emerald-500">
              <div className="flex justify-between text-slate-300">
                <span className="font-bold text-emerald-400">3. worker.acquire_distributed_lock</span>
                <span className="text-slate-500">Duration: 8ms</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[25%]" />
              </div>
            </div>

            {/* Span 4 */}
            <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg space-y-1 ml-12 border-l-2 border-l-amber-500">
              <div className="flex justify-between text-slate-300">
                <span className="font-bold text-amber-400">4. worker.execute_handler_task</span>
                <span className="text-slate-500">Duration: 142ms</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[70%]" />
              </div>
            </div>

            {/* Span 5 */}
            <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg space-y-1 ml-8 border-l-2 border-l-indigo-500">
              <div className="flex justify-between text-slate-300">
                <span className="font-bold text-indigo-400">5. postgres.commit_run_and_release_fencing_token</span>
                <span className="text-slate-500">Duration: 12ms</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[30%]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
