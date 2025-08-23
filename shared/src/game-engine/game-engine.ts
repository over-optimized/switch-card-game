import {
  GameState,
  GameAction,
  getCurrentPlayer,
  getNextPlayerIndex,
  isGameFinished,
  getWinner,
} from '../types/game.js';
import { removeCardFromHand } from '../types/player.js';
import { Card } from '../types/card.js';
import { DeckManager } from './deck-manager.js';

export class GameEngine {
  static startGame(gameState: GameState): GameState {
    if (gameState.phase !== 'waiting') {
      throw new Error('Game has already started');
    }

    if (gameState.players.length < 2) {
      throw new Error('Not enough players to start game');
    }

    const shuffledDeck = DeckManager.createShuffledDeck();
    const gameStateWithDeck = { ...gameState, drawPile: shuffledDeck };
    const gameStateWithHands = DeckManager.dealInitialHands(gameStateWithDeck);

    return {
      ...gameStateWithHands,
      phase: 'playing',
      startedAt: new Date(),
    };
  }

  static processAction(gameState: GameState, action: GameAction): GameState {
    if (gameState.phase !== 'playing') {
      throw new Error('Game is not in playing state');
    }

    const currentPlayer = getCurrentPlayer(gameState);
    if (!currentPlayer || currentPlayer.id !== action.playerId) {
      throw new Error("Not the current player's turn");
    }

    switch (action.type) {
      case 'play-card':
        return GameEngine.playCard(gameState, action.playerId, action.cardId!);
      case 'draw-card':
        return GameEngine.drawCard(gameState, action.playerId);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  static playCard(
    gameState: GameState,
    playerId: string,
    cardId: string,
  ): GameState {
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      throw new Error('Player not found');
    }

    const player = gameState.players[playerIndex];
    const card = player.hand.find(c => c.id === cardId);
    if (!card) {
      throw new Error('Card not found in player hand');
    }

    if (!GameEngine.isValidPlay(gameState, card)) {
      throw new Error('Invalid card play');
    }

    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex] = removeCardFromHand(player, cardId);

    const updatedGameState: GameState = {
      ...gameState,
      players: updatedPlayers,
      discardPile: [...gameState.discardPile, card],
    };

    return GameEngine.advanceTurn(updatedGameState);
  }

  static drawCard(gameState: GameState, playerId: string): GameState {
    const updatedGameState = DeckManager.drawCard(gameState, playerId);
    return GameEngine.advanceTurn(updatedGameState);
  }

  static isValidPlay(gameState: GameState, card: Card): boolean {
    const topCard = DeckManager.getTopDiscardCard(gameState);

    if (!topCard) {
      return true;
    }

    return card.suit === topCard.suit || card.rank === topCard.rank;
  }

  static advanceTurn(gameState: GameState): GameState {
    if (isGameFinished(gameState)) {
      const winner = getWinner(gameState);
      return {
        ...gameState,
        phase: 'finished',
        winner,
        finishedAt: new Date(),
      };
    }

    const nextPlayerIndex = getNextPlayerIndex(gameState);

    return {
      ...gameState,
      currentPlayerIndex: nextPlayerIndex,
    };
  }

  static canPlayerPlay(gameState: GameState, playerId: string): boolean {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return false;

    const topCard = DeckManager.getTopDiscardCard(gameState);
    if (!topCard) return true;

    return player.hand.some(card => GameEngine.isValidPlay(gameState, card));
  }

  static getPlayableCards(gameState: GameState, playerId: string): Card[] {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return [];

    const topCard = DeckManager.getTopDiscardCard(gameState);
    if (!topCard) return player.hand; // Can play any card if no top card

    return player.hand.filter(card => GameEngine.isValidPlay(gameState, card));
  }
}
