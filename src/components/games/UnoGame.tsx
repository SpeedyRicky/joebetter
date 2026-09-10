import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Trophy,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { SoundManager } from '../chess/chessSounds';

export type UnoColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type UnoValue =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'skip'
  | 'reverse'
  | 'draw2'
  | 'wild'
  | 'wild4';

export interface UnoCard {
  id: string;
  color: UnoColor;
  value: UnoValue;
}

const soundManager = new SoundManager();

export const UnoGame: React.FC = () => {
  const [deck, setDeck] = useState<UnoCard[]>([]);
  const [discardPile, setDiscardPile] = useState<UnoCard[]>([]);
  const [playerHand, setPlayerHand] = useState<UnoCard[]>([]);
  const [gretHand, setGretHand] = useState<UnoCard[]>([]);
  const [activeColor, setActiveColor] = useState<UnoColor>('red');
  const [turn, setTurn] = useState<'player' | 'gret'>('player');
  const [winner, setWinner] = useState<'player' | 'gret' | null>(null);
  const [playerCalledUno, setPlayerCalledUno] = useState<boolean>(false);
  const [gretCalledUno, setGretCalledUno] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [pendingCard, setPendingCard] = useState<UnoCard | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [commentary, setCommentary] = useState<string>(
    "Welcome to Uno with Gret! Match the color or number on the discard pile."
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Initialize deck and deal
  useEffect(() => {
    startNewGame();
  }, []);

  const createDeck = (): UnoCard[] => {
    const colors: UnoColor[] = ['red', 'blue', 'green', 'yellow'];
    const cards: UnoCard[] = [];
    let idCounter = 1;

    for (const c of colors) {
      // One 0
      cards.push({ id: `c-${idCounter++}`, color: c, value: '0' });
      // Two of each 1-9
      for (let n = 1; n <= 9; n++) {
        cards.push({ id: `c-${idCounter++}`, color: c, value: `${n}` as UnoValue });
        cards.push({ id: `c-${idCounter++}`, color: c, value: `${n}` as UnoValue });
      }
      // Action cards: 2 skip, 2 reverse, 2 draw2
      for (let i = 0; i < 2; i++) {
        cards.push({ id: `c-${idCounter++}`, color: c, value: 'skip' });
        cards.push({ id: `c-${idCounter++}`, color: c, value: 'reverse' });
        cards.push({ id: `c-${idCounter++}`, color: c, value: 'draw2' });
      }
    }

    // 4 Wild, 4 Wild Draw 4
    for (let i = 0; i < 4; i++) {
      cards.push({ id: `c-${idCounter++}`, color: 'wild', value: 'wild' });
      cards.push({ id: `c-${idCounter++}`, color: 'wild', value: 'wild4' });
    }

    // Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
  };

  const startNewGame = () => {
    const fullDeck = createDeck();

    // Deal 7 cards each
    const pHand = fullDeck.splice(0, 7);
    const gHand = fullDeck.splice(0, 7);

    // Initial discard must not be an action or wild card for simplicity
    let startIdx = 0;
    while (
      startIdx < fullDeck.length &&
      (fullDeck[startIdx].color === 'wild' ||
        ['skip', 'reverse', 'draw2'].includes(fullDeck[startIdx].value))
    ) {
      startIdx++;
    }

    const firstCard = fullDeck.splice(startIdx, 1)[0] || {
      id: 'first',
      color: 'red',
      value: '5',
    };

    setDeck(fullDeck);
    setDiscardPile([firstCard]);
    setActiveColor(firstCard.color);
    setPlayerHand(pHand);
    setGretHand(gHand);
    setTurn('player');
    setWinner(null);
    setPlayerCalledUno(false);
    setGretCalledUno(false);
    setShowColorPicker(false);
    setPendingCard(null);
    setIsAiThinking(false);
    setCommentary("Game on! Match the discard pile by color or number. Have fun!");
  };

  const topDiscard = discardPile[discardPile.length - 1];

  const isCardPlayable = (card: UnoCard): boolean => {
    if (!topDiscard) return false;
    if (card.color === 'wild') return true;
    if (card.color === activeColor) return true;
    if (card.value === topDiscard.value) return true;
    return false;
  };

  // Draw card from deck (reshuffling discard if needed)
  const drawCards = (
    count: number,
    currentDeck: UnoCard[],
    currentDiscard: UnoCard[]
  ): { drawn: UnoCard[]; remainingDeck: UnoCard[]; remainingDiscard: UnoCard[] } => {
    let d = [...currentDeck];
    let disc = [...currentDiscard];
    const drawn: UnoCard[] = [];

    for (let i = 0; i < count; i++) {
      if (d.length === 0) {
        if (disc.length > 1) {
          const top = disc.pop()!;
          d = disc.sort(() => Math.random() - 0.5);
          disc = [top];
        } else {
          break; // completely out of cards
        }
      }
      if (d.length > 0) {
        drawn.push(d.pop()!);
      }
    }

    return { drawn, remainingDeck: d, remainingDiscard: disc };
  };

  // Player plays a card
  const handlePlayCard = (card: UnoCard) => {
    if (turn !== 'player' || winner || isAiThinking) return;
    if (!isCardPlayable(card)) return;

    if (card.color === 'wild') {
      setPendingCard(card);
      setShowColorPicker(true);
      return;
    }

    executePlayCard(card, card.color);
  };

  // Execute card play for either player
  const executePlayCard = (card: UnoCard, chosenColor: UnoColor) => {
    soundManager.playMove();

    const newDiscard = [...discardPile, card];
    setDiscardPile(newDiscard);
    setActiveColor(chosenColor);

    if (turn === 'player') {
      const newHand = playerHand.filter((c) => c.id !== card.id);
      setPlayerHand(newHand);

      if (newHand.length === 1) {
        setPlayerCalledUno(true);
        setCommentary("UNO! You have only 1 card remaining!");
        soundManager.playCheck();
      }

      if (newHand.length === 0) {
        setWinner('player');
        setCommentary("UNBELIEVABLE! You won Uno against Gret!");
        soundManager.playVictory();
        return;
      }

      // Handle card effects
      handleActionCardEffects(card, 'player', newDiscard);
    } else {
      // Gret played
      const newHand = gretHand.filter((c) => c.id !== card.id);
      setGretHand(newHand);

      if (newHand.length === 1) {
        setGretCalledUno(true);
        setCommentary("Gret shouted: UNO! Watch out, only 1 card left!");
        soundManager.playCheck();
      }

      if (newHand.length === 0) {
        setWinner('gret');
        setCommentary("Gret won this round of Uno! GG!");
        soundManager.playLoss();
        return;
      }

      handleActionCardEffects(card, 'gret', newDiscard);
    }
  };

  const handleActionCardEffects = (
    card: UnoCard,
    actor: 'player' | 'gret',
    currentDiscard: UnoCard[]
  ) => {
    const isPlayer = actor === 'player';
    const nextTurn = isPlayer ? 'gret' : 'player';

    if (card.value === 'skip') {
      soundManager.playCheck();
      setCommentary(
        isPlayer
          ? "You played a Skip! Gret loses a turn!"
          : "Gret skipped your turn! Gret goes again."
      );
      // Turn stays with actor
      if (!isPlayer) {
        // Trigger another AI turn
        setTurn('gret');
      }
      return;
    }

    if (card.value === 'reverse') {
      soundManager.playCheck();
      setCommentary(
        isPlayer
          ? "Reverse card played! Turn bounces back to you in 2-player!"
          : "Gret played Reverse! Turn bounces back to Gret."
      );
      // In 2-player Uno, reverse acts as a skip
      return;
    }

    if (card.value === 'draw2') {
      soundManager.playCapture();
      const { drawn, remainingDeck, remainingDiscard } = drawCards(
        2,
        deck,
        currentDiscard
      );
      setDeck(remainingDeck);
      setDiscardPile(remainingDiscard);

      if (isPlayer) {
        setGretHand((prev) => [...prev, ...drawn]);
        setCommentary("Draw Two! Gret was forced to draw 2 cards and skips a turn!");
        // Player goes again
      } else {
        setPlayerHand((prev) => [...prev, ...drawn]);
        setCommentary("Ouch! Gret hit you with a Draw Two! You draw 2 cards and skip.");
        // Gret goes again
      }
      return;
    }

    if (card.value === 'wild4') {
      soundManager.playCapture();
      const { drawn, remainingDeck, remainingDiscard } = drawCards(
        4,
        deck,
        currentDiscard
      );
      setDeck(remainingDeck);
      setDiscardPile(remainingDiscard);

      if (isPlayer) {
        setGretHand((prev) => [...prev, ...drawn]);
        setCommentary("WILD DRAW 4! Gret drew 4 cards and skipped!");
        // Player goes again
      } else {
        setPlayerHand((prev) => [...prev, ...drawn]);
        setCommentary("WILD DRAW 4 from Gret! You drew 4 cards and lose your turn!");
        // Gret goes again
      }
      return;
    }

    // Standard card: toggle turn
    setTurn(nextTurn);
  };

  // Player draws a card
  const handlePlayerDraw = () => {
    if (turn !== 'player' || winner || isAiThinking) return;

    soundManager.playMove();
    const { drawn, remainingDeck, remainingDiscard } = drawCards(1, deck, discardPile);
    setDeck(remainingDeck);
    setDiscardPile(remainingDiscard);

    if (drawn.length > 0) {
      const drawnCard = drawn[0];
      const newHand = [...playerHand, drawnCard];
      setPlayerHand(newHand);

      if (isCardPlayable(drawnCard)) {
        setCommentary(`You drew a playable card (${drawnCard.color} ${drawnCard.value})!`);
      } else {
        setCommentary(`You drew a card. Passing turn to Gret.`);
        setTurn('gret');
      }
    }
  };

  // Color picker selection for wild cards
  const handleSelectColor = (c: UnoColor) => {
    if (!pendingCard) return;
    setShowColorPicker(false);
    executePlayCard(pendingCard, c);
    setPendingCard(null);
  };

  // Gret AI turn
  useEffect(() => {
    if (turn === 'gret' && !winner) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        executeGretAiTurn();
        setIsAiThinking(false);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [turn, winner, discardPile, activeColor]);

  const executeGretAiTurn = () => {
    // Find all playable cards in Gret's hand
    const playable = gretHand.filter(isCardPlayable);

    if (playable.length > 0) {
      // Gret strategy:
      // 1. Prioritize action cards (draw2, wild4, skip, reverse) to disrupt player
      // 2. Play matching numbers or colors
      // 3. Save regular Wild for when needed
      let cardToPlay: UnoCard;

      const attacks = playable.filter((c) => ['draw2', 'wild4', 'skip'].includes(c.value));
      if (attacks.length > 0) {
        cardToPlay = attacks[0];
      } else {
        const nonWilds = playable.filter((c) => c.color !== 'wild');
        cardToPlay =
          nonWilds.length > 0
            ? nonWilds[0]
            : playable[0];
      }

      // If wild, choose most frequent color in Gret's hand
      let chosenColor: UnoColor = 'red';
      if (cardToPlay.color === 'wild') {
        const counts: Record<string, number> = { red: 0, blue: 0, green: 0, yellow: 0 };
        for (const c of gretHand) {
          if (c.color !== 'wild') counts[c.color]++;
        }
        let maxColor = 'red';
        let maxCount = -1;
        for (const [col, count] of Object.entries(counts)) {
          if (count > maxCount) {
            maxCount = count;
            maxColor = col;
          }
        }
        chosenColor = maxColor as UnoColor;
      } else {
        chosenColor = cardToPlay.color;
      }

      executePlayCard(cardToPlay, chosenColor);
    } else {
      // Must draw
      const { drawn, remainingDeck, remainingDiscard } = drawCards(1, deck, discardPile);
      setDeck(remainingDeck);
      setDiscardPile(remainingDiscard);

      if (drawn.length > 0) {
        const drawnCard = drawn[0];
        const updatedGretHand = [...gretHand, drawnCard];
        setGretHand(updatedGretHand);

        if (isCardPlayable(drawnCard)) {
          // Play it immediately!
          setCommentary("Gret drew a card and played it immediately!");
          const chosen =
            drawnCard.color === 'wild'
              ? 'blue'
              : drawnCard.color;
          executePlayCard(drawnCard, chosen);
        } else {
          setCommentary("Gret had no playable cards and drew from the deck. Your turn!");
          setTurn('player');
        }
      } else {
        setTurn('player');
      }
    }
  };

  const getColorBg = (color: UnoColor): string => {
    switch (color) {
      case 'red':
        return 'bg-red-500 border-red-400 text-white';
      case 'blue':
        return 'bg-blue-500 border-blue-400 text-white';
      case 'green':
        return 'bg-emerald-500 border-emerald-400 text-white';
      case 'yellow':
        return 'bg-amber-400 border-amber-300 text-neutral-950';
      case 'wild':
        return 'bg-gradient-to-br from-red-500 via-yellow-400 via-emerald-500 to-blue-500 border-white text-white';
      default:
        return 'bg-neutral-800 text-white';
    }
  };

  const getDisplayValue = (val: UnoValue): string => {
    switch (val) {
      case 'skip':
        return '🚫';
      case 'reverse':
        return '🔁';
      case 'draw2':
        return '+2';
      case 'wild':
        return '🌈';
      case 'wild4':
        return '+4';
      default:
        return val;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-6 max-w-4xl mx-auto select-none">
      {/* Top Banner: Gret Hand & Status */}
      <div className="w-full mb-4 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-neutral-950 flex items-center justify-center font-bold text-sm shadow-xs">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-neutral-100">Gret</span>
              {gretHand.length === 1 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white font-bold animate-pulse">
                  UNO!
                </span>
              )}
            </div>
            <div className="text-[11px] text-neutral-400">
              {turn === 'gret' ? (
                <span className="text-amber-400 animate-pulse font-medium">
                  Thinking...
                </span>
              ) : (
                `${gretHand.length} cards in hand`
              )}
            </div>
          </div>
        </div>

        {/* Gret's Cards (Face Down) */}
        <div className="flex items-center -space-x-4 overflow-hidden py-1 px-2">
          {gretHand.map((c, idx) => (
            <div
              key={c.id || idx}
              className="w-9 h-13 sm:w-11 sm:h-16 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-600 shadow-md flex items-center justify-center text-[10px] font-bold text-red-500 transform -rotate-1 hover:-translate-y-1 transition-transform"
            >
              UNO
            </div>
          ))}
        </div>
      </div>

      {/* Center Arena: Draw Pile & Discard Pile */}
      <div className="w-full py-8 sm:py-12 px-4 rounded-3xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center relative shadow-2xl mb-4">
        {/* Active Color & Turn Indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-400">Current Color:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] border ${
                activeColor === 'red'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : activeColor === 'blue'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : activeColor === 'green'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}
            >
              {activeColor}
            </span>
          </div>

          <div className="h-3 w-px bg-neutral-800" />

          <div className="text-xs font-semibold">
            {turn === 'player' ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Your Turn
              </span>
            ) : (
              <span className="text-neutral-400">Gret's Turn</span>
            )}
          </div>
        </div>

        {/* Piles Container */}
        <div className="flex items-center justify-center gap-8 sm:gap-14">
          {/* Draw Pile */}
          <div
            onClick={handlePlayerDraw}
            className={`w-20 h-28 sm:w-28 sm:h-40 rounded-2xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border-2 border-neutral-700 shadow-xl flex flex-col items-center justify-center cursor-pointer transition-all transform hover:scale-105 active:scale-95 ${
              turn === 'player' && !winner
                ? 'ring-4 ring-emerald-500/30'
                : 'opacity-70'
            }`}
          >
            <div className="text-red-500 font-extrabold text-sm sm:text-xl tracking-wider">
              UNO
            </div>
            <div className="text-[10px] text-neutral-400 mt-1">
              Draw ({deck.length})
            </div>
          </div>

          {/* Discard Pile */}
          {topDiscard && (
            <div
              className={`w-20 h-28 sm:w-28 sm:h-40 rounded-2xl border-2 shadow-2xl flex flex-col items-center justify-between p-2 transform rotate-1 transition-all ${getColorBg(
                activeColor
              )}`}
            >
              <div className="self-start text-xs font-bold font-mono">
                {getDisplayValue(topDiscard.value)}
              </div>
              <div className="w-12 h-16 sm:w-16 sm:h-22 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-2xl sm:text-4xl drop-shadow-md">
                {getDisplayValue(topDiscard.value)}
              </div>
              <div className="self-end text-xs font-bold font-mono">
                {getDisplayValue(topDiscard.value)}
              </div>
            </div>
          )}
        </div>

        {/* Live Commentary */}
        <div className="mt-6 px-4 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2 max-w-md text-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{commentary}</span>
        </div>

        {/* Color Picker Modal for Wild Cards */}
        {showColorPicker && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 z-40 animate-fade-in">
            <h4 className="text-base font-bold text-white mb-4">
              Choose a Color for your Wild Card:
            </h4>
            <div className="grid grid-cols-2 gap-3 w-48">
              <button
                onClick={() => handleSelectColor('red')}
                className="py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Red
              </button>
              <button
                onClick={() => handleSelectColor('blue')}
                className="py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Blue
              </button>
              <button
                onClick={() => handleSelectColor('green')}
                className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Green
              </button>
              <button
                onClick={() => handleSelectColor('yellow')}
                className="py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                Yellow
              </button>
            </div>
          </div>
        )}

        {/* Victory Screen */}
        {winner && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 z-40 text-center animate-fade-in">
            <Trophy className="w-14 h-14 text-amber-400 mb-2 animate-bounce" />
            <h3 className="text-2xl font-black text-white mb-1">
              {winner === 'player' ? 'YOU WON UNO!' : 'GRET WON!'}
            </h3>
            <p className="text-neutral-300 text-xs max-w-xs mb-5">
              {winner === 'player'
                ? 'Flawless card management and wild card timing!'
                : 'Better luck next time. Gret cleared their hand!'}
            </p>
            <button
              onClick={startNewGame}
              className="px-5 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-200 transition cursor-pointer shadow-lg"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Player Hand & Controls */}
      <div className="w-full flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              Your Hand ({playerHand.length} cards)
            </span>
            {playerHand.length === 1 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold animate-bounce">
                UNO!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayerDraw}
              disabled={turn !== 'player' || !!winner}
              className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              Draw Card
            </button>
            <button
              onClick={startNewGame}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer"
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Player Cards Ribbon */}
        <div className="w-full flex items-center justify-center -space-x-3 sm:-space-x-4 overflow-x-auto py-4 px-3 min-h-[140px]">
          {playerHand.map((card) => {
            const playable = isCardPlayable(card) && turn === 'player' && !winner;

            return (
              <button
                key={card.id}
                onClick={() => handlePlayCard(card)}
                disabled={!playable}
                className={`relative w-16 h-24 sm:w-20 sm:h-30 rounded-xl border-2 shadow-xl flex flex-col items-center justify-between p-1.5 transition-all transform select-none cursor-pointer ${getColorBg(
                  card.color
                )} ${
                  playable
                    ? 'hover:-translate-y-4 hover:scale-110 hover:z-30 ring-2 ring-white/60 cursor-pointer'
                    : 'opacity-40 hover:opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="self-start text-[10px] sm:text-xs font-bold font-mono">
                  {getDisplayValue(card.value)}
                </div>
                <div className="w-8 h-10 sm:w-11 sm:h-14 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-sm sm:text-lg">
                  {getDisplayValue(card.value)}
                </div>
                <div className="self-end text-[10px] sm:text-xs font-bold font-mono">
                  {getDisplayValue(card.value)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
