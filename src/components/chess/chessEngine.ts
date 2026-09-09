import { Chess, Move, Square } from 'chess.js';
import { getOpeningBookMove } from './openingBook';

// Piece base values in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 335,
  r: 500,
  q: 920,
  k: 20000,
};

// Piece-Square Tables (oriented for White; flip rank index for Black)
const PAWN_TABLE = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  15, 15, 25, 35, 35, 25, 15, 15,
   5,  5, 15, 28, 28, 15,  5,  5,
   0,  0,  5, 24, 24,  5,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-25,-25, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  5, 20, 25, 25, 20,  5,-30,
  -30,  0, 15, 25, 25, 15,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  5, 10, 15, 15, 10,  5,-10,
  -10,  5, 10, 15, 15, 10,  5,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0,
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
];

// Middlegame King: Safe tucked in corner behind pawns
const KING_TABLE_MIDDLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
];

// Endgame King: March to the center and escort passed pawns!
const KING_TABLE_ENDGAME = [
  -50,-30,-20,-10,-10,-20,-30,-50,
  -30,-10, 10, 20, 20, 10,-10,-30,
  -20, 10, 30, 40, 40, 30, 10,-20,
  -10, 20, 40, 50, 50, 40, 20,-10,
  -10, 20, 40, 50, 50, 40, 20,-10,
  -20, 10, 30, 40, 40, 30, 10,-20,
  -30,-10, 10, 20, 20, 10,-10,-30,
  -50,-30,-20,-10,-10,-20,-30,-50,
];

function getSquareIndex(square: Square, isWhite: boolean): number {
  const file = square.charCodeAt(0) - 97; // a=0, h=7
  const rank = parseInt(square[1], 10) - 1; // 1=0, 8=7
  const r = isWhite ? 7 - rank : rank;
  return r * 8 + file;
}

// Transposition Table Cache for fast alpha-beta search
interface TTEntry {
  depth: number;
  score: number;
  flag: 'exact' | 'lowerbound' | 'upperbound';
}
const transpositionTable = new Map<string, TTEntry>();
const MAX_TT_ENTRIES = 50000;

export function clearTranspositionTable() {
  transpositionTable.clear();
}

/**
 * Advanced board evaluation from White's perspective in centipawns
 * Includes material, piece-square tables, endgame king transitions,
 * pawn structures, bishop pairs, and open rook files.
 */
export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -30000 : 30000;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return 0;
  }

  let score = 0;
  const board = chess.board();

  let whiteNonPawnMaterial = 0;
  let blackNonPawnMaterial = 0;
  let whiteBishops = 0;
  let blackBishops = 0;

  // Pawn tracking per file (file index 0 to 7)
  const whitePawnsByFile = [0, 0, 0, 0, 0, 0, 0, 0];
  const blackPawnsByFile = [0, 0, 0, 0, 0, 0, 0, 0];
  const whiteRooksOnFiles: number[] = [];
  const blackRooksOnFiles: number[] = [];

  // Pass 1: Gather material, counts, and files
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      if (piece.color === 'w') {
        if (piece.type === 'b') whiteBishops++;
        if (piece.type === 'r') whiteRooksOnFiles.push(c);
        if (piece.type === 'p') whitePawnsByFile[c]++;
        if (piece.type !== 'p' && piece.type !== 'k') {
          whiteNonPawnMaterial += PIECE_VALUES[piece.type] || 0;
        }
      } else {
        if (piece.type === 'b') blackBishops++;
        if (piece.type === 'r') blackRooksOnFiles.push(c);
        if (piece.type === 'p') blackPawnsByFile[c]++;
        if (piece.type !== 'p' && piece.type !== 'k') {
          blackNonPawnMaterial += PIECE_VALUES[piece.type] || 0;
        }
      }
    }
  }

  // Determine endgame weight (0 = pure opening/middlegame, 1 = pure endgame)
  const totalNonPawn = whiteNonPawnMaterial + blackNonPawnMaterial;
  const endgameFactor = Math.max(0, Math.min(1, (2600 - totalNonPawn) / 2600));

  // Pass 2: Positional & Piece-Square Evaluation
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const square = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
      const isWhite = piece.color === 'w';
      const baseVal = PIECE_VALUES[piece.type] || 0;
      const sqIdx = getSquareIndex(square, isWhite);

      let pst = 0;
      switch (piece.type) {
        case 'p':
          pst = PAWN_TABLE[sqIdx] || 0;
          // Passed pawn bonus: No enemy pawns on same file or adjacent files ahead
          const enemyPawns = isWhite ? blackPawnsByFile : whitePawnsByFile;
          const isPassed =
            enemyPawns[c] === 0 &&
            (c === 0 || enemyPawns[c - 1] === 0) &&
            (c === 7 || enemyPawns[c + 1] === 0);
          if (isPassed) {
            const rankAdvancement = isWhite ? 7 - r : r;
            pst += rankAdvancement * 18; // Huge bonus for advanced passed pawns
          }
          break;
        case 'n':
          pst = KNIGHT_TABLE[sqIdx] || 0;
          break;
        case 'b':
          pst = BISHOP_TABLE[sqIdx] || 0;
          break;
        case 'r':
          pst = ROOK_TABLE[sqIdx] || 0;
          break;
        case 'q':
          pst = QUEEN_TABLE[sqIdx] || 0;
          break;
        case 'k':
          const middlePst = KING_TABLE_MIDDLE[sqIdx] || 0;
          const endgamePst = KING_TABLE_ENDGAME[sqIdx] || 0;
          pst = Math.round(middlePst * (1 - endgameFactor) + endgamePst * endgameFactor);
          break;
      }

      const totalPieceVal = baseVal + pst;
      score += isWhite ? totalPieceVal : -totalPieceVal;
    }
  }

  // Bonus for Bishop Pair (+40 cp)
  if (whiteBishops >= 2) score += 40;
  if (blackBishops >= 2) score -= 40;

  // Rook on open file bonus (+25 cp) or semi-open file (+12 cp)
  for (const c of whiteRooksOnFiles) {
    if (whitePawnsByFile[c] === 0) {
      score += blackPawnsByFile[c] === 0 ? 25 : 12;
    }
  }
  for (const c of blackRooksOnFiles) {
    if (blackPawnsByFile[c] === 0) {
      score -= whitePawnsByFile[c] === 0 ? 25 : 12;
    }
  }

  // Doubled pawn penalty (-20 cp per doubled pawn)
  for (let c = 0; c < 8; c++) {
    if (whitePawnsByFile[c] > 1) score -= (whitePawnsByFile[c] - 1) * 20;
    if (blackPawnsByFile[c] > 1) score += (blackPawnsByFile[c] - 1) * 20;
  }

  return score;
}

// MVV-LVA move ordering (Most Valuable Victim - Least Valuable Attacker)
function orderMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.captured) {
      scoreA += (PIECE_VALUES[a.captured] || 0) * 10 - (PIECE_VALUES[a.piece] || 0);
    }
    if (a.promotion) scoreA += 850;
    if (a.san.includes('+')) scoreA += 80;

    if (b.captured) {
      scoreB += (PIECE_VALUES[b.captured] || 0) * 10 - (PIECE_VALUES[b.piece] || 0);
    }
    if (b.promotion) scoreB += 850;
    if (b.san.includes('+')) scoreB += 80;

    return scoreB - scoreA;
  });
}

let evaluatedNodes = 0;
const MAX_SEARCH_NODES = 25000;

// Quiescence search for quiet tactical resolutions
function quiescence(
  chess: Chess,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  depth: number = 0
): number {
  evaluatedNodes++;
  const standPat = evaluateBoard(chess);
  if (depth >= 3 || evaluatedNodes >= MAX_SEARCH_NODES) return standPat;

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;

    const captureMoves = chess.moves({ verbose: true }).filter((m) => m.captured || m.promotion);
    for (const move of orderMoves(captureMoves)) {
      chess.move(move);
      const score = quiescence(chess, alpha, beta, false, depth + 1);
      chess.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;

    const captureMoves = chess.moves({ verbose: true }).filter((m) => m.captured || m.promotion);
    for (const move of orderMoves(captureMoves)) {
      chess.move(move);
      const score = quiescence(chess, alpha, beta, true, depth + 1);
      chess.undo();

      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
    return beta;
  }
}

// Alpha-Beta Minimax with Transposition Table caching
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  useQuiescence: boolean
): number {
  evaluatedNodes++;
  if (depth === 0 || chess.isGameOver() || evaluatedNodes >= MAX_SEARCH_NODES) {
    if (useQuiescence && !chess.isGameOver() && evaluatedNodes < MAX_SEARCH_NODES) {
      return quiescence(chess, alpha, beta, isMaximizing, 0);
    }
    return evaluateBoard(chess);
  }

  // TT probe
  const posKey = chess.fen();
  const cached = transpositionTable.get(posKey);
  if (cached && cached.depth >= depth) {
    if (cached.flag === 'exact') return cached.score;
    if (cached.flag === 'lowerbound' && cached.score >= beta) return cached.score;
    if (cached.flag === 'upperbound' && cached.score <= alpha) return cached.score;
  }

  const legalMoves = chess.moves({ verbose: true });
  const orderedMoves = orderMoves(legalMoves);

  const originalAlpha = alpha;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of orderedMoves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false, useQuiescence);
      chess.undo();

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }

    // TT store
    if (transpositionTable.size < MAX_TT_ENTRIES) {
      let flag: 'exact' | 'lowerbound' | 'upperbound' = 'exact';
      if (maxEval <= originalAlpha) flag = 'upperbound';
      else if (maxEval >= beta) flag = 'lowerbound';
      transpositionTable.set(posKey, { depth, score: maxEval, flag });
    }

    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of orderedMoves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true, useQuiescence);
      chess.undo();

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }

    // TT store
    if (transpositionTable.size < MAX_TT_ENTRIES) {
      let flag: 'exact' | 'lowerbound' | 'upperbound' = 'exact';
      if (minEval <= originalAlpha) flag = 'lowerbound';
      else if (minEval >= beta) flag = 'upperbound';
      transpositionTable.set(posKey, { depth, score: minEval, flag });
    }

    return minEval;
  }
}

/**
 * Bot move decision engine calibrated smoothly from Elo 100 to 3000.
 * Incorporates opening books, human-like blunder curves, and master engines.
 */
export async function getBotMove(
  chess: Chess,
  elo: number,
  botId?: string
): Promise<Move | null> {
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  evaluatedNodes = 0;
  const isMaximizing = chess.turn() === 'w';

  // Step 1: Check master opening book
  const bookMove = getOpeningBookMove(chess, botId, elo);
  if (bookMove) {
    const matchingMove = legalMoves.find((m) => m.san === bookMove.san);
    if (matchingMove) {
      return matchingMove;
    }
  }

  // Step 2: Bot Personality - Martin Joe (Elo 250): Loved for advancing pawns
  if (botId === 'martin-joe' || elo <= 250) {
    const shouldPawnPush = Math.random() < 0.6;
    if (shouldPawnPush) {
      const pawnMoves = legalMoves.filter((m) => m.piece === 'p');
      if (pawnMoves.length > 0) {
        return pawnMoves[Math.floor(Math.random() * pawnMoves.length)];
      }
    }
    // High blunder chance
    if (Math.random() < 0.65) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }
  }

  // Step 3: Bot Personality - Nelson Joe (Elo 1200): Aggressive Queen attacker
  if (botId === 'nelson-joe' || (elo >= 1150 && elo <= 1250 && Math.random() < 0.4)) {
    const queenMoves = legalMoves.filter((m) => m.piece === 'q');
    if (queenMoves.length > 0 && Math.random() < 0.55) {
      let bestQueenMove = queenMoves[0];
      let bestQScore = isMaximizing ? -Infinity : Infinity;
      for (const m of queenMoves) {
        chess.move(m);
        const s = evaluateBoard(chess);
        chess.undo();
        if (isMaximizing ? s > bestQScore : s < bestQScore) {
          bestQScore = s;
          bestQueenMove = m;
        }
      }
      return bestQueenMove;
    }
  }

  // Step 4: Calibrated search depth, blunder frequency, and noise per Elo
  let searchDepth = 1;
  let useQuiescence = false;
  let blunderChance = 0;
  let randomnessNoise = 0;

  if (elo < 400) {
    searchDepth = 1;
    blunderChance = 0.5;
    randomnessNoise = 300;
  } else if (elo < 700) {
    searchDepth = 1;
    blunderChance = 0.3;
    randomnessNoise = 180;
  } else if (elo < 1000) {
    searchDepth = 1;
    blunderChance = 0.18;
    randomnessNoise = 110;
  } else if (elo < 1300) {
    searchDepth = 2;
    blunderChance = 0.1;
    randomnessNoise = 70;
  } else if (elo < 1600) {
    searchDepth = 2;
    blunderChance = 0.05;
    randomnessNoise = 40;
  } else if (elo < 1900) {
    searchDepth = 3;
    blunderChance = 0.02;
    randomnessNoise = 20;
  } else if (elo < 2300) {
    searchDepth = 3;
    useQuiescence = true;
    randomnessNoise = 8;
  } else if (elo < 2700) {
    // Grandmaster Joe (Elo 2500)
    searchDepth = 4;
    useQuiescence = true;
    randomnessNoise = 0;
  } else if (elo < 2950) {
    // Magnus Joe (Elo 2850)
    searchDepth = 4;
    useQuiescence = true;
    randomnessNoise = 0;
  } else {
    // Engine Joe 3000 (Elo 3000): Deep search with quiescence
    searchDepth = 4;
    useQuiescence = true;
    randomnessNoise = 0;
  }

  // Intentional human-like blunders at lower Elo
  if (blunderChance > 0 && Math.random() < blunderChance) {
    const nonCaptures = legalMoves.filter((m) => !m.captured);
    if (nonCaptures.length > 0) {
      return nonCaptures[Math.floor(Math.random() * nonCaptures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Step 5: Evaluate all legal moves with move-ordered Alpha-Beta search
  const scoredMoves: Array<{ move: Move; score: number }> = [];

  for (const move of orderMoves(legalMoves)) {
    chess.move(move);
    let evalScore = minimax(
      chess,
      searchDepth - 1,
      -Infinity,
      Infinity,
      !isMaximizing,
      useQuiescence
    );
    chess.undo();

    // Add calibrated Elo noise
    if (randomnessNoise > 0) {
      const noise = (Math.random() * 2 - 1) * randomnessNoise;
      evalScore += noise;
    }

    scoredMoves.push({ move, score: evalScore });
  }

  // Sort best moves according to active side
  if (isMaximizing) {
    scoredMoves.sort((a, b) => b.score - a.score);
  } else {
    scoredMoves.sort((a, b) => a.score - b.score);
  }

  return scoredMoves[0]?.move || legalMoves[0];
}

/**
 * Generate context-aware commentary from Joe Bot
 */
export function getBotCommentary(
  lastMove: Move,
  chess: Chess,
  botName: string,
  elo: number,
  botId?: string
): string {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w'
      ? `Checkmate! Good game! ${botName} calculates the final handshake.`
      : `Checkmate! You got me! What a brilliant match!`;
  }

  if (chess.isCheck()) {
    const checkPhrases = [
      'Check! Watch your king.',
      'Careful now, your monarch is under fire.',
      'Check! Where will your king seek refuge?',
      'A sharp check to seize the initiative!',
    ];
    return checkPhrases[Math.floor(Math.random() * checkPhrases.length)];
  }

  // Nelson signature quotes
  if (botId === 'nelson-joe' && lastMove.piece === 'q') {
    return `My Queen is on the prowl! Can you defend against her power?`;
  }

  // Martin signature quotes
  if (botId === 'martin-joe') {
    if (lastMove.piece === 'p') {
      return `Pawn forward! One step closer to becoming a queen someday!`;
    }
    if (Math.random() < 0.3) {
      return `I hope that was a legal move... having lots of fun anyway!`;
    }
  }

  if (lastMove.captured) {
    if (lastMove.captured === 'q') {
      return `The Queen is down! That completely flips the board dynamic.`;
    }
    if (elo <= 400) {
      const capturePhrases = [
        `Nom nom! I took your ${lastMove.captured === 'p' ? 'pawn' : 'piece'}!`,
        `Did you leave that for me? Thank you!`,
        `Hehe, piece captured!`,
      ];
      return capturePhrases[Math.floor(Math.random() * capturePhrases.length)];
    } else if (elo >= 2500) {
      return `Material transition accepted. Positional compensation calculated.`;
    } else {
      const capturePhrases = [
        `Captured! A fair exchange of timber.`,
        `Simplifying the board position.`,
        `An advantageous tactical trade.`,
      ];
      return capturePhrases[Math.floor(Math.random() * capturePhrases.length)];
    }
  }

  if (lastMove.san === 'O-O' || lastMove.san === 'O-O-O') {
    return `Castling complete! King is safely sheltered behind the pawns.`;
  }

  // Engine 3000 computational output
  if (botId === 'stockfish-joe' || elo >= 3000) {
    const evalCp = evaluateBoard(chess);
    const evalPawns = evalCp / 100;
    const formatted = evalPawns > 0 ? `+${evalPawns.toFixed(2)}` : evalPawns.toFixed(2);
    return `[Engine 3000] Eval: ${formatted} | Depth: 4-ply quiescence | Branch cleared.`;
  }

  // General position remarks
  const generalPhrases = [
    `Interesting move. Let's see how this develops.`,
    `Developing pieces and coordinating the center squares.`,
    `Solid move! Every square counts on this board.`,
    `Calculating my next counter-maneuver...`,
  ];
  return generalPhrases[Math.floor(Math.random() * generalPhrases.length)];
}

/**
 * Advice & Hint for user
 */
export function getHintForPlayer(chess: Chess): { move: Move; advice: string } | null {
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const isMaximizing = chess.turn() === 'w';
  let bestMove = legalMoves[0];
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of orderMoves(legalMoves)) {
    chess.move(move);
    const score = minimax(chess, 2, -Infinity, Infinity, !isMaximizing, true);
    chess.undo();

    if (isMaximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  let advice = `Try ${bestMove.san}.`;
  if (bestMove.captured) {
    advice += ` This captures the ${bestMove.captured.toUpperCase()} and wins material.`;
  } else if (bestMove.san.includes('+')) {
    advice += ` This gives check and seizes the initiative.`;
  } else if (bestMove.piece === 'n' || bestMove.piece === 'b') {
    advice += ` This develops a minor piece to control vital center squares.`;
  } else if (bestMove.san === 'O-O' || bestMove.san === 'O-O-O') {
    advice += ` This protects your King and connects your rooks.`;
  } else {
    advice += ` This improves piece activity and solidifies your position.`;
  }

  return { move: bestMove, advice };
}
