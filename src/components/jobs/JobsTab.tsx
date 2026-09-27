import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Layers, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  Tag,
  Filter
} from 'lucide-react';
import { Language, translations } from '../../locales/translations';
import { Job, JobRun, QueueType } from '../../types';
import { CreateJobModal } from './CreateJobModal';
import { RunDetailsModal } from './RunDetailsModal';

interface JobsTabProps {
  language: Language;
  jobs: Job[];
  jobRuns: JobRun[];
  onTriggerJob: (id: string) => void;
  onToggleJobStatus: (id: string) => void;
  onRegisterJob: (job: Partial<Job>) => void;
}

export const JobsTab: React.FC<JobsTabProps> = ({
  language,
  jobs,
  jobRuns,
  onTriggerJob,
  onToggleJobStatus,
  onRegisterJob
}) => {
  const t = translations[language];
  const [search, setSearch] = useState('');
  const [selectedQueue, setSelectedQueue] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<JobRun | null>(null);
  const [activeJobDetails, setActiveJobDetails] = useState<Job | null>(null);

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.name.toLowerCase().includes(search.toLowerCase()) || 
                          j.description.toLowerCase().includes(search.toLowerCase()) ||
                          j.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesQueue = selectedQueue === 'all' || j.queue === selectedQueue;
    return matchesSearch && matchesQueue;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search & Queue Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by job name, tags, or description..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0D121C] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Functional Segmented Controls for Filter (Allowed per guidelines) */}
          <div className="flex items-center bg-[#0D121C] p-1 border border-slate-800 rounded-lg text-xs font-mono">
            {['all', 'critical', 'default', 'background'].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQueue(q)}
                className={`px-3 py-1 rounded-md transition-colors uppercase text-[11px] ${
                  selectedQueue === q
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Action: Create Job */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.createJob}</span>
        </button>
      </div>

      {/* Main Jobs Table */}
      <div className="bg-[#0D121C] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#090D14] text-[11px] text-slate-400 font-mono uppercase">
                <th className="py-3 px-4">Job Name & Description</th>
                <th className="py-3 px-4">Queue</th>
                <th className="py-3 px-4">Schedule / Cadence</th>
                <th className="py-3 px-4 text-right">Priority</th>
                <th className="py-3 px-4">Next Run</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    No scheduled jobs match your criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const secondsRemaining = Math.max(0, Math.floor((job.nextRunAt - Date.now()) / 1000));
                  return (
                    <tr 
                      key={job.id} 
                      className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      onClick={() => setActiveJobDetails(job)}
                    >
                      {/* Name & Description */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                            {job.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans mt-0.5 line-clamp-1 max-w-sm">
                          {job.description}
                        </p>
                      </td>

                      {/* Queue */}
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-semibold uppercase ${
                          job.queue === 'critical' ? 'text-rose-400' :
                          job.queue === 'default' ? 'text-indigo-400' : 'text-slate-400'
                        }`}>
                          {job.queue}
                        </span>
                      </td>

                      {/* Schedule Cadence */}
                      <td className="py-3 px-4 text-slate-300">
                        {job.type === 'cron' ? (
                          <div className="flex items-center gap-1.5 text-indigo-300">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{job.cronExpression}</span>
                          </div>
                        ) : (
                          <div className="text-slate-300">
                            every {job.intervalSeconds}s
                          </div>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 text-right font-bold text-slate-200 tabular-nums">
                        {job.priority}/100
                      </td>

                      {/* Next Run Countdown */}
                      <td className="py-3 px-4 text-slate-400">
                        {job.status === 'active' ? (
                          <span className="text-emerald-400 font-semibold tabular-nums">
                            in {secondsRemaining}s
                          </span>
                        ) : (
                          <span className="text-slate-500">paused</span>
                        )}
                      </td>

                      {/* State */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                          job.status === 'active' ? 'text-emerald-400' : 'text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                          {job.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onTriggerJob(job.id)}
                            title="Trigger Immediate Execution"
                            className="p-1.5 rounded text-indigo-400 hover:text-white hover:bg-indigo-600 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onToggleJobStatus(job.id)}
                            title={job.status === 'active' ? 'Pause Job' : 'Resume Job'}
                            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            {job.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Job Inspection Drawer / Section */}
      {activeJobDetails && (
        <div className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white font-mono">{activeJobDetails.name}</span>
                <span className="text-xs text-slate-500 font-mono">ID: {activeJobDetails.id}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{activeJobDetails.description}</p>
            </div>
            <button
              onClick={() => setActiveJobDetails(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
            >
              Close Drawer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Retry Policy Box */}
            <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Retry Policy</div>
              <div className="text-slate-200">Max Attempts: {activeJobDetails.retryPolicy.maxRetries}</div>
              <div className="text-slate-400">Backoff: {activeJobDetails.retryPolicy.backoff} (jitter: yes)</div>
              <div className="text-slate-400">Timeout: {activeJobDetails.timeoutMs}ms</div>
            </div>

            {/* Idempotency Config */}
            <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Guarantees</div>
              <div className="text-slate-200">Delivery: Exactly-Once</div>
              <div className="text-slate-400 truncate">Template: {activeJobDetails.idempotencyKeyTemplate || 'none'}</div>
              <div className="text-slate-400">Concurrency: {activeJobDetails.concurrencyLimit} slots</div>
            </div>

            {/* Performance Stats */}
            <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Lifetime Runs</div>
              <div className="text-slate-200 font-bold text-base">{activeJobDetails.totalRuns}</div>
              <div className="text-rose-400 text-xs">{activeJobDetails.failedRuns} DLQ incidents</div>
            </div>
          </div>

          {/* JSON Payload Inspector */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-1 font-mono">Payload Schema</div>
            <pre className="p-3 bg-[#090D14] border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto">
              {JSON.stringify(activeJobDetails.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Recent Dispatched Runs Stream Table */}
      <div className="bg-[#0D121C] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 bg-[#090D14] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-wider">
            All Execution Runs Journal
          </h3>
          <span className="text-xs text-slate-500 font-mono">{jobRuns.length} total captured</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-mono uppercase bg-[#0B0F18]">
                <th className="py-2.5 px-4">Run ID</th>
                <th className="py-2.5 px-4">Job Name</th>
                <th className="py-2.5 px-4">Worker Node</th>
                <th className="py-2.5 px-4">Token</th>
                <th className="py-2.5 px-4">Attempt</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {jobRuns.slice(0, 10).map((run) => (
                <tr 
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-4 text-indigo-400 font-semibold">{run.id}</td>
                  <td className="py-2.5 px-4 text-slate-200">{run.jobName}</td>
                  <td className="py-2.5 px-4 text-slate-400">{run.workerHostname || 'awaiting'}</td>
                  <td className="py-2.5 px-4 text-slate-400">{run.fencingToken}</td>
                  <td className="py-2.5 px-4 text-slate-300">{run.attempt}/{run.maxAttempts}</td>
                  <td className="py-2.5 px-4">
                    <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                      run.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      run.status === 'running' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      run.status === 'dlq' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}>
                      {run.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400 tabular-nums">
                    {run.durationMs ? `${run.durationMs}ms` : 'active...'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateJobModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={onRegisterJob}
      />

      <RunDetailsModal
        run={selectedRun}
        onClose={() => setSelectedRun(null)}
      />
    </div>
  );
};
