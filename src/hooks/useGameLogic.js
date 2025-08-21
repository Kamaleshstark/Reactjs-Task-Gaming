import { useState, useEffect, useCallback } from 'react';
import { FLAVOURS, MAX_ATTEMPTS, FLIP_BACK_DELAY } from '../utils/constants';
import { generateId, shuffleArray } from '../utils/gameHelpers';

const useGameLogic = () => {
  const initializeGame = useCallback(() => {
    const cardPairs = Object.entries(FLAVOURS).flatMap(([flavour, emoji]) => [
      { id: generateId(), flavour: emoji, isFlipped: false, isMatched: false },
      { id: generateId(), flavour: emoji, isFlipped: false, isMatched: false },
    ]);

    return {
      cards: shuffleArray(cardPairs),
      selectedCards: [],
      attempts: 0,
      gameStatus: 'playing',
      isChecking: false,
    };
  }, []);

  const [gameState, setGameState] = useState(initializeGame);

  const flipCard = useCallback((cardId) => {
    setGameState((prev) => ({
      ...prev,
      cards: prev.cards.map((card) =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      ),
      selectedCards: [...prev.selectedCards, cardId],
    }));
  }, []);

  const checkForMatch = useCallback(() => {
    const [firstCardId, secondCardId] = gameState.selectedCards;
    const firstCard = gameState.cards.find((card) => card.id === firstCardId);
    const secondCard = gameState.cards.find((card) => card.id === secondCardId);

    setGameState((prev) => ({
      ...prev,
      isChecking: true,
      attempts: prev.attempts + 1,
    }));

    if (firstCard.flavour === secondCard.flavour) {
      // Match found
      setGameState((prev) => ({
        ...prev,
        cards: prev.cards.map((card) =>
          card.id === firstCardId || card.id === secondCardId
            ? { ...card, isMatched: true }
            : card
        ),
        selectedCards: [],
        isChecking: false,
      }));
    } else {
      // No match
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          cards: prev.cards.map((card) =>
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isFlipped: false }
              : card
          ),
          selectedCards: [],
          isChecking: false,
        }));
      }, FLIP_BACK_DELAY);
    }
  }, [gameState.selectedCards, gameState.cards]);

  // Check for game end conditions
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const allMatched = gameState.cards.every((card) => card.isMatched);
    const outOfAttempts = gameState.attempts >= MAX_ATTEMPTS;

    if (allMatched) {
      setGameState((prev) => ({ ...prev, gameStatus: 'won' }));
    } else if (outOfAttempts) {
      setGameState((prev) => ({ ...prev, gameStatus: 'lost' }));
    }
  }, [gameState.cards, gameState.attempts, gameState.gameStatus]);

  // Check for matches when two cards are selected
  useEffect(() => {
    if (gameState.selectedCards.length === 2) {
      checkForMatch();
    }
  }, [gameState.selectedCards, checkForMatch]);

  const handleCardClick = useCallback(
    (cardId) => {
      if (
        gameState.isChecking ||
        gameState.selectedCards.length >= 2 ||
        gameState.gameStatus !== 'playing'
      )
        return;

      const card = gameState.cards.find((c) => c.id === cardId);
      if (card.isFlipped || card.isMatched) return;

      flipCard(cardId);
    },
    [gameState.isChecking, gameState.selectedCards, gameState.gameStatus, gameState.cards, flipCard]
  );

  const restartGame = useCallback(() => {
    setGameState(initializeGame());
  }, [initializeGame]);

  return {
    cards: gameState.cards,
    attempts: gameState.attempts,
    gameStatus: gameState.gameStatus,
    handleCardClick,
    restartGame,
  };
};

export default useGameLogic;
