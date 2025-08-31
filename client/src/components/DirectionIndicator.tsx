import { GameDirection } from '../../../shared/src/types/game';
import styles from './DirectionIndicator.module.css';

interface DirectionIndicatorProps {
  direction: GameDirection;
  playerCount: number;
  compact?: boolean;
}

export function DirectionIndicator({
  direction,
  playerCount,
  compact = false,
}: DirectionIndicatorProps) {
  const getDirectionDisplay = () => {
    const isClockwise = direction === 1;
    
    return {
      text: isClockwise ? 'Clockwise' : 'Counter-clockwise',
      icon: isClockwise ? '↻' : '↺',
      arrow: isClockwise ? '→' : '←',
      color: '#2196F3',
    };
  };

  const directionInfo = getDirectionDisplay();

  if (compact) {
    return (
      <div className={styles.indicator}>
        <span
          className={styles.directionIcon}
          style={{ color: directionInfo.color }}
          title={`Turn order: ${directionInfo.text}`}
        >
          {directionInfo.icon}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.indicator}>
      <div className={styles.directionRow}>
        <span
          className={styles.directionIcon}
          style={{ color: directionInfo.color }}
        >
          {directionInfo.icon}
        </span>
        <span className={styles.directionText}>{directionInfo.text}</span>
      </div>
      
      {playerCount > 2 && (
        <div className={styles.turnOrder}>
          Turn order: {directionInfo.arrow}
        </div>
      )}
    </div>
  );
}