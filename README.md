<div align="center">

# ⚡ KRONOS
### Enterprise Distributed Job Scheduler & DAG Workflow Orchestrator

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Raft Consensus](https://img.shields.io/badge/Consensus-Raft%20%2F%20etcd-FF6B6B.svg?style=for-the-badge)](https://raft.github.io/)
[![Zero Split Brain](https://img.shields.io/badge/Guarantees-Exactly--Once%20%2F%20Fencing-10B981.svg?style=for-the-badge)](https://martinfowler.com/)

<p align="center">
  <b>A mission-critical, fault-tolerant infrastructure service designed to schedule, sequence, and orchestrate recurring, one-off, and multi-step DAG workflows across distributed worker clusters with Raft leader election, priority queues, and strict idempotency guarantees.</b>
</p>

[Live Interactive Cockpit Demo](https://ais-dev-53i7wm65mgjkt7xxzqrcc7-65843126879.europe-west3.run.app) • [Core Architecture](#-system-architecture) • [Design System](#-design-system--visual-identity) • [Quick Start](#-quick-start)

---

</div>

## 📌 Executive Summary & Problem Space

In modern cloud platforms, thousands of background and scheduled tasks cannot be executed synchronously with user requests:
- 💳 Generating monthly enterprise billing statements and tax declarations
- 🧹 Sweeping revoked OAuth tokens and purging dead session caches
- 🔄 Mirroring media transcode pipelines (Ingest → 4K/1080p Fan-out → Audio Normalization → CDN Purge)
- 📡 Emitting HMAC-SHA256 authenticated webhooks to partner logistics services

Simple single-node cron daemons or `setTimeout` break catastrophically at scale:
1. **Server Restart = Lost Jobs:** Volatile memory jobs vanish during node churn.
2. **Horizontal Scaling = Double Execution:** Multiple replicas trigger duplicate runs without a single elected coordinator.
3. **Cascading Failures = Thundering Herd:** Upstream API outages trigger simultaneous retries that knock services down.
4. **Split-Brain Zombie Writes:** Paused processes wake up after lock expiration and overwrite fresh state.

### 🛡️ The KRONOS Solution
**KRONOS** is a resilient central orchestrator providing:
- **Raft / etcd Leader Election:** Exactly one active leader ticks the schedule loop with sub-millisecond drift compensation.
- **Monotonic Fencing Tokens:** Guarantees zero stale writes during JVM/GC freezes or network partitions.
- **Priority & Dead Letter Queues (DLQ):** Priority queues (`critical`, `default`, `background`) with full jitter exponential backoff.
- **Visual DAG Workflow Engine:** Multi-branch Directed Acyclic Graph execution with concurrent fan-out, prerequisite validation, and rollback semantics.
- **Multi-Tenancy & Quotas:** Organization isolation, leaky-bucket rate limiting, and immutable SHA-256 audit logging.

---

## 🏛️ System Architecture

```text
                           [ Consumer Microservices & SDKs ]
                                         │
                                         ▼ REST / OpenAPI 3.1
                    ┌──────────────────────────────────────────┐
                    │      KRONOS Gateway & API Registry       │
                    │   (Tenant Quotas, Rate Limiting, RBAC)   │
                    └────────────────────┬─────────────────────┘
                                         │
                                         ▼
         ┌──────────────────────────────────────────────────────────────┐
         │     Raft Consensus Cluster & Distributed Lock Coordinator    │
         │          (Leader Election, Heartbeat Lease, Fencing)         │
         │                                                              │
         │   [Node 01 - LEADER] ───sync─── [Node 02] ───sync─── [Node 03]│
         └───────────────────────────────┬──────────────────────────────┘
                                         │ Dispatches Envelopes
                                         ▼
         ┌──────────────────────────────────────────────────────────────┐
         │       Multi-Partition Priority Queue Buffer (Redis/PG)       │
         │   • Critical (Finance/Auth)  • Default  • Background Sweeper │
         │   • Delayed Retry Queue (Exponential Backoff + Full Jitter)  │
         │   • Dead Letter Quarantine (DLQ) Repository                  │
         └───────────────────────────────┬──────────────────────────────┘
                                         │ Pulls tasks by Priority
                                         ▼
         ┌──────────────────────────────────────────────────────────────┐
         │             Elastic Distributed Worker Pool Fleet            │
         │   [Worker-EU-1a]      [Worker-EU-1b]      [Worker-US-1a]     │
         │   • Heartbeat Ping    • Concurrency Slots • Graceful Drain   │
         └───────────────────────────────┬──────────────────────────────┘
                                         │
                    ┌────────────────────┴─────────────────────┐
                    ▼                                          ▼
         [ PostgreSQL Storage Layer ]               [ Observability Stack ]
          • Jobs & DAG Definitions                   • Prometheus /metrics
          • Runs History (Partitions)                • OpenTelemetry Spans
          • Immutable Audit Ledger                   • Structured JSON Logs
```

---

## ✨ Core Feature Modules

### 1. ⏱️ Scheduler Core & Precision Tick Loop
- Sub-millisecond drift-compensated interval loops.
- Standard 5-field and 6-field UNIX Cron expression parser (`0 0 1 * *`, `*/15 * * * * *`).
- Timezone-aware scheduling with daylight saving safety.

### 2. 👑 Raft Consensus & Leader Election
- Single-active coordinator model: only the elected leader evaluates cron rules.
- Automatic failover: if the leader fails to renew its $5000\text{ms}$ lease, standby followers trigger an immediate election term increment ($Term\ N \to Term\ N+1$).
- **Monotonic Fencing Tokens:** Every lock acquisition produces an incrementally ordered integer (`TOKEN-1042`), verified at the database layer to definitively defeat split-brain anomalies.

### 3. 🕸️ Visual DAG Workflow Orchestrator
- Declarative JSON-based Directed Acyclic Graph definitions.
- Automatic cycle detection via **Kahn's Topological Sort**.
- Independent branch parallel execution (Fan-Out / Fan-In) with context passing.
- Interactive vector canvas rendering with live status badges (`WAITING`, `RUNNING`, `DONE`, `FAIL`).

### 4. 📬 Prioritized Queuing, DLQ & Thundering Herd Defense
- Three-tier queue segregation: `critical`, `default`, and `background`.
- **Full Jitter Exponential Backoff:**
  $$\text{Delay} = \text{random}(0, \min(M, B \times 2^{\text{attempt}}))$$
- Dead Letter Queue (DLQ) quarantine with one-click **Replay** and forensic inspection.

### 5. 🏢 Multi-Tenancy, Quotas & HMAC Webhooks
- Multi-organization tenant isolation with tiered concurrency and rate limits.
- Immutable SHA-256 audit ledger capturing all operational events.
- Outbound Webhook dispatching signed with `X-Kronos-Signature: t={timestamp},v1={hmac_sha256}`.

---

## 🎨 Design System & Visual Identity

The dashboard is engineered with an uncompromising commitment to clean infrastructure aesthetics inspired by **Linear**, **Vercel**, **Temporal Cloud**, and **Railway**:

- **Dark Mode Palette:** `#080B10` canvas with `#0D121C` elevated panels and `#1E293B` borders.
- **Accents:** Indigo (`#6366F1`) for primary actions, Emerald (`#10B981`) for healthy states, Amber (`#F59E0B`) for backoffs/warnings, and Rose (`#F43F5E`) for DLQ faults.
- **Typography:** **Plus Jakarta Sans** for crisp interface legibility, **JetBrains Mono** for cryptographic tokens, timestamps, and payloads, and **Vazirmatn** for bidirectional RTL Persian typography.
- **Universal Command Palette:** Instant access via `Cmd + K` or `Ctrl + K` with keyboard-driven search and chaos injection triggers.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/kronos-scheduler.git
cd kronos-scheduler

# Install dependencies
npm install

# Start local development server on port 3000
npm run dev
```

Visit `http://localhost:3000` to interact with the full interactive cockpit.

### Building for Production
```bash
npm run build
```

---

## 🧪 Chaos Engineering & Operational Playground

KRONOS includes built-in real-time chaos simulation directly accessible from the UI header and Command Palette:
1. **Simulate 50x Spike (Thundering Herd):** Enqueues 50 concurrent tasks across all queues to inspect scheduler buffer backpressure.
2. **Crash Leader Node:** Simulates an abrupt ungraceful termination of `scheduler-node-01`, triggering instant follower election and term advance.
3. **Flaky Network Chaos:** Injects $35\%$ simulated upstream network latency and HTTP 503 errors to observe exponential backoff retries and DLQ escalation.
4. **Kill / Spawn Workers:** Terminate individual node compute processes or dynamically spin up worker instances.

---

## 📜 License
Distributed under the Apache-2.0 License. See `LICENSE` for more information.
