import React, { useState } from 'react';
import { X, Plus, Layers, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Job, QueueType, JobType } from '../../types';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: Partial<Job>) => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<JobType>('recurring');
  const [cronExpression, setCronExpression] = useState('*/5 * * * *');
  const [intervalSeconds, setIntervalSeconds] = useState(15);
  const [queue, setQueue] = useState<QueueType>('default');
  const [priority, setPriority] = useState(50);
  const [maxRetries, setMaxRetries] = useState(3);
  const [backoff, setBackoff] = useState<'exponential' | 'linear'>('exponential');
  const [timeoutMs, setTimeoutMs] = useState(30000);
  const [idempotencyTemplate, setIdempotencyTemplate] = useState('task-{{tenantId}}-{{timestamp}}');
  const [payloadStr, setPayloadStr] = useState('{\n  "batchSize": 250,\n  "dryRun": false\n}');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a unique job name.');
      return;
    }

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(payloadStr);
    } catch {
      setError('Invalid JSON payload syntax.');
      return;
    }

    onSubmit({
      name: name.trim().toLowerCase().replace(/\s+/g, '_'),
      description: description.trim() || 'Custom registered task',
      tenantId: 'tenant_custom',
      type,
      cronExpression: type === 'cron' ? cronExpression : undefined,
      intervalSeconds: type === 'recurring' ? intervalSeconds : undefined,
      queue,
      priority,
      timeoutMs,
      idempotencyKeyTemplate: idempotencyTemplate,
      payload: parsedPayload,
      retryPolicy: {
        maxRetries,
        backoff,
        initialDelayMs: 2000,
        maxDelayMs: 30000,
        jitter: true
      },
      tags: ['user-created', queue]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-[#0D121C] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090D14]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Register Scheduled Job</h3>
              <p className="text-xs text-slate-400">Configure scheduling, priority queues & retry policies</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Job Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Job Identifier (snake_case)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              placeholder="e.g. sync_stripe_payouts"
              className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summarize the background execution objective"
              className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Schedule Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Schedule Mode</label>
              <div className="flex bg-[#090D14] p-1 border border-slate-800 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setType('recurring')}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${type === 'recurring' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Interval
                </button>
                <button
                  type="button"
                  onClick={() => setType('cron')}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${type === 'cron' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Cron Expr
                </button>
              </div>
            </div>

            <div>
              {type === 'recurring' ? (
                <>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Interval (Seconds)</label>
                  <input
                    type="number"
                    min="2"
                    max="86400"
                    value={intervalSeconds}
                    onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </>
              ) : (
                <>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cron Expression (5-Field)</label>
                  <input
                    type="text"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                    placeholder="0 0 1 * *"
                    className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </>
              )}
            </div>
          </div>

          {/* Queue & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Queue Partition</label>
              <select
                value={queue}
                onChange={(e) => setQueue(e.target.value as QueueType)}
                className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="critical">CRITICAL (Finance / Auth)</option>
                <option value="default">DEFAULT (Sync / API)</option>
                <option value="background">BACKGROUND (Sweepers / Reports)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priority ({priority}/100)
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* Retry Policy */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Retries</label>
              <input
                type="number"
                min="0"
                max="10"
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Backoff Strategy</label>
              <select
                value={backoff}
                onChange={(e) => setBackoff(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="exponential">Exponential + Full Jitter</option>
                <option value="linear">Linear Backoff</option>
              </select>
            </div>
          </div>

          {/* JSON Payload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              JSON Execution Payload
            </label>
            <textarea
              rows={3}
              value={payloadStr}
              onChange={(e) => setPayloadStr(e.target.value)}
              className="w-full p-2.5 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
            >
              Register & Enqueue Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
