import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Socket } from 'socket.io-client';
import { useGameStore } from './gameStore';
import { createPlayer } from '../../../shared/src/types/player';
import { createGameState } from '../../../shared/src/types/game';
import { createCard } from '../../../shared/src/types/card';
import { gameToasts } from '../utils/toastUtils';

// Mock toastUtils to capture the card display
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
  getCardDisplayString: vi.fn((rank: string, suit: string) => {
    // Return exact format to check what's being passed
    const suitSymbols: Record<string, string> = {
      hearts: '♥️',
      diamonds: '♦️',
      clubs: '♣️',
      spades: '♠️',
    };
    return `${rank}${suitSymbols[suit] || suit}`;
  }),
  isTrickCard: vi.fn(() => false),
}));

// Mock socket
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

describe('Card Display Bug Fix', () => {
  beforeEach(() => {
    // Reset store
    useGameStore.setState({
      socket: null,
      playerId: null,
      gameState: null,
      serverGameState: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display the correct card that was actually played (not previous discard)', () => {
    // Set up game state
    const currentPlayerId = 'player-1';
    const opponentPlayerId = 'computer';

    useGameStore.setState({
      socket: mockSocket,
      playerId: currentPlayerId,
    });

    const players = [
      createPlayer(currentPlayerId, 'Player'),
      createPlayer(opponentPlayerId, 'Computer'),
    ];

    // Create initial game state with a 7♠ on discard pile
    const initialGameState = createGameState('test-game', players, []);
    initialGameState.discardPile = [createCard('7', 'spades', '7s')];

    // Set initial state in store
    useGameStore.setState({ gameState: initialGameState });

    // Create new game state with 3♣ as the newly played card
    const newGameState = { ...initialGameState };
    newGameState.discardPile = [
      createCard('7', 'spades', '7s'), // Previous card (was on pile)
      createCard('3', 'clubs', '3c'), // Newly played card (should be shown in toast)
    ];

    // Get the card-played event handler from the mock socket
    const socketOnMock = mockSocket.on as vi.Mock;
    const cardPlayedCall = socketOnMock.mock.calls.find(
      call => call[0] === 'card-played',
    );

    if (cardPlayedCall) {
      const handler = cardPlayedCall[1];

      // Simulate computer playing 3♣
      handler({
        playerId: opponentPlayerId,
        cardId: '3c',
        gameState: newGameState,
      });
    }

    // Verify the toast shows the CORRECT card (3♣, not 7♠)
    expect(gameToasts.showOpponentMove).toHaveBeenCalledWith(
      'Computer',
      '3♣️',
      expect.any(String),
    );

    // Verify it's NOT showing the wrong card (previous discard)
    expect(gameToasts.showOpponentMove).not.toHaveBeenCalledWith(
      'Computer',
      '7♠️',
      expect.any(String),
    );
  });

  it('should show correct card for different suits and ranks', () => {
    const currentPlayerId = 'player-1';
    const opponentPlayerId = 'computer';

    useGameStore.setState({
      socket: mockSocket,
      playerId: currentPlayerId,
    });

    const players = [
      createPlayer(currentPlayerId, 'Player'),
      createPlayer(opponentPlayerId, 'Computer'),
    ];

    // Test multiple scenarios with different cards
    const testCases = [
      {
        previous: createCard('K', 'hearts', 'Kh'),
        played: createCard('A', 'diamonds', 'Ad'),
        expectedDisplay: 'A♦️',
      },
      {
        previous: createCard('2', 'clubs', '2c'),
        played: createCard('Q', 'spades', 'Qs'),
        expectedDisplay: 'Q♠️',
      },
      {
        previous: createCard('J', 'diamonds', 'Jd'),
        played: createCard('5', 'hearts', '5h'),
        expectedDisplay: '5♥️',
      },
    ];

    testCases.forEach(({ previous, played, expectedDisplay }, _index) => {
      // Clear previous calls
      vi.clearAllMocks();

      // Set up initial state with previous card
      const initialGameState = createGameState('test-game', players, []);
      initialGameState.discardPile = [previous];
      useGameStore.setState({ gameState: initialGameState });

      // Create new state with played card
      const newGameState = { ...initialGameState };
      newGameState.discardPile = [previous, played];

      const socketOnMock = mockSocket.on as vi.Mock;
      const cardPlayedCall = socketOnMock.mock.calls.find(
        call => call[0] === 'card-played',
      );

      if (cardPlayedCall) {
        const handler = cardPlayedCall[1];

        handler({
          playerId: opponentPlayerId,
          cardId: played.id,
          gameState: newGameState,
        });
      }

      // Verify correct card is displayed
      expect(gameToasts.showOpponentMove).toHaveBeenCalledWith(
        'Computer',
        expectedDisplay,
        expect.any(String),
      );
    });
  });

  it('should handle empty discard pile gracefully', () => {
    const currentPlayerId = 'player-1';
    const opponentPlayerId = 'computer';

    useGameStore.setState({
      socket: mockSocket,
      playerId: currentPlayerId,
    });

    const players = [
      createPlayer(currentPlayerId, 'Player'),
      createPlayer(opponentPlayerId, 'Computer'),
    ];

    // Empty initial state
    const initialGameState = createGameState('test-game', players, []);
    initialGameState.discardPile = [];
    useGameStore.setState({ gameState: initialGameState });

    // New state with first card
    const newGameState = { ...initialGameState };
    newGameState.discardPile = [createCard('K', 'clubs', 'Kc')];

    const socketOnMock = mockSocket.on as vi.Mock;
    const cardPlayedCall = socketOnMock.mock.calls.find(
      call => call[0] === 'card-played',
    );

    if (cardPlayedCall) {
      const handler = cardPlayedCall[1];

      handler({
        playerId: opponentPlayerId,
        cardId: 'Kc',
        gameState: newGameState,
      });
    }

    // Should show the first card played
    expect(gameToasts.showOpponentMove).toHaveBeenCalledWith(
      'Computer',
      'K♣️',
      expect.any(String),
    );
  });
});
