import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../stores';
import type { Player } from '../../../../shared/src/types/player';
import styles from './MobileOpponentArea.module.css';

interface ResponsiveOpponentAreaProps {
  opponents?: Player[];
}

export function MobileOpponentArea({
  opponents: propOpponents,
}: ResponsiveOpponentAreaProps) {
  const [currentOpponentIndex, setCurrentOpponentIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const startX = useRef<number>(0);
  const minSwipeDistance = 50;

  const gameState = useGameStore(state => state.gameState);
  const playerId = useGameStore(state => state.playerId);

  // Responsive breakpoint detection
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Get opponents from props or game state
  const opponents =
    propOpponents || gameState?.players.filter(p => p.id !== playerId) || [];

  if (opponents.length === 0) {
    return (
      <div className={styles.opponentContainer}>
        <div className={styles.opponentWrapper}>
          <div className={styles.singleOpponent}>
            <div className={styles.opponentName}>Waiting for opponents...</div>
          </div>
        </div>
      </div>
    );
  }

  if (opponents.length === 1) {
    const opponent = opponents[0];
    return (
      <div className={styles.opponentContainer}>
        <div className={styles.opponentWrapper}>
          <div className={styles.singleOpponent}>
            <div className={styles.opponentName}>{opponent.name}</div>
            <div className={styles.cardCount}>
              ({opponent.hand.length} cards)
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diffX = startX.current - endX;

    if (Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        // Swipe left - next opponent
        setCurrentOpponentIndex(prev =>
          prev < opponents.length - 1 ? prev + 1 : 0,
        );
      } else {
        // Swipe right - previous opponent
        setCurrentOpponentIndex(prev =>
          prev > 0 ? prev - 1 : opponents.length - 1,
        );
      }
    }
  };

  // Desktop: Show all opponents positioned around the board
  // Mobile: Show current opponent with swipe navigation
  if (isDesktop && opponents.length > 1) {
    return (
      <div className={`${styles.opponentContainer} desktop-layout`}>
        {opponents.map((opponent, index) => {
          const position = index === 0 ? 'top' : index === 1 ? 'left' : 'right';
          const isCurrentTurn =
            gameState?.players[gameState.currentPlayerIndex]?.id ===
            opponent.id;

          return (
            <div
              key={opponent.id}
              className={`opponent-area opponent-${position} ${isCurrentTurn ? 'current-turn' : ''}`}
            >
              <div className="opponent-info">
                <h4 className="opponent-name">{opponent.name}</h4>
                <span className="card-count">{opponent.hand.length} cards</span>
              </div>
              <div className={`opponent-hand opponent-hand-${position}`}>
                {Array(opponent.hand.length)
                  .fill(0)
                  .map((_, cardIndex) => (
                    <div
                      key={cardIndex}
                      className={`card-back small ${position}`}
                    >
                      🂠
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Mobile layout or single opponent
  const currentOpponent = opponents[currentOpponentIndex];

  return (
    <div
      className={`${styles.opponentContainer} ${isDesktop ? 'desktop-single' : 'mobile-layout'}`}
      onTouchStart={!isDesktop ? handleTouchStart : undefined}
      onTouchEnd={!isDesktop ? handleTouchEnd : undefined}
    >
      <div className={styles.opponentWrapper}>
        <div className={styles.multipleOpponents}>
          <div className={styles.currentOpponent}>
            <div className={styles.opponentName}>{currentOpponent.name}</div>
            <div className={styles.cardCount}>
              ({currentOpponent.hand.length} cards)
            </div>

            {!isDesktop && opponents.length > 1 && (
              <div className={styles.swipeIndicator}>
                {opponents.map((_, index) => (
                  <div
                    key={index}
                    className={`${styles.swipeDot} ${index === currentOpponentIndex ? styles.active : ''}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
