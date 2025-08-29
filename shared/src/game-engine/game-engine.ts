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
      case 'play-cards':
        return GameEngine.playCards(
          gameState,
          action.playerId,
          action.cardIds!,
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
    updatedGameState = GameEngine.handleJackEffect(updatedGameState, card);

    return GameEngine.advanceTurn(updatedGameState);
  }

  static playCards(
    gameState: GameState,
    playerId: string,
    cardIds: string[],
    chosenSuit?: Suit,
  ): GameState {
    if (!cardIds.length) {
      throw new Error('No cards provided');
    }

    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      throw new Error('Player not found');
    }

    const player = gameState.players[playerIndex];

    // Validate all cards exist in hand
    const cards: Card[] = [];
    for (const cardId of cardIds) {
      const card = player.hand.find(c => c.id === cardId);
      if (!card) {
        throw new Error(`Card ${cardId} not found in player hand`);
      }
      cards.push(card);
    }

    // Validate all cards have the same rank (Switch rule for multiple cards)
    const firstCard = cards[0];
    const allSameRank = cards.every(card => card.rank === firstCard.rank);
    if (!allSameRank) {
      throw new Error(
        'All cards must have the same rank for multiple card play',
      );
    }

    // Validate the first card is a valid play (determines legality)
    if (!GameEngine.isValidPlay(gameState, firstCard)) {
      throw new Error('Invalid card play - first card does not match');
    }

    // Remove all cards from player's hand
    let updatedPlayers = [...gameState.players];
    let updatedPlayer = { ...player };

    for (const cardId of cardIds) {
      updatedPlayer = removeCardFromHand(updatedPlayer, cardId);
    }
    updatedPlayers[playerIndex] = updatedPlayer;

    // Add all cards to discard pile (last card will be on top)
    let updatedGameState: GameState = {
      ...gameState,
      players: updatedPlayers,
      discardPile: [...gameState.discardPile, ...cards],
    };

    // Handle card effects based on the top card (last card played)
    const topCard = cards[cards.length - 1];

    // Apply effects multiple times based on number of cards played
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      updatedGameState = GameEngine.handle2sEffect(updatedGameState, card);
      updatedGameState = GameEngine.handleJackEffect(updatedGameState, card);
    }

    // Handle Ace effect only once (for the top card)
    updatedGameState = GameEngine.handleAceEffect(
      updatedGameState,
      topCard,
      chosenSuit,
    );

    return GameEngine.advanceTurn(updatedGameState);
  }

  static drawCard(gameState: GameState, playerId: string): GameState {
    // Check if there's an active penalty - if so, serve the penalty instead of drawing 1 card
    if (gameState.penaltyState.active) {
      return GameEngine.servePenalty(gameState, playerId);
    }

    // Normal draw: 1 card and advance turn
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

    let updatedGameState = { ...gameState };
    let nextPlayerIndex = getNextPlayerIndex(updatedGameState);

    // Handle skipping players when Jacks have been played
    // We need to skip players WITHOUT giving them turns
    while (updatedGameState.skipsRemaining > 0) {
      // Skip the next player entirely
      nextPlayerIndex = getNextPlayerIndex(updatedGameState);
      updatedGameState = {
        ...updatedGameState,
        currentPlayerIndex: nextPlayerIndex,
        skipsRemaining: updatedGameState.skipsRemaining - 1,
      };
      
      // Calculate the next player index for potential further skips
      if (updatedGameState.skipsRemaining > 0) {
        nextPlayerIndex = getNextPlayerIndex(updatedGameState);
      }
    }

    // If no skips, just advance normally
    if (gameState.skipsRemaining === 0) {
      updatedGameState = {
        ...updatedGameState,
        currentPlayerIndex: nextPlayerIndex,
      };
    }

    return updatedGameState;
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

    // The penalty targets the NEXT player (who will have to resolve it)
    const nextPlayerIndex = getNextPlayerIndex(gameState);
    const targetPlayerId = gameState.players[nextPlayerIndex]?.id;

    return {
      ...gameState,
      gameMode: 'active-2s',
      penaltyState: {
        active: true,
        type: '2s',
        cards: currentPenalty.cards + 2, // Each 2 adds 2 cards
        playerId: targetPlayerId, // Target the NEXT player, not current player
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

  static handleJackEffect(gameState: GameState, playedCard: Card): GameState {
    // Only handle if the played card is a Jack
    if (playedCard.rank !== 'J') {
      return gameState;
    }

    // Add 1 to skipsRemaining for each Jack played
    return {
      ...gameState,
      skipsRemaining: gameState.skipsRemaining + 1,
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
