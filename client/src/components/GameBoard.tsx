import React, { useState, useEffect } from 'react';
import { DeckArea } from './DeckArea';
import { MobileOpponentArea } from './MobileOpponentArea';
import { MobileHandArea } from './mobile/MobileHandArea';
import { PenaltyIndicator } from './PenaltyIndicator';
import { SkipIndicator } from './SkipIndicator';
import { SuitSelector } from './SuitSelector';
import { MobileGameBoard } from './mobile/MobileGameBoard';
import { useGameStore, useUIStore } from '../stores';

interface GameBoardProps {
  onBackToMenu?: (() => void) | undefined;
}

export function GameBoard({ onBackToMenu }: GameBoardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const gameState = useGameStore(state => state.gameState);
  const playerId = useGameStore(state => state.playerId);
  const penaltyState = useGameStore(state => state.penaltyState);
  const suitSelectionOpen = useGameStore(state => state.suitSelectionOpen);
  const handShelf = useUIStore(state => state.handShelf);
  const { closeSuitSelection, selectSuit } = useGameStore(state => ({
    closeSuitSelection: state.closeSuitSelection,
    selectSuit: state.selectSuit,
  }));

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate comprehensive layout dimensions for dynamic styling
  const gameBoardStyles = React.useMemo(() => {
    if (!isMobile || !handShelf.isEnabled) return {};

    const LAYOUT_CONSTANTS = {
      OPPONENT_AREA_HEIGHT: 120, // Mobile opponent container (fixed height)
      DECK_AREA_HEIGHT: 179, // Deck area container (fixed height)
      SHELF_CONTROL_HEIGHT: 40, // Drag handle height (fixed)
      ELEMENT_GAP: 20, // Gap between all elements
      MIN_HAND_HEIGHT: 200, // Minimum functional hand area height
      MAX_HAND_HEIGHT: 400, // Maximum comfortable hand area height
    };

    const calculateLayout = (shelfPosition: number) => {
      const viewportHeight = window.innerHeight;
      const {
        OPPONENT_AREA_HEIGHT,
        DECK_AREA_HEIGHT,
        SHELF_CONTROL_HEIGHT,
        ELEMENT_GAP,
        MIN_HAND_HEIGHT,
        MAX_HAND_HEIGHT,
      } = LAYOUT_CONSTANTS;

      // Calculate total space needed for fixed elements and gaps
      const fixedElementsHeight =
        OPPONENT_AREA_HEIGHT + DECK_AREA_HEIGHT + SHELF_CONTROL_HEIGHT;
      const totalGapsHeight = ELEMENT_GAP * 3; // opponent→deck, deck→shelf, shelf→hand
      const availableForHand =
        viewportHeight - fixedElementsHeight - totalGapsHeight;

      // Calculate maximum possible shelf position
      const maxHandExpansion = Math.min(
        availableForHand - MIN_HAND_HEIGHT,
        MAX_HAND_HEIGHT - MIN_HAND_HEIGHT,
      );
      const maxShelfPosition = Math.max(0, maxHandExpansion);

      // Calculate current hand height based on shelf position
      const expansionFactor =
        Math.min(shelfPosition / maxShelfPosition, 1) || 0;
      const handAreaHeight =
        MIN_HAND_HEIGHT + maxHandExpansion * expansionFactor;

      // Dynamic positioning based on shelf expansion

      // Calculate shelf control position from bottom
      const shelfControlBottom = handAreaHeight + ELEMENT_GAP;

      // Calculate deck position: Should be above shelf control with proper gap
      const shelfControlTop =
        viewportHeight - shelfControlBottom - SHELF_CONTROL_HEIGHT;
      const deckAreaTop = Math.max(
        OPPONENT_AREA_HEIGHT + ELEMENT_GAP, // Never closer than 140px from top
        shelfControlTop - DECK_AREA_HEIGHT - ELEMENT_GAP, // Or 20px above shelf control
      );

      return {
        handAreaHeight,
        deckAreaTop,
        opponentAreaHeight: OPPONENT_AREA_HEIGHT, // Always fixed height
        shelfControlBottom,
      };
    };

    const layout = calculateLayout(handShelf.position);

    return {
      '--shelf-offset': `${handShelf.position}px`,
      '--hand-height': `${layout.handAreaHeight}px`,
      '--deck-top': `${layout.deckAreaTop}px`,
      '--opponent-height': `${layout.opponentAreaHeight}px`,
      '--shelf-control-bottom': `${layout.shelfControlBottom}px`,
    } as React.CSSProperties;
  }, [isMobile, handShelf.isEnabled, handShelf.position]);

  if (!gameState) return null;

  // Use mobile layout for mobile devices
  if (isMobile) {
    return <MobileGameBoard onBackToMenu={onBackToMenu} />;
  }

  const playerCount = gameState.players.length;

  // Prepare opponents data for mobile
  const getOpponents = () => {
    if (!gameState || !playerId) return [];

    const humanPlayerIndex = gameState.players.findIndex(
      p => p.id === playerId,
    );
    if (humanPlayerIndex === -1) return [];

    const opponents = [];
    for (let i = 1; i < playerCount; i++) {
      const opponentIndex = (humanPlayerIndex + i) % playerCount;
      const opponent = gameState.players[opponentIndex];
      const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];

      opponents.push({
        id: opponent.id,
        name: opponent.name,
        hand: opponent.hand,
        isCurrentTurn: currentTurnPlayer.id === opponent.id,
      });
    }

    return opponents;
  };

  const opponents = getOpponents();

  // Create dynamic game board classes and styles
  const gameBoardClasses = [
    'game-board',
    `game-board-${playerCount}p`,
    isMobile ? 'mobile' : '',
    isMobile && handShelf.isEnabled ? 'with-shelf' : '',
    isMobile && handShelf.isDragging ? 'dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={gameBoardClasses} style={gameBoardStyles}>
      <MobileOpponentArea opponents={opponents} />
      <div className="center-area">
        <DeckArea />
      </div>
      {!isMobile && (
        <div className="player-area">
          <MobileHandArea />
        </div>
      )}
      <PenaltyIndicator penaltyState={penaltyState} />
      <SkipIndicator gameState={gameState} />
      <SuitSelector
        isOpen={suitSelectionOpen}
        onSuitSelect={selectSuit}
        onClose={closeSuitSelection}
      />
    </div>
  );
}
