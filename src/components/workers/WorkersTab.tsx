import React from 'react';
import { 
  Cpu, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  Activity, 
  Server, 
  CheckCircle2, 
  AlertTriangle,
  Radio,
  Zap
} from 'lucide-react';
import { Language, translations } from '../../locales/translations';
import { WorkerNode } from '../../types';

interface WorkersTabProps {
  language: Language;
  workers: WorkerNode[];
  onSpawnWorker: () => void;
  onKillWorker: (id: string) => void;
}

export const WorkersTab: React.FC<WorkersTabProps> = ({
  language,
  workers,
  onSpawnWorker,
  onKillWorker
}) => {
  const t = translations[language];
  const totalConcurrency = workers.reduce((acc, w) => acc + (w.status === 'healthy' ? w.concurrency : 0), 0);
  const activeJobs = workers.reduce((acc, w) => acc + w.activeJobsCount, 0);
  const totalProcessed = workers.reduce((acc, w) => acc + w.processedTotal, 0);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#0D121C] border border-slate-800 rounded-xl gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Worker Fleet Orchestration</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Distributed task execution nodes with automatic heartbeat discovery, fair-share load shedding, and graceful draining
          </p>
        </div>

        <button
          onClick={onSpawnWorker}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.spawnWorker}</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0D121C] border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Healthy Nodes</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {workers.filter(w => w.status === 'healthy').length} / {workers.length}
          </div>
        </div>

        <div className="p-4 bg-[#0D121C] border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Concurrency Capacity</span>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {activeJobs} / {totalConcurrency} slots
          </div>
        </div>

        <div className="p-4 bg-[#0D121C] border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Fleet Task Volume</span>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-1 tabular-nums">
            {totalProcessed.toLocaleString()} tasks
          </div>
        </div>

        <div className="p-4 bg-[#0D121C] border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Heartbeat Protocol</span>
          <div className="text-xl font-bold font-mono text-slate-200 mt-1 tabular-nums">
            1000ms TTL
          </div>
        </div>
      </div>

      {/* Worker Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workers.map((worker) => {
          const isAlive = worker.status === 'healthy';
          const msSinceHeartbeat = Date.now() - worker.lastHeartbeat;

          return (
            <div 
              key={worker.id}
              className={`p-5 bg-[#0D121C] border rounded-xl flex flex-col justify-between transition-all ${
                isAlive ? 'border-slate-800' : 'border-rose-500/40 bg-rose-500/5'
              }`}
            >
              <div>
                {/* Node Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isAlive ? 'bg-indigo-600/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{worker.id}</span>
                        <span className={`w-2 h-2 rounded-full ${isAlive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{worker.datacenter}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                    isAlive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {worker.status}
                  </span>
                </div>

                {/* Concurrency Usage Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 font-mono mb-1.5">
                    <span>Task Execution Slots</span>
                    <span className="text-slate-200 font-bold tabular-nums">
                      {worker.activeJobsCount} / {worker.concurrency} ({Math.round((worker.activeJobsCount / worker.concurrency) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        worker.activeJobsCount >= worker.concurrency ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, (worker.activeJobsCount / worker.concurrency) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Telemetry Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-[#090D14] border border-slate-800 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">CPU Load</span>
                    <span className="text-slate-200 font-semibold">{isAlive ? `${worker.cpuUsage}%` : '0%'}</span>
                  </div>

                  <div className="p-2.5 bg-[#090D14] border border-slate-800 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">Memory</span>
                    <span className="text-slate-200 font-semibold">{isAlive ? `${worker.memoryMb} MB` : '0 MB'}</span>
                  </div>

                  <div className="p-2.5 bg-[#090D14] border border-slate-800 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">Processed</span>
                    <span className="text-emerald-400 font-semibold">{worker.processedTotal}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Heartbeat */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Heartbeat: {isAlive ? `${msSinceHeartbeat}ms ago` : 'EXPIRED'}</span>
                </span>

                {isAlive && (
                  <button
                    onClick={() => onKillWorker(worker.id)}
                    className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t.killWorker}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
