import { useState } from 'react';
import {
  FolderTree,
  FileCode,
  Play,
  Columns2,
  Maximize2,
  Terminal as TerminalIcon,
  Download,
  Plus,
  Trash2,
  GitCompare,
  ArrowLeft,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { CodeProject, CodeFile, CodeDiff, TimeTravelSnapshot } from '../../types';
import { DEFAULT_PROJECTS } from '../../data/defaultProjects';
import { CodeEditorView } from './CodeEditorView';
import { LivePreview } from './LivePreview';
import { DiffViewer } from './DiffViewer';
import { TerminalCLI } from './TerminalCLI';
import { JoeCodeAgentPanel } from './JoeCodeAgentPanel';

interface JoeCodeWorkspaceProps {
  onBackToChat: () => void;
}

export function JoeCodeWorkspace({ onBackToChat }: JoeCodeWorkspaceProps) {
  const [projects, setProjects] = useState<CodeProject[]>(DEFAULT_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(DEFAULT_PROJECTS[0].id);
  const [layoutMode, setLayoutMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(true);
  const [activeDiff, setActiveDiff] = useState<CodeDiff | null>(null);
  const [snapshots, setSnapshots] = useState<TimeTravelSnapshot[]>([]);
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const activeFile =
    activeProject.files.find((f) => f.id === activeProject.activeFileId) || activeProject.files[0];

  // Helper to record a time travel snapshot
  const recordSnapshot = (label: string) => {
    const filesMap: Record<string, string> = {};
    activeProject.files.forEach((f) => {
      filesMap[f.name] = f.content;
    });

    const newSnap: TimeTravelSnapshot = {
      id: 'snap_' + Math.random().toString(36).slice(2, 9),
      timestamp: Date.now(),
      label,
      files: filesMap,
    };
    setSnapshots((prev) => [newSnap, ...prev.slice(0, 19)]);
  };

  // Switch active file
  const handleSelectFile = (fileId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? { ...p, activeFileId: fileId } : p))
    );
  };

  // Update file content
  const handleUpdateCode = (newCode: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProjectId) return p;
        return {
          ...p,
          files: p.files.map((f) => (f.id === activeFile.id ? { ...f, content: newCode } : f)),
        };
      })
    );
  };

  // Create new file
  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      setIsCreatingFile(false);
      return;
    }
    const name = newFileName.trim();
    let language = 'javascript';
    if (name.endsWith('.html')) language = 'html';
    else if (name.endsWith('.css')) language = 'css';
    else if (name.endsWith('.ts') || name.endsWith('.tsx')) language = 'typescript';
    else if (name.endsWith('.json')) language = 'json';

    const newFile: CodeFile = {
      id: 'f_' + Math.random().toString(36).slice(2, 9),
      name,
      content: `// ${name}\n\n`,
      language,
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProjectId) return p;
        return {
          ...p,
          files: [...p.files, newFile],
          activeFileId: newFile.id,
        };
      })
    );
    setNewFileName('');
    setIsCreatingFile(false);
  };

  // Delete file
  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeProject.files.length <= 1) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProjectId) return p;
        const remaining = p.files.filter((f) => f.id !== fileId);
        return {
          ...p,
          files: remaining,
          activeFileId: p.activeFileId === fileId ? remaining[0].id : p.activeFileId,
        };
      })
    );
  };

  // AI Diff proposal received
  const handleApplyDiff = (
    newCode: string,
    summary: string,
    highlights: string[],
    action: string
  ) => {
    // Save snapshot of current state before applying patch
    recordSnapshot(`Before AI ${action.toUpperCase()} on ${activeFile.name}`);

    setActiveDiff({
      oldCode: activeFile.content,
      newCode,
      filename: activeFile.name,
      summary,
      highlights,
    });
  };

  // Accept diff
  const handleAcceptDiff = () => {
    if (!activeDiff) return;
    handleUpdateCode(activeDiff.newCode);
    setActiveDiff(null);
  };

  // Reject diff
  const handleRejectDiff = () => {
    setActiveDiff(null);
  };

  // Restore snapshot (our special twist)
  const handleRestoreSnapshot = (snap: TimeTravelSnapshot) => {
    recordSnapshot(`Prior to restoring snapshot from ${new Date(snap.timestamp).toLocaleTimeString()}`);
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProjectId) return p;
        return {
          ...p,
          files: p.files.map((f) => {
            if (snap.files[f.name] !== undefined) {
              return { ...f, content: snap.files[f.name] };
            }
            return f;
          }),
        };
      })
    );
  };

  // Export project files
  const handleExportProject = () => {
    const data = {
      project: activeProject.name,
      exportedAt: new Date().toISOString(),
      files: activeProject.files.map((f) => ({
        name: f.name,
        content: f.content,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject.name.toLowerCase().replace(/\s+/g, '-')}-export.json`;
    a.click();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans antialiased">
      {/* Top Navbar */}
      <header className="h-12 border-b border-neutral-800 bg-neutral-900/90 px-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          {/* Back to Joe Chat button */}
          <button
            onClick={onBackToChat}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-950/60 text-neutral-400 hover:text-white text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-medium">Joe Chat</span>
          </button>

          <div className="h-4 w-px bg-neutral-800" />

          {/* Logo & Section Title */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs">
              J
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">Joe Code</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-medium">
                IDE & Agent
              </span>
            </div>
          </div>

          {/* Project Switcher Dropdown */}
          <div className="hidden sm:flex items-center ml-2">
            <select
              value={activeProjectId}
              onChange={(e) => {
                setActiveProjectId(e.target.value);
                setActiveDiff(null);
              }}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 outline-hidden hover:border-neutral-700 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          {/* Layout Mode Selector */}
          <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-950 p-0.5 text-xs">
            <button
              onClick={() => setLayoutMode('split')}
              title="Split View (Code + Preview)"
              className={`p-1.5 rounded transition cursor-pointer ${
                layoutMode === 'split' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('editor')}
              title="Editor Only"
              className={`p-1.5 rounded transition cursor-pointer ${
                layoutMode === 'editor' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('preview')}
              title="Live Preview Only"
              className={`p-1.5 rounded transition cursor-pointer ${
                layoutMode === 'preview' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Terminal CLI Toggle */}
          <button
            onClick={() => setTerminalOpen(!terminalOpen)}
            title="Toggle Agent Terminal CLI"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
              terminalOpen
                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">CLI</span>
          </button>

          {/* AI Agent Panel Toggle */}
          <button
            onClick={() => setAgentOpen(!agentOpen)}
            title="Toggle Joe Code AI Copilot"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
              agentOpen
                ? 'border-neutral-700 bg-neutral-800 text-white'
                : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Agent</span>
          </button>

          {/* Export Project */}
          <button
            onClick={handleExportProject}
            title="Export Project Code"
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left File Explorer Bar */}
        <aside className="w-48 sm:w-56 border-r border-neutral-850 bg-neutral-950/80 flex flex-col shrink-0 select-none">
          <div className="flex items-center justify-between p-2.5 border-b border-neutral-850 text-xs text-neutral-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              <span>Workspace Files</span>
            </span>
            <button
              onClick={() => setIsCreatingFile(true)}
              title="Add file"
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Create File Input */}
          {isCreatingFile && (
            <div className="p-2 border-b border-neutral-800">
              <input
                type="text"
                autoFocus
                placeholder="filename.ext"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFile();
                  if (e.key === 'Escape') setIsCreatingFile(false);
                }}
                onBlur={handleCreateFile}
                className="w-full px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-xs text-neutral-100 outline-hidden font-mono"
              />
            </div>
          )}

          {/* File List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {activeProject.files.map((file) => {
              const isSelected = file.id === activeFile.id;
              return (
                <div
                  key={file.id}
                  onClick={() => handleSelectFile(file.id)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition ${
                    isSelected
                      ? 'bg-neutral-800 text-white font-medium'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`} />
                    <span className="truncate">{file.name}</span>
                  </div>

                  {activeProject.files.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteFile(file.id, e)}
                      title="Delete file"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-neutral-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time travel count tag */}
          <div className="p-2 border-t border-neutral-850 text-[10px] text-neutral-500 flex items-center justify-between">
            <span>Snapshots: {snapshots.length}</span>
            <span className="text-emerald-500">Auto-Synced</span>
          </div>
        </aside>

        {/* Center: Editor + Live Preview / Diff */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* File Tabs Strip */}
          <div className="flex items-center px-2 border-b border-neutral-850 bg-neutral-900/60 overflow-x-auto shrink-0 select-none">
            {activeProject.files.map((file) => {
              const isSelected = file.id === activeFile.id;
              return (
                <button
                  key={file.id}
                  onClick={() => handleSelectFile(file.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 border-b-2 text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'border-white text-white bg-neutral-900 font-medium'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <FileCode className="w-3 h-3 text-neutral-500" />
                  <span>{file.name}</span>
                </button>
              );
            })}

            {activeDiff && (
              <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded bg-amber-950/60 border border-amber-800/80 text-amber-300 text-[11px] font-mono">
                <GitCompare className="w-3 h-3" />
                <span>Diff Previewing</span>
              </div>
            )}
          </div>

          {/* Editor & Preview Split Workspace */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* If Diff Inspector is active, show DiffViewer side-by-side or overlay */}
            {activeDiff ? (
              <div className="flex-1 h-full">
                <DiffViewer
                  diff={activeDiff}
                  onAccept={handleAcceptDiff}
                  onReject={handleRejectDiff}
                />
              </div>
            ) : (
              <>
                {/* Code Editor */}
                {(layoutMode === 'split' || layoutMode === 'editor') && (
                  <div className={`h-full ${layoutMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
                    <CodeEditorView
                      code={activeFile.content}
                      language={activeFile.language}
                      onChange={handleUpdateCode}
                    />
                  </div>
                )}

                {/* Live Preview */}
                {(layoutMode === 'split' || layoutMode === 'preview') && (
                  <div className={`h-full ${layoutMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
                    <LivePreview files={activeProject.files} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Collapsible Terminal CLI Drawer */}
          {terminalOpen && (
            <div className="h-56 shrink-0 z-20">
              <TerminalCLI files={activeProject.files} />
            </div>
          )}
        </div>

        {/* Right AI Copilot Agent Panel */}
        {agentOpen && (
          <aside className="w-72 sm:w-80 shrink-0 border-l border-neutral-850 flex flex-col overflow-hidden">
            <JoeCodeAgentPanel
              activeFile={activeFile}
              allFiles={activeProject.files}
              onApplyDiff={handleApplyDiff}
              snapshots={snapshots}
              onRestoreSnapshot={handleRestoreSnapshot}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
