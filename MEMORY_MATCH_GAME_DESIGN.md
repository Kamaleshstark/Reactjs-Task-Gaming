# Memory Match Game - Technical Design Document

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Setup](#project-setup)
3. [Architecture & Component Breakdown](#architecture--component-breakdown)
4. [State Management Strategy](#state-management-strategy)
5. [Game Logic Flow](#game-logic-flow)
6. [Edge Cases & Considerations](#edge-cases--considerations)
7. [UI/UX Implementation](#uiux-implementation)
8. [Performance Optimizations](#performance-optimizations)
9. [Implementation Checklist](#implementation-checklist)

## Project Overview

### Requirements Summary

- **Grid**: 12 cards (6 unique flavours, 2 of each)
- **Gameplay**: Click to flip cards, match pairs
- **Attempts**: Maximum 15 attempts allowed
- **Win Condition**: Match all pairs within 15 attempts
- **Lose Condition**: Reach 15 attempts without completing
- **Shuffle**: Cards randomized at game start

### Core Features

- Card flipping animation
- Match detection logic
- Attempt counter
- Win/lose states
- Game restart functionality
- Responsive design

## Project Setup

### 1. Initialize React Application

```bash
npx create-react-app memory-match-game
cd memory-match-game
npm install
```

### 2. Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  }
}
```

### 3. Folder Structure

```
src/
├── components/
│   ├── Card/
│   │   ├── Card.js
│   │   └── Card.css
│   ├── GameBoard/
│   │   ├── GameBoard.js
│   │   └── GameBoard.css
│   ├── GameStats/
│   │   ├── GameStats.js
│   │   └── GameStats.css
│   └── GameModal/
│       ├── GameModal.js
│       └── GameModal.css
├── hooks/
│   └── useGameLogic.js
├── utils/
│   ├── gameHelpers.js
│   └── constants.js
├── styles/
│   ├── global.css
│   └── variables.css
├── App.js
├── App.css
└── index.js
```

### 4. Development Tools Setup

```bash
# Optional: ESLint and Prettier for code quality
npm install --save-dev eslint prettier eslint-config-prettier
```

## Architecture & Component Breakdown

### Component Hierarchy

```
App
├── GameStats
├── GameBoard
│   └── Card (×12)
└── GameModal
```

### 1. App Component (Root)

**Responsibilities:**

- Main game state management
- Orchestrates child components
- Handles game initialization and restart

**Props:** None (root component)

**State:**

- All game state via custom hook

### 2. GameStats Component

**Responsibilities:**

- Display current attempt count
- Show attempts remaining
- Display game status

**Props:**

```javascript
{
  attempts: number,
  maxAttempts: number,
  gameStatus: 'playing' | 'won' | 'lost'
}
```

### 3. GameBoard Component

**Responsibilities:**

- Render 12 cards in grid layout
- Pass click handlers to cards
- Manage board layout responsiveness

**Props:**

```javascript
{
  cards: Array<CardObject>,
  onCardClick: (cardId: string) => void,
  gameStatus: 'playing' | 'won' | 'lost'
}
```

### 4. Card Component

**Responsibilities:**

- Display card face/back
- Handle flip animation
- Manage card visual states

**Props:**

```javascript
{
  id: string,
  flavour: string,
  isFlipped: boolean,
  isMatched: boolean,
  onClick: (cardId: string) => void,
  disabled: boolean
}
```

**States:**

- `isFlipping`: For animation control

### 5. GameModal Component

**Responsibilities:**

- Show win/lose messages
- Provide restart functionality
- Display final statistics

**Props:**

```javascript
{
  isVisible: boolean,
  gameStatus: 'won' | 'lost',
  attempts: number,
  onRestart: () => void
}
```

## State Management Strategy

### Main Game State (useGameLogic Hook)

```javascript
{
  // Card Management
  cards: [
    {
      id: 'unique-id',
      flavour: 'chocolate',
      isFlipped: false,
      isMatched: false
    }
    // ... 11 more cards
  ],

  // Game Flow
  selectedCards: [], // 0, 1, or 2 cards max
  attempts: 0,
  gameStatus: 'playing', // 'playing' | 'won' | 'lost'

  // Temporary States
  isChecking: false, // Prevents clicks during match check
  flipBackTimer: null // Timer for flipping unmatched cards
}
```

### State Location Strategy

- **App Level**: All game logic state via `useGameLogic` hook
- **Card Level**: Only animation state (`isFlipping`)
- **No Redux**: React state is sufficient for this scope

### State Update Patterns

```javascript
// Card Selection
const handleCardClick = (cardId) => {
  if (gameState.isChecking || gameState.selectedCards.length >= 2) return;

  setGameState((prev) => ({
    ...prev,
    cards: prev.cards.map((card) =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    ),
    selectedCards: [...prev.selectedCards, cardId],
  }));
};

// Match Check (useEffect trigger)
useEffect(() => {
  if (selectedCards.length === 2) {
    checkForMatch();
  }
}, [selectedCards]);
```

## Game Logic Flow

### 1. Game Initialization

```javascript
const initializeGame = () => {
  const flavours = [
    "chocolate",
    "vanilla",
    "strawberry",
    "mint",
    "coffee",
    "lemon",
  ];
  const cardPairs = flavours.flatMap((flavour) => [
    { id: generateId(), flavour, isFlipped: false, isMatched: false },
    { id: generateId(), flavour, isFlipped: false, isMatched: false },
  ]);

  return {
    cards: shuffleArray(cardPairs),
    selectedCards: [],
    attempts: 0,
    gameStatus: "playing",
    isChecking: false,
    flipBackTimer: null,
  };
};
```

### 2. Card Click Handler

```javascript
const handleCardClick = (cardId) => {
  // Guard conditions
  if (
    gameState.isChecking ||
    gameState.selectedCards.length >= 2 ||
    gameState.gameStatus !== "playing"
  )
    return;

  const card = gameState.cards.find((c) => c.id === cardId);
  if (card.isFlipped || card.isMatched) return;

  // Update state
  flipCard(cardId);
  addToSelectedCards(cardId);
};
```

### 3. Match Check Logic

```javascript
const checkForMatch = async () => {
  const [firstCardId, secondCardId] = gameState.selectedCards;
  const firstCard = findCard(firstCardId);
  const secondCard = findCard(secondCardId);

  setIsChecking(true);
  incrementAttempts();

  if (firstCard.flavour === secondCard.flavour) {
    // Match found
    markCardsAsMatched([firstCardId, secondCardId]);
    clearSelectedCards();
    setIsChecking(false);

    // Check win condition
    if (allCardsMatched()) {
      setGameStatus("won");
    }
  } else {
    // No match - flip back after delay
    setTimeout(() => {
      flipCardsBack([firstCardId, secondCardId]);
      clearSelectedCards();
      setIsChecking(false);

      // Check lose condition
      if (gameState.attempts >= 15) {
        setGameStatus("lost");
      }
    }, 1000);
  }
};
```

### 4. Win/Lose Detection

```javascript
const checkGameEnd = () => {
  const matchedCards = gameState.cards.filter((card) => card.isMatched);

  if (matchedCards.length === 12) {
    setGameStatus("won");
  } else if (gameState.attempts >= 15) {
    setGameStatus("lost");
  }
};
```

### 5. Game Restart

```javascript
const restartGame = () => {
  clearTimeout(gameState.flipBackTimer);
  setGameState(initializeGame());
};
```

## Edge Cases & Considerations

### 1. Rapid Clicking Prevention

```javascript
// In Card component
const [isFlipping, setIsFlipping] = useState(false);

const handleClick = () => {
  if (isFlipping || disabled) return;

  setIsFlipping(true);
  onClick(id);

  setTimeout(() => setIsFlipping(false), 300);
};
```

### 2. Double Selection Prevention

- Check if card is already in `selectedCards` array
- Disable all cards when `isChecking: true`
- Check if card is already matched

### 3. Memory Leaks Prevention

```javascript
useEffect(() => {
  return () => {
    if (gameState.flipBackTimer) {
      clearTimeout(gameState.flipBackTimer);
    }
  };
}, []);
```

### 4. Race Condition Handling

- Use `isChecking` flag to prevent state conflicts
- Queue card clicks instead of ignoring them (optional enhancement)

### 5. Browser Refresh Handling

```javascript
// Optional: Save game state to localStorage
useEffect(() => {
  const savedGame = localStorage.getItem("memoryGameState");
  if (savedGame) {
    setGameState(JSON.parse(savedGame));
  }
}, []);

useEffect(() => {
  localStorage.setItem("memoryGameState", JSON.stringify(gameState));
}, [gameState]);
```

### 6. Accessibility Considerations

- Keyboard navigation support
- Screen reader announcements
- High contrast mode support
- Focus management

## UI/UX Implementation

### 1. Card Flip Animation

```css
.card {
  perspective: 1000px;
  width: 100px;
  height: 100px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.3s;
  transform-style: preserve-3d;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}
```

### 2. Responsive Grid Layout

```css
.game-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .game-board {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}
```

### 3. Visual Feedback

- **Hover effects**: Card lift and shadow
- **Click feedback**: Slight scale animation
- **Match success**: Green glow effect
- **Match failure**: Red shake animation
- **Disabled state**: Reduced opacity

### 4. Color Scheme & Theming

```css
:root {
  --primary-color: #4f46e5;
  --success-color: #10b981;
  --error-color: #ef4444;
  --background-color: #f8fafc;
  --card-background: #ffffff;
  --text-color: #1f2937;
  --border-radius: 8px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### 5. Flavour Icons/Emojis

```javascript
const FLAVOUR_ICONS = {
  chocolate: "🍫",
  vanilla: "🍦",
  strawberry: "🍓",
  mint: "🌿",
  coffee: "☕",
  lemon: "🍋",
};
```

## Performance Optimizations

### 1. React Optimization

```javascript
// Memoize Card component
const Card = React.memo(
  ({ id, flavour, isFlipped, isMatched, onClick, disabled }) => {
    // Component implementation
  }
);

// Optimize callback functions
const handleCardClick = useCallback(
  (cardId) => {
    // Implementation
  },
  [gameState.isChecking, gameState.selectedCards]
);
```

### 2. Animation Performance

- Use `transform` instead of changing layout properties
- Use `will-change` CSS property for animation elements
- Debounce rapid state updates

### 3. Memory Management

- Clean up timers in useEffect cleanup
- Avoid storing large objects in state unnecessarily

## Implementation Checklist

### Phase 1: Core Setup

- [ ] Initialize React application
- [ ] Set up folder structure
- [ ] Create basic component files
- [ ] Install necessary dependencies

### Phase 2: Basic Components

- [ ] Create Card component with props interface
- [ ] Create GameBoard component with grid layout
- [ ] Create GameStats component
- [ ] Create App component structure

### Phase 3: Game Logic

- [ ] Implement useGameLogic custom hook
- [ ] Add card shuffling functionality
- [ ] Implement card click handling
- [ ] Add match detection logic
- [ ] Implement attempt counter
- [ ] Add win/lose conditions

### Phase 4: UI/UX

- [ ] Add card flip animations
- [ ] Implement responsive design
- [ ] Add visual feedback for matches/mismatches
- [ ] Create game modal for end states
- [ ] Add restart functionality

### Phase 5: Edge Cases

- [ ] Prevent rapid clicking issues
- [ ] Handle double selection prevention
- [ ] Add proper cleanup for timers
- [ ] Implement accessibility features

### Phase 6: Polish & Optimization

- [ ] Test on multiple devices/browsers
- [ ] Optimize performance
- [ ] Add final UI polish

### Phase 7: Optional Enhancements

- [ ] Add sound effects
- [ ] Implement difficulty levels
- [ ] Add score/time tracking
- [ ] Create leaderboard functionality
- [ ] Add different theme options

## Model Recommendation

### Claude-Sonnet (Recommended) ✅

**Strengths for this project:**

- Excellent at following detailed specifications
- Strong React/JavaScript expertise
- Good at implementing complex state management
- Better at handling edge cases systematically

**Best for:**

- Game logic implementation
- State management complexity
- Edge case handling

### GPT-4 (Alternative)

**Strengths:**

- Great at UI/UX implementation
- Strong CSS/animation skills
- Good at creative problem solving

