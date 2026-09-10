import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Edit2,
  Trash2,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  X,
  Check,
  PanelLeftClose,
  Code2,
  Swords,
} from 'lucide-react';
import { Conversation, ThemeMode } from '../types';
import { JoeLogo } from './JoeLogo';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  onOpenCodeSection?: () => void;
  onOpenChessSection?: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onOpenSettings,
  onOpenCodeSection,
  onOpenChessSection,
  theme,
  onThemeChange,
  isOpen,
  onClose,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter conversations by title or message content
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  const startEditing = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const saveEditing = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const requestDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
    setConfirmDeleteId(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const cycleTheme = () => {
    const next: Record<ThemeMode, ThemeMode> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    };
    onThemeChange(next[theme]);
  };

  const themeIcon = {
    light: <Sun className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
    system: <Laptop className="w-4 h-4" />,
  }[theme];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${!isOpen ? 'md:hidden' : 'md:flex'}`}
      >
        {/* Top Header: Brand & New Chat */}
        <div className="p-3 border-b border-neutral-200/80 dark:border-neutral-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <JoeLogo size="sm" showText={true} />
            </div>
            <button
              onClick={onClose}
              title="Close sidebar"
              aria-label="Close sidebar"
              className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New conversation</span>
            </span>
            <span className="text-[10px] opacity-70 border border-white/20 dark:border-black/20 px-1 py-0.5 rounded">
              ⌘K
            </span>
          </button>

          {/* Chess Bot Button */}
          {onOpenChessSection && (
            <button
              onClick={() => {
                onOpenChessSection();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/10 dark:hover:bg-amber-500/15 text-neutral-900 dark:text-neutral-100 font-medium text-xs shadow-xs transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-500" />
                <span>Play Chess vs Craig</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold">
                100-3000
              </span>
            </button>
          )}

          {/* Craig Code IDE & Agent Button */}
          {onOpenCodeSection && (
            <button
              onClick={() => {
                onOpenCodeSection();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 font-medium text-xs shadow-xs transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-500" />
                <span>Craig Code IDE</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-mono">
                Editor
              </span>
            </button>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
              {searchQuery ? 'No matching conversations' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeId;
              const isEditing = conv.id === editingId;
              const isConfirmingDelete = conv.id === confirmDeleteId;

              if (isConfirmingDelete) {
                return (
                  <div
                    key={conv.id}
                    className="p-2 rounded-lg bg-neutral-200/70 dark:bg-neutral-800 text-xs flex items-center justify-between animate-fade-in"
                  >
                    <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate pr-2">
                      Delete chat?
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => confirmDelete(conv.id, e)}
                        className="px-2 py-1 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-medium hover:opacity-90 cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300/50 dark:hover:bg-neutral-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              if (isEditing) {
                return (
                  <form
                    key={conv.id}
                    onSubmit={(e) => saveEditing(conv.id, e)}
                    className="p-1 rounded-lg bg-neutral-200/50 dark:bg-neutral-800 flex items-center gap-1"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => saveEditing(conv.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') cancelEditing();
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="p-1 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                );
              }

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-950 dark:text-white font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{conv.title || 'Untitled conversation'}</span>
                  </div>

                  {/* Actions on hover/active */}
                  <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => startEditing(conv, e)}
                      title="Rename"
                      aria-label="Rename conversation"
                      className="p-1 rounded hover:bg-neutral-300/60 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => requestDelete(conv.id, e)}
                      title="Delete"
                      aria-label="Delete conversation"
                      className="p-1 rounded hover:bg-neutral-300/60 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Theme Switcher & Settings */}
        <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={cycleTheme}
            title={`Current theme: ${theme}. Click to switch.`}
            aria-label={`Current theme: ${theme}. Click to switch.`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer capitalize"
          >
            {themeIcon}
            <span>{theme}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
