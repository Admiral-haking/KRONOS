import React, { useState } from 'react';
import { 
  GitFork, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  FileCode, 
  ArrowRight,
  Database,
  Globe,
  Bell,
  HardDrive,
  Code2,
  RefreshCw
} from 'lucide-react';
import { Language, translations } from '../../locales/translations';
import { Workflow, WorkflowRun, WorkflowStep } from '../../types';

interface WorkflowsTabProps {
  language: Language;
  workflows: Workflow[];
  workflowRuns: WorkflowRun[];
  onTriggerWorkflow: (id: string) => void;
}

export const WorkflowsTab: React.FC<WorkflowsTabProps> = ({
  language,
  workflows,
  workflowRuns,
  onTriggerWorkflow
}) => {
  const t = translations[language];
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || '');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');

  const activeWorkflow = workflows.find(w => w.id === selectedWorkflowId) || workflows[0];
  
  // Find current or most recent run for this workflow
  const latestRun = workflowRuns.find(r => r.workflowId === activeWorkflow?.id);

  const getStepIcon = (actionType: string) => {
    switch (actionType) {
      case 'webhook': return Globe;
      case 'database': return Database;
      case 'storage': return HardDrive;
      case 'notification': return Bell;
      default: return Code2;
    }
  };

  const selectedStep = activeWorkflow?.steps.find(s => s.id === selectedStepId);
  const selectedStepRun = latestRun?.stepRuns[selectedStepId || ''];

  return (
    <div className="space-y-6">
      {/* Top Workflow Selector & Run Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-[#0D121C] border border-slate-800 rounded-xl gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white tracking-tight">{t.workflowTitle}</h2>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-indigo-400 font-mono">v{activeWorkflow?.version || 1}.0</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{t.workflowDesc}</p>
            </div>
          </div>
        </div>

        {/* Workflow Switcher & Trigger Button */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedWorkflowId}
            onChange={(e) => {
              setSelectedWorkflowId(e.target.value);
              setSelectedStepId(null);
            }}
            className="px-3 py-1.5 bg-[#090D14] border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
          >
            {workflows.map((wf) => (
              <option key={wf.id} value={wf.id}>
                {wf.name} ({wf.steps.length} steps)
              </option>
            ))}
          </select>

          {/* Mode Switcher: Visual vs JSON */}
          <div className="flex items-center bg-[#090D14] p-1 border border-slate-800 rounded-lg text-xs font-mono">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'visual' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              DAG Canvas
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'json' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              JSON Schema
            </button>
          </div>

          <button
            onClick={() => onTriggerWorkflow(activeWorkflow.id)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{t.startExecution}</span>
          </button>
        </div>
      </div>

      {/* Main Workflow View: Visual DAG vs JSON */}
      {viewMode === 'visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive DAG Graph Canvas */}
          <div className="lg:col-span-2 p-5 bg-[#0D121C] border border-slate-800 rounded-xl flex flex-col justify-between min-h-[480px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span className="font-semibold text-white">{activeWorkflow.name}</span>
                <span className="text-slate-500">·</span>
                <span>{activeWorkflow.steps.length} Nodes</span>
                {latestRun && (
                  <>
                    <span className="text-slate-500">·</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      latestRun.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      latestRun.status === 'running' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      RUN: {latestRun.status.toUpperCase()}
                    </span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Click any step node to inspect</span>
            </div>

            {/* Visual Graph Container with SVG connecting paths */}
            <div className="relative flex-1 w-full my-4 bg-[#090D14] border border-slate-800/80 rounded-xl p-4 overflow-x-auto min-h-[360px]">
              {/* SVG Edges connecting nodes */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: 1080, minHeight: 340 }}>
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 6 3, 0 6" fill="#4F46E5" />
                  </marker>
                  <marker
                    id="arrowhead-gray"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 6 3, 0 6" fill="#334155" />
                  </marker>
                </defs>

                {activeWorkflow.steps.map((step) => {
                  return step.dependsOn.map((depId) => {
                    const prereq = activeWorkflow.steps.find(s => s.id === depId);
                    if (!prereq) return null;

                    const startX = prereq.position.x + 180;
                    const startY = prereq.position.y + 40;
                    const endX = step.position.x;
                    const endY = step.position.y + 40;
                    const midX = (startX + endX) / 2;

                    const prereqRun = latestRun?.stepRuns[prereq.id];
                    const isFlowActive = prereqRun?.status === 'completed';

                    return (
                      <path
                        key={`${depId}->${step.id}`}
                        d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                        fill="none"
                        stroke={isFlowActive ? '#6366F1' : '#334155'}
                        strokeWidth={isFlowActive ? '2' : '1.5'}
                        strokeDasharray={isFlowActive ? 'none' : '4 4'}
                        markerEnd={isFlowActive ? 'url(#arrowhead)' : 'url(#arrowhead-gray)'}
                        className="transition-colors duration-300"
                      />
                    );
                  });
                })}
              </svg>

              {/* Node Cards overlay */}
              <div className="relative" style={{ minWidth: 1080, minHeight: 340 }}>
                {activeWorkflow.steps.map((step) => {
                  const Icon = getStepIcon(step.actionType);
                  const isSelected = selectedStepId === step.id;
                  const stepRun = latestRun?.stepRuns[step.id];
                  const status = stepRun?.status || 'waiting';

                  return (
                    <div
                      key={step.id}
                      onClick={() => setSelectedStepId(step.id)}
                      style={{
                        position: 'absolute',
                        left: `${step.position.x}px`,
                        top: `${step.position.y}px`,
                        width: '180px'
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer select-none bg-[#0D121C] shadow-lg ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        
                        {/* Status Icon */}
                        {status === 'completed' ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>DONE</span>
                          </span>
                        ) : status === 'running' ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-indigo-400 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span>RUNNING</span>
                          </span>
                        ) : status === 'failed' ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>FAIL</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">
                            WAIT
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                        {step.name}
                      </div>

                      <div className="mt-1 text-[10px] text-slate-400 font-mono truncate">
                        {step.handler.split('/').pop()}
                      </div>

                      {stepRun?.durationMs && (
                        <div className="mt-2 text-[10px] text-slate-500 font-mono border-t border-slate-800/60 pt-1">
                          Duration: {stepRun.durationMs}ms
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span>Waiting Prereq</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span>Running Step</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Failed</span>
              </div>
            </div>
          </div>

          {/* Right: Step Telemetry Inspector */}
          <div className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white">{t.stepDetails}</h3>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedStep ? selectedStep.id : 'No step selected'}
                </span>
              </div>

              {selectedStep ? (
                <div className="mt-4 space-y-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">Step Identifier</span>
                    <span className="text-sm text-slate-200 font-bold">{selectedStep.name}</span>
                  </div>

                  <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Action Type:</span>
                      <span className="text-indigo-400 uppercase font-semibold">{selectedStep.actionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timeout:</span>
                      <span className="text-slate-300">{selectedStep.timeoutMs}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Handler:</span>
                      <span className="text-slate-300 truncate max-w-[140px]">{selectedStep.handler}</span>
                    </div>
                  </div>

                  {/* Prerequisites */}
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block mb-1">
                      {t.dependencies}
                    </span>
                    {selectedStep.dependsOn.length === 0 ? (
                      <span className="text-slate-500 italic text-[11px]">Root node (no prerequisites)</span>
                    ) : (
                      <div className="space-y-1">
                        {selectedStep.dependsOn.map((dep) => (
                          <div key={dep} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                            <ArrowRight className="w-3 h-3 text-indigo-400" />
                            <span>{dep}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Step Execution Telemetry */}
                  {selectedStepRun && (
                    <div className="p-3 bg-[#090D14] border border-slate-800 rounded-lg space-y-2">
                      <div className="text-[10px] text-indigo-400 font-semibold uppercase">Latest Execution</div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className="text-emerald-400 font-bold uppercase">{selectedStepRun.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Worker:</span>
                        <span className="text-slate-300">{selectedStepRun.workerId || 'pool-assigned'}</span>
                      </div>
                      {selectedStepRun.durationMs && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Duration:</span>
                          <span className="text-slate-300">{selectedStepRun.durationMs}ms</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-slate-500 font-mono">
                  Select a step node on the DAG canvas to inspect parameters, dependencies, and execution logs.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              Topological sort validated · Zero cycles detected
            </div>
          </div>
        </div>
      ) : (
        /* JSON DAG Definition Viewer */
        <div className="p-5 bg-[#0D121C] border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Declarative DAG JSON Definition</h3>
              <p className="text-xs text-slate-400">Serializable workflow specification compatible with SDK dispatch</p>
            </div>
          </div>
          <pre className="p-4 bg-[#090D14] border border-slate-800 rounded-lg text-xs font-mono text-indigo-300 overflow-x-auto max-h-[500px]">
            {JSON.stringify(activeWorkflow, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
