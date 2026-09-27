import React, { useState } from 'react';
import { 
  Github, 
  Copy, 
  Check, 
  ExternalLink, 
  Star, 
  GitFork, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  FileText,
  Layers,
  Cpu,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Language } from '../../locales/translations';

interface ReadmeTabProps {
  language: Language;
}

export const ReadmeTab: React.FC<ReadmeTabProps> = ({ language }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyText = (section: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const cloneCmd = `git clone https://github.com/your-username/kronos-distributed-scheduler.git\ncd kronos-distributed-scheduler\nnpm install\nnpm run dev`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* GitHub Repository Top Header Banner */}
      <div className="p-6 bg-[#0D121C] border border-slate-800 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold font-mono text-white tracking-tight">KRONOS</h1>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                    v1.0.0-production
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Distributed Job Scheduler & Directed Acyclic Graph (DAG) Workflow Orchestrator
                </p>
              </div>
            </div>

            {/* Badges Strip */}
            <div className="flex flex-wrap items-center gap-2 mt-4 font-mono text-[11px]">
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                TypeScript 5.8
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                Apache 2.0
              </span>
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                Raft Consensus
              </span>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                Exactly-Once Fencing
              </span>
              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded">
                Dead Letter Queue (DLQ)
              </span>
            </div>
          </div>

          {/* Quick GitHub CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
            <button
              onClick={() => copyText('clone', cloneCmd)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              {copiedSection === 'clone' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSection === 'clone' ? 'Commands Copied!' : 'Copy Clone Command'}</span>
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Star on GitHub</span>
            </a>
          </div>
        </div>
      </div>

      {/* Visual System Architecture Diagram Card */}
      <div className="p-6 bg-[#0D121C] border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              High-Level Distributed Topology & Data Flow
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">ASCII Architectural Blueprint</span>
        </div>

        <pre className="p-5 bg-[#080B10] border border-slate-800/80 rounded-lg text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
{`                     [ Client Microservices & External Trigger Events ]
                                      │
                                      ▼ HTTPS / OpenAPI 3.1
             ┌──────────────────────────────────────────────────────────┐
             │       API Gateway & Tenant Rate Limiter (Leaky Bucket)   │
             │     • Multi-Tenant Isolation  • HMAC-SHA256 Token Auth   │
             └────────────────────────────┬─────────────────────────────┘
                                          │
                                          ▼
             ┌──────────────────────────────────────────────────────────┐
             │        Raft Consensus Core & Leader Coordinator          │
             │   [Node 01: LEADER] ───heartbeat─── [Node 02: FOLLOWER]   │
             │           │                                              │
             │    Evaluates Cron Tick Loop (500ms Drift-Compensated)     │
             │    Issues Monotonic Fencing Token (TOKEN-1042++)         │
             └────────────────────────────┬─────────────────────────────┘
                                          │ Enqueues Task Envelopes
                                          ▼
             ┌──────────────────────────────────────────────────────────┐
             │          Prioritized Redis / Postgres Buffer Queues      │
             │   • CRITICAL (90-100)   • DEFAULT (40-60)   • BG (1-30)  │
             │   • Delayed Retry Queue with Full Jitter Backoff         │
             │   • Dead Letter Queue (DLQ) Quarantine Repository        │
             └────────────────────────────┬─────────────────────────────┘
                                          │ Worker Dequeue
                                          ▼
             ┌──────────────────────────────────────────────────────────┐
             │            Elastic Distributed Worker Pool Fleet         │
             │     [worker-eu-west-1a]   [worker-eu-west-1b]   [...]    │
             │     • Heartbeat Registry  • Concurrency Slot Enforcement │
             │     • Idempotency Check   • Parallel DAG Branch Fan-out  │
             └────────────────────────────┬─────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
         [ PostgreSQL Storage Layer ]                [ Real-time Observability ]
          • Jobs / Workflows Definitions              • Prometheus /metrics
          • Partitioned Run Logs                      • OpenTelemetry Spans
          • Immutable SHA-256 Audit Trail             • Structured JSON Logs`}
        </pre>
      </div>

      {/* 6 Key Architectural Tenets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Exactly-Once Semantics</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Combines unique idempotency keys with strictly monotonic <strong>Fencing Tokens</strong>. Prevents split-brain state mutations during GC pauses or network partitions.
          </p>
        </div>

        <div className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Raft Leader Election</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Only the active cluster leader ticks the scheduler loop. If lease renewal fails, followers immediately initiate term elections ($Term\ N \to Term\ N+1$) with automatic failover.
          </p>
        </div>

        <div className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <GitFork className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">DAG Workflow Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Executes complex multi-branch graphs with <strong>Kahn's Topological Sort</strong> for cycle prevention, parallel branching, timeout triggers, and step rollbacks.
          </p>
        </div>

        <div className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Thundering Herd Defense</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Exponential backoff with mathematical <strong>Full Jitter</strong> disperses retry spikes across time windows, preventing downstream cascade service outages.
          </p>
        </div>

        <div className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">DLQ Quarantine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tasks exceeding maximum retry attempts are safely quarantined into the Dead Letter Queue for forensic analysis, manual payload editing, and batch replay.
          </p>
        </div>

        <div className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Terminal className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Prometheus & OpenTelemetry</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Native <code className="text-indigo-300">/metrics</code> scraper endpoint for Grafana/Prometheus along with structured JSON log streaming and trace spans.
          </p>
        </div>
      </div>

      {/* GitHub README Markdown Code Block */}
      <div className="bg-[#0D121C] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 bg-[#090D14] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-wider">
              README.md Source Code (Ready for Repository Root)
            </h3>
          </div>

          <button
            onClick={() => copyText('readme', `# KRONOS - Distributed Job Scheduler\n\nFull README generated in repository.`)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            {copiedSection === 'readme' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'readme' ? 'Copied' : 'Copy README.md'}</span>
          </button>
        </div>

        <div className="p-5 bg-[#080B10] font-mono text-xs text-slate-300 max-h-[380px] overflow-y-auto leading-relaxed">
          <p className="text-indigo-400 font-bold mb-2"># Quick Setup & Execution</p>
          <pre className="text-slate-400 whitespace-pre-wrap">{`git clone https://github.com/your-username/kronos-distributed-scheduler.git
cd kronos-distributed-scheduler
npm install
npm run dev

# Testing & Linting
npm run lint
npm run build`}</pre>
          <p className="text-indigo-400 font-bold mt-4 mb-2"># Prometheus Scrape Configuration</p>
          <pre className="text-slate-400 whitespace-pre-wrap">{`scrape_configs:
  - job_name: 'kronos_scheduler'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['localhost:3000']`}</pre>
        </div>
      </div>
    </div>
  );
};
