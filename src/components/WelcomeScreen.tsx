import { MessageSquare, Image, Film, Code2, Swords } from 'lucide-react';
import { JoeLogo } from './JoeLogo';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
  onGenerateImagePrompt?: (promptText: string) => void;
  onGenerateVideoPrompt?: (promptText: string) => void;
  onOpenCodeSection?: () => void;
  onOpenChessSection?: () => void;
}

const CONVERSATION_STARTERS = [
  {
    icon: Swords,
    label: 'Play Chess vs Craig',
    text: 'Play chess against Craig with custom Elo from 100 to 3000 just like Chess.com bots',
    description: 'Interactive board, Elo bots (Martin, Nelson, Magnus, 3000), hints & analysis',
    isChessAction: true,
  },
  {
    icon: Code2,
    label: 'Craig Code IDE',
    text: 'Switch to Craig Code developer IDE with live sandbox and CLI',
    description: 'Open full-stack code editor and terminal',
    isCodeAction: true,
  },
  {
    icon: MessageSquare,
    label: 'Say Hello',
    text: 'Hi Craig, how are you doing today?',
    description: 'Start a friendly conversation with Craig',
  },
  {
    icon: Image,
    label: 'Generate an Image',
    text: 'Generate an image of a serene mountain lake at sunrise with mist and pine trees',
    description: 'Ask Craig to generate artwork or photos',
  },
];

export function WelcomeScreen({ onSelectPrompt, onOpenCodeSection, onOpenChessSection }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-2xl mx-auto w-full text-center animate-fade-in">
      {/* Craig Logo */}
      <div className="mb-5 flex flex-col items-center">
        <JoeLogo size="xl" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 mb-3">
        Hi, how are you?
      </h1>

      <p className="text-[15px] text-neutral-500 dark:text-neutral-400 mb-8 max-w-md leading-relaxed">
        I’m <span className="font-semibold text-neutral-900 dark:text-neutral-100">Craig</span>. Chat with me, play chess against me from <span className="font-semibold text-amber-600 dark:text-amber-400">Elo 100 to 3000</span>, or write and execute code in <span className="font-semibold text-neutral-900 dark:text-neutral-100">Craig Code</span>.
      </p>

      {/* Conversation Starters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {CONVERSATION_STARTERS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => {
                if (item.isChessAction && onOpenChessSection) {
                  onOpenChessSection();
                } else if (item.isCodeAction && onOpenCodeSection) {
                  onOpenCodeSection();
                } else {
                  onSelectPrompt(item.text);
                }
              }}
              className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:border-neutral-300 dark:border-neutral-700 transition-all text-left flex items-start gap-3 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-200/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                  <span>{item.label}</span>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5 leading-snug">
                  {item.text}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
