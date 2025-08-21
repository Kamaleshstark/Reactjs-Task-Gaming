import React from 'react';
import GameBoard from './components/GameBoard/GameBoard';
import GameStats from './components/GameStats/GameStats';
import GameModal from './components/GameModal/GameModal';
import useGameLogic from './hooks/useGameLogic';
import { MAX_ATTEMPTS } from './utils/constants';
import './styles/variables.css';
import './App.css';

function App() {
  const { cards, attempts, gameStatus, handleCardClick, restartGame } = useGameLogic();

  return (
    <div className="App">
      <h1>Memory Match Game</h1>
      <GameStats
        attempts={attempts}
        maxAttempts={MAX_ATTEMPTS}
        gameStatus={gameStatus}
      />
      <GameBoard
        cards={cards}
        onCardClick={handleCardClick}
        gameStatus={gameStatus}
      />
      <GameModal
        isVisible={gameStatus !== 'playing'}
        gameStatus={gameStatus}
        attempts={attempts}
        onRestart={restartGame}
      />
    </div>
  );
}

export default App;