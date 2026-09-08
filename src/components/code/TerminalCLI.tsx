import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Terminal, CornerDownLeft, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { TerminalEntry, CodeFile } from '../../types';

interface TerminalCLIProps {
  files: CodeFile[];
  onCommandOutput?: (output: string) => void;
}

export function TerminalCLI({ files }: TerminalCLIProps) {
  const [history, setHistory] = useState<TerminalEntry[]>([
    {
      id: 'init_1',
      command: 'joe-code --version',
      output: `Joe Code Agentic CLI v2.4.0
Interactive environment active.
Type 'help' for command manual, 'test' to run unit tests, or type any instruction in natural language!`,
      status: 'info',
      timestamp: Date.now(),
    },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [running, setRunning] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, running]);

  const handleRunCommand = async (cmdToRun: string) => {
    const trimmed = cmdToRun.trim();
    if (!trimmed) return;

    if (trimmed === 'clear') {
      setHistory([]);
      setCurrentInput('');
      return;
    }

    const newEntry: TerminalEntry = {
      id: 'term_' + Math.random().toString(36).slice(2, 9),
      command: trimmed,
      output: '',
      status: 'info',
      timestamp: Date.now(),
    };

    setHistory((prev) => [...prev, newEntry]);
    setCurrentInput('');
    setRunning(true);

    try {
      // Map files to key-value
      const filesMap: Record<string, string> = {};
      files.forEach((f) => {
        filesMap[f.name] = f.content;
      });

      const res = await fetch('/api/code/run-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: trimmed,
          files: filesMap,
        }),
      });

      if (!res.ok) {
        throw new Error(`Command runner error: ${res.status}`);
      }

      const data = await res.json();
      setHistory((prev) =>
        prev.map((item) =>
          item.id === newEntry.id
            ? {
                ...item,
                output: data.output || 'Command completed.',
                status: data.status === 'error' ? 'error' : 'success',
              }
            : item
        )
      );
    } catch (err: any) {
      setHistory((prev) =>
        prev.map((item) =>
          item.id === newEntry.id
            ? {
                ...item,
                output: `Error: ${err?.message || 'Failed to execute command.'}`,
                status: 'error',
              }
            : item
        )
      );
    } finally {
      setRunning(false);
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const userCmds = history.map((h) => h.command).filter(Boolean);
      if (userCmds.length === 0) return;
      const nextIdx = historyIndex === -1 ? userCmds.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setCurrentInput(userCmds[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const userCmds = history.map((h) => h.command).filter(Boolean);
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= userCmds.length) {
        setHistoryIndex(-1);
        setCurrentInput('');
      } else {
        setHistoryIndex(nextIdx);
        setCurrentInput(userCmds[nextIdx] || '');
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex flex-col h-full w-full bg-neutral-950 text-neutral-200 font-mono text-[12px] overflow-hidden select-text border-t border-neutral-800"
    >
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-850 bg-neutral-900/80 text-xs text-neutral-400 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-semibold text-neutral-300">Joe Code Agent CLI</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">
            bash • zsh
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setHistory([])}
            title="Clear terminal"
            className="p-1 rounded hover:text-white hover:bg-neutral-800 text-neutral-400 transition cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {history.map((entry) => (
          <div key={entry.id} className="space-y-1">
            {/* Command prompt line */}
            <div className="flex items-center gap-2 text-neutral-300 select-none">
              <span className="text-emerald-400 font-bold">joe-code:~/app</span>
              <span className="text-neutral-500">$</span>
              <span className="text-neutral-100 font-semibold">{entry.command}</span>
            </div>

            {/* Command result output */}
            {entry.output ? (
              <div
                className={`pl-3 text-[11px] leading-relaxed whitespace-pre-wrap ${
                  entry.status === 'error'
                    ? 'text-red-400'
                    : entry.status === 'success'
                    ? 'text-neutral-300'
                    : 'text-neutral-400'
                }`}
              >
                {entry.output}
              </div>
            ) : (
              running && (
                <div className="pl-3 text-[11px] text-neutral-500 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Executing agent command...</span>
                </div>
              )
            )}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Command Input Row */}
      <div className="p-2.5 border-t border-neutral-850 bg-neutral-900/50 flex items-center gap-2 select-none">
        <span className="text-emerald-400 font-bold text-xs select-none">joe-code:~/app $</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command (e.g. 'npm test', 'build', 'lint', 'help') or instructions..."
          disabled={running}
          className="flex-1 bg-transparent text-neutral-100 text-xs font-mono outline-hidden placeholder:text-neutral-600"
        />
        <button
          onClick={() => handleRunCommand(currentInput)}
          disabled={!currentInput.trim() || running}
          className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 disabled:opacity-40 transition cursor-pointer"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
