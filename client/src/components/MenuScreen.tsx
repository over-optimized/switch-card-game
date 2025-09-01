import { useState } from 'react';
import { track } from '@vercel/analytics';
import { useUIStore, useGameStore } from '../stores';
import { challengeService } from '../services/challengeService';
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
    // Trick card rules
    enable2s: boolean;
    enable8s: boolean;
    enableAces: boolean;
    enableJacks: boolean;
    enable5Hearts: boolean;
    enableMirror: boolean;
    enableRuns: boolean;
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

// Daily Challenge Display Component
function DailyChallengeDisplay() {
  const todayChallenge = challengeService.getTodayChallenge();
  const streak = challengeService.getStreak();
  const stats = challengeService.getStatistics();

  return (
    <div className={styles.dailyChallengeContent}>
      <div className={styles.challengeCard}>
        <div className={styles.challengeHeader}>
          <div className={styles.challengeTitle}>
            {todayChallenge.baseChallenge.title}
          </div>
          <div className={styles.challengeStatus}>
            {todayChallenge.baseChallenge.completed ? (
              <span className={styles.completed}>✅ Completed!</span>
            ) : (
              <span className={styles.pending}>⏳ Pending</span>
            )}
          </div>
        </div>
        <div className={styles.challengeDescription}>
          {todayChallenge.baseChallenge.description}
        </div>
        {todayChallenge.baseChallenge.completed &&
          todayChallenge.baseChallenge.completedAt && (
            <div className={styles.completedAt}>
              Completed at{' '}
              {new Date(
                todayChallenge.baseChallenge.completedAt,
              ).toLocaleTimeString()}
            </div>
          )}
      </div>

      <div className={styles.challengeStats}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{streak.current}</div>
          <div className={styles.statLabel}>Current Streak</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{streak.best}</div>
          <div className={styles.statLabel}>Best Streak</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.totalCompleted}</div>
          <div className={styles.statLabel}>Total Completed</div>
        </div>
      </div>

      {!todayChallenge.baseChallenge.completed && (
        <div className={styles.challengeTip}>
          💡 Complete any game to earn your daily victory!
        </div>
      )}
    </div>
  );
}

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
  const { menuSections, toggleMenuSection, settings, updateSettings } =
    useUIStore(state => ({
      menuSections: state.menuSections,
      toggleMenuSection: state.toggleMenuSection,
      settings: state.settings,
      updateSettings: state.updateSettings,
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
    // Track quick start game type
    track('game_started', {
      type: 'quick_start',
      mode: preset.label,
      player_count: preset.playerCount,
      has_ai: preset.players.some(p => p.type === 'ai'),
    });

    const config: GameSetupConfig = {
      playerCount: preset.playerCount,
      players: preset.players,
      gameSettings: {
        handSortOrder: 'rank',
        showAnimations: true,
        enableDebugLogs: true,
        // Use current UI settings for trick cards
        enable2s: settings.enable2s,
        enable8s: settings.enable8s,
        enableAces: settings.enableAces,
        enableJacks: settings.enableJacks,
        enable5Hearts: settings.enable5Hearts,
        enableMirror: settings.enableMirror,
        enableRuns: settings.enableRuns,
      },
    };
    onStartGame(config);
  };

  const handleStartGame = () => {
    // Track custom game setup
    track('game_started', {
      type: 'custom',
      player_count: playerCount,
      has_ai: players.some(p => p.type === 'ai'),
      ai_count: players.filter(p => p.type === 'ai').length,
    });

    const config: GameSetupConfig = {
      playerCount,
      players,
      gameSettings: {
        handSortOrder: 'rank',
        showAnimations: true,
        enableDebugLogs: true,
        // Use current UI settings for trick cards
        enable2s: settings.enable2s,
        enable8s: settings.enable8s,
        enableAces: settings.enableAces,
        enableJacks: settings.enableJacks,
        enable5Hearts: settings.enable5Hearts,
        enableMirror: settings.enableMirror,
        enableRuns: settings.enableRuns,
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
        // Track room creation
        track('room_created', {
          max_players: 4, // Default room size
          player_name_length: playerName.trim().length,
        });

        // Track multiplayer game start
        track('game_started', {
          type: 'multiplayer',
          mode: 'host',
          player_count: 1, // Just host initially
          has_ai: false,
        });

        // Navigate to game screen - create a basic online game config
        const config: GameSetupConfig = {
          playerCount: 2, // Will be determined by room
          players: [{ id: 'host', name: playerName.trim(), type: 'human' }],
          gameSettings: {
            handSortOrder: 'rank',
            showAnimations: true,
            enableDebugLogs: true,
            // Use current UI settings for trick cards
            enable2s: settings.enable2s,
            enable8s: settings.enable8s,
            enableAces: settings.enableAces,
            enableJacks: settings.enableJacks,
            enable5Hearts: settings.enable5Hearts,
            enableMirror: settings.enableMirror,
            enableRuns: settings.enableRuns,
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
        // Track room joining
        track('room_joined', {
          room_code_length: roomCode.trim().length,
          join_method: 'code_entry',
          player_name_length: playerName.trim().length,
        });

        // Track multiplayer game start
        track('game_started', {
          type: 'multiplayer',
          mode: 'join',
          player_count: 2, // Unknown, will be updated when game starts
          has_ai: false,
        });

        // Navigate to game screen - create a basic online game config
        const config: GameSetupConfig = {
          playerCount: 2, // Will be determined by room
          players: [{ id: 'player', name: playerName.trim(), type: 'human' }],
          gameSettings: {
            handSortOrder: 'rank',
            showAnimations: true,
            enableDebugLogs: true,
            // Use current UI settings for trick cards
            enable2s: settings.enable2s,
            enable8s: settings.enable8s,
            enableAces: settings.enableAces,
            enableJacks: settings.enableJacks,
            enable5Hearts: settings.enable5Hearts,
            enableMirror: settings.enableMirror,
            enableRuns: settings.enableRuns,
          },
        };
        onStartGame(config);
      }
    } finally {
      setIsJoiningRoom(false);
    }
  };

  // Game Rules handlers
  const handleClassicRulesPreset = () => {
    updateSettings({
      enable2s: false,
      enableAces: false,
      enableJacks: false,
      enable8s: false,
      enableRuns: false,
      enableMirror: false,
      enable5Hearts: false,
    });
  };

  const handleFullRulesPreset = () => {
    updateSettings({
      enable2s: true,
      enableAces: true,
      enableJacks: true,
      enable8s: true,
      enableRuns: false, // Not implemented yet
      enableMirror: false, // Not implemented yet
      enable5Hearts: false, // Not implemented yet
    });
  };

  const handleTrickCardToggle = (setting: keyof typeof settings) => {
    if (typeof settings[setting] === 'boolean') {
      updateSettings({ [setting]: !settings[setting] });
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

        {/* Daily Challenge Section */}
        <div className={styles.menuSection}>
          <div
            className={styles.sectionHeader}
            onClick={() => toggleMenuSection('dailyChallenge')}
          >
            <h3>🎯 Daily Challenge</h3>
            <span className={styles.sectionToggle}>
              {menuSections.dailyChallengeExpanded ? '▼' : '▶'}
            </span>
          </div>

          <div
            className={`${styles.sectionContent} ${
              menuSections.dailyChallengeExpanded ? styles.expanded : ''
            }`}
          >
            <DailyChallengeDisplay />
          </div>
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

          <div
            className={`${styles.sectionContent} ${
              menuSections.quickStartExpanded ? styles.expanded : ''
            }`}
          >
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

          <div
            className={`${styles.sectionContent} ${
              menuSections.onlinePlayExpanded ? styles.expanded : ''
            }`}
          >
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
                    disabled={isCreatingRoom || isLoading || !playerName.trim()}
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
                      onChange={e => setRoomCode(e.target.value.toUpperCase())}
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

          <div
            className={`${styles.sectionContent} ${
              menuSections.playerSetupExpanded ? styles.expanded : ''
            }`}
          >
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
              <button className={styles.startGameBtn} onClick={handleStartGame}>
                Start Custom Game
              </button>
            </div>
          </div>
        </div>

        {/* Game Rules Section */}
        <div className={styles.menuSection}>
          <div
            className={styles.sectionHeader}
            onClick={() => toggleMenuSection('gameRules')}
          >
            <h3>🃏 Game Rules</h3>
            <span className={styles.sectionToggle}>
              {menuSections.gameRulesExpanded ? '▼' : '▶'}
            </span>
          </div>

          <div
            className={`${styles.sectionContent} ${
              menuSections.gameRulesExpanded ? styles.expanded : ''
            }`}
          >
            <div className={styles.gameRulesContent}>
              <div className={styles.rulePresetsSection}>
                <h4>Quick Presets</h4>
                <div className={styles.rulePresets}>
                  <button
                    className={styles.rulePresetBtn}
                    onClick={handleClassicRulesPreset}
                  >
                    <span className={styles.presetIcon}>🎯</span>
                    <div className={styles.presetInfo}>
                      <div className={styles.presetName}>Classic Rules</div>
                      <div className={styles.presetDesc}>
                        Basic gameplay only
                      </div>
                    </div>
                  </button>
                  <button
                    className={styles.rulePresetBtn}
                    onClick={handleFullRulesPreset}
                  >
                    <span className={styles.presetIcon}>⚡</span>
                    <div className={styles.presetInfo}>
                      <div className={styles.presetName}>Full Rules</div>
                      <div className={styles.presetDesc}>
                        All trick cards active
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className={styles.trickCardSection}>
                <h4>Trick Card Rules</h4>
                <div className={styles.trickCardToggles}>
                  <div className={styles.trickCardToggle}>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardIcon}>2️⃣</span>
                      <div className={styles.cardDescription}>
                        <div className={styles.cardName}>2s - Pick Up Two</div>
                        <div className={styles.cardEffect}>
                          Force next player to draw 2 cards
                        </div>
                      </div>
                    </div>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        checked={settings.enable2s}
                        onChange={() => handleTrickCardToggle('enable2s')}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>

                  <div className={styles.trickCardToggle}>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardIcon}>🅰️</span>
                      <div className={styles.cardDescription}>
                        <div className={styles.cardName}>
                          Aces - Change Suit
                        </div>
                        <div className={styles.cardEffect}>
                          Play on any suit, choose next suit
                        </div>
                      </div>
                    </div>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        checked={settings.enableAces}
                        onChange={() => handleTrickCardToggle('enableAces')}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>

                  <div className={styles.trickCardToggle}>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardIcon}>🃏</span>
                      <div className={styles.cardDescription}>
                        <div className={styles.cardName}>
                          Jacks - Skip Player
                        </div>
                        <div className={styles.cardEffect}>
                          Skip the next player's turn
                        </div>
                      </div>
                    </div>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        checked={settings.enableJacks}
                        onChange={() => handleTrickCardToggle('enableJacks')}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>

                  <div className={styles.trickCardToggle}>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardIcon}>8️⃣</span>
                      <div className={styles.cardDescription}>
                        <div className={styles.cardName}>
                          8s - Reverse Direction
                        </div>
                        <div className={styles.cardEffect}>
                          Change turn order direction
                        </div>
                      </div>
                    </div>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        checked={settings.enable8s}
                        onChange={() => handleTrickCardToggle('enable8s')}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>

                  <div className={styles.trickCardToggle}>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardIcon}>5️⃣♥️</span>
                      <div className={styles.cardDescription}>
                        <div className={styles.cardName}>
                          5♥ - Pick Up Five
                        </div>
                        <div className={styles.cardEffect}>
                          Force next player to draw 5 cards
                        </div>
                      </div>
                    </div>
                    <label className={styles.toggleSwitch}>
                      <input type="checkbox" disabled />
                      <span
                        className={`${styles.toggleSlider} ${styles.disabled}`}
                      ></span>
                    </label>
                    <span className={styles.comingSoon}>Coming Soon</span>
                  </div>

                  <div className={styles.trickCardToggle}>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardIcon}>7️⃣</span>
                      <div className={styles.cardDescription}>
                        <div className={styles.cardName}>7s - Mirror Cards</div>
                        <div className={styles.cardEffect}>
                          Next card must match previous card
                        </div>
                      </div>
                    </div>
                    <label className={styles.toggleSwitch}>
                      <input type="checkbox" disabled />
                      <span
                        className={`${styles.toggleSlider} ${styles.disabled}`}
                      ></span>
                    </label>
                    <span className={styles.comingSoon}>Coming Soon</span>
                  </div>

                  <div className={styles.trickCardToggle}>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardIcon}>3️⃣</span>
                      <div className={styles.cardDescription}>
                        <div className={styles.cardName}>3s - Start Runs</div>
                        <div className={styles.cardEffect}>
                          Begin sequential card chains
                        </div>
                      </div>
                    </div>
                    <label className={styles.toggleSwitch}>
                      <input type="checkbox" disabled />
                      <span
                        className={`${styles.toggleSlider} ${styles.disabled}`}
                      ></span>
                    </label>
                    <span className={styles.comingSoon}>Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
