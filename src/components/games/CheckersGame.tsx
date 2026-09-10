import React, { useState, useEffect, useCallback, useId } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Crown,
  Trophy,
  ChevronRight,
  Sparkles,
  Info,
  Play,
  Award,
} from 'lucide-react';
import { SoundManager } from '../chess/chessSounds';

export type CheckersPieceType = 'regular' | 'king';
export type CheckersColor = 'red' | 'black'; // red = Player, black = Gret

export interface CheckersPiece {
  id: string;
  color: CheckersColor;
  type: CheckersPieceType;
}

export type BoardState = (CheckersPiece | null)[][];

interface Move {
  from: [number, number];
  to: [number, number];
  captured?: [number, number];
  promoted?: boolean;
}

interface JumpSequence {
  steps: Move[];
  finalPos: [number, number];
}

const soundManager = new SoundManager();

export const CheckersGame: React.FC<{
  onGameWin?: (winner: string) => void;
}> = () => {
  const [board, setBoard] = useState<BoardState>(() => initBoard());
  const [turn, setTurn] = useState<CheckersColor>('red'); // Red moves first
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [capturedRed, setCapturedRed] = useState<number>(0);
  const [capturedBlack, setCapturedBlack] = useState<number>(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [winner, setWinner] = useState<CheckersColor | 'draw' | null>(null);
  const [difficulty, setDifficulty] = useState<'casual' | 'tactical' | 'master'>('tactical');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [gretCommentary, setGretCommentary] = useState<string>(
    "Your move! Red pieces move first. Aim for my back rank to get Kinged!"
  );

  function initBoard(): BoardState {
    const b: BoardState = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Gret pieces (black/dark) on rows 0, 1, 2
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          b[r][c] = { id: `b-${r}-${c}`, color: 'black', type: 'regular' };
        }
      }
    }

    // Player pieces (red) on rows 5, 6, 7
    for (let r = 5; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          b[r][c] = { id: `r-${r}-${c}`, color: 'red', type: 'regular' };
        }
      }
    }

    return b;
  }

  const restartGame = () => {
    setBoard(initBoard());
    setTurn('red');
    setSelectedSquare(null);
    setValidMoves([]);
    setCapturedRed(0);
    setCapturedBlack(0);
    setMoveHistory([]);
    setWinner(null);
    setIsAiThinking(false);
    setGretCommentary("Game reset! Best of luck on the diagonal. Let's play!");
  };

  // Find all jumps available for a player (standard checkers: jumps are prioritized)
  const getAllJumps = useCallback((b: BoardState, color: CheckersColor): Move[] => {
    const jumps: Move[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = b[r][c];
        if (p && p.color === color) {
          const pieceJumps = getPieceJumps(b, r, c, p);
          jumps.push(...pieceJumps);
        }
      }
    }
    return jumps;
  }, []);

  // Find jumps for a specific piece
  const getPieceJumps = (b: BoardState, r: number, c: number, p: CheckersPiece): Move[] => {
    const moves: Move[] = [];
    const dirs =
      p.type === 'king'
        ? [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
          ]
        : p.color === 'red'
        ? [
            [-1, -1],
            [-1, 1],
          ] // red moves up
        : [
            [1, -1],
            [1, 1],
          ]; // black moves down

    for (const [dr, dc] of dirs) {
      const midR = r + dr;
      const midC = c + dc;
      const destR = r + dr * 2;
      const destC = c + dc * 2;

      if (destR >= 0 && destR < 8 && destC >= 0 && destC < 8) {
        const midPiece = b[midR][midC];
        const destPiece = b[destR][destC];

        if (midPiece && midPiece.color !== p.color && !destPiece) {
          const promotes =
            (p.color === 'red' && destR === 0 && p.type !== 'king') ||
            (p.color === 'black' && destR === 7 && p.type !== 'king');

          moves.push({
            from: [r, c],
            to: [destR, destC],
            captured: [midR, midC],
            promoted: promotes,
          });
        }
      }
    }
    return moves;
  };

  // Find standard (non-jump) steps for a piece
  const getPieceSteps = (b: BoardState, r: number, c: number, p: CheckersPiece): Move[] => {
    const moves: Move[] = [];
    const dirs =
      p.type === 'king'
        ? [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
          ]
        : p.color === 'red'
        ? [
            [-1, -1],
            [-1, 1],
          ]
        : [
            [1, -1],
            [1, 1],
          ];

    for (const [dr, dc] of dirs) {
      const destR = r + dr;
      const destC = c + dc;
      if (destR >= 0 && destR < 8 && destC >= 0 && destC < 8) {
        if (!b[destR][destC]) {
          const promotes =
            (p.color === 'red' && destR === 0 && p.type !== 'king') ||
            (p.color === 'black' && destR === 7 && p.type !== 'king');

          moves.push({
            from: [r, c],
            to: [destR, destC],
            promoted: promotes,
          });
        }
      }
    }
    return moves;
  };

  // All legal moves for a player
  const getLegalMoves = useCallback(
    (b: BoardState, color: CheckersColor): Move[] => {
      const jumps = getAllJumps(b, color);
      if (jumps.length > 0) {
        return jumps; // Must jump if available (Checkers rule)
      }

      const steps: Move[] = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = b[r][c];
          if (p && p.color === color) {
            steps.push(...getPieceSteps(b, r, c, p));
          }
        }
      }
      return steps;
    },
    [getAllJumps]
  );

  // Apply a move to a board
  const applyMove = (b: BoardState, move: Move): BoardState => {
    const newB = b.map((row) => [...row]);
    const [fromR, fromC] = move.from;
    const [toR, toC] = move.to;
    const piece = newB[fromR][fromC];
    if (!piece) return b;

    newB[fromR][fromC] = null;

    let updatedType = piece.type;
    if (move.promoted) {
      updatedType = 'king';
    }

    newB[toR][toC] = {
      ...piece,
      type: updatedType,
    };

    if (move.captured) {
      const [capR, capC] = move.captured;
      newB[capR][capC] = null;
    }

    return newB;
  };

  // Check game over
  const checkGameOver = useCallback(
    (b: BoardState, nextTurn: CheckersColor) => {
      const legal = getLegalMoves(b, nextTurn);
      if (legal.length === 0) {
        const winnerColor: CheckersColor = nextTurn === 'red' ? 'black' : 'red';
        setWinner(winnerColor);
        if (winnerColor === 'red') {
          setGretCommentary("Incredible play! You cornered all my pieces and won!");
          soundManager.playVictory();
        } else {
          setGretCommentary("Checkmate... or rather, no legal moves left for Red! Good game!");
          soundManager.playLoss();
        }
      }
    },
    [getLegalMoves]
  );

  // Handle square click by player
  const handleSquareClick = (r: number, c: number) => {
    if (turn !== 'red' || winner || isAiThinking) return;

    // If square has player piece, select it and find its moves
    const clickedPiece = board[r][c];
    if (clickedPiece && clickedPiece.color === 'red') {
      const allPlayerMoves = getLegalMoves(board, 'red');
      const pieceMoves = allPlayerMoves.filter(
        (m) => m.from[0] === r && m.from[1] === c
      );

      setSelectedSquare([r, c]);
      setValidMoves(pieceMoves);
      return;
    }

    // If destination square is clicked and is a valid move
    if (selectedSquare) {
      const matchedMove = validMoves.find((m) => m.to[0] === r && m.to[1] === c);
      if (matchedMove) {
        executePlayerMove(matchedMove);
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    }
  };

  const executePlayerMove = (move: Move) => {
    const updatedBoard = applyMove(board, move);
    setBoard(updatedBoard);
    setSelectedSquare(null);
    setValidMoves([]);

    const notation = `${coordsToNotation(move.from)}-${coordsToNotation(move.to)}${
      move.captured ? 'x' : ''
    }${move.promoted ? ' (King)' : ''}`;
    setMoveHistory((prev) => [...prev, `Red: ${notation}`]);

    if (move.captured) {
      setCapturedBlack((prev) => prev + 1);
      soundManager.playCapture();
    } else {
      soundManager.playMove();
    }

    if (move.promoted) {
      soundManager.playCheck();
      setGretCommentary("You made a King! I'll have to watch out for reverse diagonals now.");
    }

    // Check for consecutive multi-jump if captured and not newly promoted
    if (move.captured && !move.promoted) {
      const [toR, toC] = move.to;
      const movedPiece = updatedBoard[toR][toC];
      if (movedPiece) {
        const extraJumps = getPieceJumps(updatedBoard, toR, toC, movedPiece);
        if (extraJumps.length > 0) {
          setSelectedSquare([toR, toC]);
          setValidMoves(extraJumps);
          setGretCommentary("Double jump available! Keep taking my pieces!");
          return;
        }
      }
    }

    // Pass turn to Gret
    setTurn('black');
    checkGameOver(updatedBoard, 'black');
  };

  // Gret AI turn
  useEffect(() => {
    if (turn === 'black' && !winner) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        executeGretAiMove();
        setIsAiThinking(false);
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [turn, winner]);

  const executeGretAiMove = () => {
    const legalMoves = getLegalMoves(board, 'black');
    if (legalMoves.length === 0) {
      setWinner('red');
      setGretCommentary("I'm out of moves! You win!");
      soundManager.playVictory();
      return;
    }

    let chosenMove: Move;

    if (difficulty === 'casual') {
      // Pick random legal move
      chosenMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    } else {
      // Tactical / Master: evaluate moves
      let bestScore = -9999;
      let candidates: Move[] = [];

      for (const m of legalMoves) {
        let score = 0;

        // Captures are high priority
        if (m.captured) score += 50;

        // Kinging
        if (m.promoted) score += 40;

        // Center control (cols 2, 3, 4, 5)
        if (m.to[1] >= 2 && m.to[1] <= 5) score += 6;

        // Protect home rank pieces unless jumping
        if (m.from[0] === 0 && !m.captured) score -= 8;

        // Advance towards player back rank
        score += m.to[0] * 2;

        if (difficulty === 'master') {
          // Lookahead: check if destination is immediately vulnerable to player jump
          const hypotheticalBoard = applyMove(board, m);
          const playerJumps = getAllJumps(hypotheticalBoard, 'red');
          const isVulnerable = playerJumps.some(
            (pj) => pj.captured && pj.captured[0] === m.to[0] && pj.captured[1] === m.to[1]
          );
          if (isVulnerable) score -= 45;
        }

        if (score > bestScore) {
          bestScore = score;
          candidates = [m];
        } else if (score === bestScore) {
          candidates.push(m);
        }
      }

      chosenMove = candidates[Math.floor(Math.random() * candidates.length)];
    }

    // Apply Gret's move
    let currentBoard = applyMove(board, chosenMove);
    setBoard(currentBoard);

    const notation = `${coordsToNotation(chosenMove.from)}-${coordsToNotation(chosenMove.to)}${
      chosenMove.captured ? 'x' : ''
    }${chosenMove.promoted ? ' (King)' : ''}`;
    setMoveHistory((prev) => [...prev, `Gret: ${notation}`]);

    if (chosenMove.captured) {
      setCapturedRed((prev) => prev + 1);
      soundManager.playCapture();
      setGretCommentary("Got one! Gret jumps and captures.");
    } else {
      soundManager.playMove();
    }

    if (chosenMove.promoted) {
      soundManager.playCheck();
      setGretCommentary("Crown me! King Gret is ready for action.");
    }

    // Check multi-jump for AI
    if (chosenMove.captured && !chosenMove.promoted) {
      const [toR, toC] = chosenMove.to;
      const movedPiece = currentBoard[toR][toC];
      if (movedPiece) {
        const extraJumps = getPieceJumps(currentBoard, toR, toC, movedPiece);
        if (extraJumps.length > 0) {
          const secondJump = extraJumps[0];
          currentBoard = applyMove(currentBoard, secondJump);
          setBoard(currentBoard);
          setCapturedRed((prev) => prev + 1);
          setGretCommentary("Multi-jump! Double capture for Gret!");
          soundManager.playCapture();
        }
      }
    }

    setTurn('red');
    checkGameOver(currentBoard, 'red');
  };

  const coordsToNotation = ([r, c]: [number, number]): string => {
    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return `${cols[c]}${8 - r}`;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 p-3 sm:p-6 max-w-5xl mx-auto">
      {/* Main Checkers Board Area */}
      <div className="flex flex-col items-center">
        {/* Opponent (Gret) Status Header */}
        <div className="w-full max-w-[480px] mb-2 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs border border-neutral-700 shadow-xs">
              G
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                  Gret AI
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 capitalize">
                  {difficulty}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500">
                {turn === 'black' ? (
                  <span className="text-amber-600 dark:text-amber-400 font-medium animate-pulse">
                    Gret is thinking...
                  </span>
                ) : (
                  <span>Awaiting your move</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-500 text-[11px]">Captures:</span>
            <span className="font-bold text-neutral-800 dark:text-neutral-200">
              {capturedRed}
            </span>
          </div>
        </div>

        {/* The 8x8 Board */}
        <div className="relative p-2 sm:p-3.5 rounded-2xl bg-neutral-900 border-4 border-neutral-800 shadow-2xl">
          <div className="grid grid-cols-8 gap-0 w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] rounded-lg overflow-hidden border border-neutral-750">
            {board.map((row, r) =>
              row.map((piece, c) => {
                const isDarkSquare = (r + c) % 2 === 1;
                const isSelected = selectedSquare?.[0] === r && selectedSquare?.[1] === c;
                const isValidDest = validMoves.some((m) => m.to[0] === r && m.to[1] === c);

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleSquareClick(r, c)}
                    className={`relative flex items-center justify-center transition-colors select-none ${
                      isDarkSquare
                        ? 'bg-[#3A3836] hover:bg-[#45423F]'
                        : 'bg-[#C3B89E]'
                    } ${isValidDest ? 'cursor-pointer' : piece?.color === 'red' ? 'cursor-pointer' : ''}`}
                  >
                    {/* Legal move target dot */}
                    {isValidDest && (
                      <div className="absolute z-20 w-4 h-4 rounded-full bg-emerald-400/80 ring-4 ring-emerald-400/30 animate-pulse" />
                    )}

                    {/* Checkers Piece */}
                    {piece && (
                      <div
                        className={`w-[78%] h-[78%] rounded-full flex items-center justify-center transition-transform shadow-lg ${
                          isSelected ? 'scale-110 ring-4 ring-amber-400 z-10' : ''
                        } ${
                          piece.color === 'red'
                            ? 'bg-gradient-to-br from-rose-500 to-red-700 border-2 border-red-300 ring-2 ring-red-900/40 text-white'
                            : 'bg-gradient-to-br from-neutral-800 to-neutral-950 border-2 border-neutral-600 ring-2 ring-black/60 text-amber-400'
                        }`}
                      >
                        {/* Concentric rings on checker */}
                        <div className="w-[70%] h-[70%] rounded-full border border-white/20 flex items-center justify-center">
                          {piece.type === 'king' && (
                            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 drop-shadow-md" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Coordinates on edge */}
                    {c === 0 && (
                      <span className="absolute left-0.5 top-0.5 text-[8px] font-mono opacity-40 text-white">
                        {8 - r}
                      </span>
                    )}
                    {r === 7 && (
                      <span className="absolute right-0.5 bottom-0.5 text-[8px] font-mono opacity-40 text-white">
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][c]}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Victory / Game Over Overlay */}
          {winner && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
              <Trophy className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
              <h3 className="text-xl font-bold text-white mb-1">
                {winner === 'red' ? 'Victory! You Won!' : 'Gret Won!'}
              </h3>
              <p className="text-neutral-300 text-xs max-w-xs mb-4">
                {winner === 'red'
                  ? 'Superb diagonal tactics and king control against Gret AI.'
                  : 'Gret swept the board. Ready for a rematch?'}
              </p>
              <button
                onClick={restartGame}
                className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-semibold text-xs hover:bg-neutral-200 transition cursor-pointer shadow-lg"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Player Status Bar */}
        <div className="w-full max-w-[480px] mt-2 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs border border-red-400 shadow-xs">
              You
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                  You (Red Pieces)
                </span>
                {turn === 'red' && !winner && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                    Your Turn
                  </span>
                )}
              </div>
              <div className="text-[11px] text-neutral-500">
                {validMoves.length > 0
                  ? `${validMoves.length} moves available for selected piece`
                  : 'Select a red piece to move'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-500 text-[11px]">Captures:</span>
            <span className="font-bold text-neutral-800 dark:text-neutral-200">
              {capturedBlack}
            </span>
          </div>
        </div>
      </div>

      {/* Side Panel: Controls, Commentary & History */}
      <div className="w-full lg:w-72 flex flex-col gap-3">
        {/* Gret Commentary Banner */}
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white shadow-xs">
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gret Live Commentary</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed italic">
            "{gretCommentary}"
          </p>
        </div>

        {/* Difficulty & Controls */}
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
          <div>
            <label className="text-[11px] font-medium text-neutral-500 block mb-1.5">
              Gret Difficulty
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['casual', 'tactical', 'master'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-1 rounded-lg text-xs capitalize font-medium transition cursor-pointer ${
                    difficulty === lvl
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={restartGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-medium transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                soundManager.enabled = next;
              }}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition cursor-pointer"
              title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Checkers Quick Rules & Tips */}
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5">
          <div className="flex items-center gap-1 font-semibold text-neutral-800 dark:text-neutral-200 text-[11px]">
            <Info className="w-3.5 h-3.5 text-neutral-500" />
            <span>Checkers Rules</span>
          </div>
          <ul className="text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1 list-disc list-inside">
            <li>Pieces move diagonally forward 1 space.</li>
            <li>Jumping over Gret's piece captures it.</li>
            <li>Reach row 8 to become a <strong>King</strong>.</li>
            <li>Kings can move forward and backward!</li>
          </ul>
        </div>

        {/* Move History */}
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 max-h-48 overflow-y-auto">
          <div className="text-[11px] font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
            Move History
          </div>
          {moveHistory.length === 0 ? (
            <div className="text-xs text-neutral-400 italic">No moves yet</div>
          ) : (
            <div className="space-y-0.5 text-xs font-mono">
              {moveHistory.map((m, idx) => (
                <div
                  key={idx}
                  className={`text-[11px] ${
                    m.startsWith('Red') ? 'text-red-500' : 'text-neutral-400'
                  }`}
                >
                  {idx + 1}. {m}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
