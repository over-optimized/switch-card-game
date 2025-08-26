import type { Player } from '../../../../shared/src/types/player';
import { useUIStore } from '../../stores/uiStore';
import { useGameStore } from '../../stores/gameStore';
import { DeckArea } from '../DeckArea';
import { MobileOpponentArea } from './MobileOpponentArea';
import { MobilePlayerSheet } from './MobilePlayerSheet';
import styles from './MobileGameBoard.module.css';

interface MobileGameBoardProps {
  onBackToMenu?: (() => void) | undefined;
}

export function MobileGameBoard({ onBackToMenu }: MobileGameBoardProps) {
  const players = useGameStore(state => state.gameState?.players || []);
  const playerId = useGameStore(state => state.playerId);
  const theme = useUIStore(state => state.theme);

  // Get opponents (all players except current player)
  const opponents = players.filter((player: Player) => player.id !== playerId);

  return (
    <div className={styles.mobileGameBoard} data-theme={theme}>
      {/* Fixed Game Header */}
      <header className={styles.gameHeader}>
        <button 
          className={styles.backButton}
          onClick={onBackToMenu || (() => {})}
          aria-label="Back to menu"
        >
          ←
        </button>
        <div className={styles.headerContent}>
          <h1>Switch</h1>
        </div>
      </header>

      {/* Fixed Opponent Area */}
      <div className={styles.opponentArea}>
        <MobileOpponentArea opponents={opponents} />
      </div>

      {/* Fixed Deck Area */}
      <div className={styles.deckArea}>
        <DeckArea />
      </div>

      {/* Mobile Player Sheet (Bottom Sheet) */}
      <MobilePlayerSheet />
    </div>
  );
}