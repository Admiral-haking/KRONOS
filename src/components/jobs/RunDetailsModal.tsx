import React from 'react';
import { X, CheckCircle2, Clock, Cpu, ShieldCheck, AlertCircle, FileCode } from 'lucide-react';
import { JobRun } from '../../types';

interface RunDetailsModalProps {
  run: JobRun | null;
  onClose: () => void;
}

export const RunDetailsModal: React.FC<RunDetailsModalProps> = ({ run, onClose }) => {
  if (!run) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#0D121C] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090D14]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white font-mono">{run.jobName}</h3>
              <span className="text-xs text-slate-500 font-mono">#{run.id}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Job Execution Telemetry & Audit Record</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg">
              <span className="text-slate-500 text-[10px] block">Status</span>
              <span className={`font-semibold mt-1 inline-block ${
                run.status === 'completed' ? 'text-emerald-400' :
                run.status === 'running' ? 'text-indigo-400' :
                run.status === 'dlq' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {run.status.toUpperCase()}
              </span>
            </div>

            <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg">
              <span className="text-slate-500 text-[10px] block">Queue</span>
              <span className="font-semibold text-slate-200 mt-1 inline-block uppercase">
                {run.queue}
              </span>
            </div>

            <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg">
              <span className="text-slate-500 text-[10px] block">Attempts</span>
              <span className="font-semibold text-slate-200 mt-1 inline-block">
                {run.attempt} / {run.maxAttempts}
              </span>
            </div>

            <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg">
              <span className="text-slate-500 text-[10px] block">Duration</span>
              <span className="font-semibold text-slate-200 mt-1 inline-block">
                {run.durationMs ? `${run.durationMs}ms` : 'in flight'}
              </span>
            </div>
          </div>

          {/* Distributed Guarantees Card */}
          <div className="p-4 bg-[#090D14] border border-slate-800 rounded-lg space-y-2 text-xs font-mono">
            <div className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Distributed Execution Guarantees</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Idempotency Key:</span>
              <span className="text-slate-200 select-all">{run.idempotencyKey}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Fencing Token:</span>
              <span className="text-emerald-400 select-all">TOKEN-{run.fencingToken}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Worker Hostname:</span>
              <span className="text-slate-200">{run.workerHostname || 'N/A'}</span>
            </div>
          </div>

          {/* Error Banner if DLQ */}
          {run.error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs font-mono text-rose-300">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Execution Error Trace:</span>
              </div>
              <p className="whitespace-pre-wrap">{run.error}</p>
            </div>
          )}

          {/* Output Payload */}
          {run.output && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-slate-400" />
                <span>Result Output Payload</span>
              </h4>
              <pre className="p-3 bg-[#090D14] border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto">
                {JSON.stringify(run.output, null, 2)}
              </pre>
            </div>
          )}

          {/* Execution Log Stream */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Step Log Journal</h4>
            <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
              {run.logs && run.logs.length > 0 ? (
                run.logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(log.timestamp).toISOString().split('T')[1].slice(0, 8)}
                    </span>
                    <span className={`text-[10px] font-bold uppercase shrink-0 ${
                      log.level === 'error' ? 'text-rose-400' :
                      log.level === 'warn' ? 'text-amber-400' : 'text-indigo-400'
                    }`}>
                      [{log.level}]
                    </span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic">No logs recorded for this run.</div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#090D14] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
