import { 
  Job, 
  JobRun, 
  Workflow, 
  WorkflowRun, 
  WorkerNode, 
  ClusterNode, 
  DistributedLock, 
  QueueMetric, 
  SystemMetrics, 
  LogEntry,
  QueueType,
  RunStatus,
  Tenant,
  AuditLog,
  WebhookSubscription 
} from '../types';
import { 
  initialJobs, 
  initialWorkflows, 
  initialWorkers, 
  initialClusterNodes, 
  initialLocks, 
  initialQueueMetrics,
  initialTenants,
  initialAuditLogs,
  initialWebhooks
} from '../data/initialData';

export interface SimulatorState {
  jobs: Job[];
  jobRuns: JobRun[];
  workflows: Workflow[];
  workflowRuns: WorkflowRun[];
  workers: WorkerNode[];
  clusterNodes: ClusterNode[];
  locks: DistributedLock[];
  queueMetrics: QueueMetric[];
  metrics: SystemMetrics;
  logs: LogEntry[];
  tenants: Tenant[];
  auditLogs: AuditLog[];
  webhooks: WebhookSubscription[];
  clockSpeed: number; // 0.5, 1, 2, 5
  isEngineRunning: boolean;
  chaosMode: boolean; // flakiness
  selectedWorkflowRunId?: string;
  fencingTokenCounter: number;
}

type Listener = (state: SimulatorState) => void;

class SimulatorEngine {
  private state: SimulatorState;
  private listeners: Set<Listener> = new Set();
  private intervalId: number | null = null;

  constructor() {
    this.state = {
      jobs: [...initialJobs],
      jobRuns: this.createInitialRuns(),
      workflows: [...initialWorkflows],
      workflowRuns: [],
      workers: [...initialWorkers],
      clusterNodes: [...initialClusterNodes],
      locks: [...initialLocks],
      queueMetrics: [...initialQueueMetrics],
      metrics: {
        uptimeSeconds: 84320,
        totalJobsRegistered: initialJobs.length,
        totalRunsExecuted: 6280,
        successRatePercent: 99.4,
        p50LatencyMs: 42,
        p95LatencyMs: 148,
        p99LatencyMs: 380,
        throughputHistory: Array.from({ length: 24 }).map((_, i) => ({
          timestamp: Date.now() - (23 - i) * 2000,
          rate: Math.floor(40 + Math.sin(i / 3) * 15 + Math.random() * 8)
        }))
      },
      logs: [
        { timestamp: Date.now() - 5000, level: 'info', message: 'Kronos Core tick loop initialized. Leader: scheduler-node-01 (Term 14)' },
        { timestamp: Date.now() - 4000, level: 'info', message: 'Worker fleet discovery: 4 nodes registered across 3 datacenters.' },
        { timestamp: Date.now() - 3000, level: 'debug', message: 'Distributed lock acquired on finance.invoices.batch by scheduler-node-01 (fencing: 1042)' },
        { timestamp: Date.now() - 2000, level: 'info', message: 'Queue metrics loaded: critical(1 wait, 2 act), default(3 wait, 3 act), background(4 wait, 1 act)' },
      ],
      tenants: [...initialTenants],
      auditLogs: [...initialAuditLogs],
      webhooks: [...initialWebhooks],
      clockSpeed: 1,
      isEngineRunning: true,
      chaosMode: false,
      fencingTokenCounter: 1050,
    };

    this.startClock();
  }

  private createInitialRuns(): JobRun[] {
    return [
      {
        id: 'run_inv_982',
        jobId: 'job_inv_monthly',
        jobName: 'generate_monthly_invoices',
        queue: 'critical',
        status: 'running',
        workerId: 'worker-eu-west-1a',
        workerHostname: 'worker-01.eu-west-1',
        startedAt: Date.now() - 14000,
        attempt: 1,
        maxAttempts: 3,
        fencingToken: 1042,
        idempotencyKey: 'inv-tenant_fintech-2026-09',
        logs: [
          { timestamp: Date.now() - 14000, level: 'info', message: 'Acquired distributed lock & idempotency token.' },
          { timestamp: Date.now() - 10000, level: 'info', message: 'Computed usage records for 4,210 accounts.' },
          { timestamp: Date.now() - 3000, level: 'info', message: 'Generating PDF invoices and dispatching webhook batch.' }
        ]
      },
      {
        id: 'run_wh_551',
        jobId: 'job_webhook_dispatcher',
        jobName: 'dispatch_partner_order_webhooks',
        queue: 'critical',
        status: 'completed',
        workerId: 'worker-us-east-1a',
        workerHostname: 'worker-03.us-east-1',
        startedAt: Date.now() - 32000,
        finishedAt: Date.now() - 30500,
        durationMs: 1500,
        attempt: 1,
        maxAttempts: 4,
        fencingToken: 1041,
        idempotencyKey: 'wh-order-984210',
        output: { statusCode: 200, deliveryLatencyMs: 82, partnerAck: 'ACK-88129' },
        logs: [
          { timestamp: Date.now() - 32000, level: 'info', message: 'Computing HMAC-SHA256 signature.' },
          { timestamp: Date.now() - 30500, level: 'info', message: 'HTTP 200 OK received from partner webhook endpoint.' }
        ]
      },
      {
        id: 'run_wh_550_dlq',
        jobId: 'job_webhook_dispatcher',
        jobName: 'dispatch_partner_order_webhooks',
        queue: 'critical',
        status: 'dlq',
        workerId: 'worker-eu-west-1b',
        workerHostname: 'worker-02.eu-west-1',
        startedAt: Date.now() - 120000,
        finishedAt: Date.now() - 110000,
        durationMs: 10000,
        attempt: 4,
        maxAttempts: 4,
        error: 'HTTP 504 Gateway Timeout: Upstream endpoint https://api.logistics.io failed after 4 retries with exponential backoff.',
        fencingToken: 1039,
        idempotencyKey: 'wh-order-984180',
        logs: [
          { timestamp: Date.now() - 120000, level: 'warn', message: 'Attempt 4/4 failed with timeout.' },
          { timestamp: Date.now() - 110000, level: 'error', message: 'Maximum retries exhausted. Moved to Dead Letter Queue (DLQ).' }
        ]
      }
    ];
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  public getState(): SimulatorState {
    return this.state;
  }

  public setClockSpeed(speed: number) {
    this.state.clockSpeed = speed;
    this.restartClock();
    this.notify();
  }

  public toggleEngineRunning() {
    this.state.isEngineRunning = !this.state.isEngineRunning;
    this.log(this.state.isEngineRunning ? 'info' : 'warn', `Scheduler Engine ${this.state.isEngineRunning ? 'Resumed' : 'Paused'}.`);
    this.restartClock();
    this.notify();
  }

  public toggleChaosMode() {
    this.state.chaosMode = !this.state.chaosMode;
    this.log(this.state.chaosMode ? 'warn' : 'info', `Chaos Engineering / Flaky Network: ${this.state.chaosMode ? 'ENABLED (30% failure rate)' : 'DISABLED'}.`);
    this.notify();
  }

  private restartClock() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.state.isEngineRunning) {
      this.startClock();
    }
  }

  private startClock() {
    const intervalMs = Math.max(100, Math.floor(600 / this.state.clockSpeed));
    this.intervalId = window.setInterval(() => {
      this.tick();
    }, intervalMs);
  }

  public stepTick() {
    this.tick();
  }

  private tick() {
    if (!this.state.isEngineRunning) return;

    const now = Date.now();
    let { clusterNodes, jobs, jobRuns, workers, locks, queueMetrics, metrics, workflowRuns } = this.state;

    // 1. Leader Election & Heartbeat lease check
    const leader = clusterNodes.find(n => n.role === 'leader');
    if (leader && leader.status === 'online') {
      leader.leaseRemainingMs = leader.maxLeaseMs;
      leader.lastTickAt = now;
    } else {
      // Leader partition or crash: trigger election
      const onlineFollowers = clusterNodes.filter(n => n.status === 'online');
      if (onlineFollowers.length > 0) {
        const newLeader = onlineFollowers[0];
        const newTerm = (leader ? leader.term : 14) + 1;
        clusterNodes = clusterNodes.map(n => {
          if (n.id === newLeader.id) {
            return { ...n, role: 'leader', term: newTerm, leaseRemainingMs: n.maxLeaseMs, lastTickAt: now, votedFor: n.id };
          }
          return { ...n, role: 'follower', term: newTerm, leaseRemainingMs: n.maxLeaseMs, votedFor: newLeader.id };
        });
        this.log('warn', `Consensus Protocol: Election completed for Term ${newTerm}. New Leader elected: ${newLeader.id}`);
      }
    }

    // 2. Worker heartbeat and active job progression
    workers = workers.map(w => {
      if (w.status === 'dead') return w;
      // random cpu variation
      const cpuUsage = Math.min(95, Math.max(8, Math.floor(w.cpuUsage + (Math.random() * 8 - 4))));
      return { ...w, lastHeartbeat: now, cpuUsage };
    });

    // Progress running jobs
    let activeRunningCount = 0;
    jobRuns = jobRuns.map(run => {
      if (run.status !== 'running') return run;
      activeRunningCount++;

      const elapsed = now - (run.startedAt || now);
      // If elapsed > 4 seconds simulated, complete or fail
      if (elapsed > 4000) {
        const isFailed = this.state.chaosMode && Math.random() < 0.35;
        if (isFailed) {
          if (run.attempt < run.maxAttempts) {
            this.log('warn', `Job Run ${run.id} (${run.jobName}) failed on attempt ${run.attempt}/${run.maxAttempts}. Scheduling backoff retry.`);
            return {
              ...run,
              status: 'retrying',
              attempt: run.attempt + 1,
              error: 'Transient Network 503 Service Unavailable (Injected Chaos)'
            };
          } else {
            this.log('error', `Job Run ${run.id} (${run.jobName}) exhausted all retries! Moved to Dead Letter Queue (DLQ).`);
            return {
              ...run,
              status: 'dlq',
              finishedAt: now,
              durationMs: elapsed,
              error: 'FATAL: Max retries exceeded. Circuit breaker opened.'
            };
          }
        } else {
          // Success
          this.log('info', `Job Run ${run.id} (${run.jobName}) completed successfully on worker ${run.workerHostname} in ${elapsed}ms.`);
          return {
            ...run,
            status: 'completed',
            finishedAt: now,
            durationMs: elapsed,
            output: { status: 'OK', recordsProcessed: Math.floor(Math.random() * 250) + 1, executionAck: 'ACK-' + Math.floor(Math.random() * 90000 + 10000) }
          };
        }
      }
      return run;
    });

    // Progress Workflow Runs
    workflowRuns = workflowRuns.map(wRun => {
      if (wRun.status !== 'running') return wRun;
      return this.progressWorkflowRun(wRun, now);
    });

    // 3. Scheduler evaluation for scheduled/recurring jobs
    jobs = jobs.map(job => {
      if (job.status !== 'active') return job;
      if (job.nextRunAt && now >= job.nextRunAt) {
        // Trigger run!
        const newRun = this.createRunForJob(job, now);
        jobRuns = [newRun, ...jobRuns.slice(0, 49)];
        this.log('info', `Scheduler Tick: Dispatched ${job.name} [Queue: ${job.queue}, Priority: ${job.priority}]`);

        // Compute next run
        let nextRunAt = now + (job.intervalSeconds ? job.intervalSeconds * 1000 : 30000);
        return {
          ...job,
          totalRuns: job.totalRuns + 1,
          lastRunAt: now,
          nextRunAt
        };
      }
      return job;
    });

    // 4. Update queue metrics
    const critRuns = jobRuns.filter(r => r.queue === 'critical');
    const defRuns = jobRuns.filter(r => r.queue === 'default');
    const bgRuns = jobRuns.filter(r => r.queue === 'background');

    queueMetrics = [
      {
        name: 'critical',
        waiting: critRuns.filter(r => r.status === 'queued').length,
        active: critRuns.filter(r => r.status === 'running').length,
        delayed: critRuns.filter(r => r.status === 'retrying').length,
        failed: critRuns.filter(r => r.status === 'dlq').length,
        paused: queueMetrics[0]?.paused || false,
        throughputPerSec: Number((16 + Math.random() * 4).toFixed(1)),
      },
      {
        name: 'default',
        waiting: defRuns.filter(r => r.status === 'queued').length,
        active: defRuns.filter(r => r.status === 'running').length,
        delayed: defRuns.filter(r => r.status === 'retrying').length,
        failed: defRuns.filter(r => r.status === 'dlq').length,
        paused: queueMetrics[1]?.paused || false,
        throughputPerSec: Number((28 + Math.random() * 8).toFixed(1)),
      },
      {
        name: 'background',
        waiting: bgRuns.filter(r => r.status === 'queued').length,
        active: bgRuns.filter(r => r.status === 'running').length,
        delayed: bgRuns.filter(r => r.status === 'retrying').length,
        failed: bgRuns.filter(r => r.status === 'dlq').length,
        paused: queueMetrics[2]?.paused || false,
        throughputPerSec: Number((10 + Math.random() * 3).toFixed(1)),
      }
    ];

    // 5. Update metrics & throughput history
    const completedRuns = jobRuns.filter(r => r.status === 'completed').length;
    const dlqRuns = jobRuns.filter(r => r.status === 'dlq').length;
    const totalCount = completedRuns + dlqRuns;
    const successRate = totalCount > 0 ? Number(((completedRuns / totalCount) * 100).toFixed(1)) : 99.4;

    const newThroughputPoint = {
      timestamp: now,
      rate: Math.floor(35 + Math.sin(now / 15000) * 12 + (this.state.chaosMode ? 8 : 4) + Math.random() * 6)
    };

    metrics = {
      ...metrics,
      uptimeSeconds: metrics.uptimeSeconds + 1,
      totalRunsExecuted: metrics.totalRunsExecuted + (Math.random() < 0.3 ? 1 : 0),
      successRatePercent: Math.max(88, Math.min(100, successRate)),
      throughputHistory: [...metrics.throughputHistory.slice(-23), newThroughputPoint]
    };

    this.state = {
      ...this.state,
      clusterNodes,
      jobs,
      jobRuns,
      workers,
      locks,
      queueMetrics,
      metrics,
      workflowRuns
    };

    this.notify();
  }

  private createRunForJob(job: Job, now: number): JobRun {
    const availableWorkers = this.state.workers.filter(w => w.status === 'healthy');
    const worker = availableWorkers.length > 0
      ? availableWorkers[Math.floor(Math.random() * availableWorkers.length)]
      : undefined;

    this.state.fencingTokenCounter++;

    return {
      id: `run_${job.name.slice(0, 3)}_${Math.floor(Math.random() * 900 + 100)}`,
      jobId: job.id,
      jobName: job.name,
      queue: job.queue,
      status: worker ? 'running' : 'queued',
      workerId: worker?.id,
      workerHostname: worker?.hostname.split('.')[0],
      startedAt: now,
      attempt: 1,
      maxAttempts: job.retryPolicy.maxRetries,
      fencingToken: this.state.fencingTokenCounter,
      idempotencyKey: `${job.name}-${now}`,
      logs: [
        { timestamp: now, level: 'info', message: `Job dispatched to queue [${job.queue}]. Fencing token issued: ${this.state.fencingTokenCounter}` },
        { timestamp: now, level: 'debug', message: `Assigned worker: ${worker ? worker.hostname : 'WAITING_CAPACITY'}` }
      ]
    };
  }

  private progressWorkflowRun(wRun: WorkflowRun, now: number): WorkflowRun {
    const workflow = this.state.workflows.find(w => w.id === wRun.workflowId);
    if (!workflow) return wRun;

    const stepRuns = { ...wRun.stepRuns };
    let hasRunningOrPending = false;
    let anyFailed = false;

    for (const step of workflow.steps) {
      const current = stepRuns[step.id];
      if (!current) continue;

      if (current.status === 'completed') continue;
      if (current.status === 'failed') {
        anyFailed = true;
        continue;
      }

      // Check prerequisites
      const prereqsMet = step.dependsOn.every(depId => stepRuns[depId]?.status === 'completed');

      if (current.status === 'waiting' && prereqsMet) {
        // Start running this step
        stepRuns[step.id] = {
          ...current,
          status: 'running',
          startedAt: now,
          workerId: 'worker-eu-west-1a'
        };
        hasRunningOrPending = true;
        this.log('info', `Workflow [${wRun.workflowName}]: Step "${step.name}" started.`);
      } else if (current.status === 'running') {
        const stepElapsed = now - (current.startedAt || now);
        if (stepElapsed > 2500) {
          // Complete step
          stepRuns[step.id] = {
            ...current,
            status: 'completed',
            finishedAt: now,
            durationMs: stepElapsed,
            output: { status: 'SUCCESS', verified: true, timestamp: now }
          };
          this.log('info', `Workflow [${wRun.workflowName}]: Step "${step.name}" completed successfully.`);
        } else {
          hasRunningOrPending = true;
        }
      } else if (current.status === 'waiting' && !prereqsMet) {
        hasRunningOrPending = true;
      }
    }

    const allStepsCompleted = workflow.steps.every(s => stepRuns[s.id]?.status === 'completed');

    return {
      ...wRun,
      stepRuns,
      status: allStepsCompleted ? 'completed' : anyFailed ? 'failed' : 'running',
      finishedAt: allStepsCompleted || anyFailed ? now : undefined
    };
  }

  // PUBLIC ACTIONS TRIGGERED FROM UI
  public triggerJobManually(jobId: string) {
    const job = this.state.jobs.find(j => j.id === jobId);
    if (!job) return;
    const now = Date.now();
    const newRun = this.createRunForJob(job, now);
    this.state.jobRuns = [newRun, ...this.state.jobRuns.slice(0, 49)];
    this.log('info', `Manual Dispatch: Triggered execution for job ${job.name}.`);
    this.notify();
  }

  public registerJob(newJob: Partial<Job>) {
    const job: Job = {
      id: `job_${Date.now()}`,
      tenantId: newJob.tenantId || 'tenant_custom',
      name: newJob.name || 'custom_task',
      description: newJob.description || 'User created job',
      type: newJob.type || 'recurring',
      cronExpression: newJob.cronExpression,
      intervalSeconds: newJob.intervalSeconds || 30,
      queue: newJob.queue || 'default',
      priority: newJob.priority || 50,
      payload: newJob.payload || {},
      status: 'active',
      nextRunAt: Date.now() + 5000,
      retryPolicy: newJob.retryPolicy || { maxRetries: 3, backoff: 'exponential', initialDelayMs: 2000, maxDelayMs: 30000, jitter: true },
      timeoutMs: newJob.timeoutMs || 30000,
      tags: newJob.tags || ['custom'],
      createdAt: Date.now(),
      concurrencyLimit: newJob.concurrencyLimit || 2,
      totalRuns: 0,
      failedRuns: 0
    };

    this.state.jobs = [job, ...this.state.jobs];
    this.state.metrics.totalJobsRegistered++;
    this.log('info', `Job Registry: Created new job "${job.name}" in queue [${job.queue}].`);
    this.notify();
  }

  public toggleJobStatus(jobId: string) {
    this.state.jobs = this.state.jobs.map(j => {
      if (j.id === jobId) {
        const nextStatus = j.status === 'active' ? 'paused' : 'active';
        this.log('info', `Job "${j.name}" marked as ${nextStatus.toUpperCase()}.`);
        return { ...j, status: nextStatus };
      }
      return j;
    });
    this.notify();
  }

  public triggerWorkflow(workflowId: string) {
    const workflow = this.state.workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const now = Date.now();
    const initialStepRuns: Record<string, any> = {};

    workflow.steps.forEach(step => {
      const isRoot = step.dependsOn.length === 0;
      initialStepRuns[step.id] = {
        stepId: step.id,
        status: isRoot ? 'running' : 'waiting',
        startedAt: isRoot ? now : undefined,
        attempt: 1,
        workerId: isRoot ? 'worker-eu-west-1a' : undefined
      };
    });

    const newRun: WorkflowRun = {
      id: `wfrun_${Date.now().toString(36)}`,
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'running',
      startedAt: now,
      context: { tenantId: workflow.tenantId, initiatedBy: 'admin_dashboard', timestamp: now },
      stepRuns: initialStepRuns,
      activeStepIds: workflow.steps.filter(s => s.dependsOn.length === 0).map(s => s.id)
    };

    this.state.workflowRuns = [newRun, ...this.state.workflowRuns];
    this.state.selectedWorkflowRunId = newRun.id;
    this.log('info', `Workflow Engine: Initiated execution of "${workflow.name}" (ID: ${newRun.id}).`);
    this.notify();
  }

  public triggerThunderingHerd() {
    const now = Date.now();
    this.log('warn', `CHAOS TEST: Injecting 50 concurrent jobs into queues simultaneously.`);
    const newRuns: JobRun[] = [];

    for (let i = 0; i < 50; i++) {
      const randomJob = this.state.jobs[i % this.state.jobs.length];
      this.state.fencingTokenCounter++;
      newRuns.push({
        id: `spike_run_${i}_${Math.floor(Math.random() * 9000 + 1000)}`,
        jobId: randomJob.id,
        jobName: randomJob.name,
        queue: i % 4 === 0 ? 'critical' : i % 2 === 0 ? 'default' : 'background',
        status: 'queued',
        attempt: 1,
        maxAttempts: 3,
        fencingToken: this.state.fencingTokenCounter,
        idempotencyKey: `spike-${i}-${now}`,
        logs: [{ timestamp: now, level: 'info', message: 'Enqueued during thundering herd burst test.' }]
      });
    }

    this.state.jobRuns = [...newRuns, ...this.state.jobRuns.slice(0, 30)];
    this.notify();
  }

  public simulateLeaderCrash() {
    const leader = this.state.clusterNodes.find(n => n.role === 'leader');
    if (!leader) return;

    this.log('error', `CRITICAL CHAOS: Simulated crash of Leader Node [${leader.id}]! Lease immediately forfeited.`);
    this.state.clusterNodes = this.state.clusterNodes.map(n => {
      if (n.id === leader.id) {
        return { ...n, role: 'follower', status: 'crashed', leaseRemainingMs: 0 };
      }
      return n;
    });

    // Recover after 4 seconds
    setTimeout(() => {
      this.state.clusterNodes = this.state.clusterNodes.map(n => {
        if (n.id === leader.id) {
          return { ...n, status: 'online' };
        }
        return n;
      });
      this.log('info', `Node ${leader.id} rebooted and rejoined cluster as Follower.`);
      this.notify();
    }, 4000);

    this.notify();
  }

  public killWorker(workerId: string) {
    this.state.workers = this.state.workers.map(w => {
      if (w.id === workerId) {
        this.log('error', `Worker Pool: Node ${w.hostname} [${w.id}] forcefully TERMINATED.`);
        return { ...w, status: 'dead', activeJobsCount: 0 };
      }
      return w;
    });
    this.notify();
  }

  public spawnWorker() {
    const count = this.state.workers.length + 1;
    const newWorker: WorkerNode = {
      id: `worker-dyn-0${count}`,
      hostname: `worker-0${count}.compute.internal`,
      datacenter: 'eu-central-1 (Frankfurt)',
      status: 'healthy',
      concurrency: 8,
      activeJobsCount: 0,
      lastHeartbeat: Date.now(),
      cpuUsage: 14,
      memoryMb: 850,
      processedTotal: 0,
      failuresTotal: 0
    };
    this.state.workers = [...this.state.workers, newWorker];
    this.log('info', `Worker Pool: Provisioned and discovered new worker node "${newWorker.id}".`);
    this.notify();
  }

  public replayDlq() {
    const dlqCount = this.state.jobRuns.filter(r => r.status === 'dlq').length;
    this.state.jobRuns = this.state.jobRuns.map(r => {
      if (r.status === 'dlq') {
        return {
          ...r,
          status: 'queued',
          attempt: 1,
          error: undefined,
          logs: [...r.logs, { timestamp: Date.now(), level: 'info', message: 'Manual DLQ Replay triggered by operator.' }]
        };
      }
      return r;
    });
    this.log('info', `Dead Letter Queue: Re-enqueued ${dlqCount} failed jobs for fresh execution.`);
    this.notify();
  }

  public purgeDlq() {
    const before = this.state.jobRuns.length;
    this.state.jobRuns = this.state.jobRuns.filter(r => r.status !== 'dlq');
    this.log('warn', `Dead Letter Queue: Purged ${before - this.state.jobRuns.length} dead letter entries.`);
    this.notify();
  }

  public toggleQueuePause(queueName: QueueType) {
    this.state.queueMetrics = this.state.queueMetrics.map(q => {
      if (q.name === queueName) {
        const nextState = !q.paused;
        this.log(nextState ? 'warn' : 'info', `Queue [${queueName}] has been ${nextState ? 'PAUSED' : 'RESUMED'}.`);
        return { ...q, paused: nextState };
      }
      return q;
    });
    this.notify();
  }

  public clearLogs() {
    this.state.logs = [{ timestamp: Date.now(), level: 'info', message: 'Logs cleared by operator.' }];
    this.notify();
  }

  public registerTenant(tenant: Partial<Tenant>) {
    const newTenant: Tenant = {
      id: `tenant_${tenant.name?.toLowerCase().replace(/\s+/g, '_') || Date.now()}`,
      name: tenant.name || 'New Organization',
      tier: tenant.tier || 'growth',
      quotaMonthlyRuns: tenant.quotaMonthlyRuns || 250000,
      usedRunsThisMonth: 0,
      maxConcurrency: tenant.maxConcurrency || 24,
      rateLimitPerSec: tenant.rateLimitPerSec || 100,
      activeJobsCount: 0,
      webhookEndpointsCount: 0,
      createdAt: Date.now(),
    };
    this.state.tenants = [...this.state.tenants, newTenant];
    this.addAuditLog('admin@kronos.cloud', 'admin', 'TENANT_PROVISIONED', 'tenants', newTenant.id, `Allocated new tenant quota ${newTenant.quotaMonthlyRuns.toLocaleString()} runs.`);
    this.log('info', `Multi-Tenancy: Provisioned tenant organization "${newTenant.name}" (${newTenant.tier.toUpperCase()}).`);
    this.notify();
  }

  public addWebhook(wh: Partial<WebhookSubscription>) {
    const newWh: WebhookSubscription = {
      id: `wh_${Date.now().toString(36)}`,
      tenantId: wh.tenantId || 'tenant_fintech_corp',
      url: wh.url || 'https://api.domain.com/webhook',
      events: wh.events || ['job.completed', 'job.failed'],
      hmacSecret: `whsec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      isActive: true,
      totalDelivered: 0,
      totalFailed: 0,
    };
    this.state.webhooks = [...this.state.webhooks, newWh];
    this.addAuditLog('tenant_api', 'tenant_api', 'WEBHOOK_SUBSCRIBED', 'webhooks', newWh.id, `Subscribed endpoint ${newWh.url} with HMAC-SHA256 signature.`);
    this.log('info', `Webhook Registry: Registered destination ${newWh.url} with HMAC signature validation.`);
    this.notify();
  }

  public toggleWebhook(id: string) {
    this.state.webhooks = this.state.webhooks.map(w => {
      if (w.id === id) {
        return { ...w, isActive: !w.isActive };
      }
      return w;
    });
    this.notify();
  }

  public testWebhookDelivery(id: string) {
    const wh = this.state.webhooks.find(w => w.id === id);
    if (!wh) return;
    this.state.webhooks = this.state.webhooks.map(w => {
      if (w.id === id) {
        return {
          ...w,
          totalDelivered: w.totalDelivered + 1,
          lastDeliveredAt: Date.now()
        };
      }
      return w;
    });
    this.log('info', `Webhook Dispatcher: Sent signed HMAC test payload to ${wh.url} (HTTP 200 OK received in 48ms).`);
    this.addAuditLog('scheduler_core', 'scheduler_core', 'WEBHOOK_DELIVERED', 'webhooks', id, `Delivered signed ping event to ${wh.url}.`);
    this.notify();
  }

  public addAuditLog(actor: string, actorRole: 'admin' | 'scheduler_core' | 'worker_agent' | 'tenant_api', action: string, resource: string, resourceId: string, details: string, status: 'success' | 'warning' | 'denied' = 'success') {
    const entry: AuditLog = {
      id: `audit_evt_${Math.floor(Math.random() * 9000 + 1000)}`,
      actor,
      actorRole,
      action,
      resource,
      resourceId,
      details,
      timestamp: Date.now(),
      status,
      ipAddress: '10.0.4.12'
    };
    this.state.auditLogs = [entry, ...this.state.auditLogs.slice(0, 99)];
    this.notify();
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string) {
    this.state.logs = [
      { timestamp: Date.now(), level, message },
      ...this.state.logs.slice(0, 99)
    ];
  }
}

export const simulator = new SimulatorEngine();
