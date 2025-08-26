import React, { useState, useRef } from 'react';
import type { Player } from '../../../../shared/src/types/player';
import styles from './MobileOpponentArea.module.css';

interface MobileOpponentAreaProps {
  opponents: Player[];
}

export function MobileOpponentArea({ opponents }: MobileOpponentAreaProps) {
  const [currentOpponentIndex, setCurrentOpponentIndex] = useState(0);
  const startX = useRef<number>(0);
  const minSwipeDistance = 50;

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
            <div className={styles.cardCount}>({opponent.hand.length} cards)</div>
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
          prev < opponents.length - 1 ? prev + 1 : 0
        );
      } else {
        // Swipe right - previous opponent
        setCurrentOpponentIndex(prev => 
          prev > 0 ? prev - 1 : opponents.length - 1
        );
      }
    }
  };

  const currentOpponent = opponents[currentOpponentIndex];

  return (
    <div 
      className={styles.opponentContainer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.opponentWrapper}>
        <div className={styles.multipleOpponents}>
          <div className={styles.currentOpponent}>
            <div className={styles.opponentName}>{currentOpponent.name}</div>
            <div className={styles.cardCount}>({currentOpponent.hand.length} cards)</div>
            
            <div className={styles.swipeIndicator}>
              {opponents.map((_, index) => (
                <div
                  key={index}
                  className={`${styles.swipeDot} ${index === currentOpponentIndex ? styles.active : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}