export interface BotCharacter {
  id: string;
  name: string;
  elo: number;
  avatar: string;
  avatarColor: string;
  title?: string;
  quote: string;
  playStyle: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'master';
}

export const BOT_PRESETS: BotCharacter[] = [
  {
    id: 'baby-gret',
    name: 'Baby Gret',
    elo: 100,
    avatar: '👶',
    avatarColor: 'bg-pink-500/20 text-pink-600 dark:text-pink-400',
    quote: "I just learned how the pieces move! Let's have fun!",
    playStyle: 'Makes random moves and frequent blunders. Perfect for absolute beginners.',
    category: 'beginner',
  },
  {
    id: 'martin-gret',
    name: 'Martin Gret',
    elo: 250,
    avatar: '🧔',
    avatarColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    quote: "I'm just happy to be here. Don't take all my pawns!",
    playStyle: 'Pushes pawns forward and occasionally forgets to protect pieces.',
    category: 'beginner',
  },
  {
    id: 'elani-gret',
    name: 'Elani Gret',
    elo: 400,
    avatar: '👧',
    avatarColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    quote: 'My favorite piece is the bishop! I like diagonal moves.',
    playStyle: 'Knows basic piece captures but struggles with piece defense.',
    category: 'beginner',
  },
  {
    id: 'aron-gret',
    name: 'Aron Gret',
    elo: 700,
    avatar: '👦',
    avatarColor: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
    quote: 'I have been practicing opening principles and king safety.',
    playStyle: 'Plays standard openings and looks for 1-move piece captures.',
    category: 'beginner',
  },
  {
    id: 'laura-gret',
    name: 'Laura Gret',
    elo: 1000,
    avatar: '👩‍🦰',
    avatarColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    quote: 'Control the center, develop your knights, and castle early!',
    playStyle: 'Solid beginner-intermediate player with sound positional basics.',
    category: 'intermediate',
  },
  {
    id: 'nelson-gret',
    name: 'Nelson Gret',
    elo: 1200,
    avatar: '👨‍🦱',
    avatarColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    quote: 'Beware! My Queen is coming out on move 2 to attack you!',
    playStyle: 'Aggressive early Queen attacks like the Wayward Queen attack.',
    category: 'intermediate',
  },
  {
    id: 'isabel-gret',
    name: 'Isabel Gret',
    elo: 1400,
    avatar: '👩‍🎓',
    avatarColor: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    quote: 'Tactics are 99% of chess. Keep your pieces defended.',
    playStyle: 'Looks for pins, forks, and double attacks. Rarely blunders free pieces.',
    category: 'intermediate',
  },
  {
    id: 'antonio-gret',
    name: 'Antonio Gret',
    elo: 1600,
    avatar: '👨‍🔬',
    avatarColor: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
    quote: 'A tactical player who punishes positional oversights with calculation.',
    playStyle: 'Calculates 2-3 moves ahead with sharp tactical instincts.',
    category: 'intermediate',
  },
  {
    id: 'wally-gret',
    name: 'Wally Gret',
    elo: 1800,
    avatar: '🧓',
    avatarColor: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
    quote: 'Patience and endgame mastery win matches.',
    playStyle: 'Strong club player with deep endgame and positional knowledge.',
    category: 'advanced',
  },
  {
    id: 'li-gret',
    name: 'Master Li Gret',
    elo: 2000,
    avatar: '🥋',
    avatarColor: 'bg-teal-500/20 text-teal-600 dark:text-teal-400',
    quote: 'Every pawn move creates permanent weaknesses. Choose wisely.',
    playStyle: 'Positional boa-constrictor style. Punishes minor inaccuracies.',
    category: 'advanced',
  },
  {
    id: 'elena-gret',
    name: 'Elena Gret',
    elo: 2200,
    avatar: '👑',
    avatarColor: 'bg-violet-500/20 text-violet-600 dark:text-violet-400',
    title: 'FM',
    quote: 'FIDE Master level calculation and tactical precision.',
    playStyle: 'Deep tactical vision, piece coordination, and rapid punishment.',
    category: 'advanced',
  },
  {
    id: 'gm-gret',
    name: 'Grandmaster Gret',
    elo: 2500,
    avatar: '🎖️',
    avatarColor: 'bg-amber-600/20 text-amber-600 dark:text-amber-400',
    title: 'GM',
    quote: 'I calculate to the end of all critical variations.',
    playStyle: 'Grandmaster evaluation, initiative management, and sharp defense.',
    category: 'master',
  },
  {
    id: 'magnus-gret',
    name: 'Magnus Gret',
    elo: 2850,
    avatar: '⚡',
    avatarColor: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    title: 'Super GM',
    quote: 'I will squeeze water from a stone in endgame grinds.',
    playStyle: 'Peerless endgame technique and relentless pressure from move 1.',
    category: 'master',
  },
  {
    id: 'stockfish-gret',
    name: 'Engine Gret 3000',
    elo: 3000,
    avatar: '🤖',
    avatarColor: 'bg-red-500/20 text-red-600 dark:text-red-400',
    title: '3000 Engine',
    quote: 'Maximum computational strength. 0 errors tolerated.',
    playStyle: 'Deep alpha-beta search with quiescence search. Unforgiving precision.',
    category: 'master',
  },
];

export function getBotForElo(elo: number): BotCharacter {
  const sorted = [...BOT_PRESETS].sort((a, b) => Math.abs(a.elo - elo) - Math.abs(b.elo - elo));
  const closest = sorted[0];
  if (closest.elo === elo) return closest;
  return {
    ...closest,
    id: `gret-${elo}`,
    name: `Gret (${elo})`,
    elo,
  };
}

export type PlayerColor = 'w' | 'b';

export interface CapturedPieces {
  p: number;
  n: number;
  b: number;
  r: number;
  q: number;
}
