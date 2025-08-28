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
});
