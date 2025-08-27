import { useGameStore } from '../../stores/gameStore';
import type { GameState } from '../../../../shared/src/types/game';
import styles from './MobileWinModal.module.css';

interface MobileWinModalProps {
  gameState: GameState;
  onBackToMenu?: () => void;
}

export function MobileWinModal({ gameState, onBackToMenu }: MobileWinModalProps) {
  const { playerId, restartGame } = useGameStore(state => ({
    playerId: state.playerId,
    restartGame: state.restartGame,
  }));

  // Only show modal when game is finished
  if (gameState.phase !== 'finished' || !gameState.winner) {
    return null;
  }

  const isPlayerWin = gameState.winner.id === playerId;
  const winnerName = gameState.winner.name;

  const handleNewGame = () => {
    console.log('🎮 MOBILE WIN MODAL - Starting new game');
    restartGame();
  };

  const handleBackToMenu = () => {
    console.log('🎮 MOBILE WIN MODAL - Back to menu');
    if (onBackToMenu) {
      onBackToMenu();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Celebration Header */}
        <div className={styles.celebrationHeader}>
          <div className={styles.celebrationEmoji}>
            {isPlayerWin ? '🎉' : '🎯'}
          </div>
          <h1 className={styles.winTitle}>
            {isPlayerWin ? 'You Won!' : 'Game Over'}
          </h1>
          <p className={styles.winSubtitle}>
            {isPlayerWin 
              ? 'Congratulations on your victory!' 
              : `${winnerName} wins this round!`
            }
          </p>
        </div>

        {/* Game Stats */}
        <div className={styles.gameStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Winner:</span>
            <span className={styles.statValue}>
              {isPlayerWin ? 'You' : winnerName}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Final Cards:</span>
            <span className={styles.statValue}>0</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button 
            className={`${styles.actionButton} ${styles.primaryButton}`}
            onClick={handleNewGame}
          >
            🎴 New Game
          </button>
          
          {onBackToMenu && (
            <button 
              className={`${styles.actionButton} ${styles.secondaryButton}`}
              onClick={handleBackToMenu}
            >
              ← Back to Menu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}