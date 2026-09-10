import { PanelLeft, Settings as SettingsIcon, Sun, Moon, Laptop, Plus, Code2, Gamepad2 } from 'lucide-react';
import { ThemeMode } from '../types';
import { JoeLogo } from './JoeLogo';

interface HeaderProps {
  conversationTitle: string;
  modelName: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenCodeSection?: () => void;
  onOpenChessSection?: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export function Header({
  conversationTitle,
  isSidebarOpen,
  onToggleSidebar,
  onNewChat,
  onOpenSettings,
  onOpenCodeSection,
  onOpenChessSection,
  theme,
  onThemeChange,
}: HeaderProps) {
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
    <header className="sticky top-0 z-30 h-13 px-4 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-between">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Mobile New Chat shortcut */}
        <button
          onClick={onNewChat}
          title="New conversation"
          aria-label="New conversation"
          className="md:hidden p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Conversation Title & Gret Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <JoeLogo size="xs" className="hidden sm:inline-flex" />
          <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
            {conversationTitle}
          </h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/60 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gret AI</span>
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5">
        {/* Switch to Games Arena */}
        {onOpenChessSection && (
          <button
            onClick={onOpenChessSection}
            title="Play Games with Gret: Chess, Checkers, Uno, Sorry! Revenge"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Gret Games</span>
          </button>
        )}

        {/* Switch to Gret Code Section */}
        {onOpenCodeSection && (
          <button
            onClick={onOpenCodeSection}
            title="Open Gret Code (IDE & Agent CLI)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gret Code</span>
          </button>
        )}

        <button
          onClick={cycleTheme}
          title={`Theme: ${theme}`}
          aria-label={`Theme: ${theme}`}
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
        >
          {themeIcon}
        </button>

        <button
          onClick={onOpenSettings}
          title="Settings"
          aria-label="Settings"
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
