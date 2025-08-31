import { io } from 'socket.io-client';
import { GameEngine, GameState, getCardDisplayName, Suit } from 'switch-shared';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { GameSetupConfig } from '../components/MenuScreen';
import {
  gameToasts,
  getCardDisplayString,
  isTrickCard,
} from '../utils/toastUtils';
import { useUIStore } from './uiStore';
import {
  debugLogger,
  logCardPlay,
  logGame,
  logNetwork,
  logTurn,
  logValidation,
} from '../utils/debug';
import {
  ActionStatus,
  ConnectionStatus,
  DragState,
  GameMode,
  OptimisticUpdate,
  PenaltyState,
  PendingAction,
  PlayerInfo,
  RecentMove,
} from './types';

interface GameStore {
  // Core game state
  gameState: GameState | null;
  serverGameState: GameState | null; // Authoritative server state
  isLoading: boolean;
  playerId: string;
  message: string;

  // Network state
  socket: ReturnType<typeof io> | null;
  connectionStatus: ConnectionStatus;
  roomCode: string | null;
  isHost: boolean;
  connectedPlayers: Record<string, PlayerInfo>;
  spectators: PlayerInfo[];

  // Reconnection tracking
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectTimeoutId: ReturnType<typeof setTimeout> | null;
  lastDisconnectTime: Date | null;

  // Game flow
  gameMode: GameMode;
  penaltyState: PenaltyState;

  // UI state
  selectedCards: string[];
  selectionMode: 'none' | 'selecting' | 'ready';
  cardSelectionOrder: Record<string, number>;
  dragState: DragState;

  // Suit selection for Aces
  suitSelectionOpen: boolean;
  pendingAceCardId: string | null;

  // History and debugging
  recentMoves: RecentMove[];
  showRecentMoves: boolean;

  // Networking specific
  pendingActions: PendingAction[];
  optimisticUpdates: OptimisticUpdate[];
  currentAction: PendingAction | null;

  // Actions - Game management (WebSocket-first)
  setupWebSocketGame: (config?: GameSetupConfig) => void;
  connectToLocalServer: () => Promise<boolean>;
  createRoom: (playerName: string, maxPlayers?: number) => Promise<boolean>;
  joinRoom: (roomCode: string, playerName: string) => Promise<boolean>;
  restartGame: () => void;
  leaveRoom: () => Promise<boolean>;
  updateMessage: (message: string) => void;

  // Actions - Card interactions (WebSocket-only)
  selectCard: (cardId: string) => void;
  clearSelection: () => void;
  playSelectedCards: () => Promise<boolean>;
  drawCard: () => Promise<boolean>;

  // Actions - Drag and drop
  startDrag: (cardIds: string[]) => void;
  endDrag: () => void;
  dropCards: (cardIds: string[]) => Promise<boolean>;

  // Actions - Network state
  setConnectionStatus: (status: ConnectionStatus) => void;
  setRoomCode: (code: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  addPlayer: (player: PlayerInfo) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<PlayerInfo>) => void;

  // Actions - Reconnection management
  startReconnection: () => void;
  stopReconnection: () => void;
  manualReconnect: () => void;
  resetReconnectionState: () => void;

  // Actions - Room persistence
  saveRoomSession: () => void;
  loadRoomSession: () => boolean;
  clearRoomSession: () => void;

  // Actions - State synchronization
  syncWithServer: (serverState: GameState) => void;

  // Actions - Async action management
  createPendingAction: (
    type: PendingAction['type'],
    cardIds?: string[],
  ) => string;
  updateActionStatus: (
    actionId: string,
    status: ActionStatus,
    error?: string,
  ) => void;
  confirmAction: (actionId: string, serverState: GameState) => void;
  rollbackAction: (actionId: string) => void;

  // Actions - Optimistic updates
  applyOptimisticUpdate: (actionId: string, cardIds?: string[]) => void;
  confirmOptimisticUpdate: (updateId: string) => void;
  rollbackOptimisticUpdate: (updateId: string) => void;

  // Actions - History
  addRecentMove: (player: string, action: string, details?: string) => void;
  toggleRecentMoves: () => void;

  // Actions - Penalty handling
  servePenalty: (playerId: string) => Promise<boolean>;

  // Actions - Suit selection for Aces
  openSuitSelection: (cardId: string) => void;
  closeSuitSelection: () => void;
  selectSuit: (suit: Suit) => Promise<boolean>;

  // Actions - AI
  executeComputerTurn: () => void;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gameState: null,
    serverGameState: null,
    isLoading: true,
    playerId: 'player-1',
    message: '',

    // Network state
    socket: null,
    connectionStatus: 'offline',
    roomCode: null,
    isHost: false,
    connectedPlayers: {},
    spectators: [],

    // Reconnection tracking
    reconnectAttempts: 0,
    maxReconnectAttempts: 10,
    reconnectTimeoutId: null,
    lastDisconnectTime: null,

    // Game flow
    gameMode: 'normal',
    penaltyState: {
      active: false,
      cards: 0,
      type: null,
    },

    // UI state
    selectedCards: [],
    selectionMode: 'none',
    cardSelectionOrder: {},
    dragState: {
      isDragging: false,
      draggedCards: [],
    },

    // Suit selection for Aces
    suitSelectionOpen: false,
    pendingAceCardId: null,

    // History
    recentMoves: [],
    showRecentMoves: false,

    // Network
    pendingActions: [],
    optimisticUpdates: [],
    currentAction: null,

    // Actions - WebSocket-first architecture
    setupWebSocketGame: (config?: GameSetupConfig) => {
      logGame('Setting up WebSocket game', {
        config: config?.playerCount || 2,
      });
      set({ isLoading: true, message: 'Connecting to game server...' });

      // Connect to local server for all games (localhost:3001)
      get()
        .connectToLocalServer()
        .then(connected => {
          if (connected) {
            // Use the new socket event for local games with AI
            const playerName = config?.players?.[0]?.name || 'You';
            const aiOpponents = (config?.playerCount || 2) - 1;

            // Create local game with AI opponents via WebSocket
            const socket = get().socket;
            if (socket) {
              logGame('WebSocket connection established, creating local game', {
                playerName,
                aiOpponents,
              });
              socket.emit('create-local-game', { playerName, aiOpponents });
            } else {
              set({
                isLoading: false,
                message: 'No socket connection available',
              });
            }
          } else {
            set({
              isLoading: false,
              message: 'Failed to connect to game server. Please try again.',
            });
          }
        });
    },

    connectToLocalServer: async () => {
      try {
        // Get WebSocket URL from environment variables
        const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
        logNetwork(`Connecting to server at ${wsUrl}`, 'pending');

        const socket = io(wsUrl, {
          transports: ['websocket'],
          withCredentials: true,
        });

        // Store socket instance and set up event handlers
        set({ socket, connectionStatus: 'connecting' });

        return new Promise<boolean>(resolve => {
          socket.on('connect', () => {
            const socketId = socket.id || `temp-${Date.now()}`;
            const currentState = get();

            set({
              connectionStatus: 'connected',
              message: 'Connected to game server',
              playerId: socketId,
            });

            // DEBUG: Track playerId assignment during socket connection
            console.log(
              '[Jack Debug] Socket connected - playerId set to:',
              socketId,
            );

            logNetwork('WebSocket connected', 'success', {
              id: socketId,
            });

            // Reset reconnection state on successful connection
            currentState.resetReconnectionState();

            // Show reconnection success toast if this was a reconnection
            if (currentState.reconnectAttempts > 0) {
              import('../utils/toastUtils').then(({ gameToasts }) => {
                gameToasts.showInfo(
                  'Connection Restored',
                  'Successfully reconnected to the game!',
                  3000,
                );
              });
            }

            resolve(true);
          });

          socket.on('disconnect', () => {
            console.log(
              '[Connection Debug] Socket disconnected - setting offline status',
            );
            set({
              connectionStatus: 'offline',
              message: 'Disconnected from game server',
              lastDisconnectTime: new Date(),
            });
            logNetwork('Disconnected from server', 'error');

            // Show disconnect toast
            import('../utils/toastUtils').then(({ gameToasts }) => {
              gameToasts.showInfo(
                'Connection Lost',
                'Attempting to reconnect...',
                3000,
              );
            });

            // Start automatic reconnection
            setTimeout(() => {
              const currentState = get();
              console.log(
                '[Connection Debug] Checking for auto-reconnection...',
                {
                  status: currentState.connectionStatus,
                  roomCode: currentState.roomCode,
                },
              );
              if (
                currentState.connectionStatus === 'offline' &&
                currentState.roomCode
              ) {
                console.log(
                  '[Connection Debug] Starting automatic reconnection',
                );
                currentState.startReconnection();
              }
            }, 1000); // Brief delay before starting reconnection
          });

          socket.on('error', error => {
            logNetwork('Socket error', 'error', error);
            set({
              connectionStatus: 'offline',
              message: 'Connection error',
            });
            resolve(false);
          });

          // Handle local game creation response
          socket.on('local-game-created', ({ room, player, gameState }) => {
            logGame('Local game created', { room, player, gameState });

            // Clear any existing toasts from previous games
            useUIStore.getState().clearAllToasts();

            // Show game start notification
            gameToasts.showGameStart();

            // DEBUG: Track playerId change during local game creation
            const oldPlayerId = get().playerId;
            console.log(
              '[Jack Debug] Local game created - playerId changing:',
              {
                from: oldPlayerId,
                to: player.id,
              },
            );

            set({
              gameState,
              serverGameState: gameState,
              roomCode: room.code,
              playerId: player.id, // FIX: Set playerId to match server player ID
              isHost: player.isHost,
              isLoading: false,
              message: 'Game started!',
            });
          });

          // Handle game events
          socket.on('card-played', ({ playerId, cardId, gameState }) => {
            logCardPlay(playerId, [cardId], true, 'Server confirmed card play');

            // DEBUG: Track playerId comparison for Jack toast issue
            const currentPlayerId = get().playerId;
            console.log('[Jack Debug] card-played event:', {
              eventPlayerId: playerId,
              clientPlayerId: currentPlayerId,
              isOpponent: playerId !== currentPlayerId,
              cardId,
            });

            // Show toast for opponent moves
            if (playerId !== get().playerId) {
              const oldGameState = get().gameState;
              const player = gameState.players.find(
                (p: any) => p.id === playerId,
              );
              // Get the card that was just played (top of new discard pile)
              const cardPlayed =
                gameState.discardPile[gameState.discardPile.length - 1];

              if (player && cardPlayed) {
                const cardDisplay = getCardDisplayString(
                  cardPlayed.rank,
                  cardPlayed.suit,
                );

                // Check for trick card effects
                if (isTrickCard(cardPlayed.rank)) {
                  let effect = '';

                  if (cardPlayed.rank === '2') {
                    const penalty = gameState.penaltyState;
                    const oldPenalty = oldGameState?.penaltyState;

                    if (penalty.active) {
                      if (oldPenalty?.active && oldPenalty.cards > 0) {
                        // Penalty stacking
                        const addedCards = penalty.cards - oldPenalty.cards;
                        gameToasts.showPenaltyStacked(
                          penalty.cards,
                          addedCards,
                        );
                        gameToasts.show2sEffect(addedCards, player.name);
                      } else {
                        // New penalty created
                        gameToasts.showPenaltyCreated(penalty.cards);
                        gameToasts.show2sEffect(penalty.cards, player.name);
                      }
                    }
                    effect = `+${penalty.cards} penalty cards`;
                  } else if (cardPlayed.rank === 'A' && gameState.chosenSuit) {
                    gameToasts.showAceEffect(
                      gameState.chosenSuit as any,
                      player.name,
                    );
                    effect = `Changed suit to ${gameState.chosenSuit}`;
                  } else if (cardPlayed.rank === 'J') {
                    // Jack skips next player - show toast
                    console.log(
                      '[Jack Debug] Showing Jack effect for opponent:',
                      {
                        playerName: player.name,
                        playerId: playerId,
                        clientPlayerId: get().playerId,
                        shouldShowAsOpponent: playerId !== get().playerId,
                      },
                    );

                    // SAFEGUARD: Double-check that this is actually an opponent
                    // Don't show if player name suggests it's the current player
                    if (
                      player.name !== 'You' &&
                      player.name !==
                        get().gameState?.players?.find(
                          p => p.id === get().playerId,
                        )?.name
                    ) {
                      gameToasts.showJackEffect(1, player.name);
                    } else {
                      console.log(
                        '[Jack Debug] Prevented showing opponent toast for own play',
                      );
                    }
                    effect = 'Next player skipped';
                  } else if (cardPlayed.rank === '8') {
                    // 8 reverses direction - show toast
                    if (
                      player.name !== 'You' &&
                      player.name !==
                        get().gameState?.players?.find(
                          p => p.id === get().playerId,
                        )?.name
                    ) {
                      gameToasts.show8sEffect(gameState.direction, player.name);
                    }
                    const directionText =
                      gameState.direction === 1
                        ? 'clockwise'
                        : 'counter-clockwise';
                    effect = `Direction reversed to ${directionText}`;
                  }

                  gameToasts.showOpponentMove(player.name, cardDisplay, effect);
                } else {
                  gameToasts.showOpponentMove(player.name, cardDisplay);
                }
              }
            }

            set({
              gameState,
              serverGameState: gameState,
              message:
                playerId === get().playerId
                  ? 'Card played!'
                  : `${playerId} played a card`,
            });
          });

          socket.on('cards-played', ({ playerId, cardIds, gameState }) => {
            logCardPlay(
              playerId,
              cardIds,
              true,
              `Server confirmed ${cardIds.length} cards played`,
            );

            // Show toast for opponent multiple card plays
            if (playerId !== get().playerId) {
              const player = gameState.players.find(
                (p: any) => p.id === playerId,
              );
              if (player) {
                const cardCount = cardIds.length;
                gameToasts.showOpponentMove(
                  player.name,
                  `${cardCount} cards of same rank`,
                  `Multiple card play (${cardCount}x)`,
                );
              }
            }

            set({
              gameState,
              serverGameState: gameState,
              message:
                playerId === get().playerId
                  ? `${cardIds.length} cards played!`
                  : `${playerId} played ${cardIds.length} cards`,
            });
          });

          socket.on('card-drawn', ({ playerId, gameState }) => {
            logNetwork(`Card drawn by ${playerId}`, 'success', { gameState });

            // Show toast for penalty served notifications
            if (playerId !== get().playerId) {
              const oldGameState = get().gameState;
              const player = gameState.players.find(
                (p: any) => p.id === playerId,
              );

              if (player && oldGameState) {
                const oldPlayerData = oldGameState.players.find(
                  (p: any) => p.id === playerId,
                );
                const cardsDrawn =
                  player.hand.length - (oldPlayerData?.hand.length || 0);

                // Check if this was a penalty draw (multiple cards)
                if (
                  cardsDrawn > 1 ||
                  (oldGameState.penaltyState?.active && cardsDrawn >= 1)
                ) {
                  gameToasts.showPenaltyServed(player.name, cardsDrawn);
                } else if (cardsDrawn === 1) {
                  // Regular card draw - show simple notification
                  gameToasts.showOpponentMove(player.name, 'Drew a card');
                }
              }
            }

            set({
              gameState,
              serverGameState: gameState,
              message:
                playerId === get().playerId
                  ? 'Card drawn!'
                  : `${playerId} drew a card`,
            });
          });

          socket.on('game-finished', ({ winner, gameState }) => {
            logGame('Game finished', { winner, gameState });

            // Show game end toast - winner is a Player object, not an ID
            const isYou = winner.id === get().playerId;
            const winnerName = winner.name;

            gameToasts.showGameEnd(winnerName, isYou);

            set({
              gameState,
              serverGameState: gameState,
              message: isYou ? 'You won! 🎉' : `${winnerName} won the game!`,
            });

            // Clear toasts after a delay to let the game end toast show
            setTimeout(() => {
              useUIStore.getState().clearToastsOnGameEnd();
            }, 6000);
          });

          // Connection timeout
          setTimeout(() => {
            if (get().connectionStatus !== 'connected') {
              socket.disconnect();
              resolve(false);
            }
          }, 5000);
        });
      } catch (error) {
        logNetwork('Failed to connect to local server', 'error', error);
        set({
          socket: null,
          connectionStatus: 'offline',
          message: 'Failed to connect to game server',
        });
        return false;
      }
    },

    createRoom: async (playerName: string, maxPlayers = 4) => {
      const socket = get().socket;
      if (!socket) {
        set({ message: 'Not connected to server' });
        return false;
      }

      return new Promise<boolean>(resolve => {
        console.log('[Room Debug] Creating room...', {
          playerName,
          maxPlayers,
        });
        set({ isLoading: true, message: 'Creating room...' });

        const timeout = setTimeout(() => {
          set({
            isLoading: false,
            message: 'Room creation timed out. Please try again.',
          });
          resolve(false);
        }, 10000);

        socket.emit('create-room', { playerName, maxPlayers });

        const handleRoomCreated = (data: any) => {
          clearTimeout(timeout);
          console.log('[Room Debug] Room created successfully', data);

          // DEBUG: Track playerId change during room creation
          const oldPlayerId = get().playerId;
          console.log('[Jack Debug] Room created - playerId changing:', {
            from: oldPlayerId,
            to: data.player.id,
          });

          set({
            roomCode: data.room.code,
            playerId: data.player.id,
            isHost: true,
            connectedPlayers: { [data.player.id]: data.player },
            isLoading: false,
            message: `Room ${data.room.code} created! Waiting for players...`,
          });
          socket.off('room-created', handleRoomCreated);
          socket.off('error', handleError);
          resolve(true);
        };

        const handleError = (error: any) => {
          clearTimeout(timeout);
          console.log('[Room Debug] Room creation failed', error);
          set({
            isLoading: false,
            message: error.message || 'Failed to create room',
          });
          socket.off('room-created', handleRoomCreated);
          socket.off('error', handleError);
          resolve(false);
        };

        socket.once('room-created', handleRoomCreated);
        socket.once('error', handleError);
      });
    },

    joinRoom: async (roomCode: string, playerName: string) => {
      const socket = get().socket;
      if (!socket) {
        set({ message: 'Not connected to server' });
        return false;
      }

      return new Promise<boolean>(resolve => {
        console.log('[Room Debug] Joining room...', { roomCode, playerName });
        set({ isLoading: true, message: `Joining room ${roomCode}...` });

        const timeout = setTimeout(() => {
          set({
            isLoading: false,
            message:
              'Join room timed out. Please check the room code and try again.',
          });
          resolve(false);
        }, 10000);

        socket.emit('join-room', {
          roomCode: roomCode.toUpperCase(),
          playerName,
        });

        const handleRoomJoined = (data: any) => {
          clearTimeout(timeout);
          console.log('[Room Debug] Room joined successfully', data);

          // DEBUG: Track playerId change during room joining
          const oldPlayerId = get().playerId;
          console.log('[Jack Debug] Room joined - playerId changing:', {
            from: oldPlayerId,
            to: data.player.id,
          });

          set({
            roomCode: data.room.code,
            playerId: data.player.id,
            isHost: false,
            connectedPlayers: data.room.players.reduce((acc: any, p: any) => {
              acc[p.id] = p;
              return acc;
            }, {}),
            isLoading: false,
            message: `Joined room ${data.room.code}! Waiting for game to start...`,
          });
          socket.off('room-joined', handleRoomJoined);
          socket.off('error', handleError);
          resolve(true);
        };

        const handleError = (error: any) => {
          clearTimeout(timeout);
          console.log('[Room Debug] Join room failed', error);
          set({
            isLoading: false,
            message:
              error.message ||
              'Failed to join room. Please check the room code.',
          });
          socket.off('room-joined', handleRoomJoined);
          socket.off('error', handleError);
          resolve(false);
        };

        socket.once('room-joined', handleRoomJoined);
        socket.once('error', handleError);
      });
    },

    restartGame: () => {
      // Clear any existing toasts from previous game
      useUIStore.getState().clearAllToasts();

      set({ isLoading: true });
      setTimeout(() => {
        // Restart using WebSocket-first approach
        get().setupWebSocketGame();
      }, 500);
    },

    leaveRoom: () => {
      return new Promise<boolean>(resolve => {
        const { socket, roomCode, playerId } = get();

        if (!socket || !roomCode) {
          console.warn('Cannot leave room: no socket connection or room code');
          resolve(false);
          return;
        }

        logNetwork('leave-room', 'pending', { roomCode, playerId });
        set({
          isLoading: true,
          message: 'Leaving room...',
        });

        // Set up response handlers
        const handleLeftRoom = (response: {
          success: boolean;
          roomCode?: string;
          error?: string;
        }) => {
          socket.off('left-room', handleLeftRoom);

          if (response.success) {
            logNetwork('leave-room', 'success', {
              roomCode: response.roomCode,
            });

            // Reset game state to menu
            set({
              gameState: null,
              serverGameState: null,
              isLoading: false,
              playerId: '',
              message: 'Left room successfully',
              roomCode: null,
              isHost: false,
              selectedCards: [],
              selectionMode: 'none',
              cardSelectionOrder: {},
              pendingActions: [],
              optimisticUpdates: [],
              currentAction: null,
              dragState: { isDragging: false, draggedCards: [] },
              recentMoves: [],
              penaltyState: { active: false, cards: 0, type: null },
              connectedPlayers: {},
              spectators: [],
              connectionStatus: 'connected',
              gameMode: 'normal' as GameMode,
            });
            resolve(true);
          } else {
            logNetwork('leave-room', 'error', { error: response.error });
            set({
              isLoading: false,
              message: response.error || 'Failed to leave room',
            });
            resolve(false);
          }
        };

        socket.on('left-room', handleLeftRoom);

        // Request to leave room
        socket.emit('leave-room');

        // Timeout fallback
        setTimeout(() => {
          socket.off('left-room', handleLeftRoom);
          if (get().isLoading) {
            logNetwork('leave-room', 'error', { reason: 'timeout' });
            set({
              isLoading: false,
              message: 'Leave room request timed out',
            });
            resolve(false);
          }
        }, 5000);
      });
    },

    updateMessage: (message: string) => {
      set({ message });
    },

    selectCard: (cardId: string) => {
      const { gameState, playerId, selectedCards, cardSelectionOrder } = get();

      if (!gameState) {
        return;
      }

      const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentTurnPlayer.id !== playerId || gameState.phase === 'finished') {
        get().updateMessage(
          gameState.phase === 'finished'
            ? 'Game is finished!'
            : "It's not your turn!",
        );
        return;
      }

      const player = gameState.players.find(p => p.id === playerId);
      if (!player) return;

      const isCurrentlySelected = selectedCards.includes(cardId);

      if (isCurrentlySelected) {
        // Deselect card
        const newSelection = selectedCards.filter(id => id !== cardId);
        const newOrder = { ...cardSelectionOrder };
        delete newOrder[cardId];

        set({
          selectedCards: newSelection,
          cardSelectionOrder: newOrder,
          selectionMode: newSelection.length > 0 ? 'selecting' : 'none',
          message: `Card deselected. ${newSelection.length} cards selected.`,
        });
      } else {
        // Select card - validate same rank if multiple cards selected
        const cardToSelect = player.hand.find(c => c.id === cardId);
        if (!cardToSelect) return;

        if (selectedCards.length > 0) {
          const firstSelectedCard = player.hand.find(
            c => c.id === selectedCards[0],
          );
          if (
            firstSelectedCard &&
            firstSelectedCard.rank !== cardToSelect.rank
          ) {
            get().updateMessage('Can only select cards of the same rank!');
            return;
          }
        }

        const newSelectedCards = [...selectedCards, cardId];
        const selectionOrder = newSelectedCards.length; // 1, 2, 3, etc.
        console.log('🎯 New selection after select:', newSelectedCards);

        set({
          selectedCards: newSelectedCards,
          cardSelectionOrder: {
            ...cardSelectionOrder,
            [cardId]: selectionOrder,
          },
          selectionMode: 'selecting',
          message: `${getCardDisplayName(cardToSelect)} selected (#${selectionOrder}). ${newSelectedCards.length} cards selected.`,
        });
      }
    },

    clearSelection: () => {
      set({
        selectedCards: [],
        selectionMode: 'none',
        cardSelectionOrder: {},
        message: 'Selection cleared.',
      });
    },

    playSelectedCards: async () => {
      const { gameState, selectedCards, connectionStatus, playerId } = get();
      if (!gameState || selectedCards.length === 0) {
        logValidation('play-cards', false, { reason: 'No cards selected' });
        return false;
      }

      // Validate it's the current player's turn
      const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentTurnPlayer.id !== playerId || gameState.phase === 'finished') {
        const reason =
          gameState.phase === 'finished'
            ? 'Game is finished'
            : 'Not current player turn';
        logValidation('turn-check', false, {
          reason,
          currentPlayerId: currentTurnPlayer.id,
          playerId,
        });
        get().updateMessage(
          gameState.phase === 'finished'
            ? 'Game is finished!'
            : "It's not your turn!",
        );
        return false;
      }

      logTurn(playerId, `Attempting to play ${selectedCards.length} cards`, {
        cardIds: selectedCards,
      });

      if (connectionStatus !== 'connected') {
        const { reconnectAttempts, maxReconnectAttempts } = get();
        let errorMessage = 'Not connected to game server';

        switch (connectionStatus) {
          case 'connecting':
            errorMessage = 'Connecting to server... Please wait';
            break;
          case 'reconnecting':
            errorMessage = `Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})`;
            break;
          case 'offline':
            if (reconnectAttempts >= maxReconnectAttempts) {
              errorMessage =
                'Connection failed. Try the reconnect button in the top-right corner';
            } else {
              errorMessage = 'Connection lost. Attempting to reconnect...';
            }
            break;
        }

        get().updateMessage(errorMessage);

        // Show user-friendly toast for connection issues
        import('../utils/toastUtils').then(({ gameToasts }) => {
          gameToasts.showInfo('Cannot Play Card', errorMessage, 4000);
        });

        return false;
      }

      // WebSocket-only mode with optimistic updates
      const actionId = get().createPendingAction('play-cards', selectedCards);

      // Apply optimistic update for immediate UI feedback
      get().applyOptimisticUpdate(actionId, selectedCards);

      // Check for Ace plays that need suit selection BEFORE sending to server
      if (selectedCards.length === 1) {
        const cardId = selectedCards[0];
        const player = gameState.players.find(p => p.id === playerId);
        const card = player?.hand.find(c => c.id === cardId);

        if (card?.rank === 'A') {
          logNetwork(
            `Ace detected - opening suit selection for ${card.rank}${card.suit}`,
            'pending',
          );
          get().openSuitSelection(cardId);
          return true; // Don't send to server yet - wait for suit selection
        }
      }

      // Send WebSocket message to server
      const socket = get().socket;
      if (socket) {
        if (selectedCards.length === 1) {
          const cardId = selectedCards[0];
          logNetwork(`Playing single card ${cardId} via WebSocket`, 'pending');
          socket.emit('play-card', { cardId });
        } else {
          logNetwork(
            `Playing ${selectedCards.length} cards via WebSocket`,
            'pending',
            { cardIds: selectedCards },
          );
          socket.emit('play-cards', { cardIds: selectedCards });
        }

        // Clear selection after sending
        get().clearSelection();
      } else {
        // Fallback for missing socket
        logNetwork('No socket available, using fallback confirmation', 'error');
        setTimeout(() => {
          get().confirmAction(actionId, get().gameState!);
        }, 1000);
      }

      return true;
    },

    playCardsLocally: (cardIds: string[]) => {
      const { gameState, playerId } = get();
      if (!gameState) {
        logValidation('local-play', false, { reason: 'No game state' });
        return false;
      }

      try {
        const player = gameState.players.find(p => p.id === playerId);
        if (!player) {
          logValidation('local-play', false, {
            reason: 'Player not found',
            playerId,
          });
          return false;
        }

        // Get cards in selection order
        const orderedCards = cardIds
          .map(id => player.hand.find(c => c.id === id))
          .filter(Boolean);

        if (orderedCards.length === 0) {
          logValidation('local-play', false, {
            reason: 'No valid cards found',
            cardIds,
          });
          return false;
        }

        logGame(`Local play: ${orderedCards.length} cards`, {
          cardNames: orderedCards.map(c => getCardDisplayName(c!)),
          playerId,
        });

        // Validate all cards can be played (same rank)
        const firstCard = orderedCards[0];
        if (!GameEngine.isValidPlay(gameState, firstCard!)) {
          get().updateMessage(`Cannot play ${getCardDisplayName(firstCard!)}!`);
          return false;
        }

        // Validate all selected cards are the same rank
        const firstRank = firstCard!.rank;
        const invalidCards = orderedCards.filter(
          card => card!.rank !== firstRank,
        );
        if (invalidCards.length > 0) {
          get().updateMessage(`All selected cards must be the same rank!`);
          return false;
        }

        // Handle Ace suit selection for single Ace plays
        if (orderedCards.length === 1 && firstCard!.rank === 'A') {
          get().openSuitSelection(firstCard!.id);
          return true; // Return true but don't actually play yet
        }

        // Use GameEngine to play cards sequentially to handle trick card effects
        let currentGameState = { ...gameState };
        for (const card of orderedCards) {
          try {
            currentGameState = GameEngine.playCard(
              currentGameState,
              playerId,
              card!.id,
            );
          } catch (error) {
            logValidation('local-play', false, {
              reason: 'GameEngine.playCard failed',
              error: error instanceof Error ? error.message : String(error),
              cardId: card!.id,
            });
            get().updateMessage(
              `Cannot play ${getCardDisplayName(card!)}: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`,
            );
            return false;
          }
        }

        const cardNames = orderedCards
          .map(card => getCardDisplayName(card!))
          .join(', ');
        const hasJacks = orderedCards.some(card => card?.rank === 'J');
        const jackCount = orderedCards.filter(
          card => card?.rank === 'J',
        ).length;
        const message = hasJacks
          ? orderedCards.length === 1
            ? `${cardNames} played! Next player skipped.`
            : `${orderedCards.length} cards played: ${cardNames}. ${jackCount} skip${jackCount > 1 ? 's' : ''} added!`
          : orderedCards.length === 1
            ? `${cardNames} played!`
            : `${orderedCards.length} cards played: ${cardNames}`;

        set({
          gameState: currentGameState,
          gameMode: currentGameState.gameMode,
          penaltyState: currentGameState.penaltyState,
          selectedCards: [],
          selectionMode: 'none',
          cardSelectionOrder: {},
          message,
        });

        const moveType = hasJacks ? 'played Jack' : 'played card';
        const moveDescription = hasJacks
          ? orderedCards.length === 1
            ? `${cardNames} (skip)`
            : `${orderedCards.length} cards (${cardNames}) - ${jackCount} skip${jackCount > 1 ? 's' : ''}`
          : orderedCards.length === 1
            ? `${cardNames}`
            : `${orderedCards.length} cards (${cardNames})`;
        get().addRecentMove('You', moveType, moveDescription);

        logCardPlay(
          playerId,
          cardIds,
          true,
          `Played ${orderedCards.length} cards locally`,
        );

        // Check for win condition first
        if (currentGameState.phase === 'finished') {
          const winner = currentGameState.winner;
          console.log('🏆 GAME FINISHED!', { winner, playerId });
          get().updateMessage(
            winner?.id === playerId ? 'You won! 🎉' : `${winner?.name} wins!`,
          );
          get().addRecentMove(
            'Game',
            winner?.id === playerId ? 'You won!' : `${winner?.name} won!`,
          );
        } else {
          // Handle AI turn if needed
          const nextPlayer =
            currentGameState.players[currentGameState.currentPlayerIndex];
          if (nextPlayer.id !== playerId) {
            setTimeout(() => get().executeComputerTurn(), 1000);
          }
        }

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Invalid move!';
        logCardPlay(playerId, cardIds, false, errorMessage);
        get().updateMessage(errorMessage);
        return false;
      }
    },

    drawCard: async () => {
      const { gameState, playerId, connectionStatus } = get();
      if (!gameState) return false;

      const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentTurnPlayer.id !== playerId) {
        get().updateMessage("It's not your turn!");
        return false;
      }

      // Check connection status
      if (connectionStatus !== 'connected') {
        const { reconnectAttempts, maxReconnectAttempts } = get();
        let errorMessage = 'Not connected to game server';

        switch (connectionStatus) {
          case 'connecting':
            errorMessage = 'Connecting to server... Please wait';
            break;
          case 'reconnecting':
            errorMessage = `Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})`;
            break;
          case 'offline':
            if (reconnectAttempts >= maxReconnectAttempts) {
              errorMessage =
                'Connection failed. Try the reconnect button in the top-right corner';
            } else {
              errorMessage = 'Connection lost. Attempting to reconnect...';
            }
            break;
        }

        get().updateMessage(errorMessage);

        // Show user-friendly toast for connection issues
        import('../utils/toastUtils').then(({ gameToasts }) => {
          gameToasts.showInfo('Cannot Draw Card', errorMessage, 4000);
        });

        return false;
      }

      try {
        // Use WebSocket if available
        const socket = get().socket;
        if (socket) {
          logNetwork('Drawing card via WebSocket', 'pending');
          socket.emit('draw-card');
          return true;
        }

        // Fallback to local processing (for backwards compatibility)
        const action = {
          type: 'draw-card' as const,
          playerId,
          timestamp: new Date(),
        };

        const updatedGameState = GameEngine.processAction(gameState, action);

        set({
          gameState: updatedGameState,
          gameMode: updatedGameState.gameMode,
          penaltyState: updatedGameState.penaltyState,
          message: 'Card drawn!',
        });

        get().addRecentMove('You', 'drew a card');

        // Handle AI turn
        const nextPlayer =
          updatedGameState.players[updatedGameState.currentPlayerIndex];
        if (nextPlayer.id !== playerId) {
          setTimeout(() => get().executeComputerTurn(), 1000);
        }

        return true;
      } catch (error) {
        get().updateMessage(
          error instanceof Error ? error.message : 'Cannot draw card!',
        );
        return false;
      }
    },

    startDrag: (cardIds: string[]) => {
      logGame(`Starting drag with ${cardIds.length} cards`, { cardIds });
      set({
        dragState: {
          isDragging: true,
          draggedCards: cardIds,
        },
      });
    },

    endDrag: () => {
      logGame('Ending drag');
      set({
        dragState: {
          isDragging: false,
          draggedCards: [],
        },
      });
    },

    dropCards: async (cardIds: string[]) => {
      logGame(`Dropping ${cardIds.length} cards on discard pile`, { cardIds });

      // Update selection to match dragged cards
      set({
        selectedCards: cardIds,
        selectionMode: cardIds.length > 0 ? 'selecting' : 'none',
      });

      // Play the dropped cards
      const result = await get().playSelectedCards();

      // Always end the drag state after attempting to play cards
      get().endDrag();

      if (result) {
        logGame('Drop successful - cards played');
      } else {
        logGame('Drop failed - cards not played');
      }

      return result;
    },

    // Network actions (stubs for now)
    setConnectionStatus: (status: ConnectionStatus) => {
      const prevStatus = get().connectionStatus;
      console.log(
        `[Connection Debug] Status change: ${prevStatus} → ${status}`,
      );
      set({ connectionStatus: status });
    },

    setRoomCode: (code: string | null) => {
      set({ roomCode: code });

      // Save or clear room session based on code presence
      if (code) {
        get().saveRoomSession();
      } else {
        get().clearRoomSession();
      }
    },

    setIsHost: (isHost: boolean) => {
      set({ isHost });
    },

    addPlayer: (player: PlayerInfo) => {
      set(state => ({
        connectedPlayers: {
          ...state.connectedPlayers,
          [player.id]: player,
        },
      }));
    },

    removePlayer: (playerId: string) => {
      set(state => {
        const newPlayers = { ...state.connectedPlayers };
        delete newPlayers[playerId];
        return { connectedPlayers: newPlayers };
      });
    },

    updatePlayer: (playerId: string, updates: Partial<PlayerInfo>) => {
      set(state => ({
        connectedPlayers: {
          ...state.connectedPlayers,
          [playerId]: {
            ...state.connectedPlayers[playerId],
            ...updates,
          },
        },
      }));
    },

    // Reconnection management
    startReconnection: () => {
      const state = get();
      if (state.reconnectTimeoutId) {
        clearTimeout(state.reconnectTimeoutId);
      }

      const attemptReconnection = () => {
        const currentState = get();
        if (currentState.connectionStatus === 'connected') {
          return; // Already connected, stop trying
        }

        if (
          currentState.reconnectAttempts >= currentState.maxReconnectAttempts
        ) {
          set({
            connectionStatus: 'offline',
            reconnectTimeoutId: null,
          });
          // Show toast about max attempts reached
          import('../utils/toastUtils').then(({ gameToasts }) => {
            gameToasts.showInfo(
              'Connection Failed',
              `Unable to reconnect after ${currentState.maxReconnectAttempts} attempts. Try manual reconnection.`,
              8000,
            );
          });
          return;
        }

        console.log(
          `[Connection Debug] Attempting reconnection ${currentState.reconnectAttempts + 1}/${currentState.maxReconnectAttempts}`,
        );
        set(state => ({
          connectionStatus: 'reconnecting',
          reconnectAttempts: state.reconnectAttempts + 1,
        }));

        // Try to reconnect
        if (currentState.roomCode && currentState.socket) {
          currentState.socket.connect();
        } else if (currentState.roomCode) {
          // Try to establish new socket connection
          currentState.setupWebSocketGame();
        }

        // Schedule next attempt with exponential backoff
        const delay = Math.min(
          1000 * Math.pow(2, currentState.reconnectAttempts),
          30000,
        );
        const timeoutId = setTimeout(attemptReconnection, delay);
        set({ reconnectTimeoutId: timeoutId });
      };

      // Start first attempt immediately
      attemptReconnection();
    },

    stopReconnection: () => {
      const state = get();
      if (state.reconnectTimeoutId) {
        clearTimeout(state.reconnectTimeoutId);
        set({ reconnectTimeoutId: null });
      }
    },

    manualReconnect: () => {
      const state = get();

      // Try to load saved room session if no current room
      if (!state.roomCode) {
        const sessionLoaded = get().loadRoomSession();
        if (!sessionLoaded) {
          // Show toast about no saved session
          import('../utils/toastUtils').then(({ gameToasts }) => {
            gameToasts.showInfo(
              'No Saved Game',
              'No game session to restore. Start a new game from the menu.',
              6000,
            );
          });
          return;
        }
      }

      // Reset attempts and try again
      set({
        reconnectAttempts: 0,
        connectionStatus: 'connecting',
      });

      if (state.roomCode && state.socket) {
        state.socket.connect();
      } else {
        state.setupWebSocketGame();
      }

      // Show feedback toast
      import('../utils/toastUtils').then(({ gameToasts }) => {
        gameToasts.showInfo(
          'Reconnecting...',
          'Attempting to restore connection',
        );
      });
    },

    resetReconnectionState: () => {
      const state = get();
      if (state.reconnectTimeoutId) {
        clearTimeout(state.reconnectTimeoutId);
      }
      set({
        reconnectAttempts: 0,
        reconnectTimeoutId: null,
        lastDisconnectTime: null,
      });
    },

    // Room persistence management
    saveRoomSession: () => {
      const { roomCode, playerId, isHost } = get();
      if (roomCode && playerId) {
        const sessionData = {
          roomCode,
          playerId,
          isHost,
          timestamp: Date.now(),
        };

        try {
          localStorage.setItem(
            'switch-game-session',
            JSON.stringify(sessionData),
          );
          logNetwork('Room session saved', 'success', sessionData);
        } catch (error) {
          logNetwork('Failed to save room session', 'error', error);
        }
      }
    },

    loadRoomSession: () => {
      try {
        const sessionData = localStorage.getItem('switch-game-session');
        if (!sessionData) return false;

        const parsed = JSON.parse(sessionData);
        const { roomCode, playerId, isHost, timestamp } = parsed;

        // Check if session is not too old (30 minutes)
        if (Date.now() - timestamp > 30 * 60 * 1000) {
          get().clearRoomSession();
          return false;
        }

        // Restore session data
        set({
          roomCode,
          playerId,
          isHost,
        });

        logNetwork('Room session loaded', 'success', {
          roomCode,
          playerId,
          isHost,
        });
        return true;
      } catch (error) {
        logNetwork('Failed to load room session', 'error', error);
        get().clearRoomSession();
        return false;
      }
    },

    clearRoomSession: () => {
      try {
        localStorage.removeItem('switch-game-session');
        logNetwork('Room session cleared', 'success');
      } catch (error) {
        logNetwork('Failed to clear room session', 'error', error);
      }
    },

    syncWithServer: (serverState: GameState) => {
      logNetwork('sync-state', 'success', {
        phase: serverState.phase,
        currentPlayer: serverState.currentPlayerIndex,
      });

      set({
        gameState: serverState,
        serverGameState: serverState,
      });
    },

    // Async action management
    createPendingAction: (type: PendingAction['type'], cardIds?: string[]) => {
      const actionId = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const { playerId } = get();

      const pendingAction: PendingAction = {
        id: actionId,
        type,
        playerId,
        ...(cardIds && { cardIds }),
        timestamp: new Date(),
        status: 'pending',
        retryCount: 0,
      };

      logNetwork(`create-${type}`, 'pending', {
        actionId,
        cardIds: cardIds?.length || 0,
      });

      set(state => ({
        pendingActions: [...state.pendingActions, pendingAction],
        currentAction: pendingAction,
      }));

      return actionId;
    },

    updateActionStatus: (
      actionId: string,
      status: ActionStatus,
      error?: string,
    ) => {
      // Only log network actions for non-idle statuses
      if (status !== 'idle') {
        logNetwork(`update-action-${actionId.slice(-6)}`, status, { error });
      }

      set(state => ({
        pendingActions: state.pendingActions.map(action =>
          action.id === actionId ? { ...action, status, error } : action,
        ),
        currentAction:
          state.currentAction?.id === actionId
            ? { ...state.currentAction, status, error }
            : state.currentAction,
      }));
    },

    confirmAction: (actionId: string, serverState: GameState) => {
      const { pendingActions } = get();
      const action = pendingActions.find(a => a.id === actionId);

      if (!action) {
        debugLogger.warn(
          'network',
          `Cannot confirm unknown action: ${actionId}`,
        );
        return;
      }

      logNetwork(`confirm-${action.type}`, 'success', {
        actionId: actionId.slice(-6),
        cardIds: action.cardIds,
      });

      // Remove confirmed action and related optimistic updates
      set(state => ({
        pendingActions: state.pendingActions.filter(a => a.id !== actionId),
        optimisticUpdates: state.optimisticUpdates.filter(
          u => u.actionId !== actionId,
        ),
        currentAction:
          state.currentAction?.id === actionId ? null : state.currentAction,
        gameState: serverState,
        serverGameState: serverState,
      }));
    },

    rollbackAction: (actionId: string) => {
      const { pendingActions, optimisticUpdates } = get();
      const action = pendingActions.find(a => a.id === actionId);
      const optimisticUpdate = optimisticUpdates.find(
        u => u.actionId === actionId,
      );

      if (!action) {
        debugLogger.warn(
          'network',
          `Cannot rollback unknown action: ${actionId}`,
        );
        return;
      }

      logNetwork(`rollback-${action.type}`, 'error', {
        actionId: actionId.slice(-6),
        error: action.error,
      });

      // Restore original state if we have an optimistic update
      const updates: any = {
        pendingActions: pendingActions.filter(a => a.id !== actionId),
        optimisticUpdates: optimisticUpdates.filter(
          u => u.actionId !== actionId,
        ),
        currentAction: null,
      };

      if (optimisticUpdate) {
        updates.gameState = optimisticUpdate.originalState;
      }

      set(state => ({ ...state, ...updates }));
    },

    // Optimistic updates
    applyOptimisticUpdate: (actionId: string, cardIds?: string[]) => {
      const { gameState, playerId } = get();
      if (!gameState || !cardIds) return;

      try {
        // Create optimistic state by simulating the action
        let optimisticState = { ...gameState };

        for (const cardId of cardIds) {
          const action = {
            type: 'play-card' as const,
            playerId,
            cardId,
            timestamp: new Date(),
          };
          optimisticState = GameEngine.processAction(optimisticState, action);
        }

        const updateId = `update-${actionId}`;
        const optimisticUpdate: OptimisticUpdate = {
          id: updateId,
          actionId,
          type: 'play-card',
          timestamp: new Date(),
          originalState: gameState,
          optimisticState,
          cardIds,
        };

        debugLogger.debug('game', 'Applied optimistic update', {
          updateId: updateId.slice(-6),
          cardIds,
          originalHandSize: gameState.players.find(p => p.id === playerId)?.hand
            .length,
          optimisticHandSize: optimisticState.players.find(
            p => p.id === playerId,
          )?.hand.length,
        });

        set(state => ({
          gameState: optimisticState,
          optimisticUpdates: [...state.optimisticUpdates, optimisticUpdate],
        }));
      } catch (error) {
        debugLogger.error('game', 'Failed to apply optimistic update', {
          actionId,
          cardIds,
          error,
        });
      }
    },

    confirmOptimisticUpdate: (updateId: string) => {
      logNetwork(`confirm-optimistic-${updateId.slice(-6)}`, 'success');

      set(state => ({
        optimisticUpdates: state.optimisticUpdates.filter(
          u => u.id !== updateId,
        ),
      }));
    },

    rollbackOptimisticUpdate: (updateId: string) => {
      const { optimisticUpdates } = get();
      const update = optimisticUpdates.find(u => u.id === updateId);

      if (!update) {
        debugLogger.warn(
          'game',
          `Cannot rollback unknown optimistic update: ${updateId}`,
        );
        return;
      }

      logNetwork(`rollback-optimistic-${updateId.slice(-6)}`, 'error');

      set(state => ({
        gameState: update.originalState,
        optimisticUpdates: state.optimisticUpdates.filter(
          u => u.id !== updateId,
        ),
      }));
    },

    addRecentMove: (player: string, action: string, details?: string) => {
      const move = {
        timestamp: new Date(),
        player,
        action,
        ...(details && { details }),
      };

      set(state => ({
        recentMoves: [move, ...state.recentMoves].slice(0, 6),
      }));
    },

    toggleRecentMoves: () => {
      set(state => ({
        showRecentMoves: !state.showRecentMoves,
      }));
    },

    servePenalty: async (playerId: string) => {
      const { gameState } = get();
      if (!gameState) return false;

      try {
        const penaltyCards = gameState.penaltyState.cards;
        console.log('🚨 SERVING PENALTY:', {
          playerId,
          penaltyCards,
          type: gameState.penaltyState.type,
        });

        const updatedGameState = GameEngine.servePenalty(gameState, playerId);
        console.log('🚨 PENALTY SERVED:', {
          playerId,
          cardsDrawn: penaltyCards,
          newHandSize: updatedGameState.players.find(p => p.id === playerId)
            ?.hand.length,
          penaltyActive: updatedGameState.penaltyState.active,
        });
        set({
          gameState: updatedGameState,
          gameMode: updatedGameState.gameMode,
          penaltyState: updatedGameState.penaltyState,
          message: `Penalty served! Drew ${penaltyCards} cards.`,
        });

        get().addRecentMove(
          playerId === get().playerId ? 'You' : 'Computer',
          'served penalty',
          `${penaltyCards} cards`,
        );

        // Handle AI turn after penalty is served
        if (updatedGameState.phase !== 'finished') {
          const nextPlayer =
            updatedGameState.players[updatedGameState.currentPlayerIndex];
          if (nextPlayer.id !== get().playerId) {
            setTimeout(() => get().executeComputerTurn(), 1500);
          }
        }

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to serve penalty';
        get().updateMessage(errorMessage);
        return false;
      }
    },

    openSuitSelection: (cardId: string) => {
      set({
        suitSelectionOpen: true,
        pendingAceCardId: cardId,
      });
    },

    closeSuitSelection: () => {
      const { pendingAceCardId, pendingActions, optimisticUpdates } = get();

      // If we have a pending Ace card, we need to rollback the optimistic update
      if (pendingAceCardId) {
        // Find the pending action that was created for this Ace play
        const aceAction = pendingActions.find(
          action =>
            action.type === 'play-cards' &&
            action.cardIds?.includes(pendingAceCardId),
        );

        if (aceAction) {
          // Rollback the action (this will also rollback related optimistic updates)
          get().rollbackAction(aceAction.id);
          logNetwork(
            `Ace play cancelled - rolled back action ${aceAction.id.slice(-6)}`,
            'error',
          );
        } else {
          // Fallback: look for optimistic updates related to this card
          const aceUpdate = optimisticUpdates.find(update =>
            update.cardIds?.includes(pendingAceCardId),
          );
          if (aceUpdate) {
            get().rollbackOptimisticUpdate(aceUpdate.id);
            logNetwork(
              `Ace play cancelled - rolled back optimistic update ${aceUpdate.id.slice(-6)}`,
              'error',
            );
          }
        }

        // Restore the card selection since the play was cancelled
        set({
          selectedCards: [pendingAceCardId],
          selectionMode: 'ready',
          cardSelectionOrder: { [pendingAceCardId]: 1 },
          message: 'Ace play cancelled - card remains selected',
        });
      }

      set({
        suitSelectionOpen: false,
        pendingAceCardId: null,
      });
    },

    selectSuit: async (suit: Suit) => {
      const { pendingAceCardId, socket } = get();
      if (!pendingAceCardId || !socket) return false;

      try {
        logNetwork(`Playing Ace with chosen suit: ${suit}`, 'pending');

        // Send Ace play to server with chosen suit
        socket.emit('play-card', {
          cardId: pendingAceCardId,
          chosenSuit: suit,
        });

        // Close suit selection - server will respond with game state update
        get().closeSuitSelection();

        // Clear any selected cards since we just played
        set({
          selectedCards: [],
          selectionMode: 'none',
          cardSelectionOrder: {},
          message: `Playing Ace with ${suit} suit...`,
        });

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to play Ace';
        get().updateMessage(errorMessage);
        get().closeSuitSelection();
        return false;
      }
    },

    executeComputerTurn: () => {
      const { gameState } = get();
      if (!gameState) return;

      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentPlayer.id === get().playerId) return; // Not computer's turn

      console.log('🤖 COMPUTER TURN START:', {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        penaltyActive: gameState.penaltyState.active,
        penaltyType: gameState.penaltyState.type,
        penaltyCards: gameState.penaltyState.cards,
      });

      try {
        // Check if penalty needs to be served first
        if (
          gameState.penaltyState.active &&
          gameState.penaltyState.type === '2s'
        ) {
          console.log('🤖 COMPUTER FACING 2s PENALTY:', {
            penaltyCards: gameState.penaltyState.cards,
            playerId: currentPlayer.id,
          });
          const playableCards = GameEngine.getPlayableCards(
            gameState,
            currentPlayer.id,
          );

          // Check if computer has any 2s to play
          const has2s = playableCards.some(card => card.rank === '2');
          const available2s = playableCards.filter(card => card.rank === '2');

          console.log('🤖 COMPUTER 2s CHECK:', {
            has2s,
            available2s: available2s.map(c => c.id),
            totalPlayableCards: playableCards.length,
          });

          if (!has2s) {
            console.log('🤖 COMPUTER NO 2s - SERVING PENALTY');
            // Computer must serve penalty
            const updatedGameState = GameEngine.servePenalty(
              gameState,
              currentPlayer.id,
            );
            const penaltyCards = gameState.penaltyState.cards;

            set({
              gameState: updatedGameState,
              gameMode: updatedGameState.gameMode,
              penaltyState: updatedGameState.penaltyState,
              message: `${currentPlayer.name} served penalty (${penaltyCards} cards)`,
            });

            get().addRecentMove(
              currentPlayer.name,
              'served penalty',
              `${penaltyCards} cards`,
            );

            // Continue with next AI turn if needed
            if (updatedGameState.phase !== 'finished') {
              const nextPlayer =
                updatedGameState.players[updatedGameState.currentPlayerIndex];
              if (nextPlayer.id !== get().playerId) {
                setTimeout(() => get().executeComputerTurn(), 1500);
              }
            }
            return;
          }
        }

        const playableCards = GameEngine.getPlayableCards(
          gameState,
          currentPlayer.id,
        );

        console.log('🤖 COMPUTER NORMAL TURN:', {
          playableCards: playableCards.length,
          penaltyActive: gameState.penaltyState.active,
        });

        if (playableCards.length > 0) {
          // Computer plays a random valid card
          const randomCard =
            playableCards[Math.floor(Math.random() * playableCards.length)];

          console.log('🤖 COMPUTER PLAYING CARD:', {
            cardId: randomCard.id,
            rank: randomCard.rank,
            suit: randomCard.suit,
          });

          // AI suit selection for Aces
          let chosenSuit: Suit | undefined;
          if (randomCard.rank === 'A') {
            // Smart suit selection: choose suit with most cards in hand
            const suitCounts = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
            currentPlayer.hand.forEach(card => {
              suitCounts[card.suit]++;
            });

            // Find suit with highest count
            let bestSuit: Suit = 'hearts';
            let maxCount = suitCounts.hearts;

            if (suitCounts.diamonds > maxCount) {
              bestSuit = 'diamonds';
              maxCount = suitCounts.diamonds;
            }
            if (suitCounts.clubs > maxCount) {
              bestSuit = 'clubs';
              maxCount = suitCounts.clubs;
            }
            if (suitCounts.spades > maxCount) {
              bestSuit = 'spades';
            }

            chosenSuit = bestSuit;
          }

          const action = {
            type: 'play-card' as const,
            playerId: currentPlayer.id,
            cardId: randomCard.id,
            chosenSuit,
            timestamp: new Date(),
          };

          const updatedGameState = GameEngine.processAction(gameState, action);

          set({
            gameState: updatedGameState,
            gameMode: updatedGameState.gameMode,
            penaltyState: updatedGameState.penaltyState,
            message:
              randomCard.rank === 'A'
                ? `${currentPlayer.name} played ${getCardDisplayName(randomCard)} (suit changed to ${chosenSuit})`
                : randomCard.rank === 'J'
                  ? `${currentPlayer.name} played ${getCardDisplayName(randomCard)} (next player skipped)`
                  : `${currentPlayer.name} played ${getCardDisplayName(randomCard)}`,
          });

          get().addRecentMove(
            currentPlayer.name,
            randomCard.rank === 'A'
              ? 'played Ace'
              : randomCard.rank === 'J'
                ? 'played Jack'
                : 'played card',
            randomCard.rank === 'A'
              ? `${getCardDisplayName(randomCard)} → ${chosenSuit}`
              : randomCard.rank === 'J'
                ? `${getCardDisplayName(randomCard)} (skip)`
                : getCardDisplayName(randomCard),
          );

          if (updatedGameState.phase === 'finished') {
            const winner = updatedGameState.winner;
            get().updateMessage(
              winner?.id === get().playerId
                ? 'You won! 🎉'
                : `${winner?.name} wins!`,
            );
          } else {
            // Check if the next player is also an AI
            const nextPlayer =
              updatedGameState.players[updatedGameState.currentPlayerIndex];
            if (nextPlayer.id !== get().playerId) {
              setTimeout(() => get().executeComputerTurn(), 1500);
            }
          }
        } else {
          // Computer draws a card
          const action = {
            type: 'draw-card' as const,
            playerId: currentPlayer.id,
            timestamp: new Date(),
          };

          const updatedGameState = GameEngine.processAction(gameState, action);

          set({
            gameState: updatedGameState,
            gameMode: updatedGameState.gameMode,
            penaltyState: updatedGameState.penaltyState,
            message: `${currentPlayer.name} drew a card`,
          });

          get().addRecentMove(currentPlayer.name, 'drew a card');

          // Check if the next player is also an AI after drawing
          if (updatedGameState.phase !== 'finished') {
            const nextPlayer =
              updatedGameState.players[updatedGameState.currentPlayerIndex];
            if (nextPlayer.id !== get().playerId) {
              setTimeout(() => get().executeComputerTurn(), 1500);
            }
          }
        }
      } catch (error) {
        console.error('Computer turn error:', error);
      }
    },
  })),
);
