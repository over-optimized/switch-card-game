import { useState, useEffect } from 'react';
import { useGameStore, useUIStore } from '../stores';

interface HandControlsProps {
  selectedCount: number;
  onPlaySelected: () => void;
  onClearSelection: () => void;
}

export function HandControls({
  selectedCount,
  onPlaySelected,
  onClearSelection,
}: HandControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
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

  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions);
  };

  // Check if current player can serve penalty
  const canServePenalty =
    gameState &&
    penaltyState.active &&
    penaltyState.type === '2s' &&
    gameState.players[gameState.currentPlayerIndex]?.id === playerId;

  return (
    <div className="hand-controls">
      {isMobile ? (
        // Mobile Layout
        <>
          <div className="mobile-top-controls">
            <div className="sort-controls">
              <button
                className={`sort-btn ${showSortOptions ? 'active' : ''}`}
                onClick={toggleSortOptions}
              >
                📊{' '}
                {settings.handSortOrder === 'rank'
                  ? 'Rank'
                  : settings.handSortOrder === 'suit'
                    ? 'Suit'
                    : 'Dealt'}{' '}
                {showSortOptions ? '▲' : '▼'}
              </button>
              {showSortOptions && (
                <div className="sort-dropdown">
                  <button
                    className={`sort-option ${settings.handSortOrder === 'rank' ? 'active' : ''}`}
                    onClick={() => {
                      handleSortChange('rank');
                      setShowSortOptions(false);
                    }}
                  >
                    🔢 By Rank
                  </button>
                  <button
                    className={`sort-option ${settings.handSortOrder === 'suit' ? 'active' : ''}`}
                    onClick={() => {
                      handleSortChange('suit');
                      setShowSortOptions(false);
                    }}
                  >
                    ♠️ By Suit
                  </button>
                  <button
                    className={`sort-option ${settings.handSortOrder === 'dealt' ? 'active' : ''}`}
                    onClick={() => {
                      handleSortChange('dealt');
                      setShowSortOptions(false);
                    }}
                  >
                    🃏 As Dealt
                  </button>
                </div>
              )}
            </div>

            <div className="hint-controls">
              <button
                className={`hint-btn ${settings.showCardHints ? 'active' : ''}`}
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

          <div className="action-controls">
            <button
              className={`play-btn ${selectedCount === 0 ? 'disabled' : ''}`}
              disabled={selectedCount === 0}
              onClick={onPlaySelected}
              title={
                selectedCount > 1 ? 'Last selected card will be on top' : ''
              }
            >
              🎯 Play ({selectedCount})
            </button>
            {selectedCount > 0 && (
              <button className="clear-btn" onClick={onClearSelection}>
                ✖️ Clear
              </button>
            )}
            {canServePenalty && (
              <button
                className="penalty-btn"
                onClick={handleServePenalty}
                title={`Draw ${penaltyState.cards} cards and end turn`}
              >
                ⚠️ Penalty ({penaltyState.cards})
              </button>
            )}
          </div>
        </>
      ) : (
        // Desktop Layout
        <>
          <div className="sort-controls">
            <button
              className={`sort-btn ${settings.handSortOrder === 'rank' ? 'active' : ''}`}
              onClick={() => handleSortChange('rank')}
            >
              By Rank
            </button>
            <button
              className={`sort-btn ${settings.handSortOrder === 'suit' ? 'active' : ''}`}
              onClick={() => handleSortChange('suit')}
            >
              By Suit
            </button>
            <button
              className={`sort-btn ${settings.handSortOrder === 'dealt' ? 'active' : ''}`}
              onClick={() => handleSortChange('dealt')}
            >
              As Dealt
            </button>
          </div>

          <div className="hint-controls">
            <button
              className={`hint-btn ${settings.showCardHints ? 'active' : ''}`}
              onClick={handleHintsToggle}
              title={
                settings.showCardHints
                  ? 'Hide card hints'
                  : 'Show valid cards with green border'
              }
            >
              💡 Hints {settings.showCardHints ? 'On' : 'Off'}
            </button>
          </div>

          <div className="action-controls">
            <button
              className={`play-btn ${selectedCount === 0 ? 'disabled' : ''}`}
              disabled={selectedCount === 0}
              onClick={onPlaySelected}
              title={
                selectedCount > 1 ? 'Last selected card will be on top' : ''
              }
            >
              Play Selected ({selectedCount})
            </button>
            <button
              className={`clear-btn ${selectedCount === 0 ? 'hidden' : ''}`}
              onClick={onClearSelection}
            >
              Clear Selection
            </button>
            {canServePenalty && (
              <button
                className="penalty-btn"
                onClick={handleServePenalty}
                title={`Draw ${penaltyState.cards} cards and end turn`}
              >
                Serve Penalty ({penaltyState.cards} cards)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
