import React, { useState } from 'react';
import './Card.css';

const Card = React.memo(({ id, flavour, isFlipped, isMatched, onClick, disabled }) => {
  const [isFlipping, setIsFlipping] = useState(false);

  const handleClick = () => {
    if (isFlipping || disabled || isFlipped || isMatched) return;

    setIsFlipping(true);
    onClick(id);

    setTimeout(() => setIsFlipping(false), 300);
  };

  const cardClasses = `card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`;

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="card-inner">
        <div className="card-front"></div>
        <div className="card-back">
          {isFlipped && flavour}
        </div>
      </div>
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
