import { useState, useEffect } from 'react';
import { useGameStore, useUIStore } from '../stores';
import styles from './HandControls.module.css';

interface HandControlsProps {
  selectedCount: number;
  onPlaySelected: () => void;
  onClearSelection: () => void;
  showPlayControls?: boolean; // Optional prop to control Play/Clear button visibility
}

export function HandControls({
  selectedCount,
  onPlaySelected,
  onClearSelection,
  showPlayControls = true, // Default to true for backward compatibility
}: HandControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { settings, updateSettings } = useUIStore(state => ({
    settings: state.settings,
    updateSettings: state.updateSettings,
  }));

  const { gameState, penaltyState, playerId, servePenalty } = useGameStore(
    state => ({
      gameState: state.gameState,
      penaltyState: state.penaltyState,
      playerId: state.playerId,
      servePenalty: state.servePenalty,
    }),
  );

  const handleSortChange = (sortOrder: 'dealt' | 'rank' | 'suit') => {
    updateSettings({ handSortOrder: sortOrder });
  };

  const handleHintsToggle = () => {
    updateSettings({ showCardHints: !settings.showCardHints });
  };

  const handleServePenalty = async () => {
    await servePenalty(playerId);
  };

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if current player can serve penalty
  const canServePenalty =
    gameState &&
    penaltyState.active &&
    penaltyState.type === '2s' &&
    gameState.players[gameState.currentPlayerIndex]?.id === playerId;

  return (
    <div className={styles.handControls}>
      {isMobile ? (
        // Mobile Layout - direct buttons without wrapper divs
        <>
          <button
            className={`${styles.sortBtn} ${settings.handSortOrder === 'rank' ? styles.active : ''}`}
            onClick={() =>
              handleSortChange(
                settings.handSortOrder === 'rank' ? 'suit' : 'rank',
              )
            }
          >
            {settings.handSortOrder === 'rank' ? '🔢 By Rank' : '♠️ By Suit'}
          </button>

          <button
            className={`${styles.hintBtn} ${settings.showCardHints ? styles.active : ''}`}
            onClick={handleHintsToggle}
            title={
              settings.showCardHints
                ? 'Hide card hints'
                : 'Show valid cards with green border'
            }
          >
            💡 {settings.showCardHints ? 'On' : 'Off'}
          </button>

          {showPlayControls && (
            <div className={styles.actionControls}>
              <button
                className={`${styles.playBtn} ${selectedCount === 0 ? styles.disabled : ''}`}
                disabled={selectedCount === 0}
                onClick={onPlaySelected}
                title={
                  selectedCount > 1 ? 'Last selected card will be on top' : ''
                }
              >
                🎯 Play ({selectedCount})
              </button>
              {selectedCount > 0 && (
                <button className={styles.clearBtn} onClick={onClearSelection}>
                  ✖️ Clear
                </button>
              )}
              {canServePenalty && (
                <button
                  className={styles.penaltyBtn}
                  onClick={handleServePenalty}
                  title={`Draw ${penaltyState.cards} cards and end turn`}
                >
                  ⚠️ Penalty ({penaltyState.cards})
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        // Desktop Layout
        <div className={styles.desktopLayout}>
          <div className={styles.desktopSortControls}>
            <button
              className={`${styles.desktopSortBtn} ${settings.handSortOrder === 'rank' ? styles.active : ''}`}
              onClick={() => handleSortChange('rank')}
            >
              🔢 By Rank
            </button>
            <button
              className={`${styles.desktopSortBtn} ${settings.handSortOrder === 'suit' ? styles.active : ''}`}
              onClick={() => handleSortChange('suit')}
            >
              ♠️ By Suit
            </button>
            <button
              className={`${styles.desktopSortBtn} ${settings.handSortOrder === 'dealt' ? styles.active : ''}`}
              onClick={() => handleSortChange('dealt')}
            >
              🃏 As Dealt
            </button>
          </div>

          <div className={styles.desktopHintControls}>
            <button
              className={`${styles.desktopHintBtn} ${settings.showCardHints ? styles.active : ''}`}
              onClick={handleHintsToggle}
              title={
                settings.showCardHints
                  ? 'Hide card hints'
                  : 'Show valid cards with green border'
              }
            >
              💡 {settings.showCardHints ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
