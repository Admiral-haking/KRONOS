export type QueueType = 'critical' | 'default' | 'background';

export type JobType = 'cron' | 'one_off' | 'recurring' | 'delayed';

export type JobStatus = 'active' | 'paused' | 'completed' | 'failed';

export type RunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'retrying' | 'dlq';

export interface RetryPolicy {
  maxRetries: number;
  backoff: 'exponential' | 'linear';
  initialDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
}

export interface Job {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  type: JobType;
  cronExpression?: string;
  intervalSeconds?: number;
  queue: QueueType;
  priority: number; // 1-100, 100 highest
  payload: Record<string, any>;
  status: JobStatus;
  nextRunAt: number;
  lastRunAt?: number;
  retryPolicy: RetryPolicy;
  timeoutMs: number;
  idempotencyKeyTemplate?: string;
  tags: string[];
  createdAt: number;
  concurrencyLimit: number;
  totalRuns: number;
  failedRuns: number;
}

export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
}

export interface JobRun {
  id: string;
  jobId: string;
  jobName: string;
  queue: QueueType;
  status: RunStatus;
  workerId?: string;
  workerHostname?: string;
  startedAt?: number;
  finishedAt?: number;
  durationMs?: number;
  attempt: number;
  maxAttempts: number;
  error?: string;
  output?: Record<string, any>;
  fencingToken: number;
  idempotencyKey: string;
  logs: LogEntry[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  handler: string;
  dependsOn: string[];
  timeoutMs: number;
  actionType: 'webhook' | 'function' | 'database' | 'storage' | 'notification';
  position: { x: number; y: number };
  config?: Record<string, any>;
}

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  version: number;
  steps: WorkflowStep[];
  triggers: {
    cron?: string;
    event?: string;
  };
  createdAt: number;
  lastRunAt?: number;
  totalRuns: number;
}

export type StepRunStatus = 'pending' | 'waiting' | 'running' | 'completed' | 'failed' | 'retrying' | 'skipped';

export interface WorkflowStepRun {
  stepId: string;
  status: StepRunStatus;
  startedAt?: number;
  finishedAt?: number;
  durationMs?: number;
  attempt: number;
  workerId?: string;
  error?: string;
  output?: any;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  startedAt: number;
  finishedAt?: number;
  context: Record<string, any>;
  stepRuns: Record<string, WorkflowStepRun>;
  activeStepIds: string[];
}

export interface WorkerNode {
  id: string;
  hostname: string;
  datacenter: string;
  status: 'healthy' | 'draining' | 'dead' | 'busy';
  concurrency: number;
  activeJobsCount: number;
  lastHeartbeat: number;
  cpuUsage: number;
  memoryMb: number;
  processedTotal: number;
  failuresTotal: number;
}

export interface ClusterNode {
  id: string;
  hostname: string;
  role: 'leader' | 'follower' | 'candidate';
  term: number;
  votedFor?: string;
  leaseRemainingMs: number;
  maxLeaseMs: number;
  lastTickAt: number;
  status: 'online' | 'partitioned' | 'crashed';
}

export interface DistributedLock {
  key: string;
  holderNodeId: string;
  fencingToken: number;
  acquiredAt: number;
  ttlMs: number;
  expiresAt: number;
  resource: string;
}

export interface QueueMetric {
  name: QueueType;
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  paused: boolean;
  throughputPerSec: number;
}

export interface SystemMetrics {
  uptimeSeconds: number;
  totalJobsRegistered: number;
  totalRunsExecuted: number;
  successRatePercent: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  throughputHistory: Array<{ timestamp: number; rate: number }>;
}

export interface Tenant {
  id: string;
  name: string;
  tier: 'free' | 'growth' | 'enterprise';
  quotaMonthlyRuns: number;
  usedRunsThisMonth: number;
  maxConcurrency: number;
  rateLimitPerSec: number;
  activeJobsCount: number;
  webhookEndpointsCount: number;
  createdAt: number;
}

export interface AuditLog {
  id: string;
  actor: string;
  actorRole: 'admin' | 'scheduler_core' | 'worker_agent' | 'tenant_api';
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress?: string;
  timestamp: number;
  status: 'success' | 'warning' | 'denied';
}

export interface WebhookSubscription {
  id: string;
  tenantId: string;
  url: string;
  events: Array<'job.dispatched' | 'job.completed' | 'job.failed' | 'workflow.completed' | 'dlq.threshold_exceeded'>;
  hmacSecret: string;
  isActive: boolean;
  totalDelivered: number;
  totalFailed: number;
  lastDeliveredAt?: number;
}
