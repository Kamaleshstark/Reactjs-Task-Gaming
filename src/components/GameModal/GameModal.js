import React from 'react';
import './GameModal.css';

const GameModal = ({ isVisible, gameStatus, attempts, onRestart }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{gameStatus === 'won' ? 'Congratulations!' : 'Game Over!'}</h2>
        <p>
          {gameStatus === 'won'
            ? `You won in ${attempts} attempts!`
            : `You ran out of attempts. Try again!`}
        </p>
        <button className="restart-button" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameModal;
