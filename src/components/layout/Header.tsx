import React from 'react';
import { 
  Play, 
  Pause, 
  FastForward, 
  Flame, 
  Languages, 
  Command, 
  Cpu, 
  CheckCircle2,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { Language, translations } from '../../locales/translations';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  language: Language;
  onLanguageToggle: () => void;
  isEngineRunning: boolean;
  onToggleEngine: () => void;
  clockSpeed: number;
  onSetClockSpeed: (speed: number) => void;
  chaosMode: boolean;
  onToggleChaos: () => void;
  onOpenCommandPalette: () => void;
  leaderNodeId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  language,
  onLanguageToggle,
  isEngineRunning,
  onToggleEngine,
  clockSpeed,
  onSetClockSpeed,
  chaosMode,
  onToggleChaos,
  onOpenCommandPalette,
  leaderNodeId
}) => {
  const t = translations[language];

  const navItems = [
    { id: 'overview', label: t.navOverview },
    { id: 'jobs', label: t.navJobs },
    { id: 'workflows', label: t.navWorkflows },
    { id: 'queues', label: t.navQueues },
    { id: 'workers', label: t.navWorkers },
    { id: 'consensus', label: t.navConsensus },
    { id: 'tenants', label: t.navTenants },
    { id: 'audit', label: t.navAudit },
    { id: 'observability', label: t.navObservability },
    { id: 'architecture', label: t.navArchitecture },
    { id: 'readme', label: t.navReadme },
  ];

  const speeds = [0.5, 1, 2, 5];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Single Brand Wordmark */}
      <div className="flex items-center gap-4">
        <a 
          href="#overview" 
          onClick={(e) => { e.preventDefault(); onTabChange('overview'); }}
          className="text-base font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm shadow-indigo-500/30">
            K
          </div>
          <span>{t.brand}</span>
        </a>

        {/* Quiet Leader Telemetry Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 pl-2 border-l border-slate-800 font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{leaderNodeId || 'scheduler-01'}</span>
          <span className="text-slate-600">/</span>
          <span className="text-indigo-400">Term 14</span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Clean text with subtle active state) */}
      <nav className="hidden xl:flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800/60">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Interactive Controls (Engine, Clock, Chaos, Language, Palette) */}
      <div className="flex items-center gap-2">
        {/* Speed Selector */}
        <div className="hidden md:flex items-center bg-slate-900/80 border border-slate-800 rounded-md p-0.5 text-xs">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSetClockSpeed(s)}
              className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                clockSpeed === s ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Engine Play/Pause */}
        <button
          onClick={onToggleEngine}
          title={isEngineRunning ? 'Pause Engine Tick' : 'Resume Engine Tick'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
            isEngineRunning
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          {isEngineRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline font-mono text-[11px]">{isEngineRunning ? 'TICKING' : 'PAUSED'}</span>
        </button>

        {/* Chaos Engineering Toggle */}
        <button
          onClick={onToggleChaos}
          title="Toggle Chaos Injected Network Jitter"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
            chaosMode
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300 hover:border-slate-700'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span className="hidden md:inline font-mono text-[11px]">{chaosMode ? 'CHAOS ON' : 'CHAOS'}</span>
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 bg-slate-900/80 border border-slate-800 rounded-md hover:text-white hover:border-slate-700 transition-colors"
          title="Command Palette (Cmd+K)"
        >
          <Command className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px] font-mono">⌘K</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={onLanguageToggle}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-md hover:text-white hover:border-slate-700 transition-colors"
          title="Toggle English / فارسی"
        >
          <Languages className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px] uppercase font-semibold">{language === 'en' ? 'FA' : 'EN'}</span>
        </button>
      </div>
    </header>
  );
};
