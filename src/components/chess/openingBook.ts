import { Chess } from 'chess.js';

interface BookEntry {
  moves: string[]; // SAN moves
  name: string;
}

// Master opening book keyed by normalized position (board, turn, castling)
const OPENING_BOOK: Record<string, BookEntry> = {
  // Start position
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq': {
    moves: ['e4', 'd4', 'Nf3', 'c4'],
    name: 'Starting Position',
  },

  // 1. e4
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq': {
    moves: ['e5', 'c5', 'e6', 'c6', 'd5', 'Nf6', 'g6'],
    name: "King's Pawn Opening",
  },

  // 1. d4
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq': {
    moves: ['d5', 'Nf6', 'e6', 'f5', 'g6'],
    name: "Queen's Pawn Opening",
  },

  // 1. c4
  'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq': {
    moves: ['e5', 'c5', 'Nf6', 'e6'],
    name: 'English Opening',
  },

  // 1. Nf3
  'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq': {
    moves: ['d5', 'Nf6', 'c5', 'g6'],
    name: 'Réti Opening',
  },

  // 1. e4 e5
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq': {
    moves: ['Nf3', 'Bc4', 'Nc3', 'f4', 'd4'],
    name: 'Open Game',
  },

  // 1. e4 e5 2. Nf3
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq': {
    moves: ['Nc6', 'Nf6', 'd6'],
    name: "King's Knight Opening",
  },

  // 1. e4 e5 2. Nf3 Nc6
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq': {
    moves: ['Bb5', 'Bc4', 'd4', 'Nc3'],
    name: 'Open Game: Three Knights',
  },

  // 1. e4 e5 2. Nf3 Nc6 3. Bb5 (Ruy Lopez)
  'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq': {
    moves: ['a6', 'Nf6', 'd6', 'Bc5'],
    name: 'Ruy Lopez (Spanish Opening)',
  },

  // 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4
  'r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R b KQkq': {
    moves: ['Nf6', 'd6', 'b5'],
    name: 'Ruy Lopez: Morphy Defense',
  },

  // 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O
  'r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b kq': {
    moves: ['Be7', 'b5', 'Nxe4'],
    name: 'Ruy Lopez: Closed Setup',
  },

  // 1. e4 e5 2. Nf3 Nc6 3. Bc4 (Italian Game)
  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq': {
    moves: ['Bc5', 'Nf6', 'Be7'],
    name: 'Italian Game (Giuoco Piano)',
  },

  // 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3
  'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq': {
    moves: ['Nf6', 'd6', 'Qe7'],
    name: 'Italian Game: Main Line',
  },

  // 1. e4 e5 2. Nf3 Nc6 3. d4 (Scotch Game)
  'r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq': {
    moves: ['exd4'],
    name: 'Scotch Game',
  },

  // 1. e4 e5 2. Qh5 (Nelson signature Wayward Queen)
  'rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq': {
    moves: ['Nc6', 'Nf6', 'g6'],
    name: 'Wayward Queen Attack (Nelson Signature)',
  },

  // 1. e4 e5 2. Qh5 Nc6 3. Bc4 (Nelson Scholar attempt)
  'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq': {
    moves: ['g6', 'Qe7', 'Qf6'],
    name: "Nelson's Scholar Threat",
  },

  // 1. e4 c5 (Sicilian Defense)
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq': {
    moves: ['Nf3', 'Nc3', 'c3', 'd4'],
    name: 'Sicilian Defense',
  },

  // 1. e4 c5 2. Nf3
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq': {
    moves: ['d6', 'Nc6', 'e6', 'g6'],
    name: 'Open Sicilian Preparation',
  },

  // 1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3
  'rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq': {
    moves: ['a6', 'g6', 'Nc6', 'e6'],
    name: 'Sicilian Najdorf / Dragon',
  },

  // 1. e4 e6 (French Defense)
  'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq': {
    moves: ['d4', 'd3', 'Nf3'],
    name: 'French Defense',
  },

  // 1. e4 e6 2. d4 d5
  'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq': {
    moves: ['Nc3', 'Nd2', 'e5', 'exd5'],
    name: 'French Defense: Classical/Advance',
  },

  // 1. e4 c6 (Caro-Kann Defense)
  'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq': {
    moves: ['d4', 'Nc3', 'Nf3'],
    name: 'Caro-Kann Defense',
  },

  // 1. e4 c6 2. d4 d5
  'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq': {
    moves: ['Nc3', 'e5', 'exd5'],
    name: 'Caro-Kann: Main Line',
  },

  // 1. d4 d5
  'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq': {
    moves: ['c4', 'Nf3', 'Bf4'],
    name: "Queen's Pawn Game",
  },

  // 1. d4 d5 2. c4 (Queen's Gambit)
  'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq': {
    moves: ['e6', 'c6', 'dxc4', 'Nc6'],
    name: "Queen's Gambit",
  },

  // 1. d4 d5 2. c4 e6 3. Nc3 Nf6
  'rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq': {
    moves: ['Bg5', 'Nf3', 'cxd5'],
    name: "Queen's Gambit Declined",
  },

  // 1. d4 d5 2. Bf4 (London System)
  'rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq': {
    moves: ['Nf6', 'e6', 'c5'],
    name: 'London System',
  },

  // 1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6
  'rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq': {
    moves: ['Nf3', 'Be2', 'f3'],
    name: "King's Indian Defense",
  },
};

/**
 * Normalizes chess position FEN for opening book lookup (first 3 segments: board, turn, castling)
 */
function getNormalizedFen(chess: Chess): string {
  const parts = chess.fen().split(' ');
  return `${parts[0]} ${parts[1]} ${parts[2]}`;
}

/**
 * Retrieves a book move if available in the position, respecting bot personality
 */
export function getOpeningBookMove(
  chess: Chess,
  botId?: string,
  elo?: number
): { san: string; name: string } | null {
  // Baby Joe & Martin Joe rarely adhere to deep theory
  if (botId === 'baby-joe') return null;
  if (botId === 'martin-joe' && Math.random() < 0.6) return null;

  const key = getNormalizedFen(chess);
  const entry = OPENING_BOOK[key];
  if (!entry || entry.moves.length === 0) return null;

  // Nelson Joe special opening logic: Loves early Queen attacks
  if (botId === 'nelson-joe') {
    // If starting position as white, always play 1. e4
    if (key.startsWith('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w')) {
      return { san: 'e4', name: "Nelson's Aggressive Setup" };
    }
    // If White after 1. e4 e5, play Nelson's signature 2. Qh5!
    if (key.startsWith('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w')) {
      return { san: 'Qh5', name: 'Wayward Queen Attack (Nelson Signature)' };
    }
    // If White after 1. e4 e5 2. Qh5 Nc6, play 3. Bc4! (threatening mate on f7)
    if (key.startsWith('r1bqkbnr/pppp1ppp/2n5/4p2Q/4P3/8/PPPP1PPP/RNB1K1NR w')) {
      return { san: 'Bc4', name: "Nelson's Scholar Threat" };
    }
  }

  // Filter moves to only currently legal moves
  const legalMoves = chess.moves();
  const validBookMoves = entry.moves.filter((m) => legalMoves.includes(m));
  if (validBookMoves.length === 0) return null;

  // Higher Elo bots pick the most standard main line (first 1-2 moves)
  if (elo && elo >= 2200) {
    return { san: validBookMoves[0], name: entry.name };
  }

  // Mid Elo pick from valid book moves with variety
  const chosenMove = validBookMoves[Math.floor(Math.random() * validBookMoves.length)];
  return { san: chosenMove, name: entry.name };
}
