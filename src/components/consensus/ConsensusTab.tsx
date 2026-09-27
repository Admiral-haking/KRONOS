import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Key, 
  Clock, 
  Cpu, 
  RefreshCw, 
  AlertTriangle,
  Server,
  Zap,
  Info
} from 'lucide-react';
import { Language, translations } from '../../locales/translations';
import { ClusterNode, DistributedLock } from '../../types';

interface ConsensusTabProps {
  language: Language;
  clusterNodes: ClusterNode[];
  locks: DistributedLock[];
  onCrashLeader: () => void;
}

export const ConsensusTab: React.FC<ConsensusTabProps> = ({
  language,
  clusterNodes,
  locks,
  onCrashLeader
}) => {
  const t = translations[language];
  const leader = clusterNodes.find(n => n.role === 'leader');

  return (
    <div className="space-y-6">
      {/* Header and Crash Simulation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#0D121C] border border-slate-800 rounded-xl gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">{t.consensusTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t.consensusDesc}</p>
        </div>

        <button
          onClick={onCrashLeader}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 rounded-lg transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>{t.crashLeader}</span>
        </button>
      </div>

      {/* Cluster Nodes & Consensus State */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clusterNodes.map((node) => {
          const isLeader = node.role === 'leader';
          const isCrashed = node.status === 'crashed';

          return (
            <div
              key={node.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                isCrashed
                  ? 'bg-rose-500/5 border-rose-500/40'
                  : isLeader
                  ? 'bg-indigo-950/20 border-indigo-500/50 shadow-lg shadow-indigo-500/5'
                  : 'bg-[#0D121C] border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${
                      isCrashed ? 'bg-rose-500/20 text-rose-400' :
                      isLeader ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white font-mono">{node.id}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{node.hostname}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                    isCrashed ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    isLeader ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {isCrashed ? 'CRASHED' : node.role.toUpperCase()}
                  </span>
                </div>

                {/* Consensus Parameters */}
                <div className="mt-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-500">Raft Term:</span>
                    <span className="text-indigo-400 font-bold">{node.term}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-500">Voted For:</span>
                    <span className="text-slate-300">{node.votedFor || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">State:</span>
                    <span className={`font-semibold ${node.status === 'online' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {node.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Leader Lease Countdown Bar */}
                {isLeader && (
                  <div className="mt-4 p-3 bg-[#090D14] border border-indigo-500/30 rounded-lg">
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-indigo-300 font-semibold">{t.leaseCountdown}</span>
                      <span className="text-emerald-400 font-bold tabular-nums">{node.leaseRemainingMs}ms</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${(node.leaseRemainingMs / node.maxLeaseMs) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      Renewed via etcd keepalive every 1000ms
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                {isLeader ? 'Actively evaluating scheduler ticks' : 'Standby follower ready for instantaneous failover'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Distributed Locks Table */}
      <div className="bg-[#0D121C] border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 bg-[#090D14] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-wider">
              {t.distributedLocks}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {locks.length} Active Mutex Leases
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-mono uppercase bg-[#0B0F18]">
                <th className="py-2.5 px-4">Lock Key (Mutex)</th>
                <th className="py-2.5 px-4">Guarded Resource</th>
                <th className="py-2.5 px-4">Lock Holder</th>
                <th className="py-2.5 px-4">Fencing Token</th>
                <th className="py-2.5 px-4 text-right">TTL Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {locks.map((lock) => {
                const ttlRemaining = Math.max(0, Math.floor((lock.expiresAt - Date.now()) / 1000));
                return (
                  <tr key={lock.key} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-indigo-300 font-semibold">{lock.key}</td>
                    <td className="py-3 px-4 text-slate-300">{lock.resource}</td>
                    <td className="py-3 px-4 text-slate-400">{lock.holderNodeId}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">TOKEN-{lock.fencingToken}</td>
                    <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                      {ttlRemaining}s
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fencing Token & Split-Brain Mathematical Defense */}
      <div className="p-5 bg-[#090D14] border border-slate-800 rounded-xl space-y-3 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold">
          <Key className="w-4 h-4" />
          <span>Fencing Tokens: The Definitive Protection Against Split-Brain Anomalies</span>
        </div>
        <p className="leading-relaxed">
          Distributed locks without fencing tokens fail when a client experiences a garbage-collection pause or network freeze while holding a lease.
          When the lease expires and another node acquires the lock, the frozen client awakens and writes stale data.
        </p>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
          <span className="text-emerald-400 font-bold">Invariant: </span>
          Every lock acquisition increments a monotonic fencing number (e.g. <code>1042 → 1043</code>). The storage/database layer rejects any write carrying a fencing token lower than the latest seen token.
        </div>
      </div>
    </div>
  );
};
