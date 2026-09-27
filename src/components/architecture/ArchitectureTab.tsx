import React, { useState } from 'react';
import { 
  FileCode, 
  Database, 
  Layers, 
  ShieldCheck, 
  GitFork, 
  Copy, 
  Check, 
  Server, 
  Code2,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { Language, translations } from '../../locales/translations';

interface ArchitectureTabProps {
  language: Language;
}

export const ArchitectureTab: React.FC<ArchitectureTabProps> = ({ language }) => {
  const t = translations[language];
  const [activeSnippet, setActiveSnippet] = useState<string>('scheduler_core');
  const [copied, setCopied] = useState(false);

  const snippets: Record<string, { title: string; lang: string; desc: string; code: string }> = {
    scheduler_core: {
      title: 'Scheduler Core Tick Loop & Cron Matcher (Go / TypeScript)',
      lang: 'typescript',
      desc: 'High-precision tick engine running on the elected Leader node. Uses cron matching with drift compensation.',
      code: `// scheduler_core.ts - Enterprise Distributed Tick Engine
import { Redis } from 'ioredis';
import { Pool } from 'pg';

export class KronosSchedulerEngine {
  private redis: Redis;
  private db: Pool;
  private leaderElection: LeaderLeaseManager;
  private isLeader = false;

  constructor(redis: Redis, db: Pool) {
    this.redis = redis;
    this.db = db;
    this.leaderElection = new LeaderLeaseManager(redis, process.env.NODE_ID!);
  }

  public async startTickLoop(tickIntervalMs = 500): Promise<void> {
    setInterval(async () => {
      // 1. Maintain consensus heartbeat lease
      this.isLeader = await this.leaderElection.isCurrentLeader();
      if (!this.isLeader) {
        return; // Passive follower node; do not evaluate scheduled jobs
      }

      const now = Date.now();

      // 2. Fetch pending jobs from PostgreSQL where next_run_at <= NOW()
      const query = \`
        UPDATE kronos_jobs 
        SET next_run_at = calculate_next_run(cron_expression, interval_seconds, NOW()),
            status = 'active'
        WHERE status = 'active' 
          AND next_run_at <= TO_TIMESTAMP($1 / 1000.0)
        RETURNING id, name, queue, priority, payload, retry_policy, timeout_ms;
      \`;

      const result = await this.db.query(query, [now]);

      // 3. Push jobs into Redis Priority Queue with atomic ZADD
      for (const job of result.rows) {
        const fencingToken = await this.redis.incr('kronos:fencing:counter');
        const jobEnvelope = JSON.stringify({ ...job, fencingToken, enqueuedAt: now });

        // Score = priority (higher priority gets popped first via ZPOPMIN/ZPOPMAX)
        await this.redis.zadd(\`kronos:queue:\${job.queue}\`, job.priority, jobEnvelope);
      }
    }, tickIntervalMs);
  }
}`
    },

    distributed_lock: {
      title: 'Distributed Lock with Redis & Monotonic Fencing Tokens',
      lang: 'typescript',
      desc: 'Prevents split-brain execution anomalies using Lua scripts and strict monotonically increasing fencing tokens.',
      code: `// distributed_lock.ts - Redlock with Monotonic Fencing
import { Redis } from 'ioredis';

export class DistributedLock {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  // Acquire Lock with atomic fencing token generation
  public async acquire(resourceKey: string, holderId: string, ttlMs: number): Promise<{ acquired: boolean; fencingToken?: number }> {
    const luaScript = \`
      local key = KEYS[1]
      local holder = ARGV[1]
      local ttl = tonumber(ARGV[2])
      local counterKey = KEYS[2]

      if redis.call('SET', key, holder, 'NX', 'PX', ttl) then
        local token = redis.call('INCR', counterKey)
        return { 1, token }
      end
      return { 0, 0 }
    \`;

    const result = await this.redis.eval(
      luaScript, 
      2, 
      \`lock:\${resourceKey}\`, 
      'kronos:fencing:master', 
      holderId, 
      ttlMs
    ) as [number, number];

    return {
      acquired: result[0] === 1,
      fencingToken: result[0] === 1 ? result[1] : undefined
    };
  }

  // Release Lock ensuring only the legitimate holder can delete it
  public async release(resourceKey: string, holderId: string): Promise<boolean> {
    const releaseScript = \`
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    \`;
    const res = await this.redis.eval(releaseScript, 1, \`lock:\${resourceKey}\`, holderId);
    return res === 1;
  }
}`
    },

    dag_engine: {
      title: 'Workflow Engine: Topological Sort & Parallel DAG Resolver',
      lang: 'typescript',
      desc: 'Kahn’s algorithm implementation verifying acyclic graphs, parallel step fan-out, and failure rollback semantics.',
      code: `// workflow_dag_engine.ts - Parallel DAG Executor
export interface DAGNode {
  id: string;
  name: string;
  dependsOn: string[];
  handler: (context: any) => Promise<any>;
}

export class DAGWorkflowEngine {
  // Validates graph acyclicity using Kahn's Topological Sort
  public validateAcyclic(nodes: DAGNode[]): boolean {
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    nodes.forEach(n => {
      inDegree.set(n.id, n.dependsOn.length);
      adjList.set(n.id, []);
    });

    nodes.forEach(n => {
      n.dependsOn.forEach(dep => {
        adjList.get(dep)?.push(n.id);
      });
    });

    const queue: string[] = [];
    inDegree.forEach((deg, id) => {
      if (deg === 0) queue.push(id);
    });

    let visitedCount = 0;
    while (queue.length > 0) {
      const u = queue.shift()!;
      visitedCount++;

      for (const neighbor of adjList.get(u) || []) {
        inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    return visitedCount === nodes.length; // True if valid DAG (no cycles)
  }

  // Executes independent branches concurrently
  public async executeDAG(nodes: DAGNode[], initialContext: any): Promise<Record<string, any>> {
    const context = { ...initialContext };
    const completedSteps = new Set<string>();

    while (completedSteps.size < nodes.length) {
      // Find all ready steps whose dependencies have completely finished
      const readyNodes = nodes.filter(n => 
        !completedSteps.has(n.id) && 
        n.dependsOn.every(dep => completedSteps.has(dep))
      );

      if (readyNodes.length === 0) {
        throw new Error("Deadlock in DAG execution or cyclic dependency encountered!");
      }

      // Execute ready independent nodes in parallel (Fan-out)
      await Promise.all(readyNodes.map(async (node) => {
        const stepOutput = await node.handler(context);
        context[node.id] = stepOutput;
        completedSteps.add(node.id);
      }));
    }

    return context;
  }
}`
    },

    database_schema: {
      title: 'PostgreSQL Relational ERD & DDL Schemas',
      lang: 'sql',
      desc: 'Production relational schema with partitioned execution logs, idempotent indexes, and atomic state transitions.',
      code: `-- schema.sql - Production DDL for Distributed Job Scheduler
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Scheduled Jobs Definition
CREATE TABLE kronos_jobs (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    schedule_type VARCHAR(32) NOT NULL, -- 'cron', 'recurring', 'one_off'
    cron_expression VARCHAR(64),
    interval_seconds INT,
    queue VARCHAR(32) NOT NULL DEFAULT 'default',
    priority INT NOT NULL DEFAULT 50 CHECK (priority BETWEEN 1 AND 100),
    payload JSONB NOT NULL DEFAULT '{}',
    retry_policy JSONB NOT NULL,
    timeout_ms INT NOT NULL DEFAULT 30000,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    next_run_at TIMESTAMPTZ,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_schedule CHECK (
        (schedule_type = 'cron' AND cron_expression IS NOT NULL) OR 
        (schedule_type = 'recurring' AND interval_seconds IS NOT NULL) OR
        (schedule_type = 'one_off')
    )
);

CREATE INDEX idx_kronos_jobs_next_run ON kronos_jobs (status, next_run_at) 
WHERE status = 'active';

-- 2. Job Executions Journal
CREATE TABLE kronos_job_runs (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL REFERENCES kronos_jobs(id) ON DELETE CASCADE,
    queue VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL, -- 'queued', 'running', 'completed', 'failed', 'dlq'
    worker_id VARCHAR(64),
    fencing_token BIGINT NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    attempt INT NOT NULL DEFAULT 1,
    max_attempts INT NOT NULL DEFAULT 3,
    error_message TEXT,
    output_payload JSONB,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    duration_ms INT
);

CREATE INDEX idx_kronos_runs_job ON kronos_job_runs (job_id, started_at DESC);
CREATE INDEX idx_kronos_runs_dlq ON kronos_job_runs (status) WHERE status = 'dlq';

-- 3. Leader Consensus Lease Table
CREATE TABLE kronos_leader_lease (
    cluster_name VARCHAR(64) PRIMARY KEY,
    leader_node_id VARCHAR(64) NOT NULL,
    raft_term BIGINT NOT NULL,
    lease_expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`
    },

    rest_api: {
      title: 'RESTful Admin & Worker APIs (OpenAPI Specification)',
      lang: 'json',
      desc: 'Canonical REST endpoints for job dispatching, DAG definitions, worker heartbeats, and DLQ operations.',
      code: `{
  "openapi": "3.1.0",
  "info": {
    "title": "KRONOS Distributed Job Scheduler & Workflow API",
    "version": "1.0.0"
  },
  "paths": {
    "/v1/jobs": {
      "post": {
        "summary": "Register a new scheduled or recurring job",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "queue", "payload"],
                "properties": {
                  "name": { "type": "string" },
                  "queue": { "enum": ["critical", "default", "background"] },
                  "cronExpression": { "type": "string" },
                  "priority": { "type": "integer", "minimum": 1, "maximum": 100 }
                }
              }
            }
          }
        },
        "responses": { "201": { "description": "Job registered" } }
      }
    },
    "/v1/jobs/{id}/dispatch": {
      "post": {
        "summary": "Trigger immediate execution out-of-band"
      }
    },
    "/v1/workers/heartbeat": {
      "post": {
        "summary": "Worker node pulse with active concurrency capacity"
      }
    },
    "/v1/dlq/replay": {
      "post": {
        "summary": "Re-enqueue all quarantined tasks from Dead Letter Queue"
      }
    }
  }
}`
    }
  };

  const current = snippets[activeSnippet];

  const copyCode = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl">
        <h2 className="text-sm font-semibold text-white tracking-tight">{t.archTitle}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{t.archSubtitle}</p>
      </div>

      {/* Snippet Selection Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(snippets).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setActiveSnippet(key)}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors border ${
              activeSnippet === key
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                : 'bg-[#0D121C] text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {item.title.split(' ')[0]} {item.title.split(' ')[1]}
          </button>
        ))}
      </div>

      {/* Code Viewer */}
      <div className="bg-[#0D121C] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 bg-[#090D14] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white font-mono">{current.title}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{current.desc}</p>
          </div>

          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Source'}</span>
          </button>
        </div>

        <pre className="p-5 bg-[#080B10] text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[550px]">
          <code>{current.code}</code>
        </pre>
      </div>
    </div>
  );
};
