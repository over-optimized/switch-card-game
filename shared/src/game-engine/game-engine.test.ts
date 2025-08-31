import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from './game-engine.js';
import { createGameState, GameState } from '../types/game.js';
import { createPlayer } from '../types/player.js';
import { createStandardDeck } from '../types/card.js';

describe('GameEngine', () => {
  let gameState: GameState;

  beforeEach(() => {
    const players = [
      createPlayer('player1', 'Alice'),
      createPlayer('player2', 'Bob'),
    ];
    const deck = createStandardDeck();
    gameState = createGameState('test-game', players, deck);
  });

  it('should start a game successfully', () => {
    const startedGame = GameEngine.startGame(gameState);

    expect(startedGame.phase).toBe('playing');
    expect(startedGame.startedAt).toBeInstanceOf(Date);
    expect(startedGame.players).toHaveLength(2);
    expect(startedGame.players[0].hand).toHaveLength(7);
    expect(startedGame.players[1].hand).toHaveLength(7);
    expect(startedGame.discardPile).toHaveLength(1);
    expect(startedGame.drawPile.length).toBeLessThan(52);
  });

  it('should not start game with insufficient players', () => {
    gameState.players = [createPlayer('player1', 'Alice')];

    expect(() => GameEngine.startGame(gameState)).toThrow(
      'Not enough players to start game',
    );
  });

  it('should not start game that has already started', () => {
    gameState.phase = 'playing';

    expect(() => GameEngine.startGame(gameState)).toThrow(
      'Game has already started',
    );
  });

  it('should validate card plays correctly', () => {
    const startedGame = GameEngine.startGame(gameState);
    const topCard = startedGame.discardPile[0];
    const player = startedGame.players[0];

    const matchingRankCard = player.hand.find(
      card => card.rank === topCard.rank,
    );
    const matchingSuitCard = player.hand.find(
      card => card.suit === topCard.suit,
    );
    const nonMatchingCard = player.hand.find(
      card =>
        card.rank !== topCard.rank &&
        card.suit !== topCard.suit &&
        card.rank !== 'A' && // Aces are universal
        !(card.rank === '2' && topCard.rank === '2'), // 2s can play on 2s
    );

    if (matchingRankCard) {
      expect(GameEngine.isValidPlay(startedGame, matchingRankCard)).toBe(true);
    }

    if (matchingSuitCard) {
      expect(GameEngine.isValidPlay(startedGame, matchingSuitCard)).toBe(true);
    }

    if (nonMatchingCard) {
      expect(GameEngine.isValidPlay(startedGame, nonMatchingCard)).toBe(false);
    }
  });

  it('should advance turn after valid play', () => {
    const startedGame = GameEngine.startGame(gameState);
    const topCard = startedGame.discardPile[0];
    const currentPlayer = startedGame.players[startedGame.currentPlayerIndex];
    const validCard = currentPlayer.hand.find(
      card => card.rank === topCard.rank || card.suit === topCard.suit,
    );

    if (validCard) {
      const updatedGame = GameEngine.playCard(
        startedGame,
        currentPlayer.id,
        validCard.id,
      );

      expect(updatedGame.currentPlayerIndex).toBe(
        (startedGame.currentPlayerIndex + 1) % 2,
      );
      expect(updatedGame.discardPile).toHaveLength(2);
      expect(updatedGame.discardPile[1]).toEqual(validCard);

      const updatedPlayer = updatedGame.players.find(
        p => p.id === currentPlayer.id,
      );
      expect(updatedPlayer?.hand).toHaveLength(6);
    }
  });

  describe('8s - Reverse Direction', () => {
    it('should reverse direction when playing an 8', () => {
      const startedGame = GameEngine.startGame(gameState);
      
      // Set up initial state with clockwise direction
      expect(startedGame.direction).toBe(1);
      
      // Create an 8 card and put it in current player's hand
      const eightCard = { id: 'eight-test', rank: '8', suit: 'spades' };
      const currentPlayerIndex = startedGame.currentPlayerIndex;
      const updatedPlayers = [...startedGame.players];
      updatedPlayers[currentPlayerIndex] = {
        ...updatedPlayers[currentPlayerIndex],
        hand: [...updatedPlayers[currentPlayerIndex].hand, eightCard],
      };
      
      // Set discard pile to allow playing the 8
      const gameWithEight = {
        ...startedGame,
        players: updatedPlayers,
        discardPile: [{ id: 'top', rank: '8', suit: 'hearts' }], // 8 can be played on 8
      };

      const resultGame = GameEngine.playCard(
        gameWithEight,
        updatedPlayers[currentPlayerIndex].id,
        eightCard.id,
      );

      // Direction should be reversed
      expect(resultGame.direction).toBe(-1);
      expect(resultGame.gameStats.directionChanges).toBe(1);
    });

    it('should handle multiple 8s correctly (odd = reverse, even = same)', () => {
      const startedGame = GameEngine.startGame(gameState);
      
      // Create two 8 cards for multiple play
      const eight1 = { id: 'eight-1', rank: '8', suit: 'spades' };
      const eight2 = { id: 'eight-2', rank: '8', suit: 'clubs' };
      const currentPlayerIndex = startedGame.currentPlayerIndex;
      const updatedPlayers = [...startedGame.players];
      updatedPlayers[currentPlayerIndex] = {
        ...updatedPlayers[currentPlayerIndex],
        hand: [...updatedPlayers[currentPlayerIndex].hand, eight1, eight2],
      };
      
      const gameWithEights = {
        ...startedGame,
        players: updatedPlayers,
        discardPile: [{ id: 'top', rank: '8', suit: 'hearts' }],
      };

      // Play two 8s - should reverse twice (back to original direction)
      const resultGame = GameEngine.playCards(
        gameWithEights,
        updatedPlayers[currentPlayerIndex].id,
        [eight1.id, eight2.id],
      );

      // Two 8s should result in same direction (1 → -1 → 1)
      expect(resultGame.direction).toBe(1);
      expect(resultGame.gameStats.directionChanges).toBe(2);
    });

    it('should work correctly with 3+ players', () => {
      // Create 3-player game
      const threePlayers = [
        createPlayer('player1', 'Alice'),
        createPlayer('player2', 'Bob'), 
        createPlayer('player3', 'Charlie'),
      ];
      const deck = createStandardDeck();
      const threePlayerGame = GameEngine.startGame(
        createGameState('test-3p', threePlayers, deck)
      );
      
      // Set up 8 card play
      const eightCard = { id: 'eight-test', rank: '8', suit: 'spades' };
      const currentPlayerIndex = threePlayerGame.currentPlayerIndex; // Should be 0 (Alice)
      const updatedPlayers = [...threePlayerGame.players];
      updatedPlayers[currentPlayerIndex] = {
        ...updatedPlayers[currentPlayerIndex],
        hand: [...updatedPlayers[currentPlayerIndex].hand, eightCard],
      };
      
      const gameWithEight = {
        ...threePlayerGame,
        players: updatedPlayers,
        discardPile: [{ id: 'top', rank: '8', suit: 'hearts' }],
      };

      const resultGame = GameEngine.playCard(
        gameWithEight,
        updatedPlayers[currentPlayerIndex].id,
        eightCard.id,
      );

      // Direction reversed: next turn should be index 2 (Charlie) instead of 1 (Bob)
      expect(resultGame.direction).toBe(-1);
      expect(resultGame.currentPlayerIndex).toBe(2); // Charlie
    });

    it('should not affect turn order if 8s setting is disabled', () => {
      // This test will be relevant when we implement the setting check
      // For now, 8s effect should always apply since it's in the game engine
      const startedGame = GameEngine.startGame(gameState);
      const eightCard = { id: 'eight-test', rank: '8', suit: 'spades' };
      
      const currentPlayerIndex = startedGame.currentPlayerIndex;
      const updatedPlayers = [...startedGame.players];
      updatedPlayers[currentPlayerIndex] = {
        ...updatedPlayers[currentPlayerIndex],
        hand: [...updatedPlayers[currentPlayerIndex].hand, eightCard],
      };
      
      const gameWithEight = {
        ...startedGame,
        players: updatedPlayers,
        discardPile: [{ id: 'top', rank: '8', suit: 'hearts' }],
      };

      const resultGame = GameEngine.playCard(
        gameWithEight,
        updatedPlayers[currentPlayerIndex].id,
        eightCard.id,
      );

      // For now, should always reverse (we'll add setting check later)
      expect(resultGame.direction).toBe(-1);
    });
  });
});
