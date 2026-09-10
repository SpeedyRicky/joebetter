import React, { useState } from 'react';
import {
  ArrowLeft,
  Code2,
  Volume2,
  VolumeX,
  Swords,
  Crown,
  Layers,
  CircleDot,
  Gamepad2,
} from 'lucide-react';
import { GameType } from '../../types';
import { JoeChessArena } from '../chess/JoeChessArena';
import { CheckersGame } from './CheckersGame';
import { UnoGame } from './UnoGame';
import { TwoPlayerBattleGame } from './TwoPlayerBattleGame';
import { SoundManager } from '../chess/chessSounds';

interface GamesArenaProps {
  initialGame?: GameType;
  onBackToChat: () => void;
  onOpenCode: () => void;
}

const soundManager = new SoundManager();

export const GamesArena: React.FC<GamesArenaProps> = ({
  initialGame = 'chess',
  onBackToChat,
  onOpenCode,
}) => {
  const [activeGame, setActiveGame] = useState<GameType>(initialGame);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
  };

  const gameTabs: {
    id: GameType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: string;
    description: string;
  }[] = [
    {
      id: 'chess',
      label: 'Chess',
      icon: Crown,
      badge: '100-3000 Elo',
      description: 'Play with Gret Chess bots & eval bar',
    },
    {
      id: 'checkers',
      label: 'Checkers',
      icon: CircleDot,
      badge: 'Jumps & Kings',
      description: 'American standard draughts vs Gret',
    },
    {
      id: 'uno',
      label: 'Uno',
      icon: Layers,
      badge: 'Action & Wild',
      description: 'Classic card battles vs Gret AI',
    },
    {
      id: 'battle',
      label: '2 Player Battle',
      icon: Swords,
      badge: 'Scratch 292728003',
      description: '2 Player Versus or AI Arena Combat',
    },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 overflow-hidden">
      {/* Top Games Navigation Bar */}
      <header className="shrink-0 h-14 px-3 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/90 backdrop-blur-md flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onBackToChat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Gret</span>
          </button>

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                Play Games with Gret
              </span>
            </div>
          </div>
        </div>

        {/* Game Selector Tabs */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700/60 overflow-x-auto max-w-[280px] sm:max-w-none">
          {gameTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeGame === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveGame(tab.id);
                  soundManager.playMove();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions (Sound toggle, Open Code IDE) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onOpenCode}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition cursor-pointer"
            title="Open Gret Code IDE"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Gret Code</span>
          </button>
        </div>
      </header>

      {/* Main Game Screen */}
      <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
        {activeGame === 'chess' && (
          <JoeChessArena onBackToChat={onBackToChat} onOpenCode={onOpenCode} />
        )}
        {activeGame === 'checkers' && <CheckersGame />}
        {activeGame === 'uno' && <UnoGame />}
        {activeGame === 'battle' && <TwoPlayerBattleGame />}
      </main>
    </div>
  );
};
