import { useState, KeyboardEvent } from 'react';
import {
  Sparkles,
  Zap,
  Wand2,
  FileCheck2,
  HelpCircle,
  History,
  Send,
  Loader2,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { CodeFile, TimeTravelSnapshot } from '../../types';

interface JoeCodeAgentPanelProps {
  activeFile: CodeFile;
  allFiles: CodeFile[];
  onApplyDiff: (
    newCode: string,
    summary: string,
    highlights: string[],
    action: string
  ) => void;
  snapshots: TimeTravelSnapshot[];
  onRestoreSnapshot: (snapshot: TimeTravelSnapshot) => void;
}

export function JoeCodeAgentPanel({
  activeFile,
  allFiles,
  onApplyDiff,
  snapshots,
  onRestoreSnapshot,
}: JoeCodeAgentPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'composer' | 'timetravel'>('composer');

  const [lastAction, setLastAction] = useState<{ action: string; prompt?: string } | null>(null);

  const executeAction = async (action: string, customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt.trim();
    if (!finalPrompt && action !== 'fix') return;

    setLoading(true);
    setError(null);
    setLastAction({ action, prompt: customPrompt });

    try {
      const filesMap: Record<string, string> = {};
      allFiles.forEach((f) => {
        filesMap[f.name] = f.content;
      });

      const res = await fetch('/api/code/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          code: activeFile.content,
          filename: activeFile.name,
          prompt: finalPrompt || 'Detect and fix all syntax, structural, and performance bugs in this file.',
          allFiles: filesMap,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let errMsg = errData.error || 'Failed to process AI code edit.';
        if (typeof errMsg === 'string' && (errMsg.includes('{"error"') || errMsg.startsWith('{'))) {
          try {
            const parsed = JSON.parse(errMsg);
            if (parsed?.error?.message) {
              errMsg = parsed.error.message;
            }
          } catch {
            // ignore
          }
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      onApplyDiff(
        data.code,
        data.summary || `Updated ${activeFile.name} with Joe Code.`,
        data.highlights || [],
        action
      );
      setPrompt('');
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Error executing AI code operation.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeAction('edit');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 border-l border-neutral-800 text-xs text-neutral-200 select-none">
      {/* Header Tabs */}
      <div className="flex items-center justify-between p-2.5 border-b border-neutral-800 bg-neutral-950 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-white text-black flex items-center justify-center font-bold text-[10px]">
            J
          </div>
          <span className="font-semibold text-neutral-100 text-xs">Joe Code Agent</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('composer')}
            className={`px-2 py-1 rounded text-[11px] transition cursor-pointer ${
              activeTab === 'composer' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Composer
          </button>
          <button
            onClick={() => setActiveTab('timetravel')}
            title="Time-Travel Snapshots (Our Special Twist)"
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition cursor-pointer ${
              activeTab === 'timetravel' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <History className="w-3 h-3" />
            <span>Snapshots ({snapshots.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'composer' ? (
        <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-4">
          {/* Active File Context Tag */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-neutral-800/80 border border-neutral-700/80 text-[11px]">
            <span className="text-neutral-400">Targeting:</span>
            <span className="font-mono font-medium text-emerald-400">{activeFile.name}</span>
          </div>

          {/* Quick Action Pills (Claude / Cursor style) */}
          <div>
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Instant Actions
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => executeAction('fix', 'Fix syntax errors, bugs, and edge cases in this file.')}
                disabled={loading}
                className="flex items-center gap-1.5 p-2 rounded-lg border border-neutral-800 bg-neutral-950/70 hover:bg-neutral-800 hover:border-neutral-700 transition text-left cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div className="truncate">
                  <div className="font-medium text-neutral-200">Auto-Fix</div>
                  <div className="text-[10px] text-neutral-500">Heal errors</div>
                </div>
              </button>

              <button
                onClick={() =>
                  executeAction(
                    'edit',
                    'Enhance UI aesthetic, polish animations, add responsive styling, and modern micro-interactions.'
                  )
                }
                disabled={loading}
                className="flex items-center gap-1.5 p-2 rounded-lg border border-neutral-800 bg-neutral-950/70 hover:bg-neutral-800 hover:border-neutral-700 transition text-left cursor-pointer disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <div className="truncate">
                  <div className="font-medium text-neutral-200">Polish UI</div>
                  <div className="text-[10px] text-neutral-500">Upgrade design</div>
                </div>
              </button>

              <button
                onClick={() => executeAction('test', 'Generate comprehensive unit test coverage with assert cases.')}
                disabled={loading}
                className="flex items-center gap-1.5 p-2 rounded-lg border border-neutral-800 bg-neutral-950/70 hover:bg-neutral-800 hover:border-neutral-700 transition text-left cursor-pointer disabled:opacity-50"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <div className="truncate">
                  <div className="font-medium text-neutral-200">Write Tests</div>
                  <div className="text-[10px] text-neutral-500">Unit test suite</div>
                </div>
              </button>

              <button
                onClick={() =>
                  executeAction('refactor', 'Refactor and simplify code logic, optimize performance, and clean types.')
                }
                disabled={loading}
                className="flex items-center gap-1.5 p-2 rounded-lg border border-neutral-800 bg-neutral-950/70 hover:bg-neutral-800 hover:border-neutral-700 transition text-left cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <div className="font-medium text-neutral-200">Refactor</div>
                  <div className="text-[10px] text-neutral-500">Clean code</div>
                </div>
              </button>
            </div>
          </div>

          {/* Error Banner if any */}
          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-[11px] flex items-start justify-between gap-2 animate-fade-in">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span className="leading-snug">{error}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (lastAction) {
                    executeAction(lastAction.action, lastAction.prompt);
                  } else {
                    executeAction('fix');
                  }
                }}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 rounded bg-red-900/80 hover:bg-red-800 border border-red-700 text-red-100 text-[10px] font-medium transition cursor-pointer disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          )}

          {/* Prompt Composer */}
          <div className="flex-1 flex flex-col pt-2">
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Natural Language Instruction
            </div>
            <div className="relative flex-1 flex flex-col rounded-xl border border-neutral-800 bg-neutral-950 focus-within:border-neutral-600 transition">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Ask Joe Code to add features, refactor components, or solve logic issues..."
                className="w-full flex-1 min-h-[90px] p-3 bg-transparent text-neutral-100 text-xs resize-none outline-hidden placeholder:text-neutral-500 select-text"
              />
              <div className="p-2 border-t border-neutral-850 flex items-center justify-between bg-neutral-900/40">
                <span className="text-[10px] text-neutral-500">Press Enter to run</span>
                <button
                  onClick={() => executeAction('edit')}
                  disabled={!prompt.trim() || loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 font-medium text-xs transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Run Agent</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Time Travel Tab (Joe Code Unique Twist) */
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
          <div className="text-neutral-400 text-[11px] leading-relaxed mb-2">
            <strong>Joe Smart Time-Travel</strong> automatically captures project snapshots before any AI or user patch, letting you travel back anytime.
          </div>

          {snapshots.length === 0 ? (
            <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-950 text-center text-neutral-500 text-xs">
              No snapshots recorded yet. Snapshots will appear here as you edit or apply AI changes.
            </div>
          ) : (
            snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 hover:bg-neutral-800/50 transition flex items-center justify-between gap-2"
              >
                <div>
                  <div className="font-medium text-neutral-200 text-xs">{snap.label}</div>
                  <div className="text-[10px] text-neutral-500">
                    {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>

                <button
                  onClick={() => onRestoreSnapshot(snap)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-neutral-400" />
                  <span>Restore</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
