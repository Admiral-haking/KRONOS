import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Clock, 
  Sliders, 
  Key, 
  Radio, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { Language, translations } from '../../locales/translations';
import { Tenant } from '../../types';

interface TenantsTabProps {
  language: Language;
  tenants: Tenant[];
  onRegisterTenant: (tenant: Partial<Tenant>) => void;
}

export const TenantsTab: React.FC<TenantsTabProps> = ({
  language,
  tenants,
  onRegisterTenant
}) => {
  const t = translations[language];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(tenants[0] || null);

  // Form states
  const [name, setName] = useState('');
  const [tier, setTier] = useState<'free' | 'growth' | 'enterprise'>('growth');
  const [quotaRuns, setQuotaRuns] = useState(500000);
  const [maxConcurrency, setMaxConcurrency] = useState(32);
  const [rateLimit, setRateLimit] = useState(150);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onRegisterTenant({
      name: name.trim(),
      tier,
      quotaMonthlyRuns: quotaRuns,
      maxConcurrency,
      rateLimitPerSec: rateLimit
    });
    setName('');
    setIsModalOpen(false);
  };

  const totalQuota = tenants.reduce((acc, ten) => acc + ten.quotaMonthlyRuns, 0);
  const totalUsed = tenants.reduce((acc, ten) => acc + ten.usedRunsThisMonth, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#0D121C] border border-slate-800 rounded-xl gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white tracking-tight">Multi-Tenancy & Quota Management</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict tenant isolation, rate limits, sliding window execution quotas, and concurrency throttling
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Tenant</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0D121C] border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Total Organizations</span>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {tenants.length}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">100% isolated databases</div>
        </div>

        <div className="p-4 bg-[#0D121C] border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Monthly Runs Allocated</span>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-1 tabular-nums">
            {(totalQuota / 1000000).toFixed(1)}M
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Global aggregate capacity</div>
        </div>

        <div className="p-4 bg-[#0D121C] border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Monthly Consumed</span>
          <div className="text-xl font-bold font-mono text-slate-200 mt-1 tabular-nums">
            {(totalUsed / 1000000).toFixed(2)}M
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            {Math.round((totalUsed / totalQuota) * 100)}% quota consumed
          </div>
        </div>

        <div className="p-4 bg-[#0D121C] border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Security Guard</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            RBAC + HMAC
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Ed25519 tenant tokens</div>
        </div>
      </div>

      {/* Main Tenant Table and Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tenant List */}
        <div className="lg:col-span-2 bg-[#0D121C] border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 bg-[#090D14] flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-wider">
              Registered Organizations
            </h3>
            <span className="text-xs text-slate-500 font-mono">{tenants.length} tenants</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0B0F18] text-[11px] text-slate-400 uppercase">
                  <th className="py-2.5 px-4">Organization</th>
                  <th className="py-2.5 px-4">Tier</th>
                  <th className="py-2.5 px-4">Runs Consumption</th>
                  <th className="py-2.5 px-4">Concurrency</th>
                  <th className="py-2.5 px-4 text-right">Rate Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tenants.map((ten) => {
                  const percentUsed = Math.min(100, Math.round((ten.usedRunsThisMonth / ten.quotaMonthlyRuns) * 100));
                  const isSelected = selectedTenant?.id === ten.id;

                  return (
                    <tr
                      key={ten.id}
                      onClick={() => setSelectedTenant(ten)}
                      className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{ten.name}</div>
                        <div className="text-[10px] text-slate-500">{ten.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${
                          ten.tier === 'enterprise' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          ten.tier === 'growth' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {ten.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-300">{ten.usedRunsThisMonth.toLocaleString()}</span>
                          <span className="text-slate-500">/ {ten.quotaMonthlyRuns.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              percentUsed > 85 ? 'bg-rose-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        {ten.maxConcurrency} slots
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {ten.rateLimitPerSec} req/s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Selected Tenant Deep Dive */}
        <div className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl flex flex-col justify-between">
          {selectedTenant ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Tenant Profile</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{selectedTenant.name}</h3>
                <span className="text-[11px] text-indigo-400">{selectedTenant.id}</span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg space-y-1.5">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Service Level Agreement</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Target Tier:</span>
                    <span className="text-white font-bold uppercase">{selectedTenant.tier}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Concurrency Cap:</span>
                    <span className="text-white">{selectedTenant.maxConcurrency} parallel tasks</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Bucket Leaky Rate:</span>
                    <span className="text-white">{selectedTenant.rateLimitPerSec} tokens/sec</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Webhooks Bound:</span>
                    <span className="text-white">{selectedTenant.webhookEndpointsCount} endpoints</span>
                  </div>
                </div>

                <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg space-y-1.5">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Tenant Isolation Spec</div>
                  <div className="text-[11px] text-slate-400">
                    • Database: Row-Level Security (RLS) + schema tenant partition<br />
                    • Queue Key: <code className="text-indigo-300">kronos:t:{selectedTenant.id}:jobs</code><br />
                    • Cryptography: HMAC-SHA256 authenticated webhook signers
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500 font-mono">
              Select a tenant to view quota enforcement details.
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
            Zero cross-tenant data bleed guaranteed by schema validation
          </div>
        </div>
      </div>

      {/* Provision Tenant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-[#0D121C] border border-slate-800 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090D14]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Provision Tenant Organization</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme FinTech Corp"
                  className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subscription Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="growth">Growth</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="free">Free Starter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Runs Quota</label>
                  <input
                    type="number"
                    min="1000"
                    step="10000"
                    value={quotaRuns}
                    onChange={(e) => setQuotaRuns(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Concurrency Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="512"
                    value={maxConcurrency}
                    onChange={(e) => setMaxConcurrency(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rate Limit (req/s)</label>
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
