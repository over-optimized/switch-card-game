import {
  GameState,
  GameAction,
  getCurrentPlayer,
  getNextPlayerIndex,
  isGameFinished,
  getWinner,
} from '../types/game.js';
import { removeCardFromHand } from '../types/player.js';
import { Card, Suit } from '../types/card.js';
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
        return GameEngine.playCard(
          gameState,
          action.playerId,
          action.cardId!,
          action.chosenSuit,
        );
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
    chosenSuit?: Suit,
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

    let updatedGameState: GameState = {
      ...gameState,
      players: updatedPlayers,
      discardPile: [...gameState.discardPile, card],
    };

    // Handle card effects
    updatedGameState = GameEngine.handle2sEffect(updatedGameState, card);
    updatedGameState = GameEngine.handleAceEffect(
      updatedGameState,
      card,
      chosenSuit,
    );

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

    // Handle 2s penalty state
    if (gameState.penaltyState.active && gameState.penaltyState.type === '2s') {
      // During active 2s penalty, only 2s can be played (Aces cannot counter penalties)
      return card.rank === '2';
    }

    // Aces are universal - can be played on any card (except during active penalties)
    if (card.rank === 'A') {
      return true;
    }

    // Normal play: 2s can be played on any 2 (suit doesn't matter)
    if (card.rank === '2' && topCard.rank === '2') {
      return true;
    }

    // Standard matching rules - use chosenSuit if top card is an Ace
    const effectiveSuit =
      topCard.rank === 'A' && gameState.chosenSuit
        ? gameState.chosenSuit
        : topCard.suit;

    return card.suit === effectiveSuit || card.rank === topCard.rank;
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

  static handle2sEffect(gameState: GameState, playedCard: Card): GameState {
    // Only handle if the played card is a 2
    if (playedCard.rank !== '2') {
      return gameState;
    }

    // Activate or increase 2s penalty
    const currentPenalty = gameState.penaltyState;
    return {
      ...gameState,
      gameMode: 'active-2s',
      penaltyState: {
        active: true,
        type: '2s',
        cards: currentPenalty.cards + 2, // Each 2 adds 2 cards
        playerId: gameState.players[gameState.currentPlayerIndex]?.id,
      },
    };
  }

  static handleAceEffect(
    gameState: GameState,
    playedCard: Card,
    chosenSuit?: Suit,
  ): GameState {
    // Only handle if the played card is an Ace
    if (playedCard.rank !== 'A') {
      return gameState;
    }

    // If no suit chosen, default to the Ace's original suit
    const newSuit = chosenSuit || playedCard.suit;

    return {
      ...gameState,
      chosenSuit: newSuit,
    };
  }

  static servePenalty(gameState: GameState, playerId: string): GameState {
    if (!gameState.penaltyState.active) {
      return gameState;
    }

    const penaltyCards = gameState.penaltyState.cards;
    // Draw penalty cards for the player
    let updatedGameState = { ...gameState };
    for (let i = 0; i < penaltyCards; i++) {
      updatedGameState = DeckManager.drawCard(updatedGameState, playerId);
    }

    // Clear penalty and return to normal mode
    updatedGameState = {
      ...updatedGameState,
      gameMode: 'normal',
      penaltyState: {
        active: false,
        cards: 0,
        type: null,
      },
    };

    // Advance turn after serving penalty - penalty ends the turn
    return GameEngine.advanceTurn(updatedGameState);
  }
}
