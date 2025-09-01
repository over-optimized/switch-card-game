import { useGameStore } from '../../stores/gameStore';
import type { GameState } from '../../../../shared/src/types/game';
import { analyzeGameStats, getPlayerSummary } from '../../utils/gameStatsUtils';
import { challengeService } from '../../services/challengeService';
import styles from './MobileWinModal.module.css';

interface MobileWinModalProps {
  gameState: GameState;
  onBackToMenu?: (() => void) | undefined;
}

export function MobileWinModal({
  gameState,
  onBackToMenu,
}: MobileWinModalProps) {
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

  // Check challenge completion
  const todayChallenge = challengeService.getTodayChallenge();
  const streakInfo = challengeService.getStreak();
  const challengeWasJustCompleted =
    isPlayerWin && todayChallenge.baseChallenge.completed;

  // Analyze game statistics for meaningful display
  const gameAnalysis = analyzeGameStats(gameState);
  const playerSummary = getPlayerSummary(gameState, playerId);

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
              : `${winnerName} wins this round!`}
          </p>
        </div>

        {/* Player Performance Summary */}
        <div className={styles.playerSummary}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Your Result:</span>
            <span className={styles.statValue}>{playerSummary.rank}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Achievement:</span>
            <span className={styles.statValue}>{playerSummary.highlight}</span>
          </div>
        </div>

        {/* Daily Challenge Completion */}
        {challengeWasJustCompleted && (
          <div className={styles.challengeCompletion}>
            <div className={styles.challengeHeader}>
              <span className={styles.challengeIcon}>🎯</span>
              <span className={styles.challengeTitle}>
                Daily Challenge Completed!
              </span>
            </div>
            <div className={styles.challengeDetails}>
              <div className={styles.challengeInfo}>
                <span className={styles.challengeLabel}>
                  "{todayChallenge.baseChallenge.title}"
                </span>
                <span className={styles.challengeStatus}>✅ Complete</span>
              </div>
              <div className={styles.streakInfo}>
                <span className={styles.streakLabel}>Streak:</span>
                <span className={styles.streakValue}>
                  {streakInfo.current} day{streakInfo.current !== 1 ? 's' : ''}
                  {streakInfo.current === streakInfo.best &&
                    streakInfo.best > 1 && (
                      <span className={styles.personalBest}>
                        {' '}
                        🏆 Personal Best!
                      </span>
                    )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Game Statistics */}
        <div className={styles.gameStats}>
          {gameAnalysis.topStats.slice(0, 4).map((stat, index) => (
            <div key={index} className={styles.stat}>
              <span className={styles.statLabel}>
                {stat.icon && (
                  <span className={styles.statIcon}>{stat.icon}</span>
                )}
                {stat.label}:
              </span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
          ))}
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
