import React from 'react';
import Card from '../Card/Card';
import './GameBoard.css';

const GameBoard = ({ cards, onCardClick, gameStatus }) => {
  return (
    <div className="game-board">
      {cards.map((card) => (
        <Card
          key={card.id}
          id={card.id}
          flavour={card.flavour}
          isFlipped={card.isFlipped}
          isMatched={card.isMatched}
          onClick={onCardClick}
          disabled={gameStatus !== 'playing'}
        />
      ))}
    </div>
  );
};

export default GameBoard;
