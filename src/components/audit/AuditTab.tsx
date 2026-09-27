import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Send, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Key, 
  Radio, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  Code2,
  Copy,
  Check,
  X
} from 'lucide-react';
import { Language, translations } from '../../locales/translations';
import { AuditLog, WebhookSubscription, Tenant } from '../../types';

interface AuditTabProps {
  language: Language;
  auditLogs: AuditLog[];
  webhooks: WebhookSubscription[];
  tenants: Tenant[];
  onAddWebhook: (wh: Partial<WebhookSubscription>) => void;
  onToggleWebhook: (id: string) => void;
  onTestWebhookDelivery: (id: string) => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  language,
  auditLogs,
  webhooks,
  tenants,
  onAddWebhook,
  onToggleWebhook,
  onTestWebhookDelivery
}) => {
  const t = translations[language];
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'webhooks'>('audit');
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [isAddWhModalOpen, setIsAddWhModalOpen] = useState(false);

  // Form states
  const [whUrl, setWhUrl] = useState('');
  const [whTenant, setWhTenant] = useState(tenants[0]?.id || 'tenant_fintech_corp');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredAudits = auditLogs.filter(a => {
    if (auditFilter === 'all') return true;
    return a.status === auditFilter || a.actorRole === auditFilter;
  });

  const handleAddWh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whUrl.trim()) return;
    onAddWebhook({
      url: whUrl.trim(),
      tenantId: whTenant,
      events: ['job.completed', 'job.failed', 'dlq.threshold_exceeded']
    });
    setWhUrl('');
    setIsAddWhModalOpen(false);
  };

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Subtab switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#0D121C] border border-slate-800 rounded-xl gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white tracking-tight">Immutable Audit Log & Webhooks Hub</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographic actor tracking, SOC2 compliance logs, and authenticated HMAC-SHA256 event fan-out
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#090D14] p-1 border border-slate-800 rounded-lg text-xs font-mono">
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeSubTab === 'audit' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Audit Trail ({auditLogs.length})
            </button>
            <button
              onClick={() => setActiveSubTab('webhooks')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeSubTab === 'webhooks' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Webhooks ({webhooks.length})
            </button>
          </div>

          {activeSubTab === 'webhooks' && (
            <button
              onClick={() => setIsAddWhModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Endpoint</span>
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'audit' ? (
        /* Audit Trail Table */
        <div className="bg-[#0D121C] border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-3 bg-[#090D14] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Filter Role:</span>
              <div className="flex items-center bg-slate-900 p-0.5 border border-slate-800 rounded-lg text-[11px] font-mono">
                {['all', 'admin', 'scheduler_core', 'worker_agent', 'tenant_api'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setAuditFilter(role)}
                    className={`px-2.5 py-0.5 rounded uppercase ${
                      auditFilter === role ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {role.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              Immutable SHA256 hashed records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0B0F18] text-[11px] text-slate-400 uppercase">
                  <th className="py-2.5 px-4">Event ID</th>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Resource</th>
                  <th className="py-2.5 px-4">Details</th>
                  <th className="py-2.5 px-4">IP</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAudits.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-indigo-400 font-semibold">{item.id}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{item.actor}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{item.actorRole}</div>
                    </td>
                    <td className="py-3 px-4 text-amber-300 font-bold">{item.action}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <code className="text-[11px] bg-slate-900 px-1 py-0.5 rounded">{item.resource}</code>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs">{item.details}</td>
                    <td className="py-3 px-4 text-slate-400">{item.ipAddress || 'internal-vpc'}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${
                        item.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        item.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Webhooks Manager */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {webhooks.map((wh) => (
              <div key={wh.id} className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${wh.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-xs font-bold text-white font-mono uppercase">{wh.id}</span>
                    </div>

                    <button
                      onClick={() => onToggleWebhook(wh.id)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                        wh.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {wh.isActive ? 'ACTIVE' : 'PAUSED'}
                    </button>
                  </div>

                  <div className="mt-4 space-y-2 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Endpoint Destination</span>
                      <div className="text-indigo-300 break-all text-[11px] mt-0.5">{wh.url}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Bound Tenant</span>
                      <div className="text-slate-300">{wh.tenantId}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">HMAC SHA-256 Secret</span>
                      <div className="flex items-center justify-between bg-[#090D14] p-1.5 rounded border border-slate-800 text-[11px] text-slate-300">
                        <span className="truncate max-w-[160px]">{wh.hmacSecret}</span>
                        <button
                          onClick={() => copyToClipboard(wh.id, wh.hmacSecret)}
                          className="p-1 hover:text-white"
                        >
                          {copiedKey === wh.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="bg-[#090D14] p-2 rounded border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-500">Delivered</div>
                        <div className="text-base font-bold text-emerald-400 tabular-nums">{wh.totalDelivered}</div>
                      </div>
                      <div className="bg-[#090D14] p-2 rounded border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-500">Failures</div>
                        <div className="text-base font-bold text-rose-400 tabular-nums">{wh.totalFailed}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {wh.lastDeliveredAt ? `Last ping: ${Math.floor((Date.now() - wh.lastDeliveredAt) / 60000)}m ago` : 'No pings yet'}
                  </span>
                  <button
                    onClick={() => onTestWebhookDelivery(wh.id)}
                    className="flex items-center gap-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Ping</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Webhook Signature Reference */}
          <div className="p-4 bg-[#090D14] border border-slate-800 rounded-xl space-y-2 font-mono text-xs text-slate-400">
            <div className="text-indigo-400 font-semibold flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span>HMAC-SHA256 Webhook Verification Header Spec</span>
            </div>
            <p>
              Every webhook emitted by KRONOS contains the HTTP header <code className="text-slate-200">X-Kronos-Signature: t=1758921820,v1=9e8...</code>.
              Receiving endpoints must compute the HMAC hash of <code className="text-slate-200">t + "." + payload</code> with their secret key to guarantee payload authenticity and prevent replay attacks.
            </p>
          </div>
        </div>
      )}

      {/* Add Webhook Modal */}
      {isAddWhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-[#0D121C] border border-slate-800 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090D14]">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Subscribe Webhook Destination</h3>
              </div>
              <button 
                onClick={() => setIsAddWhModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWh} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target HTTPS Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={whUrl}
                  onChange={(e) => setWhUrl(e.target.value)}
                  placeholder="https://api.yourcompany.com/v1/jobs/callback"
                  className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Organization Scope</label>
                <select
                  value={whTenant}
                  onChange={(e) => setWhTenant(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWhModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
                >
                  Register Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
