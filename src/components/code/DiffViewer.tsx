import { useMemo } from 'react';
import { Check, X, GitCommit, Sparkles } from 'lucide-react';
import { CodeDiff } from '../../types';

interface DiffViewerProps {
  diff: CodeDiff;
  onAccept: () => void;
  onReject: () => void;
}

interface DiffLine {
  type: 'add' | 'remove' | 'same';
  text: string;
  oldNum?: number;
  newNum?: number;
}

export function DiffViewer({ diff, onAccept, onReject }: DiffViewerProps) {
  // Simple Myers/LCS diff algorithm for clean line-by-line visual diff
  const lines: DiffLine[] = useMemo(() => {
    const oldLines = diff.oldCode.split('\n');
    const newLines = diff.newCode.split('\n');

    const result: DiffLine[] = [];
    let o = 0;
    let n = 0;

    // Fast approximation for line-by-line display
    while (o < oldLines.length || n < newLines.length) {
      if (o < oldLines.length && n < newLines.length && oldLines[o] === newLines[n]) {
        result.push({ type: 'same', text: oldLines[o], oldNum: o + 1, newNum: n + 1 });
        o++;
        n++;
      } else if (n < newLines.length && (!oldLines.slice(o).includes(newLines[n]) || o >= oldLines.length)) {
        result.push({ type: 'add', text: newLines[n], newNum: n + 1 });
        n++;
      } else if (o < oldLines.length) {
        result.push({ type: 'remove', text: oldLines[o], oldNum: o + 1 });
        o++;
      } else {
        break;
      }
    }

    return result;
  }, [diff.oldCode, diff.newCode]);

  const addedCount = lines.filter((l) => l.type === 'add').length;
  const removedCount = lines.filter((l) => l.type === 'remove').length;

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 font-mono text-[12px] overflow-hidden select-text border-l border-neutral-800">
      {/* Header with Accept / Reject Actions */}
      <div className="p-3 border-b border-neutral-800 bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-neutral-100">{diff.filename}</span>
            <div className="flex items-center gap-1.5 text-[11px] ml-2">
              <span className="text-emerald-400 font-bold">+{addedCount}</span>
              <span className="text-rose-400 font-bold">-{removedCount}</span>
            </div>
          </div>
          {diff.summary && (
            <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
              {diff.summary}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-xs font-medium transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>
          <button
            onClick={onAccept}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept Changes</span>
          </button>
        </div>
      </div>

      {/* Highlights info banner */}
      {diff.highlights && diff.highlights.length > 0 && (
        <div className="px-3 py-2 bg-neutral-900/50 border-b border-neutral-800/80 flex items-center gap-2 text-xs text-neutral-300">
          <Sparkles className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <div className="flex flex-wrap gap-2 text-[11px]">
            {diff.highlights.map((h, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Diff Lines Container */}
      <div className="flex-1 overflow-auto p-2">
        <div className="min-w-full">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`flex items-start leading-[20px] font-mono select-text ${
                line.type === 'add'
                  ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
                  : line.type === 'remove'
                  ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                  : 'text-neutral-400'
              }`}
            >
              {/* Old line number */}
              <div className="w-8 shrink-0 select-none text-right pr-2 text-neutral-600 text-[10px]">
                {line.oldNum || ''}
              </div>
              {/* New line number */}
              <div className="w-8 shrink-0 select-none text-right pr-2 text-neutral-600 text-[10px]">
                {line.newNum || ''}
              </div>
              {/* Sign */}
              <div className="w-4 shrink-0 select-none text-center font-bold text-[11px]">
                {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
              </div>
              {/* Content */}
              <div className="flex-1 whitespace-pre pl-1">{line.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
