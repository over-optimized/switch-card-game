import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GameState, GameEngine, DeckManager, createGameState, createPlayer } from 'switch-shared';
import { 
  ConnectionStatus, 
  GameMode, 
  DragState, 
  PenaltyState, 
  RecentMove, 
  OptimisticUpdate,
  PlayerInfo,
} from './types';

interface GameStore {
  // Core game state
  gameState: GameState | null;
  serverGameState: GameState | null; // Authoritative server state
  isLoading: boolean;
  playerId: string;
  message: string;
  
  // Network state
  connectionStatus: ConnectionStatus;
  roomCode: string | null;
  isHost: boolean;
  connectedPlayers: Record<string, PlayerInfo>;
  spectators: PlayerInfo[];
  
  // Game flow
  gameMode: GameMode;
  penaltyState: PenaltyState;
  
  // UI state
  selectedCards: string[];
  selectionMode: 'none' | 'selecting' | 'ready';
  selectionSequence: number;
  cardSelectionOrder: Record<string, number>;
  dragState: DragState;
  
  // History and debugging
  recentMoves: RecentMove[];
  showRecentMoves: boolean;
  
  // Networking specific
  pendingActions: Array<{ type: string; data: any; timestamp: Date }>;
  optimisticUpdates: OptimisticUpdate[];
  
  // Actions - Local game management
  setupLocalGame: () => void;
  restartGame: () => void;
  updateMessage: (message: string) => void;
  
  // Actions - Card interactions
  selectCard: (cardId: string) => void;
  clearSelection: () => void;
  playSelectedCards: () => Promise<boolean>;
  playCardsLocally: (cardIds: string[]) => boolean;
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
  
  // Actions - State synchronization
  syncWithServer: (serverState: GameState) => void;
  playCardOptimistically: (cardId: string) => void;
  confirmOptimisticUpdate: (updateId: string) => void;
  rollbackOptimisticUpdate: (updateId: string) => void;
  
  // Actions - History
  addRecentMove: (player: string, action: string, details?: string) => void;
  toggleRecentMoves: () => void;
  
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
    connectionStatus: 'offline',
    roomCode: null,
    isHost: false,
    connectedPlayers: {},
    spectators: [],
    
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
    selectionSequence: 0,
    cardSelectionOrder: {},
    dragState: {
      isDragging: false,
      draggedCards: [],
    },
    
    // History
    recentMoves: [],
    showRecentMoves: false,
    
    // Network
    pendingActions: [],
    optimisticUpdates: [],
    
    // Actions
    setupLocalGame: () => {
      try {
        const players = [
          createPlayer('player-1', 'You'),
          createPlayer('player-2', 'Computer'),
        ];

        const gameState = createGameState('local-game', players, []);
        const startedGame = GameEngine.startGame(gameState);
        const topCard = DeckManager.getTopDiscardCard(startedGame);

        set({
          isLoading: false,
          gameState: startedGame,
          message: 'Game started! Select cards to play them.',
          recentMoves: [{
            timestamp: new Date(),
            player: 'Game',
            action: 'Game started',
            ...(topCard && { details: `Starting card: ${topCard.rank}${topCard.suit}` }),
          }],
          selectedCards: [],
          selectionMode: 'none',
          cardSelectionOrder: {},
        });
      } catch (error) {
        set({
          isLoading: false,
          message: `Error starting game: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    },

    restartGame: () => {
      set({ isLoading: true });
      setTimeout(() => {
        get().setupLocalGame();
      }, 500);
    },

    updateMessage: (message: string) => {
      set({ message });
    },

    selectCard: (cardId: string) => {
      const { gameState, playerId, selectedCards, cardSelectionOrder } = get();
      if (!gameState) return;

      const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentTurnPlayer.id !== playerId || gameState.phase === 'finished') {
        get().updateMessage(gameState.phase === 'finished' ? 'Game is finished!' : "It's not your turn!");
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
          const firstSelectedCard = player.hand.find(c => c.id === selectedCards[0]);
          if (firstSelectedCard && firstSelectedCard.rank !== cardToSelect.rank) {
            get().updateMessage('Can only select cards of the same rank!');
            return;
          }
        }

        const newSequence = get().selectionSequence + 1;
        set({
          selectedCards: [...selectedCards, cardId],
          selectionSequence: newSequence,
          cardSelectionOrder: {
            ...cardSelectionOrder,
            [cardId]: newSequence,
          },
          selectionMode: 'selecting',
          message: `${cardToSelect.rank}${cardToSelect.suit} selected (#${newSequence}). ${selectedCards.length + 1} cards selected.`,
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
      const { gameState, selectedCards, connectionStatus } = get();
      if (!gameState || selectedCards.length === 0) return false;

      if (connectionStatus === 'connected') {
        // Network mode - will be implemented later
        return false;
      } else {
        // Local mode
        return get().playCardsLocally(selectedCards);
      }
    },

    playCardsLocally: (cardIds: string[]) => {
      const { gameState, playerId } = get();
      if (!gameState) return false;

      try {
        // Implementation similar to current main.ts logic
        // This is simplified - full implementation would match current card playing logic
        const player = gameState.players.find(p => p.id === playerId);
        if (!player) return false;

        // Get cards in selection order
        const orderedCards = cardIds
          .map(id => player.hand.find(c => c.id === id))
          .filter(Boolean);

        if (orderedCards.length === 0) return false;

        // Validate and play first card
        const firstCard = orderedCards[0];
        if (!GameEngine.isValidPlay(gameState, firstCard!)) {
          get().updateMessage(`Cannot play ${firstCard!.rank}${firstCard!.suit}!`);
          return false;
        }

        // For now, just play the first card - full multi-card logic would be implemented here
        const action = {
          type: 'play-card' as const,
          playerId,
          cardId: firstCard!.id,
          timestamp: new Date(),
        };

        const updatedGameState = GameEngine.processAction(gameState, action);
        
        set({
          gameState: updatedGameState,
          selectedCards: [],
          selectionMode: 'none',
          cardSelectionOrder: {},
          message: `${firstCard!.rank}${firstCard!.suit} played!`,
        });

        get().addRecentMove('You', 'played card', `${firstCard!.rank}${firstCard!.suit}`);

        // Handle AI turn if needed
        if (updatedGameState.phase !== 'finished') {
          const nextPlayer = updatedGameState.players[updatedGameState.currentPlayerIndex];
          if (nextPlayer.id !== playerId) {
            setTimeout(() => get().executeComputerTurn(), 1000);
          }
        }

        return true;
      } catch (error) {
        get().updateMessage(error instanceof Error ? error.message : 'Invalid move!');
        return false;
      }
    },

    drawCard: async () => {
      const { gameState, playerId } = get();
      if (!gameState) return false;

      const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentTurnPlayer.id !== playerId) {
        get().updateMessage("It's not your turn!");
        return false;
      }

      try {
        const action = {
          type: 'draw-card' as const,
          playerId,
          timestamp: new Date(),
        };

        const updatedGameState = GameEngine.processAction(gameState, action);
        
        set({
          gameState: updatedGameState,
          message: 'Card drawn!',
        });

        get().addRecentMove('You', 'drew a card');

        // Handle AI turn
        const nextPlayer = updatedGameState.players[updatedGameState.currentPlayerIndex];
        if (nextPlayer.id !== playerId) {
          setTimeout(() => get().executeComputerTurn(), 1000);
        }

        return true;
      } catch (error) {
        get().updateMessage(error instanceof Error ? error.message : 'Cannot draw card!');
        return false;
      }
    },

    startDrag: (cardIds: string[]) => {
      set({
        dragState: {
          isDragging: true,
          draggedCards: cardIds,
        },
      });
    },

    endDrag: () => {
      set({
        dragState: {
          isDragging: false,
          draggedCards: [],
        },
      });
    },

    dropCards: async (cardIds: string[]) => {
      // Update selection to match dragged cards
      set({
        selectedCards: cardIds,
        selectionMode: cardIds.length > 0 ? 'selecting' : 'none',
      });
      
      return get().playSelectedCards();
    },

    // Network actions (stubs for now)
    setConnectionStatus: (status: ConnectionStatus) => {
      set({ connectionStatus: status });
    },

    setRoomCode: (code: string | null) => {
      set({ roomCode: code });
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

    syncWithServer: (serverState: GameState) => {
      set({
        gameState: serverState,
        serverGameState: serverState,
      });
    },

    playCardOptimistically: (cardId: string) => {
      // Optimistic update implementation - stub for now
      console.log('Optimistic update for card:', cardId);
    },

    confirmOptimisticUpdate: (updateId: string) => {
      // Confirm optimistic update - stub for now
      console.log('Confirming optimistic update:', updateId);
    },

    rollbackOptimisticUpdate: (updateId: string) => {
      // Rollback optimistic update - stub for now
      console.log('Rolling back optimistic update:', updateId);
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

    executeComputerTurn: () => {
      const { gameState } = get();
      if (!gameState) return;

      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentPlayer.id === get().playerId) return; // Not computer's turn

      try {
        const playableCards = GameEngine.getPlayableCards(gameState, currentPlayer.id);

        if (playableCards.length > 0) {
          // Computer plays a random valid card
          const randomCard = playableCards[Math.floor(Math.random() * playableCards.length)];
          const action = {
            type: 'play-card' as const,
            playerId: currentPlayer.id,
            cardId: randomCard.id,
            timestamp: new Date(),
          };

          const updatedGameState = GameEngine.processAction(gameState, action);
          
          set({
            gameState: updatedGameState,
            message: `${currentPlayer.name} played ${randomCard.rank}${randomCard.suit}`,
          });

          get().addRecentMove(currentPlayer.name, 'played card', `${randomCard.rank}${randomCard.suit}`);

          if (updatedGameState.phase === 'finished') {
            const winner = updatedGameState.winner;
            get().updateMessage(
              winner?.id === get().playerId ? 'You won! 🎉' : `${winner?.name} wins!`
            );
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
            message: `${currentPlayer.name} drew a card`,
          });

          get().addRecentMove(currentPlayer.name, 'drew a card');
        }
      } catch (error) {
        console.error('Computer turn error:', error);
      }
    },
  })),
);