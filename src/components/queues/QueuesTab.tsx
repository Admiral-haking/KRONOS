import React, { useState } from 'react';
import { 
  Server, 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  ArrowUpRight,
  Flame,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Language, translations } from '../../locales/translations';
import { QueueMetric, JobRun, QueueType } from '../../types';

interface QueuesTabProps {
  language: Language;
  queueMetrics: QueueMetric[];
  jobRuns: JobRun[];
  onToggleQueuePause: (name: QueueType) => void;
  onReplayDlq: () => void;
  onPurgeDlq: () => void;
  onSelectRun: (run: JobRun) => void;
}

export const QueuesTab: React.FC<QueuesTabProps> = ({
  language,
  queueMetrics,
  jobRuns,
  onToggleQueuePause,
  onReplayDlq,
  onPurgeDlq,
  onSelectRun
}) => {
  const t = translations[language];
  const dlqRuns = jobRuns.filter(r => r.status === 'dlq');

  return (
    <div className="space-y-6">
      {/* 1. Header Information */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#0D121C] border border-slate-800 rounded-xl gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Queue Partitions & Buffers</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fair-share priority queuing with exponential backoff, circuit breaking, and isolated DLQ storage
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReplayDlq}
            disabled={dlqRuns.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shadow-xs ${
              dlqRuns.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.replayDlq} ({dlqRuns.length})</span>
          </button>

          <button
            onClick={onPurgeDlq}
            disabled={dlqRuns.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
              dlqRuns.length > 0
                ? 'text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20'
                : 'text-slate-600 border-slate-800 bg-slate-900 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.purgeDlq}</span>
          </button>
        </div>
      </div>

      {/* 2. Three Master Queue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {queueMetrics.map((queue) => (
          <div key={queue.name} className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    queue.name === 'critical' ? 'bg-rose-500' :
                    queue.name === 'default' ? 'bg-indigo-500' : 'bg-slate-400'
                  }`} />
                  <span className="text-xs font-bold uppercase font-mono text-white tracking-wide">
                    {queue.name} Queue
                  </span>
                </div>

                <button
                  onClick={() => onToggleQueuePause(queue.name)}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                    queue.paused
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {queue.paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  <span>{queue.paused ? 'PAUSED' : 'ACTIVE'}</span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase">Waiting</div>
                  <div className="text-lg font-bold text-white mt-0.5 tabular-nums">{queue.waiting}</div>
                </div>

                <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase">In Flight</div>
                  <div className="text-lg font-bold text-indigo-400 mt-0.5 tabular-nums">{queue.active}</div>
                </div>

                <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase">Backoff Retry</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5 tabular-nums">{queue.delayed}</div>
                </div>

                <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase">DLQ Exceeded</div>
                  <div className="text-lg font-bold text-rose-400 mt-0.5 tabular-nums">{queue.failed}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Throughput:</span>
              <span className="text-slate-200 font-bold">{queue.throughputPerSec} tasks/sec</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Dead Letter Queue (DLQ) Deep Inspector */}
      <div className="bg-[#0D121C] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 bg-[#090D14] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-wider">
              Dead Letter Queue (DLQ) Quarantine Repository
            </h3>
          </div>
          <span className="text-xs text-rose-400 font-mono font-semibold">
            {dlqRuns.length} Quarantined Tasks
          </span>
        </div>

        {dlqRuns.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
            <span>Dead Letter Queue is empty. No tasks exceeded maximum retry budgets.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-mono uppercase bg-[#0B0F18]">
                  <th className="py-2.5 px-4">Run ID</th>
                  <th className="py-2.5 px-4">Job Name</th>
                  <th className="py-2.5 px-4">Attempts Exhausted</th>
                  <th className="py-2.5 px-4">Error Reason</th>
                  <th className="py-2.5 px-4">Idempotency Key</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {dlqRuns.map((run) => (
                  <tr 
                    key={run.id}
                    onClick={() => onSelectRun(run)}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 text-rose-400 font-semibold">{run.id}</td>
                    <td className="py-3 px-4 text-slate-200">{run.jobName}</td>
                    <td className="py-3 px-4 text-slate-400">{run.attempt}/{run.maxAttempts}</td>
                    <td className="py-3 px-4 text-rose-300 max-w-xs truncate">{run.error || 'Execution timeout'}</td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[140px]">{run.idempotencyKey}</td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectRun(run)}
                        className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 ml-auto"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Exponential Backoff & Full Jitter Theoretical Reference */}
      <div className="p-4 bg-[#090D14] border border-slate-800 rounded-xl flex items-start gap-3 text-xs font-mono text-slate-400">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200">
            Thundering Herd Prevention: Full Jitter Exponential Backoff Formula
          </div>
          <p className="text-slate-400">
            KRONOS schedules retries using: <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">delay = Math.random() * Math.min(maxDelay, baseDelay * (2 ** attempt))</code>.
            This mathematically disperses concurrent retry waves across available worker pools to prevent cascading overload on external upstream APIs.
          </p>
        </div>
      </div>
    </div>
  );
};
