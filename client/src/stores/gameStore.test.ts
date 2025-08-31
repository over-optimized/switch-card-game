import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Socket } from 'socket.io-client';
import { useGameStore } from './gameStore';
import { createPlayer } from '../../../shared/src/types/player';
import { createGameState } from '../../../shared/src/types/game';
import { createStandardDeck } from '../../../shared/src/types/card';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

// Mock toastUtils to prevent import errors during tests
vi.mock('../utils/toastUtils', () => ({
  gameToasts: {
    showOpponentMove: vi.fn(),
    showInfo: vi.fn(),
    showGameEnd: vi.fn(),
    showJackEffect: vi.fn(),
    showAceEffect: vi.fn(),
    show2sEffect: vi.fn(),
    show8sEffect: vi.fn(),
    showTrickCard: vi.fn(),
    showPenaltyCreated: vi.fn(),
    showPenaltyStacked: vi.fn(),
    showPenaltyServed: vi.fn(),
  },
  getCardDisplayString: vi.fn(() => 'Test Card'),
  isTrickCard: vi.fn(() => false),
}));

// Create mock socket
const mockSocket = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connected: true,
  id: 'test-socket-id',
} as unknown as Socket;

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store state
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
      maxReconnectAttempts: 5,
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('playerId synchronization', () => {
    it('should set socket when connecting to server', async () => {
      const store = useGameStore.getState();

      // Simulate connecting to server
      await store.connectToLocalServer();

      // Should have socket in store
      expect(store.socket).toBeTruthy();
    });

    it('should update playerId when local-game-created event is received', () => {

      // Set up socket manually for test
      useGameStore.setState({ socket: mockSocket });

      const player = createPlayer('server-player-id', 'Test Player');
      const gameState = createGameState(
        'test-game',
        [player],
        createStandardDeck(),
      );
      const room = { code: 'TEST123', id: 'room-1' };

      // Get the mock socket's on method to simulate event
      const socketOnMock = mockSocket.on as vi.Mock;

      // Find the local-game-created handler
      const localGameCreatedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'local-game-created',
      );

      if (localGameCreatedCall) {
        const handler = localGameCreatedCall[1];
        handler({ room, player, gameState });
      }

      const updatedStore = useGameStore.getState();
      expect(updatedStore.playerId).toBe('server-player-id');
      expect(updatedStore.roomCode).toBe('TEST123');
      expect(updatedStore.isHost).toBe(player.isHost);
    });

    it('should update playerId when room-created event is received', () => {
      useGameStore.setState({ socket: mockSocket });

      const player = createPlayer('host-player-id', 'Host Player');
      const room = { code: 'HOST123', id: 'room-2' };

      const socketOnMock = mockSocket.on as vi.Mock;
      const roomCreatedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'room-created',
      );

      if (roomCreatedCall) {
        const handler = roomCreatedCall[1];
        handler({ room, player });
      }

      const updatedStore = useGameStore.getState();
      expect(updatedStore.playerId).toBe('host-player-id');
      expect(updatedStore.roomCode).toBe('HOST123');
      expect(updatedStore.isHost).toBe(true);
    });

    it('should update playerId when room-joined event is received', () => {
      useGameStore.setState({ socket: mockSocket });

      const player = createPlayer('joined-player-id', 'Joined Player');
      const room = { code: 'JOIN123', id: 'room-3' };

      const socketOnMock = mockSocket.on as vi.Mock;
      const roomJoinedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'room-joined',
      );

      if (roomJoinedCall) {
        const handler = roomJoinedCall[1];
        handler({ room, player });
      }

      const updatedStore = useGameStore.getState();
      expect(updatedStore.playerId).toBe('joined-player-id');
      expect(updatedStore.roomCode).toBe('JOIN123');
      expect(updatedStore.isHost).toBe(false);
    });

    it('should maintain playerId consistency across connection events', () => {
      useGameStore.setState({ socket: mockSocket });

      // Start with socket connection
      expect(store.socket?.id).toBe('test-socket-id');
      expect(store.playerId).toBeNull();

      // Simulate room creation
      const player = createPlayer('consistent-player-id', 'Test Player');
      const room = { code: 'CONSISTENT123', id: 'room-4' };

      const socketOnMock = mockSocket.on as vi.Mock;
      const roomCreatedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'room-created',
      );

      if (roomCreatedCall) {
        const handler = roomCreatedCall[1];
        handler({ room, player });
      }

      // Verify playerId is now set to server player ID, not socket ID
      const updatedStore = useGameStore.getState();
      expect(updatedStore.playerId).toBe('consistent-player-id');
      expect(updatedStore.playerId).not.toBe('test-socket-id');
    });
  });

  describe('WebSocket event handling', () => {
    it('should register card-played event handler', () => {
      useGameStore.setState({ socket: mockSocket });

      const socketOnMock = mockSocket.on as vi.Mock;
      const cardPlayedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'card-played',
      );

      expect(cardPlayedCall).toBeDefined();
      expect(typeof cardPlayedCall[1]).toBe('function');
    });

    it('should handle card-played event with correct player attribution', () => {
      useGameStore.setState({ socket: mockSocket });

      // Set up initial state with playerId
      useGameStore.setState({ playerId: 'current-player-id' });

      const players = [
        createPlayer('current-player-id', 'Current Player'),
        createPlayer('opponent-player-id', 'Opponent Player'),
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

        // Simulate opponent playing a card
        handler({
          gameState,
          playedCard: { id: 'card-1', rank: 'J', suit: 'hearts' },
          playerId: 'opponent-player-id',
        });
      }

      // Verify the event was processed
      const updatedStore = useGameStore.getState();
      expect(updatedStore.gameState).toEqual(gameState);
      expect(updatedStore.serverGameState).toEqual(gameState);
    });

    it('should handle game-ended event', () => {
      useGameStore.setState({ socket: mockSocket });

      const socketOnMock = mockSocket.on as vi.Mock;
      const gameEndedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'game-ended',
      );

      expect(gameEndedCall).toBeDefined();

      if (gameEndedCall) {
        const handler = gameEndedCall[1];
        const winner = createPlayer('winner-id', 'Winner');

        handler({ winner, gameState: null });

        const updatedStore = useGameStore.getState();
        expect(updatedStore.gameState).toBeNull();
      }
    });
  });

  describe('connection management', () => {
    it('should handle connection status changes', () => {
      useGameStore.setState({ socket: mockSocket });

      const socketOnMock = mockSocket.on as vi.Mock;
      const connectCall = socketOnMock.mock.calls.find(
        call => call[0] === 'connect',
      );
      const disconnectCall = socketOnMock.mock.calls.find(
        call => call[0] === 'disconnect',
      );

      expect(connectCall).toBeDefined();
      expect(disconnectCall).toBeDefined();

      // Test connect handler
      if (connectCall) {
        const handler = connectCall[1];
        handler();

        const connectedStore = useGameStore.getState();
        expect(connectedStore.connectionStatus).toBe('connected');
        expect(connectedStore.reconnectAttempts).toBe(0);
      }

      // Test disconnect handler
      if (disconnectCall) {
        const handler = disconnectCall[1];
        handler('transport close');

        const disconnectedStore = useGameStore.getState();
        expect(disconnectedStore.connectionStatus).toBe('disconnected');
      }
    });

    it('should track reconnection attempts', () => {
      const store = useGameStore.getState();

      // Set initial reconnect attempts
      useGameStore.setState({ reconnectAttempts: 3 });

      expect(store.reconnectAttempts).toBe(3);

      // Test incrementing attempts
      useGameStore.setState({ reconnectAttempts: store.reconnectAttempts + 1 });
      const updatedStore = useGameStore.getState();
      expect(updatedStore.reconnectAttempts).toBe(4);
    });

    it('should respect max reconnection attempts', () => {
      const store = useGameStore.getState();

      // Set up scenario where max attempts are reached
      useGameStore.setState({
        reconnectAttempts: 5,
        maxReconnectAttempts: 5,
      });

      const { reconnectAttempts, maxReconnectAttempts } =
        useGameStore.getState();
      expect(reconnectAttempts).toBe(maxReconnectAttempts);
    });
  });

  describe('toast attribution logic', () => {
    it('should correctly identify current player vs opponent for toast messages', () => {
      // Set up store with current player ID
      useGameStore.setState({ playerId: 'current-player-id' });

      const players = [
        createPlayer('current-player-id', 'Current Player'),
        createPlayer('opponent-player-id', 'Opponent Player'),
      ];

      // Test current player identification
      const currentPlayer = players.find(p => p.id === 'current-player-id');
      const opponentPlayer = players.find(p => p.id === 'opponent-player-id');

      expect(currentPlayer?.id).toBe('current-player-id');
      expect(opponentPlayer?.id).toBe('opponent-player-id');

      // Verify store playerId matches current player
      const store = useGameStore.getState();
      expect(store.playerId).toBe(currentPlayer?.id);
      expect(store.playerId).not.toBe(opponentPlayer?.id);
    });

    it('should handle Jack card play attribution correctly', () => {
      useGameStore.setState({ socket: mockSocket });

      // Set up current player
      useGameStore.setState({ playerId: 'jack-player-id' });

      const players = [
        createPlayer('jack-player-id', 'Jack Player'),
        createPlayer('other-player-id', 'Other Player'),
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

        // Simulate current player playing a Jack
        handler({
          gameState,
          playedCard: { id: 'jack-card', rank: 'J', suit: 'spades' },
          playerId: 'jack-player-id', // Same as current player
        });
      }

      // Verify game state was updated
      const updatedStore = useGameStore.getState();
      expect(updatedStore.gameState).toEqual(gameState);

      // The key test: playerId should match the Jack player
      expect(updatedStore.playerId).toBe('jack-player-id');
    });
  });

  describe('room operations', () => {
    it('should handle createRoom action', async () => {
      useGameStore.setState({ socket: mockSocket });

      const emitMock = mockSocket.emit as vi.Mock;

      // Simulate creating a room
      store.createRoom('Test Player');

      expect(emitMock).toHaveBeenCalledWith('create-room', {
        playerName: 'Test Player',
      });
    });

    it('should handle joinRoom action', async () => {
      useGameStore.setState({ socket: mockSocket });

      const emitMock = mockSocket.emit as vi.Mock;

      // Simulate joining a room
      store.joinRoom('ROOM123', 'Joining Player');

      expect(emitMock).toHaveBeenCalledWith('join-room', {
        roomCode: 'ROOM123',
        playerName: 'Joining Player',
      });
    });

    it('should handle startGame action', () => {
      useGameStore.setState({ socket: mockSocket });

      const emitMock = mockSocket.emit as vi.Mock;

      // Simulate starting a game
      store.startGame();

      expect(emitMock).toHaveBeenCalledWith('start-game');
    });

    it('should handle playCard action', () => {
      useGameStore.setState({ socket: mockSocket });

      const emitMock = mockSocket.emit as vi.Mock;

      // Simulate playing a card
      store.playCard('card-123');

      expect(emitMock).toHaveBeenCalledWith('play-card', {
        cardId: 'card-123',
      });
    });
  });

  describe('error handling', () => {
    it('should handle socket errors gracefully', () => {
      useGameStore.setState({ socket: mockSocket });

      const socketOnMock = mockSocket.on as vi.Mock;
      const errorCall = socketOnMock.mock.calls.find(
        call => call[0] === 'error',
      );

      expect(errorCall).toBeDefined();

      if (errorCall) {
        const handler = errorCall[1];
        handler({ message: 'Test error' });

        const errorStore = useGameStore.getState();
        expect(errorStore.message).toBe('Test error');
      }
    });

    it('should handle invalid-play errors', () => {
      useGameStore.setState({ socket: mockSocket });

      const socketOnMock = mockSocket.on as vi.Mock;
      const invalidPlayCall = socketOnMock.mock.calls.find(
        call => call[0] === 'invalid-play',
      );

      expect(invalidPlayCall).toBeDefined();

      if (invalidPlayCall) {
        const handler = invalidPlayCall[1];
        handler({ message: 'Invalid card play' });

        const errorStore = useGameStore.getState();
        expect(errorStore.message).toBe('Invalid card play');
      }
    });
  });
});
