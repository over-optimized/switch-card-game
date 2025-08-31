import { useState } from 'react';
import { useUIStore, useGameStore } from '../stores';
import styles from './MenuScreen.module.css';

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

  // Online play state
  const [playerName, setPlayerName] = useState('Player');
  const [roomCode, setRoomCode] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  // Get menu section states from store
  const { menuSections, toggleMenuSection } = useUIStore(state => ({
    menuSections: state.menuSections,
    toggleMenuSection: state.toggleMenuSection,
  }));

  // Get game store methods for room management
  const {
    connectToLocalServer,
    createRoom,
    joinRoom,
    connectionStatus,
    isLoading,
    message,
  } = useGameStore(state => ({
    connectToLocalServer: state.connectToLocalServer,
    createRoom: state.createRoom,
    joinRoom: state.joinRoom,
    connectionStatus: state.connectionStatus,
    isLoading: state.isLoading,
    message: state.message,
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

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      // Show toast instead of alert for better UX
      import('../utils/toastUtils').then(({ gameToasts }) => {
        gameToasts.showInfo('Validation Error', 'Please enter your name', 3000);
      });
      return;
    }

    setIsCreatingRoom(true);
    try {
      // First connect to server if not connected
      if (connectionStatus !== 'connected') {
        const connected = await connectToLocalServer();
        if (!connected) {
          return;
        }
      }

      // Create the room
      const success = await createRoom(playerName.trim());
      if (success) {
        // Navigate to game screen - create a basic online game config
        const config: GameSetupConfig = {
          playerCount: 2, // Will be determined by room
          players: [{ id: 'host', name: playerName.trim(), type: 'human' }],
          gameSettings: {
            handSortOrder: 'rank',
            showAnimations: true,
            enableDebugLogs: true,
          },
        };
        onStartGame(config);
      }
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      // Show toast instead of alert for better UX
      import('../utils/toastUtils').then(({ gameToasts }) => {
        gameToasts.showInfo('Validation Error', 'Please enter your name', 3000);
      });
      return;
    }
    if (!roomCode.trim()) {
      // Show toast instead of alert for better UX
      import('../utils/toastUtils').then(({ gameToasts }) => {
        gameToasts.showInfo(
          'Validation Error',
          'Please enter a room code',
          3000,
        );
      });
      return;
    }

    setIsJoiningRoom(true);
    try {
      // First connect to server if not connected
      if (connectionStatus !== 'connected') {
        const connected = await connectToLocalServer();
        if (!connected) {
          return;
        }
      }

      // Join the room
      const success = await joinRoom(
        roomCode.trim().toUpperCase(),
        playerName.trim(),
      );
      if (success) {
        // Navigate to game screen - create a basic online game config
        const config: GameSetupConfig = {
          playerCount: 2, // Will be determined by room
          players: [{ id: 'player', name: playerName.trim(), type: 'human' }],
          gameSettings: {
            handSortOrder: 'rank',
            showAnimations: true,
            enableDebugLogs: true,
          },
        };
        onStartGame(config);
      }
    } finally {
      setIsJoiningRoom(false);
    }
  };

  return (
    <div className={styles.menuScreen}>
      <div className={styles.menuContainer}>
        <div className={styles.menuHeader}>
          <div className={styles.headerCardStack}>
            <div className={styles.stackedCard}>🂡</div>
            <div className={styles.stackedCard}>🂾</div>
            <div className={styles.stackedCard}>🃛</div>
            <div className={styles.stackedCard}>🃏</div>
          </div>
          <h1 className={styles.headerTitle}>Switch</h1>
          <p className={styles.headerDescription}>
            Configure your game and start playing!
          </p>
        </div>

        {/* Quick Start Section - Always visible with presets */}
        <div className={styles.menuSection}>
          <div
            className={styles.sectionHeader}
            onClick={() => toggleMenuSection('quickStart')}
          >
            <h3>⚡ Quick Start</h3>
            <span className={styles.sectionToggle}>
              {menuSections.quickStartExpanded ? '▼' : '▶'}
            </span>
          </div>

          {menuSections.quickStartExpanded && (
            <div className={styles.sectionContent}>
              <div className={styles.quickStartPresets}>
                {Object.entries(QUICK_START_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    className={styles.quickStartBtn}
                    onClick={() => handleQuickStart(preset)}
                  >
                    <div className={styles.presetLabel}>{preset.label}</div>
                    <div className={styles.presetDescription}>
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Online Play Section */}
        <div className={styles.menuSection}>
          <div
            className={styles.sectionHeader}
            onClick={() => toggleMenuSection('onlinePlay')}
          >
            <h3>🌐 Online Play</h3>
            <span className={styles.sectionToggle}>
              {menuSections.onlinePlayExpanded ? '▼' : '▶'}
            </span>
          </div>

          {menuSections.onlinePlayExpanded && (
            <div className={styles.sectionContent}>
              <div className={styles.onlinePlayContent}>
                <div className={styles.connectionStatus}>
                  <span
                    className={`${styles.connectionDot} ${
                      connectionStatus === 'connected'
                        ? styles.connected
                        : connectionStatus === 'connecting'
                          ? styles.connecting
                          : styles.offline
                    }`}
                  >
                    ●
                  </span>
                  <span className={styles.connectionText}>
                    {connectionStatus === 'connected'
                      ? 'Connected to server'
                      : connectionStatus === 'connecting'
                        ? 'Connecting to server...'
                        : 'Offline'}
                  </span>
                </div>

                <div className={styles.playerNameSection}>
                  <label className={styles.inputLabel}>
                    Your Name:
                    <input
                      type="text"
                      value={playerName}
                      onChange={e => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      className={styles.playerNameInput}
                      maxLength={20}
                    />
                  </label>
                </div>

                <div className={styles.roomActions}>
                  <div className={styles.createRoomSection}>
                    <h4>Create a New Room</h4>
                    <button
                      className={styles.roomActionBtn}
                      onClick={handleCreateRoom}
                      disabled={
                        isCreatingRoom || isLoading || !playerName.trim()
                      }
                    >
                      {isCreatingRoom ? 'Creating...' : 'Create Room'}
                    </button>
                  </div>

                  <div className={styles.joinRoomSection}>
                    <h4>Join an Existing Room</h4>
                    <div className={styles.joinRoomInputs}>
                      <input
                        type="text"
                        value={roomCode}
                        onChange={e =>
                          setRoomCode(e.target.value.toUpperCase())
                        }
                        placeholder="Room Code (e.g. ABC123)"
                        className={styles.roomCodeInput}
                        maxLength={6}
                      />
                      <button
                        className={styles.roomActionBtn}
                        onClick={handleJoinRoom}
                        disabled={
                          isJoiningRoom ||
                          isLoading ||
                          !playerName.trim() ||
                          !roomCode.trim()
                        }
                      >
                        {isJoiningRoom ? 'Joining...' : 'Join Room'}
                      </button>
                    </div>
                  </div>
                </div>

                {message && <div className={styles.gameMessage}>{message}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Advanced Setup Section - Collapsible */}
        <div className={styles.menuSection}>
          <div
            className={styles.sectionHeader}
            onClick={() => toggleMenuSection('playerSetup')}
          >
            <h3>⚙️ Custom Setup</h3>
            <span className={styles.sectionToggle}>
              {menuSections.playerSetupExpanded ? '▼' : '▶'}
            </span>
          </div>

          {menuSections.playerSetupExpanded && (
            <div className={styles.sectionContent}>
              <div className={styles.playerCountSection}>
                <h4>Number of Players</h4>
                <div className={styles.playerCountSelector}>
                  {([2, 3, 4] as const).map(count => (
                    <label key={count} className={styles.playerCountOption}>
                      <input
                        type="radio"
                        name="playerCount"
                        value={count}
                        checked={playerCount === count}
                        onChange={() => handlePlayerCountChange(count)}
                      />
                      <span className={styles.radioCustom}></span>
                      {count} Players
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.playerSetupSection}>
                <h4>Player Configuration</h4>
                <div className={styles.playersSetup}>
                  {players.map((player, index) => (
                    <div key={player.id} className={styles.playerConfig}>
                      <div className={styles.playerInfo}>
                        <span className={styles.playerNumber}>
                          Player {index + 1}
                        </span>
                        <input
                          type="text"
                          value={player.name}
                          onChange={e =>
                            handlePlayerNameChange(player.id, e.target.value)
                          }
                          className={styles.playerNameInput}
                          placeholder="Enter name"
                          maxLength={20}
                        />
                      </div>

                      <div className={styles.playerType}>
                        <label className={styles.typeOption}>
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
                        <label className={styles.typeOption}>
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
                        <div className={styles.aiDifficulty}>
                          <select
                            value={player.aiDifficulty || 'medium'}
                            onChange={e =>
                              handleAIDifficultyChange(
                                player.id,
                                e.target.value as 'easy' | 'medium' | 'hard',
                              )
                            }
                            className={styles.difficultySelect}
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

              <div className={styles.menuActions}>
                <button
                  className={styles.startGameBtn}
                  onClick={handleStartGame}
                >
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
