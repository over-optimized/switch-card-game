import React, { useRef, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { MobileHandArea } from './MobileHandArea';
import styles from './MobilePlayerSheet.module.css';
import type { Player } from '../../../../shared/src/types/player';

export function MobilePlayerSheet() {
  const gameState = useGameStore(state => state.gameState);
  const players = useGameStore(state => state.gameState?.players || []);
  const playerId = useGameStore(state => state.playerId);

  // Bottom sheet positioning state
  const [sheetPosition, setSheetPosition] = useState(0); // 0 = default, positive = pulled up
  const [isDragging, setIsDragging] = useState(false);

  // Drag handling refs
  const startY = useRef<number>(0);
  const startPosition = useRef<number>(0);

  // Sheet constraints
  const MIN_POSITION = 0; // Default position
  const MAX_POSITION = 300; // Maximum pull up (adjust based on content needs)

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
    startPosition.current = sheetPosition;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    e.preventDefault();
    const touch = e.touches[0];
    const deltaY = startY.current - touch.clientY; // Positive = pull up, negative = pull down
    const newPosition = Math.max(0, startPosition.current + deltaY);

    // Constrain to min/max positions
    const constrainedPosition = Math.min(
      Math.max(newPosition, MIN_POSITION),
      MAX_POSITION,
    );

    setSheetPosition(constrainedPosition);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Snap to positions
    const snapPoints = [0, 150, 300]; // Default, mid, max
    const closest = snapPoints.reduce((prev, curr) => {
      return Math.abs(curr - sheetPosition) < Math.abs(prev - sheetPosition)
        ? curr
        : prev;
    });

    setSheetPosition(closest);
  };

  // Handle double tap to toggle between default and mid position
  const handleDoubleTab = () => {
    const targetPosition = sheetPosition > 0 ? 0 : 150;
    setSheetPosition(targetPosition);

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
  const expansionPercentage = Math.round((sheetPosition / MAX_POSITION) * 100);

  if (!currentPlayer) return null;

  return (
    <div
      className={`${styles.playerSheet} ${isDragging ? styles.dragging : ''}`}
      style={{ 
        '--sheet-expansion': `${sheetPosition}px`
      } as React.CSSProperties}
    >
      {/* Drag Handle */}
      <div
        className={`${styles.dragHandle} ${isDragging ? styles.dragging : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleTab}
      >
        <div className={styles.dragHandleIcon}>
          <div className={styles.gripLine} />
          <div className={styles.gripLine} />
          <div className={styles.gripLine} />
        </div>
        <div className={styles.dragHandleLabel}>
          {sheetPosition > 0 ? `Expanded ${expansionPercentage}%` : 'Default'}
        </div>
      </div>

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
            disabled={!isPlayerTurn}
          >
            🎯 Play (0)
          </button>
          <button className={`${styles.controlButton} ${styles.clearButton}`}>
            Clear
          </button>
        </div>

        {/* Player Hand */}
        <div className={styles.handCards}>
          <MobileHandArea />
        </div>
      </div>
    </div>
  );
}