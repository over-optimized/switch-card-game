import { useState } from 'react';

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

export function MenuScreen({ onStartGame }: MenuScreenProps) {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { id: 'player-1', name: 'You', type: 'human' },
    { id: 'player-2', name: 'Computer', type: 'ai', aiDifficulty: 'medium' },
  ]);

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

        <div className="menu-section">
          <h3>Number of Players</h3>
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

        <div className="menu-section mb-0">
          <h3>Player Setup</h3>
          <div className="players-setup">
            {players.map((player, index) => (
              <div key={player.id} className="player-config">
                <div className="player-info">
                  <span className="player-number">Player {index + 1}</span>
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
                      onChange={() => handlePlayerTypeChange(player.id, 'ai')}
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
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
