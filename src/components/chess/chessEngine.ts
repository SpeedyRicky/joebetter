import { Chess, Move, Square } from 'chess.js';

// Piece base values in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (oriented for White; flip rank index for Black)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
 50, 50, 50, 50, 50, 50, 50, 50,
 10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 27, 27, 10,  5,  5,
  0,  0,  0, 25, 25,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_TABLE = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20,  0,  0,  0,  0,-20,-40,
 -30,  0, 10, 15, 15, 10,  0,-30,
 -30,  5, 15, 20, 20, 15,  5,-30,
 -30,  0, 15, 20, 20, 15,  0,-30,
 -30,  5, 10, 15, 15, 10,  5,-30,
 -40,-20,  0,  5,  5,  0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
 -20,-10,-10,-10,-10,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5, 10, 10,  5,  0,-10,
 -10,  5,  5, 10, 10,  5,  5,-10,
 -10,  0, 10, 10, 10, 10,  0,-10,
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

const KING_TABLE = [
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -20,-30,-30,-40,-40,-30,-30,-20,
 -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20,
];

function getSquareIndex(square: Square, isWhite: boolean): number {
  const file = square.charCodeAt(0) - 97; // a=0, h=7
  const rank = parseInt(square[1], 10) - 1; // 1=0, 8=7
  const r = isWhite ? 7 - rank : rank;
  return r * 8 + file;
}

// Evaluate board position from White's perspective in centipawns
export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -30000 : 30000;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return 0;
  }

  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const square = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
      const isWhite = piece.color === 'w';
      const baseVal = PIECE_VALUES[piece.type] || 0;

      let pst = 0;
      const sqIdx = getSquareIndex(square, isWhite);
      switch (piece.type) {
        case 'p': pst = PAWN_TABLE[sqIdx] || 0; break;
        case 'n': pst = KNIGHT_TABLE[sqIdx] || 0; break;
        case 'b': pst = BISHOP_TABLE[sqIdx] || 0; break;
        case 'r': pst = ROOK_TABLE[sqIdx] || 0; break;
        case 'q': pst = QUEEN_TABLE[sqIdx] || 0; break;
        case 'k': pst = KING_TABLE[sqIdx] || 0; break;
      }

      const totalVal = baseVal + pst;
      score += isWhite ? totalVal : -totalVal;
    }
  }

  return score;
}

// Order moves for alpha-beta efficiency (captures and checks first)
function orderMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.captured) {
      scoreA += (PIECE_VALUES[a.captured] || 0) * 10 - (PIECE_VALUES[a.piece] || 0);
    }
    if (a.promotion) scoreA += 800;

    if (b.captured) {
      scoreB += (PIECE_VALUES[b.captured] || 0) * 10 - (PIECE_VALUES[b.piece] || 0);
    }
    if (b.promotion) scoreB += 800;

    return scoreB - scoreA;
  });
}

// Maximum search node evaluations to keep engine fast (<300ms) on main thread
let evaluatedNodes = 0;
const MAX_SEARCH_NODES = 20000;

// Quiescence search for quiet positions without wild capture horizon effects
function quiescence(chess: Chess, alpha: number, beta: number, isMaximizing: boolean, depth: number = 0): number {
  evaluatedNodes++;
  const standPat = evaluateBoard(chess);
  if (depth >= 2 || evaluatedNodes >= MAX_SEARCH_NODES) return standPat;

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

// Alpha-Beta Minimax with node-cap protection
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

  const legalMoves = chess.moves({ verbose: true });
  const orderedMoves = orderMoves(legalMoves);

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
    return minEval;
  }
}

// Bot move decision engine mapped smoothly from 100 to 3000 Elo
export async function getBotMove(
  chess: Chess,
  elo: number,
  botId?: string
): Promise<Move | null> {
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  evaluatedNodes = 0;
  const isMaximizing = chess.turn() === 'w';

  // 1. Martin & Baby Joe (Elo 100 - 300): Heavy randomness, frequent blunders
  if (elo <= 300) {
    const shouldBlunder = Math.random() < 0.75;
    if (shouldBlunder) {
      // If Martin Joe, high preference to push pawns
      if (botId === 'martin-joe') {
        const pawnMoves = legalMoves.filter((m) => m.piece === 'p');
        if (pawnMoves.length > 0 && Math.random() < 0.6) {
          return pawnMoves[Math.floor(Math.random() * pawnMoves.length)];
        }
      }
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }
  }

  // 2. Nelson Joe (Elo 1200): Aggressively attacks with Queen
  if (botId === 'nelson-joe' || (elo >= 1100 && elo <= 1300 && Math.random() < 0.45)) {
    const queenMoves = legalMoves.filter((m) => m.piece === 'q');
    if (queenMoves.length > 0 && Math.random() < 0.5) {
      // Pick best queen move
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

  // 3. Determine search depth & noise factor based on Elo
  let searchDepth = 1;
  let useQuiescence = false;
  let blunderChance = 0;
  let randomnessNoise = 0;

  if (elo < 500) {
    searchDepth = 1;
    blunderChance = 0.5;
    randomnessNoise = 350;
  } else if (elo < 900) {
    searchDepth = 1;
    blunderChance = 0.25;
    randomnessNoise = 200;
  } else if (elo < 1300) {
    searchDepth = 2;
    blunderChance = 0.12;
    randomnessNoise = 120;
  } else if (elo < 1700) {
    searchDepth = 2;
    blunderChance = 0.05;
    randomnessNoise = 60;
  } else if (elo < 2100) {
    searchDepth = 3;
    blunderChance = 0.02;
    randomnessNoise = 25;
  } else if (elo < 2500) {
    searchDepth = 3;
    useQuiescence = true;
    randomnessNoise = 10;
  } else if (elo < 2850) {
    searchDepth = 3;
    useQuiescence = true;
    randomnessNoise = 0;
  } else {
    // 2850 - 3000: Max engine depth with quiescence
    searchDepth = 3;
    useQuiescence = true;
    randomnessNoise = 0;
  }

  // Potential intentional blunder for human-like lower Elo bots
  if (blunderChance > 0 && Math.random() < blunderChance) {
    const nonCaptures = legalMoves.filter((m) => !m.captured);
    if (nonCaptures.length > 0) {
      return nonCaptures[Math.floor(Math.random() * nonCaptures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Evaluate all legal moves
  const scoredMoves: Array<{ move: Move; score: number }> = [];

  for (const move of legalMoves) {
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

    // Add noise based on Elo
    if (randomnessNoise > 0) {
      const noise = (Math.random() * 2 - 1) * randomnessNoise;
      evalScore += noise;
    }

    scoredMoves.push({ move, score: evalScore });
  }

  // Sort by score
  if (isMaximizing) {
    scoredMoves.sort((a, b) => b.score - a.score);
  } else {
    scoredMoves.sort((a, b) => a.score - b.score);
  }

  return scoredMoves[0]?.move || legalMoves[0];
}

// Generate context-aware commentary from Joe Bot
export function getBotCommentary(
  lastMove: Move,
  chess: Chess,
  botName: string,
  elo: number
): string {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w'
      ? `Checkmate! Good game! ${botName} calculates the final handshake.`
      : `Checkmate! You got me! Brilliant play.`;
  }

  if (chess.isCheck()) {
    const checkPhrases = [
      'Check! Watch your king.',
      'Careful now, your king is under fire.',
      'Check! Where will your monarch flee?',
      'A check to keep you on your toes!',
    ];
    return checkPhrases[Math.floor(Math.random() * checkPhrases.length)];
  }

  if (lastMove.captured) {
    if (lastMove.captured === 'q') {
      return `Whoa, the Queen is down! That shifts the whole board.`;
    }
    if (elo <= 400) {
      const capturePhrases = [
        `Nom nom! I took your ${lastMove.captured === 'p' ? 'pawn' : 'piece'}!`,
        `Did you leave that for me? Thank you!`,
        `Hehe, piece captured!`,
      ];
      return capturePhrases[Math.floor(Math.random() * capturePhrases.length)];
    } else if (elo >= 2400) {
      return `Material transition accepted. Positional compensation calculated.`;
    } else {
      const capturePhrases = [
        `Captured! A fair exchange.`,
        `Cleaning up the board piece by piece.`,
        `An advantageous trade.`,
      ];
      return capturePhrases[Math.floor(Math.random() * capturePhrases.length)];
    }
  }

  if (lastMove.san === 'O-O' || lastMove.san === 'O-O-O') {
    return `Castling complete! King tucked safely away behind the pawns.`;
  }

  // General position remarks
  const generalPhrases = [
    `Interesting move. Let's see how this develops.`,
    `Developing my pieces towards the center.`,
    `Solid move! Every square counts.`,
    `Calculating my counter-play...`,
  ];
  return generalPhrases[Math.floor(Math.random() * generalPhrases.length)];
}

// Advice & Hint for user
export function getHintForPlayer(chess: Chess): { move: Move; advice: string } | null {
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const isMaximizing = chess.turn() === 'w';
  let bestMove = legalMoves[0];
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of legalMoves) {
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
