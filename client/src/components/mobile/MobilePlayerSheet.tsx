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

  // Card container ref (keeping for potential future use)
  const handCardsRef = useRef<HTMLDivElement>(null);

  // 3-Mode Snap System - Optimized positioning
  const SNAP_POSITIONS = {
    CLOSED: 0, // Minimal - just handle visible
    CARDS: 170, // Cards fully visible with minimal padding (130px cards + 40px padding/controls)
    EXPANDED: 240, // Cards + secondary controls with minimal gap (170 + 70px for controls area)
  } as const;

  const MIN_POSITION = SNAP_POSITIONS.CLOSED;
  const MAX_POSITION = SNAP_POSITIONS.EXPANDED;

  // Enable handShelf for mobile on component mount and set to CARDS mode
  useEffect(() => {
    enableHandShelf(true);
    // Always set to CARDS mode as default for optimal gameplay
    // Use setTimeout to ensure state is ready
    const timer = setTimeout(() => {
      setHandShelfPosition(SNAP_POSITIONS.CARDS);
    }, 100);

    return () => clearTimeout(timer);
  }, [enableHandShelf, setHandShelfPosition, SNAP_POSITIONS.CARDS]);

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

    // Snap to closest of 3 defined positions
    const snapPoints = [
      SNAP_POSITIONS.CLOSED,
      SNAP_POSITIONS.CARDS,
      SNAP_POSITIONS.EXPANDED,
    ];
    const closest = snapPoints.reduce((prev, curr) => {
      return Math.abs(curr - handShelf.position) <
        Math.abs(prev - handShelf.position)
        ? curr
        : prev;
    });

    setHandShelfPosition(closest);
  };

  // Handle double tap to toggle between CARDS and EXPANDED modes
  const handleDoubleTab = () => {
    const currentPosition = handShelf.position;
    let targetPosition: number;

    if (currentPosition === SNAP_POSITIONS.CARDS) {
      targetPosition = SNAP_POSITIONS.EXPANDED;
    } else {
      targetPosition = SNAP_POSITIONS.CARDS; // Always return to CARDS as primary mode
    }

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

  // Remove unused expansion percentage calculation since we simplified the drag handle

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

        {/* Hand Controls - Smooth visibility transitions */}
        <div
          className={`${styles.handControls} ${
            handShelf.position > SNAP_POSITIONS.CLOSED
              ? styles['handControls--visible']
              : styles['handControls--hidden']
          }`}
        >
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

        {/* Player Hand with Fixed Shadows */}
        <div className={styles.handContainer}>
          <div ref={handCardsRef} className={styles.handCards}>
            <MobileHandArea />
          </div>
          {/* Fixed shadow elements */}
          <div className={styles.leftShadow}></div>
          <div className={styles.rightShadow}></div>
        </div>
      </div>

      {/* Secondary Controls - Fixed at bottom of screen when expanded */}
      {handShelf.position >= SNAP_POSITIONS.EXPANDED && (
        <div className={styles.secondaryControls}>
          <HandControls
            selectedCount={selectedCards.length}
            onPlaySelected={playSelectedCards}
            onClearSelection={clearSelection}
            showPlayControls={false}
          />
        </div>
      )}
    </div>
  );
}
