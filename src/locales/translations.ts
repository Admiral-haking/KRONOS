export type Language = 'en' | 'fa';

export const translations = {
  en: {
    brand: 'KRONOS',
    tagline: 'Distributed Job Scheduler & Workflow Orchestrator',
    clusterStatus: 'Cluster Healthy',
    leader: 'Leader',
    follower: 'Follower',
    tickEngine: 'Scheduler Engine',
    statusRunning: 'Running',
    statusPaused: 'Paused',
    statusHealthy: 'Healthy',
    searchPlaceholder: 'Search jobs, workflows, runs... (Cmd+K)',
    
    // Navigation
    navOverview: 'Overview',
    navJobs: 'Jobs Registry',
    navWorkflows: 'Workflow DAGs',
    navQueues: 'Queues & DLQ',
    navWorkers: 'Worker Fleet',
    navConsensus: 'Consensus & Locks',
    navTenants: 'Tenants & Quotas',
    navAudit: 'Audit & Webhooks',
    navObservability: 'Observability',
    navArchitecture: 'Architecture & Code',
    navReadme: 'GitHub Showcase',

    // Overview KPIs
    kpiActiveJobs: 'Registered Jobs',
    kpiRunsExecuted: 'Total Runs',
    kpiSuccessRate: 'Success Rate',
    kpiP95Latency: 'p95 Latency',
    kpiWorkersOnline: 'Workers Active',
    kpiQueuedTasks: 'Queued Buffer',
    
    // Actions
    triggerJob: 'Dispatch Job',
    triggerWorkflow: 'Execute Workflow',
    createJob: 'Register Job',
    thunderingHerd: 'Simulate 50x Spike',
    toggleChaos: 'Flaky Network Chaos',
    crashLeader: 'Crash Leader Node',
    spawnWorker: 'Add Worker',
    drainWorker: 'Drain Worker',
    killWorker: 'Kill Node',
    replayDlq: 'Replay DLQ',
    purgeDlq: 'Purge DLQ',
    pauseQueue: 'Pause Queue',
    resumeQueue: 'Resume Queue',
    copyPrometheus: 'Copy Prometheus Metrics',
    clearLogs: 'Clear Logs',
    speed: 'Clock Speed',

    // Tables & Badges
    jobName: 'Job Identifier',
    queue: 'Queue',
    type: 'Schedule Type',
    priority: 'Priority',
    nextRun: 'Next Execution',
    lastRun: 'Last Execution',
    status: 'State',
    actions: 'Actions',
    attempts: 'Attempts',
    idempotencyKey: 'Idempotency Key',
    fencingToken: 'Fencing Token',
    duration: 'Duration',
    node: 'Worker Node',

    // Workflow Engine
    workflowTitle: 'DAG Workflow Orchestration',
    workflowDesc: 'Multi-step Directed Acyclic Graph engine with concurrent branching, failure rollbacks, and idempotency guarantees.',
    stepDetails: 'Step Telemetry',
    dependencies: 'Prerequisites',
    actionType: 'Action Type',
    runHistory: 'Execution History',
    startExecution: 'Start DAG Run',

    // Consensus
    consensusTitle: 'Leader Election & Distributed Locks',
    consensusDesc: 'Raft / etcd based consensus protocol. Exactly one active leader evaluates ticks while followers maintain lease countdown.',
    leaseCountdown: 'Leader Lease Expiry',
    term: 'Raft Term',
    distributedLocks: 'Active Distributed Locks',
    resource: 'Guarded Resource',
    holder: 'Lock Holder',
    expiresIn: 'TTL Remaining',

    // Observability
    liveLogs: 'Structured JSON & Execution Telemetry',
    exportPrometheus: 'Prometheus Metric Exporter',
    logLevel: 'Log Level',
    allLevels: 'All Levels',

    // Architecture
    archTitle: 'Production Architectural Blueprints & Implementation Code',
    archSubtitle: 'Complete enterprise-grade source code, database ERDs, and distributed algorithm patterns for Senior & Staff engineering reviews.',
  },
  fa: {
    brand: 'کرونوس (KRONOS)',
    tagline: 'سیستم زمان‌بندی و هماهنگی کارهای توزیع‌شده',
    clusterStatus: 'کلاستر پایدار',
    leader: 'رهبر (Leader)',
    follower: 'دنبال‌کننده (Follower)',
    tickEngine: 'موتور اسکژولر',
    statusRunning: 'در حال کار',
    statusPaused: 'متوقف‌شده',
    statusHealthy: 'سالم',
    searchPlaceholder: 'جستجوی کارها، ورک‌فلوها و لاگ‌ها... (Ctrl+K)',

    // Navigation
    navOverview: 'نمای کلی (Overview)',
    navJobs: 'رجیستری کارها (Jobs)',
    navWorkflows: 'ورک‌فلوها و DAG',
    navQueues: 'صف‌ها و DLQ',
    navWorkers: 'ورکرها (Workers)',
    navConsensus: 'اجماع و قفل‌ها',
    navTenants: 'مستاجرها و سهمیه‌ها',
    navAudit: 'لاگ ممیزی و وب‌هوک‌ها',
    navObservability: 'دیده‌بانی و لاگ‌ها',
    navArchitecture: 'معماری و کدها',
    navReadme: 'نمایش گیت‌هاب (README)',

    // Overview KPIs
    kpiActiveJobs: 'کارهای ثبت‌شده',
    kpiRunsExecuted: 'کل اجراها',
    kpiSuccessRate: 'نرخ موفقیت',
    kpiP95Latency: 'تأخیر p95',
    kpiWorkersOnline: 'ورکرهای آنلاین',
    kpiQueuedTasks: 'صف انتظار',

    // Actions
    triggerJob: 'اجرای کار',
    triggerWorkflow: 'اجرای ورک‌فلو',
    createJob: 'ثبت کار جدید',
    thunderingHerd: 'تست ترافیک ۵۰ برابری',
    toggleChaos: 'آشوب شبکه (Chaos)',
    crashLeader: 'شبیه‌سازی کرش رهبر',
    spawnWorker: 'افزودن ورکر',
    drainWorker: 'تخلیه امن (Drain)',
    killWorker: 'توقف ناگهانی',
    replayDlq: 'اجرای مجدد DLQ',
    purgeDlq: 'پاکسازی DLQ',
    pauseQueue: 'توقف صف',
    resumeQueue: 'ادامه صف',
    copyPrometheus: 'کپی متریک‌های پرومتئوس',
    clearLogs: 'پاکسازی لاگ‌ها',
    speed: 'سرعت کلاک',

    // Tables & Badges
    jobName: 'شناسه کار',
    queue: 'صف',
    type: 'نوع زمان‌بندی',
    priority: 'اولویت',
    nextRun: 'اجرای بعدی',
    lastRun: 'آخرین اجرا',
    status: 'وضعیت',
    actions: 'عملیات',
    attempts: 'تعداد تلاش',
    idempotencyKey: 'کلید عدم‌تکرار (Idempotency)',
    fencingToken: 'توکن فنسینگ (Fencing)',
    duration: 'مدت زمان',
    node: 'نود پردازشی',

    // Workflow Engine
    workflowTitle: 'ارکستراسیون ورک‌فلوهای چندمرحله‌ای (DAG)',
    workflowDesc: 'موتور اجرای گراف جهت‌دار بدون چرخه با گره‌های موازی، تضمین پیش‌نیازها و مدیریت شکست.',
    stepDetails: 'تله‌متری مرحله',
    dependencies: 'وابستگی‌ها',
    actionType: 'نوع اکشن',
    runHistory: 'تاریخچه اجراها',
    startExecution: 'شروع اجرای گراف',

    // Consensus
    consensusTitle: 'انتخاب رهبر (Leader Election) و قفل‌های توزیع‌شده',
    consensusDesc: 'الگوریتم اجماع مبتنی بر Raft/etcd؛ فقط رهبر فعال تیک می‌زند و در صورت عدم ارسال Heartbeat، رهبر جدید انتخاب می‌شود.',
    leaseCountdown: 'انقضای اعتبار اجاره رهبر',
    term: 'دوره Raft (Term)',
    distributedLocks: 'قفل‌های توزیع‌شده فعال',
    resource: 'منبع محافظت‌شده',
    holder: 'مالک قفل',
    expiresIn: 'زمان باقی‌مانده (TTL)',

    // Observability
    liveLogs: 'لاگ‌های ساخت‌یافته و تله‌متری اجرا',
    exportPrometheus: 'اکسپورت متریک‌های Prometheus',
    logLevel: 'سطح لاگ',
    allLevels: 'همه سطوح',

    // Architecture
    archTitle: 'معماری فنی و قطعه‌کدهای آماده پیاده‌سازی',
    archSubtitle: 'کدهای کامل با TypeScript و Go، اسکیماهای PostgreSQL، و ساختار الگوریتم‌های توزیع‌شده برای ارائه و مصاحبه‌های تخصصی.',
  }
};
