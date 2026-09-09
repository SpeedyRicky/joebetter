import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import {
  Trophy,
  RotateCcw,
  Lightbulb,
  Volume2,
  VolumeX,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Swords,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  Share2,
} from 'lucide-react';
import { BotCharacter, BOT_PRESETS, getBotForElo, PlayerColor, CapturedPieces } from './chessTypes';
import { getBotMove, getBotCommentary, getHintForPlayer, evaluateBoard, clearTranspositionTable } from './chessEngine';
import { chessSounds } from './chessSounds';
import { ChessPiece } from './ChessPieces';
import { JoeLogo } from '../JoeLogo';

interface JoeChessArenaProps {
  onBackToChat: () => void;
  onOpenCode?: () => void;
}

export const JoeChessArena: React.FC<JoeChessArenaProps> = ({ onBackToChat }) => {
  // Game state
  const [chess] = useState(() => new Chess());
  const [, setTick] = useState(0); // Force re-renders on chess mutations
  const [fen, setFen] = useState(chess.fen());
  const [playerColor, setPlayerColor] = useState<PlayerColor>('w');
  const [boardFlipped, setBoardFlipped] = useState(false);

  // Selected bot & Elo (default Martin Joe - 250 or custom 100 to 3000)
  const [selectedElo, setSelectedElo] = useState<number>(1000);
  const currentBot: BotCharacter = useMemo(() => getBotForElo(selectedElo), [selectedElo]);

  // Board interaction state
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [hintMove, setHintMove] = useState<{ from: Square; to: Square; advice: string } | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Bot thinking state & commentary
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [botSpeech, setBotSpeech] = useState<string>(
    `Hi! I'm ${currentBot.name} (Elo ${currentBot.elo}). Ready for a game? Make your first move!`
  );

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals & Panels
  const [isEloDrawerOpen, setIsEloDrawerOpen] = useState(false);
  const [gameOverResult, setGameOverResult] = useState<{
    winner: 'player' | 'bot' | 'draw' | null;
    reason: string;
  } | null>(null);

  // Move history for PGN/list
  const [historyMoves, setHistoryMoves] = useState<string[]>([]);
  const movesScrollRef = useRef<HTMLDivElement>(null);

  // Sync sound manager
  useEffect(() => {
    chessSounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Scroll move history to bottom
  useEffect(() => {
    if (movesScrollRef.current) {
      movesScrollRef.current.scrollTop = movesScrollRef.current.scrollHeight;
    }
  }, [historyMoves]);

  // Update speech when changing bot
  useEffect(() => {
    setBotSpeech(`Hi! I'm ${currentBot.name} (Elo ${currentBot.elo}). ${currentBot.quote}`);
  }, [currentBot]);

  // Check game over
  const checkGameOver = useCallback(() => {
    if (chess.isGameOver()) {
      chessSounds.playGameOver();
      if (chess.isCheckmate()) {
        const winner = chess.turn() === playerColor ? 'bot' : 'player';
        setGameOverResult({
          winner,
          reason: `Checkmate! ${winner === 'player' ? 'You won!' : `${currentBot.name} won!`}`,
        });
      } else if (chess.isStalemate()) {
        setGameOverResult({ winner: 'draw', reason: 'Stalemate! Draw.' });
      } else if (chess.isThreefoldRepetition()) {
        setGameOverResult({ winner: 'draw', reason: 'Draw by Threefold Repetition.' });
      } else if (chess.isInsufficientMaterial()) {
        setGameOverResult({ winner: 'draw', reason: 'Draw by Insufficient Material.' });
      } else {
        setGameOverResult({ winner: 'draw', reason: 'Draw.' });
      }
      return true;
    }
    return false;
  }, [chess, playerColor, currentBot.name]);

  // Execute bot move
  const triggerBotMove = useCallback(async () => {
    if (chess.isGameOver()) return;
    setIsBotThinking(true);

    // Simulate realistic bot calculation delay (250ms - 800ms)
    const thinkDelay = Math.min(800, Math.max(250, selectedElo / 4));
    await new Promise((resolve) => setTimeout(resolve, thinkDelay));

    if (chess.turn() === playerColor || chess.isGameOver()) {
      setIsBotThinking(false);
      return;
    }

    try {
      const move = await getBotMove(chess, selectedElo, currentBot.id);
      if (move) {
        const result = chess.move(move);
        if (result) {
          setFen(chess.fen());
          setTick((t) => t + 1);
          setLastMove({ from: result.from as Square, to: result.to as Square });
          setHistoryMoves(chess.history());
          setHintMove(null);

          // Audio
          if (result.captured) {
            chessSounds.playCapture();
          } else if (result.san === 'O-O' || result.san === 'O-O-O') {
            chessSounds.playCastle();
          } else if (chess.isCheck()) {
            chessSounds.playCheck();
          } else {
            chessSounds.playMove();
          }

          // Commentary
          const speech = getBotCommentary(result, chess, currentBot.name, selectedElo);
          setBotSpeech(speech);

          checkGameOver();
        }
      }
    } catch (err) {
      console.error('Bot move error:', err);
    } finally {
      setIsBotThinking(false);
    }
  }, [chess, selectedElo, currentBot, checkGameOver]);

  // If player chose Black, bot moves first
  useEffect(() => {
    if (playerColor === 'b' && chess.turn() === 'w' && historyMoves.length === 0) {
      triggerBotMove();
    }
  }, [playerColor, chess, historyMoves.length, triggerBotMove]);

  // Handle Square Selection & Move
  const handleSquareClick = (square: Square) => {
    if (isBotThinking || gameOverResult) return;

    const currentTurn = chess.turn();
    if (currentTurn !== playerColor) return;

    // 1. If clicking a possible move destination
    const existingMove = possibleMoves.find((m) => m.to === square);
    if (existingMove && selectedSquare) {
      // Check for pawn promotion
      const piece = chess.get(selectedSquare);
      if (
        piece &&
        piece.type === 'p' &&
        ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'))
      ) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }

      executeMove(selectedSquare, square);
      return;
    }

    // 2. Select piece if it belongs to current player
    const piece = chess.get(square);
    if (piece && piece.color === playerColor) {
      setSelectedSquare(square);
      const legal = chess.moves({ square, verbose: true });
      setPossibleMoves(legal);
      return;
    }

    // Otherwise deselect
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  // Perform Move
  const executeMove = (from: Square, to: Square, promotionPiece: 'q' | 'r' | 'b' | 'n' = 'q') => {
    try {
      const move = chess.move({
        from,
        to,
        promotion: promotionPiece,
      });

      if (move) {
        setFen(chess.fen());
        setTick((t) => t + 1);
        setSelectedSquare(null);
        setPossibleMoves([]);
        setLastMove({ from, to });
        setHistoryMoves(chess.history());
        setHintMove(null);

        // Sound
        if (move.captured) {
          chessSounds.playCapture();
        } else if (move.san === 'O-O' || move.san === 'O-O-O') {
          chessSounds.playCastle();
        } else if (chess.isCheck()) {
          chessSounds.playCheck();
        } else {
          chessSounds.playMove();
        }

        const isOver = checkGameOver();
        if (!isOver) {
          // Trigger bot's turn
          setTimeout(() => {
            triggerBotMove();
          }, 200);
        }
      }
    } catch (err) {
      console.error('Invalid move attempt:', err);
    }
  };

  // Handle Promotion Selection
  const handleSelectPromotion = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (pendingPromotion) {
      executeMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
    }
  };

  // New Game
  const handleStartNewGame = (newColor?: PlayerColor) => {
    clearTranspositionTable();
    chess.reset();
    setFen(chess.fen());
    setTick((t) => t + 1);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setHintMove(null);
    setPendingPromotion(null);
    setGameOverResult(null);
    setHistoryMoves([]);
    setIsBotThinking(false);

    const activeColor = newColor || playerColor;
    setPlayerColor(activeColor);
    setBoardFlipped(activeColor === 'b');
    setBotSpeech(`New game started! I'm ${currentBot.name} (Elo ${currentBot.elo}). Good luck!`);

    if (activeColor === 'b') {
      setTimeout(() => {
        triggerBotMove();
      }, 400);
    }
  };

  // Undo Move (undoes both bot move and player move)
  const handleUndoMove = () => {
    if (isBotThinking || historyMoves.length === 0) return;
    chess.undo(); // Undo bot move
    if (chess.turn() !== playerColor) {
      chess.undo(); // Undo player move
    }
    setFen(chess.fen());
    setTick((t) => t + 1);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setHintMove(null);
    setGameOverResult(null);
    setHistoryMoves(chess.history());
    setBotSpeech("Move taken back! Let's try again.");
    chessSounds.playMove();
  };

  // Hint
  const handleAskHint = () => {
    if (isBotThinking || gameOverResult || chess.turn() !== playerColor) return;
    const hint = getHintForPlayer(chess);
    if (hint) {
      setHintMove({
        from: hint.move.from as Square,
        to: hint.move.to as Square,
        advice: hint.advice,
      });
      setBotSpeech(`💡 Hint: ${hint.advice}`);
      chessSounds.playCheck();
    }
  };

  // Resign
  const handleResign = () => {
    if (gameOverResult) return;
    chessSounds.playGameOver();
    setGameOverResult({
      winner: 'bot',
      reason: `You resigned. ${currentBot.name} wins!`,
    });
    setBotSpeech("Good game! Resignation accepted. Ready for a rematch?");
  };

  // Calculate Captured pieces
  const capturedPieces = useMemo(() => {
    const white: CapturedPieces = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const black: CapturedPieces = { p: 8, n: 2, b: 2, r: 2, q: 1 };

    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const t = piece.type as keyof CapturedPieces;
          if (piece.color === 'w') {
            white[t] = Math.max(0, (white[t] || 0) - 1);
          } else {
            black[t] = Math.max(0, (black[t] || 0) - 1);
          }
        }
      }
    }

    // Material count
    const wScore =
      white.p * 1 + white.n * 3 + white.b * 3 + white.r * 5 + white.q * 9;
    const bScore =
      black.p * 1 + black.n * 3 + black.b * 3 + black.r * 5 + black.q * 9;

    return {
      whiteCapturedByBlack: white, // White pieces captured by black
      blackCapturedByWhite: black, // Black pieces captured by white
      whiteDiff: bScore - wScore,
      blackDiff: wScore - bScore,
    };
  }, [fen]);

  // Centipawn evaluation
  const positionEval = useMemo(() => {
    const raw = evaluateBoard(chess);
    // Normalize to -10 to +10 range
    const pawns = raw / 100;
    return Math.max(-10, Math.min(10, pawns));
  }, [fen]);

  // Board square ranks and files
  const ranks = boardFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = boardFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <div className="h-13 px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Joe</span>
          </button>

          <div className="h-4 w-px bg-neutral-200 dark:border-neutral-800" />

          <div className="flex items-center gap-2">
            <JoeLogo size="xs" />
            <div className="flex items-baseline gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Joe Chess Bot
              </h1>
              <span className="text-xs text-neutral-500 font-medium">
                vs {currentBot.name} ({currentBot.elo} Elo)
              </span>
            </div>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Elo Selector Quick Button */}
          <button
            onClick={() => setIsEloDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold shadow-xs hover:opacity-90 transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Change Bot (Elo {currentBot.elo})</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Chess Arena Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center: Board and Bot/Player Badges */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-[560px] flex flex-col gap-2">
            {/* Top: Bot Profile & Speech Bubble */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="relative">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold ${currentBot.avatarColor} border border-black/10 dark:border-white/10 shrink-0`}
                >
                  {currentBot.avatar}
                </div>
                {isBotThinking && (
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {currentBot.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                      {currentBot.elo} Elo
                    </span>
                    {currentBot.title && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-white">
                        {currentBot.title}
                      </span>
                    )}
                  </div>

                  {/* Captured pieces by Bot */}
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    {playerColor === 'w' ? (
                      <CapturedPiecesRow pieces={capturedPieces.whiteCapturedByBlack} />
                    ) : (
                      <CapturedPiecesRow pieces={capturedPieces.blackCapturedByWhite} />
                    )}
                  </div>
                </div>

                {/* Speech Bubble */}
                <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 text-xs italic flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{botSpeech}</span>
                </div>
              </div>
            </div>

            {/* Middle: Chess Board with Eval Bar */}
            <div className="flex items-stretch gap-2.5">
              {/* Vertical Evaluation Bar (Chess.com style) */}
              <div className="w-3.5 sm:w-4 rounded-full bg-neutral-800 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 overflow-hidden flex flex-col justify-end relative shadow-inner shrink-0">
                {/* White portion */}
                <div
                  className="w-full bg-white transition-all duration-300 ease-out"
                  style={{
                    height: `${Math.max(5, Math.min(95, 50 + positionEval * 4.5))}%`,
                  }}
                />
              </div>

              {/* 8x8 Chess Board */}
              <div className="flex-1 aspect-square rounded-xl overflow-hidden border-2 border-neutral-700/60 dark:border-neutral-800 shadow-xl bg-[#739552] relative">
                <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                  {ranks.map((rank) =>
                    files.map((file) => {
                      const square = `${file}${rank}` as Square;
                      const piece = chess.get(square);
                      const isLight = (file.charCodeAt(0) - 97 + rank) % 2 !== 0;

                      // Highlights
                      const isSelected = selectedSquare === square;
                      const isLastMoveSource = lastMove?.from === square;
                      const isLastMoveTarget = lastMove?.to === square;
                      const isPossibleMove = possibleMoves.some((m) => m.to === square);
                      const isCaptureMove = possibleMoves.some((m) => m.to === square && m.captured);
                      const isHintSquare = hintMove?.from === square || hintMove?.to === square;

                      // In-Check Highlight
                      const isKingInCheck =
                        chess.isCheck() && piece?.type === 'k' && piece?.color === chess.turn();

                      return (
                        <div
                          key={square}
                          onClick={() => handleSquareClick(square)}
                          className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                            isLight ? 'bg-[#ebecd0]' : 'bg-[#739552]'
                          } ${isSelected ? '!bg-amber-300/80 dark:!bg-amber-400/70' : ''} ${
                            isLastMoveSource || isLastMoveTarget
                              ? '!bg-lime-200/70 dark:!bg-lime-500/40'
                              : ''
                          } ${isHintSquare ? '!bg-emerald-300/80 ring-2 ring-emerald-500' : ''} ${
                            isKingInCheck ? '!bg-rose-500/90 animate-pulse' : ''
                          }`}
                        >
                          {/* Rank / File Coordinate Labels (Chess.com style) */}
                          {file === files[0] && (
                            <span
                              className={`absolute top-0.5 left-1 text-[10px] font-bold pointer-events-none select-none ${
                                isLight ? 'text-[#739552]' : 'text-[#ebecd0]'
                              }`}
                            >
                              {rank}
                            </span>
                          )}
                          {rank === ranks[7] && (
                            <span
                              className={`absolute bottom-0.5 right-1 text-[10px] font-bold pointer-events-none select-none ${
                                isLight ? 'text-[#739552]' : 'text-[#ebecd0]'
                              }`}
                            >
                              {file}
                            </span>
                          )}

                          {/* Piece SVG */}
                          {piece && (
                            <div className="w-[82%] h-[82%] flex items-center justify-center transition-transform duration-100 hover:scale-105 active:scale-95">
                              <ChessPiece type={piece.type} color={piece.color} />
                            </div>
                          )}

                          {/* Valid Move Indicator Dot (for quiet empty square) */}
                          {isPossibleMove && !piece && !isCaptureMove && (
                            <div className="w-3.5 h-3.5 rounded-full bg-black/20 dark:bg-white/30 pointer-events-none" />
                          )}

                          {/* Valid Capture Indicator Ring (for occupied square or en passant) */}
                          {isPossibleMove && (piece || isCaptureMove) && (
                            <div className="absolute inset-0.5 rounded-full border-4 border-black/25 dark:border-white/40 pointer-events-none" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Pawn Promotion Modal Overlay */}
                {pendingPromotion && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-30">
                    <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl flex flex-col items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        Promote Pawn
                      </span>
                      <div className="flex gap-2">
                        {(['q', 'r', 'b', 'n'] as const).map((pType) => (
                          <button
                            key={pType}
                            onClick={() => handleSelectPromotion(pType)}
                            className="w-13 h-13 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 transition flex items-center justify-center cursor-pointer"
                          >
                            <ChessPiece type={pType} color={playerColor} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Player Profile Card */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm">
                  You
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      You ({playerColor === 'w' ? 'White' : 'Black'})
                    </span>
                    {chess.turn() === playerColor && !gameOverResult && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 animate-pulse">
                        Your Turn
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {playerColor === 'w' ? (
                      <CapturedPiecesRow pieces={capturedPieces.blackCapturedByWhite} />
                    ) : (
                      <CapturedPiecesRow pieces={capturedPieces.whiteCapturedByBlack} />
                    )}
                  </div>
                </div>
              </div>

              {/* Game Quick Toolbar */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAskHint}
                  title="Ask Joe for a Hint"
                  disabled={chess.turn() !== playerColor || !!gameOverResult}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Hint</span>
                </button>

                <button
                  onClick={handleUndoMove}
                  title="Undo Move"
                  disabled={historyMoves.length === 0 || isBotThinking || !!gameOverResult}
                  className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-40 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setBoardFlipped(!boardFlipped)}
                  title="Flip Board"
                  className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleResign}
                  title="Resign Game"
                  disabled={!!gameOverResult}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60 disabled:opacity-40 transition cursor-pointer"
                >
                  Resign
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Elo Picker Drawer / Moves History / Settings */}
        <div className="w-full lg:w-84 border-t lg:border-t-0 lg:border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col shrink-0">
          {/* Header */}
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Match Controls
            </span>
            <button
              onClick={() => handleStartNewGame()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>New Game</span>
            </button>
          </div>

          {/* Color Chooser */}
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Play As:
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handleStartNewGame('w')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  playerColor === 'w'
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                ⚪ White
              </button>
              <button
                onClick={() => handleStartNewGame('b')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  playerColor === 'b'
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                ⚫ Black
              </button>
            </div>
          </div>

          {/* Elo Selector Slider (100 to 3000) */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Bot Strength (Elo)
                </span>
                <p className="text-[11px] text-neutral-500">Pick from 100 to 3000</p>
              </div>
              <span className="text-sm font-extrabold px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {selectedElo} Elo
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="100"
              max="3000"
              step="50"
              value={selectedElo}
              onChange={(e) => setSelectedElo(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-neutral-100 cursor-pointer"
            />

            {/* Quick Bot Presets (Chess.com bot tiles) */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { name: 'Martin', elo: 250, icon: '🧔' },
                { name: 'Nelson', elo: 1200, icon: '👨‍🦱' },
                { name: 'Antonio', elo: 1600, icon: '👨‍🔬' },
                { name: 'Elena', elo: 2200, icon: '👑' },
                { name: 'Magnus', elo: 2850, icon: '⚡' },
                { name: 'Engine 3000', elo: 3000, icon: '🤖' },
              ].map((preset) => (
                <button
                  key={preset.elo}
                  onClick={() => setSelectedElo(preset.elo)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    selectedElo === preset.elo
                      ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900/5 dark:bg-neutral-100/10 font-bold text-neutral-900 dark:text-neutral-100'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{preset.icon}</span>
                    <span className="truncate">{preset.name}</span>
                  </span>
                  <span className="text-[10px] opacity-75">{preset.elo}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Move History Table */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <span>Move History</span>
              <span>{historyMoves.length} moves</span>
            </div>

            <div
              ref={movesScrollRef}
              className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1"
            >
              {historyMoves.length === 0 ? (
                <div className="h-full flex items-center justify-center text-neutral-400 text-xs text-center p-4">
                  Moves will appear here as you play against {currentBot.name}.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {Array.from({ length: Math.ceil(historyMoves.length / 2) }).map((_, idx) => {
                    const whiteMove = historyMoves[idx * 2];
                    const blackMove = historyMoves[idx * 2 + 1];
                    return (
                      <React.Fragment key={idx}>
                        <div className="flex items-center gap-2 px-2 py-1 rounded bg-neutral-50 dark:bg-neutral-800/50">
                          <span className="text-neutral-400 text-[11px] w-5">{idx + 1}.</span>
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {whiteMove}
                          </span>
                        </div>
                        <div className="flex items-center px-2 py-1 rounded bg-neutral-50 dark:bg-neutral-800/50">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {blackMove || ''}
                          </span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal Popup */}
      {gameOverResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                gameOverResult.winner === 'player'
                  ? 'bg-amber-500/20 text-amber-500'
                  : gameOverResult.winner === 'bot'
                  ? 'bg-rose-500/20 text-rose-500'
                  : 'bg-blue-500/20 text-blue-500'
              }`}
            >
              {gameOverResult.winner === 'player' ? (
                <Trophy className="w-8 h-8" />
              ) : (
                currentBot.avatar
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {gameOverResult.winner === 'player'
                  ? 'Victory!'
                  : gameOverResult.winner === 'bot'
                  ? `${currentBot.name} Won`
                  : 'Draw Game'}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">{gameOverResult.reason}</p>
            </div>

            <div className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 italic">
              "{botSpeech}"
            </div>

            <div className="w-full flex gap-2">
              <button
                onClick={() => handleStartNewGame()}
                className="flex-1 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer"
              >
                Play Rematch
              </button>
              <button
                onClick={() => {
                  setGameOverResult(null);
                  setIsEloDrawerOpen(true);
                }}
                className="py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                Change Bot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Bot Character Picker Modal */}
      {isEloDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Select Joe Bot Opponent
                </h3>
                <p className="text-xs text-neutral-500">
                  Choose an Elo from 100 to 3000 just like Chess.com bots
                </p>
              </div>
              <button
                onClick={() => setIsEloDrawerOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BOT_PRESETS.map((bot) => (
                <div
                  key={bot.id}
                  onClick={() => {
                    setSelectedElo(bot.elo);
                    setIsEloDrawerOpen(false);
                    handleStartNewGame();
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    selectedElo === bot.elo
                      ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900/5 dark:bg-neutral-100/10'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold ${bot.avatarColor} shrink-0`}
                  >
                    {bot.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        {bot.name}
                      </span>
                      <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {bot.elo}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1">
                      {bot.playStyle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for captured pieces list
function CapturedPiecesRow({ pieces }: { pieces: CapturedPieces }) {
  const list: React.ReactNode[] = [];
  const map: Record<keyof CapturedPieces, string> = {
    p: '♟',
    n: '♞',
    b: '♝',
    r: '♜',
    q: '♛',
  };

  Object.entries(pieces).forEach(([k, count]) => {
    if (count > 0) {
      list.push(
        <span key={k} className="inline-flex items-center text-xs tracking-tighter">
          {map[k as keyof CapturedPieces]}
          {count > 1 && <span className="text-[9px] font-bold">x{count}</span>}
        </span>
      );
    }
  });

  return <div className="flex items-center gap-1">{list}</div>;
}
