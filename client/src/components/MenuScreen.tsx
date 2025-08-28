import { useState } from 'react';
import { useUIStore } from '../stores';

export interface PlayerSetup {
  id: string;
  name: string;
  type: 'human' | 'ai';
  aiDifficulty?: 'easy' | 'medium' | 'hard' | undefined;
}

export interface GameSetupConfig {
  playerCount: 2 | 3 | 4;
  players: PlayerSetup[];
  gameSettings: {
    handSortOrder: 'dealt' | 'rank' | 'suit';
    showAnimations: boolean;
    enableDebugLogs: boolean;
  };
}

interface MenuScreenProps {
  onStartGame: (config: GameSetupConfig) => void;
}

// Quick start presets for faster game setup
const QUICK_START_PRESETS = {
  twoPlayerAI: {
    playerCount: 2 as const,
    players: [
      { id: 'player-1', name: 'You', type: 'human' as const },
      {
        id: 'player-2',
        name: 'Computer',
        type: 'ai' as const,
        aiDifficulty: 'medium' as const,
      },
    ],
    label: '2P vs AI',
    description: 'Quick match against computer',
  },
  twoPlayerLocal: {
    playerCount: 2 as const,
    players: [
      { id: 'player-1', name: 'Player 1', type: 'human' as const },
      { id: 'player-2', name: 'Player 2', type: 'human' as const },
    ],
    label: '2P Local',
    description: 'Pass & play with a friend',
  },
  threePlayerAI: {
    playerCount: 3 as const,
    players: [
      { id: 'player-1', name: 'You', type: 'human' as const },
      {
        id: 'player-2',
        name: 'Computer 1',
        type: 'ai' as const,
        aiDifficulty: 'medium' as const,
      },
      {
        id: 'player-3',
        name: 'Computer 2',
        type: 'ai' as const,
        aiDifficulty: 'medium' as const,
      },
    ],
    label: '3P vs AI',
    description: 'Challenge two computers',
  },
};

export function MenuScreen({ onStartGame }: MenuScreenProps) {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { id: 'player-1', name: 'You', type: 'human' },
    { id: 'player-2', name: 'Computer', type: 'ai', aiDifficulty: 'medium' },
  ]);

  // Get menu section states from store
  const { menuSections, toggleMenuSection } = useUIStore(state => ({
    menuSections: state.menuSections,
    toggleMenuSection: state.toggleMenuSection,
  }));

  // Update players array when player count changes
  const handlePlayerCountChange = (count: 2 | 3 | 4) => {
    setPlayerCount(count);

    const newPlayers: PlayerSetup[] = [];

    // Always include the human player first
    newPlayers.push({ id: 'player-1', name: 'You', type: 'human' });

    // Add AI players for remaining slots
    for (let i = 2; i <= count; i++) {
      newPlayers.push({
        id: `player-${i}`,
        name: `Computer ${i - 1}`,
        type: 'ai',
        aiDifficulty: 'medium',
      });
    }

    setPlayers(newPlayers);
  };

  const handlePlayerNameChange = (playerId: string, name: string) => {
    setPlayers(prev =>
      prev.map(player =>
        player.id === playerId ? { ...player, name } : player,
      ),
    );
  };

  const handlePlayerTypeChange = (playerId: string, type: 'human' | 'ai') => {
    setPlayers(prev =>
      prev.map(player =>
        player.id === playerId
          ? {
              ...player,
              type,
              aiDifficulty: type === 'ai' ? 'medium' : undefined,
            }
          : player,
      ),
    );
  };

  const handleAIDifficultyChange = (
    playerId: string,
    difficulty: 'easy' | 'medium' | 'hard',
  ) => {
    setPlayers(prev =>
      prev.map(player =>
        player.id === playerId
          ? { ...player, aiDifficulty: difficulty }
          : player,
      ),
    );
  };

  const handleQuickStart = (
    preset: (typeof QUICK_START_PRESETS)[keyof typeof QUICK_START_PRESETS],
  ) => {
    const config: GameSetupConfig = {
      playerCount: preset.playerCount,
      players: preset.players,
      gameSettings: {
        handSortOrder: 'rank',
        showAnimations: true,
        enableDebugLogs: true,
      },
    };
    onStartGame(config);
  };

  const handleStartGame = () => {
    const config: GameSetupConfig = {
      playerCount,
      players,
      gameSettings: {
        handSortOrder: 'rank',
        showAnimations: true,
        enableDebugLogs: true,
      },
    };
    onStartGame(config);
  };

  return (
    <div className="menu-screen">
      <div className="menu-container">
        <div className="menu-header">
          <h1>🃏 Switch</h1>
          <p>Configure your game and start playing!</p>
        </div>

        {/* Quick Start Section - Always visible with presets */}
        <div className="menu-section">
          <div
            className="section-header"
            onClick={() => toggleMenuSection('quickStart')}
          >
            <h3>⚡ Quick Start</h3>
            <span
              className={`section-toggle ${menuSections.quickStartExpanded ? 'expanded' : ''}`}
            >
              {menuSections.quickStartExpanded ? '▼' : '▶'}
            </span>
          </div>

          {menuSections.quickStartExpanded && (
            <div className="section-content">
              <div className="quick-start-presets">
                {Object.entries(QUICK_START_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    className="quick-start-btn"
                    onClick={() => handleQuickStart(preset)}
                  >
                    <div className="preset-label">{preset.label}</div>
                    <div className="preset-description">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Advanced Setup Section - Collapsible */}
        <div className="menu-section">
          <div
            className="section-header"
            onClick={() => toggleMenuSection('playerSetup')}
          >
            <h3>⚙️ Custom Setup</h3>
            <span
              className={`section-toggle ${menuSections.playerSetupExpanded ? 'expanded' : ''}`}
            >
              {menuSections.playerSetupExpanded ? '▼' : '▶'}
            </span>
          </div>

          {menuSections.playerSetupExpanded && (
            <div className="section-content">
              <div className="player-count-section">
                <h4>Number of Players</h4>
                <div className="player-count-selector">
                  {([2, 3, 4] as const).map(count => (
                    <label key={count} className="player-count-option">
                      <input
                        type="radio"
                        name="playerCount"
                        value={count}
                        checked={playerCount === count}
                        onChange={() => handlePlayerCountChange(count)}
                      />
                      <span className="radio-custom"></span>
                      {count} Players
                    </label>
                  ))}
                </div>
              </div>

              <div className="player-setup-section">
                <h4>Player Configuration</h4>
                <div className="players-setup">
                  {players.map((player, index) => (
                    <div key={player.id} className="player-config">
                      <div className="player-info">
                        <span className="player-number">
                          Player {index + 1}
                        </span>
                        <input
                          type="text"
                          value={player.name}
                          onChange={e =>
                            handlePlayerNameChange(player.id, e.target.value)
                          }
                          className="player-name-input"
                          placeholder="Enter name"
                          maxLength={20}
                        />
                      </div>

                      <div className="player-type">
                        <label className="type-option">
                          <input
                            type="radio"
                            name={`type-${player.id}`}
                            value="human"
                            checked={player.type === 'human'}
                            onChange={() =>
                              handlePlayerTypeChange(player.id, 'human')
                            }
                          />
                          👤 Human
                        </label>
                        <label className="type-option">
                          <input
                            type="radio"
                            name={`type-${player.id}`}
                            value="ai"
                            checked={player.type === 'ai'}
                            onChange={() =>
                              handlePlayerTypeChange(player.id, 'ai')
                            }
                          />
                          🤖 AI
                        </label>
                      </div>

                      {player.type === 'ai' && (
                        <div className="ai-difficulty">
                          <select
                            value={player.aiDifficulty || 'medium'}
                            onChange={e =>
                              handleAIDifficultyChange(
                                player.id,
                                e.target.value as 'easy' | 'medium' | 'hard',
                              )
                            }
                            className="difficulty-select"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="menu-actions">
                <button className="start-game-btn" onClick={handleStartGame}>
                  Start Custom Game
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
