import React, { useState, useEffect } from 'react';
import { Search, Play, Flame, ShieldAlert, Cpu, Layers, GitFork, Activity, Server, FileCode, Building2, Send, Github, X } from 'lucide-react';
import { Language, translations } from '../../locales/translations';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onTriggerSpike: () => void;
  onCrashLeader: () => void;
  onToggleChaos: () => void;
  onReplayDlq: () => void;
  onSpawnWorker: () => void;
  language: Language;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onTriggerSpike,
  onCrashLeader,
  onToggleChaos,
  onReplayDlq,
  onSpawnWorker,
  language
}) => {
  const [query, setQuery] = useState('');
  const t = translations[language];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'tab_overview',
      label: `${t.navOverview}`,
      category: 'Navigation',
      icon: Activity,
      run: () => { onSelectTab('overview'); onClose(); }
    },
    {
      id: 'tab_jobs',
      label: `${t.navJobs}`,
      category: 'Navigation',
      icon: Layers,
      run: () => { onSelectTab('jobs'); onClose(); }
    },
    {
      id: 'tab_workflows',
      label: `${t.navWorkflows}`,
      category: 'Navigation',
      icon: GitFork,
      run: () => { onSelectTab('workflows'); onClose(); }
    },
    {
      id: 'tab_queues',
      label: `${t.navQueues}`,
      category: 'Navigation',
      icon: Server,
      run: () => { onSelectTab('queues'); onClose(); }
    },
    {
      id: 'tab_workers',
      label: `${t.navWorkers}`,
      category: 'Navigation',
      icon: Cpu,
      run: () => { onSelectTab('workers'); onClose(); }
    },
    {
      id: 'tab_consensus',
      label: `${t.navConsensus}`,
      category: 'Navigation',
      icon: ShieldAlert,
      run: () => { onSelectTab('consensus'); onClose(); }
    },
    {
      id: 'tab_tenants',
      label: `${t.navTenants}`,
      category: 'Navigation',
      icon: Building2,
      run: () => { onSelectTab('tenants'); onClose(); }
    },
    {
      id: 'tab_audit',
      label: `${t.navAudit}`,
      category: 'Navigation',
      icon: Send,
      run: () => { onSelectTab('audit'); onClose(); }
    },
    {
      id: 'tab_architecture',
      label: `${t.navArchitecture}`,
      category: 'Architecture',
      icon: FileCode,
      run: () => { onSelectTab('architecture'); onClose(); }
    },
    {
      id: 'tab_readme',
      label: `${t.navReadme}`,
      category: 'Documentation',
      icon: Github,
      run: () => { onSelectTab('readme'); onClose(); }
    },
    {
      id: 'act_thundering_herd',
      label: t.thunderingHerd,
      category: 'Chaos & Testing',
      icon: Play,
      run: () => { onTriggerSpike(); onClose(); }
    },
    {
      id: 'act_crash_leader',
      label: t.crashLeader,
      category: 'Chaos & Testing',
      icon: ShieldAlert,
      run: () => { onCrashLeader(); onClose(); }
    },
    {
      id: 'act_toggle_chaos',
      label: t.toggleChaos,
      category: 'Chaos & Testing',
      icon: Flame,
      run: () => { onToggleChaos(); onClose(); }
    },
    {
      id: 'act_replay_dlq',
      label: t.replayDlq,
      category: 'Operations',
      icon: Play,
      run: () => { onReplayDlq(); onClose(); }
    },
    {
      id: 'act_spawn_worker',
      label: t.spawnWorker,
      category: 'Worker Fleet',
      icon: Cpu,
      run: () => { onSpawnWorker(); onClose(); }
    }
  ];

  const filtered = actions.filter(a => 
    a.label.toLowerCase().includes(query.toLowerCase()) || 
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-[#0D121C] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No actions found matching "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.run}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#090D14] border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
          <span>Navigate with arrows or click</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
