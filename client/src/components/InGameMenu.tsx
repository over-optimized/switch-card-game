import { useUIStore, useGameStore } from '../stores';

interface InGameMenuProps {
  onBackToMenu?: (() => void) | undefined;
}

export function InGameMenu({ onBackToMenu }: InGameMenuProps) {
  const { inGameMenuOpen, setInGameMenuOpen, settings, updateSettings } =
    useUIStore(state => ({
      inGameMenuOpen: state.inGameMenuOpen,
      setInGameMenuOpen: state.setInGameMenuOpen,
      settings: state.settings,
      updateSettings: state.updateSettings,
    }));

  const { leaveRoom } = useGameStore(state => ({
    leaveRoom: state.leaveRoom,
  }));

  const handleClose = () => {
    setInGameMenuOpen(false);
  };

  const handleNewGame = () => {
    // TODO: Implement new game with same players
    handleClose();
    if (onBackToMenu) {
      onBackToMenu();
    }
  };

  const handleMainMenu = async () => {
    handleClose();
    try {
      await leaveRoom();
      if (onBackToMenu) {
        onBackToMenu();
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const handleToggleSetting = (setting: keyof typeof settings) => {
    if (typeof settings[setting] === 'boolean') {
      updateSettings({ [setting]: !settings[setting] });
    }
  };

  if (!inGameMenuOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="in-game-menu-backdrop" onClick={handleClose}>
        <div className="in-game-menu-panel" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="in-game-menu-header">
            <h3>⚙️ Game Menu</h3>
            <button className="menu-close-btn" onClick={handleClose}>
              ✕
            </button>
          </div>

          {/* Menu Options */}
          <div className="in-game-menu-content">
            {/* Game Settings */}
            <div className="menu-section">
              <h4>🎮 Game Settings</h4>
              <div className="setting-toggles">
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={settings.showAnimations}
                    onChange={() => handleToggleSetting('showAnimations')}
                  />
                  <span className="toggle-slider"></span>
                  <span className="setting-label">Animations</span>
                </label>

                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={settings.showCardHints}
                    onChange={() => handleToggleSetting('showCardHints')}
                  />
                  <span className="toggle-slider"></span>
                  <span className="setting-label">Card Hints</span>
                </label>

                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={settings.showRecentMoves}
                    onChange={() => handleToggleSetting('showRecentMoves')}
                  />
                  <span className="toggle-slider"></span>
                  <span className="setting-label">Recent Moves</span>
                </label>
              </div>
            </div>

            {/* Rule Settings */}
            <div className="menu-section">
              <h4>🃏 Active Rules</h4>
              <div className="rule-indicators">
                <div
                  className={`rule-indicator ${settings.enable2s ? 'active' : 'inactive'}`}
                >
                  <span className="rule-card">2s</span>
                  <span className="rule-desc">Pick Up Two</span>
                </div>
                <div
                  className={`rule-indicator ${settings.enable8s ? 'active' : 'inactive'}`}
                >
                  <span className="rule-card">8s</span>
                  <span className="rule-desc">Reverse Direction</span>
                </div>
                <div
                  className={`rule-indicator ${settings.enableAces ? 'active' : 'inactive'}`}
                >
                  <span className="rule-card">As</span>
                  <span className="rule-desc">Change Suit</span>
                </div>
                <div
                  className={`rule-indicator ${settings.enableJacks ? 'active' : 'inactive'}`}
                >
                  <span className="rule-card">Js</span>
                  <span className="rule-desc">Skip Player</span>
                </div>
                <div
                  className={`rule-indicator ${settings.enable5Hearts ? 'active' : 'inactive'}`}
                >
                  <span className="rule-card">5♥</span>
                  <span className="rule-desc">Pick Up Five</span>
                </div>
                <div
                  className={`rule-indicator ${settings.enableMirror ? 'active' : 'inactive'}`}
                >
                  <span className="rule-card">7s</span>
                  <span className="rule-desc">Mirror Card</span>
                </div>
                <div
                  className={`rule-indicator ${settings.enableRuns ? 'active' : 'inactive'}`}
                >
                  <span className="rule-card">3s</span>
                  <span className="rule-desc">Start Runs</span>
                </div>
              </div>
            </div>

            {/* Hand Sorting */}
            <div className="menu-section">
              <h4>🎯 Hand Sorting</h4>
              <div className="sort-options">
                {[
                  { key: 'dealt', label: 'As Dealt', icon: '🎲' },
                  { key: 'rank', label: 'By Rank', icon: '🔢' },
                  { key: 'suit', label: 'By Suit', icon: '♠️' },
                ].map(option => (
                  <button
                    key={option.key}
                    className={`sort-option ${settings.handSortOrder === option.key ? 'active' : ''}`}
                    onClick={() =>
                      updateSettings({ handSortOrder: option.key as any })
                    }
                  >
                    <span className="sort-icon">{option.icon}</span>
                    <span className="sort-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="in-game-menu-actions">
            <button
              className="menu-action-btn new-game-btn"
              onClick={handleNewGame}
            >
              🔄 New Game
            </button>
            <button
              className="menu-action-btn main-menu-btn"
              onClick={handleMainMenu}
            >
              🏠 Main Menu
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
