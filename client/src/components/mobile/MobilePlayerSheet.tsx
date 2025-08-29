import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useUIStore } from '../../stores/uiStore';
import { MobileHandArea } from './MobileHandArea';
import { HandControls } from '../HandControls';
import styles from './MobilePlayerSheet.module.css';
import type { Player } from '../../../../shared/src/types/player';

export function MobilePlayerSheet() {
  const gameState = useGameStore(state => state.gameState);
  const players = useGameStore(state => state.gameState?.players || []);
  const playerId = useGameStore(state => state.playerId);
  const selectedCards = useGameStore(state => state.selectedCards);
  const playSelectedCards = useGameStore(state => state.playSelectedCards);
  const clearSelection = useGameStore(state => state.clearSelection);

  // Use global handShelf state instead of local state
  const {
    handShelf,
    setHandShelfPosition,
    setHandShelfDragging,
    enableHandShelf,
  } = useUIStore(state => ({
    handShelf: state.handShelf,
    setHandShelfPosition: state.setHandShelfPosition,
    setHandShelfDragging: state.setHandShelfDragging,
    enableHandShelf: state.enableHandShelf,
  }));

  // Local drag handling refs (still needed for touch events)
  const startY = useRef<number>(0);
  const startPosition = useRef<number>(0);

  // Sheet constraints
  const MIN_POSITION = 0; // Default position
  const MAX_POSITION = 300; // Maximum pull up (adjust based on content needs)

  // Enable handShelf for mobile on component mount
  useEffect(() => {
    enableHandShelf(true);
  }, [enableHandShelf]);

  const currentPlayer = players.find(
    (player: Player) => player.id === playerId,
  );
  const isPlayerTurn =
    gameState?.currentPlayerIndex !== undefined &&
    gameState.players[gameState.currentPlayerIndex]?.id === playerId;

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    startY.current = touch.clientY;
    startPosition.current = handShelf.position;
    setHandShelfDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!handShelf.isDragging) return;

    e.preventDefault();
    const touch = e.touches[0];
    const deltaY = startY.current - touch.clientY; // Positive = pull up, negative = pull down
    const newPosition = Math.max(0, startPosition.current + deltaY);

    // Constrain to min/max positions
    const constrainedPosition = Math.min(
      Math.max(newPosition, MIN_POSITION),
      MAX_POSITION,
    );

    setHandShelfPosition(constrainedPosition);
  };

  const handleTouchEnd = () => {
    if (!handShelf.isDragging) return;
    setHandShelfDragging(false);

    // Snap to positions
    const snapPoints = [0, 150, 300]; // Default, mid, max
    const closest = snapPoints.reduce((prev, curr) => {
      return Math.abs(curr - handShelf.position) <
        Math.abs(prev - handShelf.position)
        ? curr
        : prev;
    });

    setHandShelfPosition(closest);
  };

  // Handle double tap to toggle between default and mid position
  const handleDoubleTab = () => {
    const targetPosition = handShelf.position > 0 ? 0 : 150;
    setHandShelfPosition(targetPosition);

    // Haptic feedback if available
    if (
      typeof window !== 'undefined' &&
      'navigator' in window &&
      'vibrate' in window.navigator
    ) {
      window.navigator.vibrate(50);
    }
  };

  // Calculate expansion percentage for label
  const expansionPercentage = Math.round(
    (handShelf.position / MAX_POSITION) * 100,
  );

  if (!currentPlayer) return null;

  return (
    <div
      className={`${styles.playerSheet} ${handShelf.isDragging ? styles.dragging : ''}`}
      style={
        {
          '--sheet-expansion': `${handShelf.position}px`,
        } as React.CSSProperties
      }
    >
      {/* Integrated Drag Handle Tab */}
      <div
        className={`${styles.dragHandle} ${handShelf.isDragging ? styles.dragging : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleTab}
      />

      {/* Sheet Content - Floated to Top */}
      <div className={styles.sheetContent}>
        {/* Player Info */}
        <div className={styles.playerInfo}>
          <div className={styles.playerName}>
            {currentPlayer.name} ({currentPlayer.hand.length} cards)
          </div>
          <div className={styles.turnIndicator}>
            {isPlayerTurn ? 'Your Turn' : 'Waiting...'}
          </div>
        </div>

        {/* Hand Controls */}
        <div className={styles.handControls}>
          <button
            className={`${styles.controlButton} ${styles.playButton}`}
            disabled={!isPlayerTurn || selectedCards.length === 0}
            onClick={() => {
              console.log(
                '🎮 MOBILE PLAY BUTTON CLICKED:',
                selectedCards.length,
              );
              playSelectedCards();
            }}
          >
            🎴 Play ({selectedCards.length})
          </button>
          <button
            className={`${styles.controlButton} ${styles.clearButton}`}
            disabled={selectedCards.length === 0}
            onClick={() => {
              console.log('🧹 MOBILE CLEAR BUTTON CLICKED');
              clearSelection();
            }}
          >
            Clear
          </button>
        </div>

        {/* Player Hand */}
        <div className={styles.handCards}>
          <MobileHandArea />
        </div>

        {/* Sort and Hint Controls - positioned below cards but outside scroll area */}
        <div className={styles.secondaryControls}>
          <HandControls
            selectedCount={selectedCards.length}
            onPlaySelected={playSelectedCards}
            onClearSelection={clearSelection}
            showPlayControls={false}
          />
        </div>
      </div>
    </div>
  );
}
