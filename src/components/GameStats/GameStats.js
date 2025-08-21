import React from 'react';
import './GameStats.css';

const GameStats = ({ attempts, maxAttempts, gameStatus }) => {
  return (
    <div className="game-stats">
      <div className="attempts">
        Attempts: {attempts} / {maxAttempts}
      </div>
      <div className="remaining">
        Remaining: {maxAttempts - attempts}
      </div>
      {gameStatus !== 'playing' && (
        <div className={`game-status ${gameStatus}`}>
          {gameStatus === 'won' ? 'Congratulations! You Won!' : 'Game Over!'}
        </div>
      )}
    </div>
  );
};

export default GameStats;
