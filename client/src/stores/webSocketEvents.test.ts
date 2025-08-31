import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Socket } from 'socket.io-client';
import { useGameStore } from './gameStore';
import { createPlayer } from '../../../shared/src/types/player';
import { createGameState } from '../../../shared/src/types/game';
import { createStandardDeck } from '../../../shared/src/types/card';
import { gameToasts } from '../utils/toastUtils';

// Mock toastUtils
vi.mock('../utils/toastUtils', () => ({
  gameToasts: {
    showOpponentMove: vi.fn(),
    showJackEffect: vi.fn(),
    showAceEffect: vi.fn(),
    show2sEffect: vi.fn(),
    show8sEffect: vi.fn(),
    showTrickCard: vi.fn(),
    showInfo: vi.fn(),
    showGameEnd: vi.fn(),
    showPenaltyCreated: vi.fn(),
    showPenaltyStacked: vi.fn(),
    showPenaltyServed: vi.fn(),
  },
  getCardDisplayString: vi.fn(
    (rank: string, suit: string) => `${rank}${suit[0]?.toUpperCase()}`,
  ),
  isTrickCard: vi.fn((rank: string) =>
    ['2', '3', '5', '7', '8', 'J', 'K', 'A'].includes(rank),
  ),
}));

// Mock socket.io-client
const mockSocket = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connected: true,
  id: 'socket-123',
} as unknown as Socket;

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

describe('WebSocket Event Handling', () => {
  beforeEach(() => {
    // Reset store
    useGameStore.setState({
      socket: null,
      playerId: null,
      isHost: false,
      roomCode: null,
      gameState: null,
      serverGameState: null,
      connectionStatus: 'disconnected',
      isLoading: false,
      message: '',
      reconnectAttempts: 0,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('card-played event attribution', () => {
    it('should NOT show opponent toast when current player plays a card', () => {
      const store = useGameStore.getState();
      store.setSocket(mockSocket);

      // Set up current player
      const currentPlayerId = 'current-player-123';
      useGameStore.setState({ playerId: currentPlayerId });

      const players = [
        createPlayer(currentPlayerId, 'Current Player'),
        createPlayer('opponent-456', 'Opponent'),
      ];
      const gameState = createGameState(
        'test-game',
        players,
        createStandardDeck(),
      );

      // Get the card-played event handler
      const socketOnMock = mockSocket.on as vi.Mock;
      const cardPlayedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'card-played',
      );

      expect(cardPlayedCall).toBeDefined();

      if (cardPlayedCall) {
        const handler = cardPlayedCall[1];

        // Simulate current player playing a Jack
        handler({
          gameState,
          playedCard: { id: 'jack-1', rank: 'J', suit: 'hearts' },
          playerId: currentPlayerId, // SAME as current player
        });
      }

      // Verify NO opponent toast was shown for current player's move
      expect(gameToasts.showOpponentMove).not.toHaveBeenCalled();
    });

    it('should show opponent toast when opponent plays a card', () => {
      const store = useGameStore.getState();
      store.setSocket(mockSocket);

      // Set up current player
      const currentPlayerId = 'current-player-123';
      const opponentPlayerId = 'opponent-456';
      useGameStore.setState({ playerId: currentPlayerId });

      const players = [
        createPlayer(currentPlayerId, 'Current Player'),
        createPlayer(opponentPlayerId, 'Opponent'),
      ];
      const gameState = createGameState(
        'test-game',
        players,
        createStandardDeck(),
      );

      // Get the card-played event handler
      const socketOnMock = mockSocket.on as vi.Mock;
      const cardPlayedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'card-played',
      );

      if (cardPlayedCall) {
        const handler = cardPlayedCall[1];

        // Simulate opponent playing a card
        handler({
          gameState,
          playedCard: { id: 'king-1', rank: 'K', suit: 'spades' },
          playerId: opponentPlayerId, // DIFFERENT from current player
        });
      }

      // Verify opponent toast WAS shown for opponent's move
      expect(gameToasts.showOpponentMove).toHaveBeenCalledWith(
        'Opponent',
        expect.stringContaining('K'),
        expect.any(String),
      );
    });

    it('should show correct Jack effect attribution for current player', () => {
      const store = useGameStore.getState();
      store.setSocket(mockSocket);

      const currentPlayerId = 'jack-player-789';
      useGameStore.setState({ playerId: currentPlayerId });

      const players = [
        createPlayer(currentPlayerId, 'Jack Player'),
        createPlayer('other-player-101', 'Other Player'),
      ];
      const gameState = createGameState(
        'test-game',
        players,
        createStandardDeck(),
      );
      gameState.players[0].hand = []; // Give current player 0 cards for Jack effect

      const socketOnMock = mockSocket.on as vi.Mock;
      const cardPlayedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'card-played',
      );

      if (cardPlayedCall) {
        const handler = cardPlayedCall[1];

        // Current player plays Jack
        handler({
          gameState,
          playedCard: { id: 'jack-spades', rank: 'J', suit: 'spades' },
          playerId: currentPlayerId,
        });
      }

      // Should show Jack effect WITHOUT "by [player]" attribution for current player
      expect(gameToasts.showJackEffect).toHaveBeenCalledWith(
        1, // skips remaining
        undefined, // No player name for current player's own actions
      );

      // Should NOT show opponent move toast
      expect(gameToasts.showOpponentMove).not.toHaveBeenCalled();
    });

    it('should show correct Jack effect attribution for opponent', () => {
      const store = useGameStore.getState();
      store.setSocket(mockSocket);

      const currentPlayerId = 'current-999';
      const opponentPlayerId = 'opponent-888';
      useGameStore.setState({ playerId: currentPlayerId });

      const players = [
        createPlayer(currentPlayerId, 'Current Player'),
        createPlayer(opponentPlayerId, 'Jack Opponent'),
      ];
      const gameState = createGameState(
        'test-game',
        players,
        createStandardDeck(),
      );

      const socketOnMock = mockSocket.on as vi.Mock;
      const cardPlayedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'card-played',
      );

      if (cardPlayedCall) {
        const handler = cardPlayedCall[1];

        // Opponent plays Jack
        handler({
          gameState,
          playedCard: { id: 'jack-clubs', rank: 'J', suit: 'clubs' },
          playerId: opponentPlayerId,
        });
      }

      // Should show Jack effect WITH player name for opponent
      expect(gameToasts.showJackEffect).toHaveBeenCalledWith(
        1,
        'Jack Opponent', // Include player name for opponent's actions
      );

      // Should ALSO show opponent move toast
      expect(gameToasts.showOpponentMove).toHaveBeenCalledWith(
        'Jack Opponent',
        expect.stringContaining('J'),
        expect.stringContaining('skip'),
      );
    });
  });

  describe('playerId synchronization edge cases', () => {
    it('should handle null playerId gracefully in card-played events', () => {
      const store = useGameStore.getState();
      store.setSocket(mockSocket);

      // No playerId set (null)
      useGameStore.setState({ playerId: null });

      const players = [
        createPlayer('player-1', 'Player 1'),
        createPlayer('player-2', 'Player 2'),
      ];
      const gameState = createGameState(
        'test-game',
        players,
        createStandardDeck(),
      );

      const socketOnMock = mockSocket.on as vi.Mock;
      const cardPlayedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'card-played',
      );

      if (cardPlayedCall) {
        const handler = cardPlayedCall[1];

        // Any player plays a card while playerId is null
        handler({
          gameState,
          playedCard: { id: 'any-card', rank: '7', suit: 'hearts' },
          playerId: 'player-1',
        });
      }

      // Should show as opponent move since playerId is null
      expect(gameToasts.showOpponentMove).toHaveBeenCalledWith(
        'Player 1',
        expect.stringContaining('7'),
        expect.any(String),
      );
    });

    it('should handle missing player in gameState gracefully', () => {
      const store = useGameStore.getState();
      store.setSocket(mockSocket);

      const currentPlayerId = 'current-player';
      useGameStore.setState({ playerId: currentPlayerId });

      const players = [
        createPlayer(currentPlayerId, 'Current Player'),
        createPlayer('other-player', 'Other Player'),
      ];
      const gameState = createGameState(
        'test-game',
        players,
        createStandardDeck(),
      );

      const socketOnMock = mockSocket.on as vi.Mock;
      const cardPlayedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'card-played',
      );

      if (cardPlayedCall) {
        const handler = cardPlayedCall[1];

        // Card played by player not in gameState
        handler({
          gameState,
          playedCard: { id: 'mystery-card', rank: 'A', suit: 'spades' },
          playerId: 'missing-player-id', // Not in gameState.players
        });
      }

      // Should handle gracefully - might show as 'Unknown Player' or similar
      expect(gameToasts.showOpponentMove).toHaveBeenCalled();
    });

    it('should maintain playerId consistency across multiple events', () => {
      const store = useGameStore.getState();
      store.setSocket(mockSocket);

      const playerId = 'consistent-player-id';
      const playerName = 'Consistent Player';

      // Start with room creation event
      const socketOnMock = mockSocket.on as vi.Mock;

      // Simulate room-created event
      const roomCreatedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'room-created',
      );
      if (roomCreatedCall) {
        const handler = roomCreatedCall[1];
        handler({
          room: { code: 'ROOM123', id: 'room-1' },
          player: createPlayer(playerId, playerName),
        });
      }

      // Verify playerId is set
      expect(useGameStore.getState().playerId).toBe(playerId);

      // Now simulate card-played event for same player
      const cardPlayedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'card-played',
      );
      if (cardPlayedCall) {
        const handler = cardPlayedCall[1];

        const gameState = createGameState(
          'test-game',
          [
            createPlayer(playerId, playerName),
            createPlayer('other-id', 'Other Player'),
          ],
          createStandardDeck(),
        );

        handler({
          gameState,
          playedCard: { id: 'test-card', rank: '9', suit: 'diamonds' },
          playerId: playerId, // Same as current player
        });
      }

      // Should NOT show opponent toast for consistent player
      expect(gameToasts.showOpponentMove).not.toHaveBeenCalled();

      // playerId should still be consistent
      expect(useGameStore.getState().playerId).toBe(playerId);
    });
  });

  describe('connection state impact on events', () => {
    it('should handle events when disconnected', () => {
      const store = useGameStore.getState();
      store.setSocket(mockSocket);

      // Set disconnected state
      useGameStore.setState({
        connectionStatus: 'disconnected',
        playerId: 'test-player',
      });

      const socketOnMock = mockSocket.on as vi.Mock;
      const cardPlayedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'card-played',
      );

      if (cardPlayedCall) {
        const handler = cardPlayedCall[1];

        const gameState = createGameState(
          'test-game',
          [
            createPlayer('test-player', 'Test Player'),
            createPlayer('other-player', 'Other Player'),
          ],
          createStandardDeck(),
        );

        // Event received while disconnected
        handler({
          gameState,
          playedCard: { id: 'disconnect-card', rank: 'Q', suit: 'hearts' },
          playerId: 'other-player',
        });
      }

      // Events should still be processed even when disconnected
      expect(useGameStore.getState().gameState).toBeTruthy();
    });

    it('should handle reconnection with playerId preservation', () => {
      const store = useGameStore.getState();
      store.setSocket(mockSocket);

      const originalPlayerId = 'preserved-player-id';
      useGameStore.setState({
        playerId: originalPlayerId,
        connectionStatus: 'disconnected',
      });

      const socketOnMock = mockSocket.on as vi.Mock;

      // Simulate reconnection
      const connectCall = socketOnMock.mock.calls.find(
        call => call[0] === 'connect',
      );
      if (connectCall) {
        const handler = connectCall[1];
        handler();
      }

      // playerId should be preserved across reconnection
      const reconnectedStore = useGameStore.getState();
      expect(reconnectedStore.playerId).toBe(originalPlayerId);
      expect(reconnectedStore.connectionStatus).toBe('connected');
      expect(reconnectedStore.reconnectAttempts).toBe(0);
    });
  });
});
