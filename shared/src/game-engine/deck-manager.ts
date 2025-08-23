import { Card, createStandardDeck, shuffleDeck } from '../types/card.js';
import { GameState } from '../types/game.js';
import { Player, addCardToHand } from '../types/player.js';

export class DeckManager {
  static createShuffledDeck(): Card[] {
    const standardDeck = createStandardDeck();
    return shuffleDeck(standardDeck);
  }

  static dealInitialHands(gameState: GameState): GameState {
    const updatedPlayers: Player[] = [];
    let remainingDeck = [...gameState.drawPile];

    // Switch rule: 7 cards for 2-3 players, 5 cards for 4+ players
    const handSize = gameState.players.length >= 4 ? 5 : 7;

    for (const player of gameState.players) {
      let updatedPlayer: Player = { ...player, hand: [] };

      for (let i = 0; i < handSize; i++) {
        if (remainingDeck.length === 0) {
          throw new Error('Not enough cards to deal initial hands');
        }

        const card = remainingDeck.pop()!;
        updatedPlayer = addCardToHand(updatedPlayer, card);
      }

      updatedPlayers.push(updatedPlayer);
    }

    const updatedGameState: GameState = {
      ...gameState,
      players: updatedPlayers,
      drawPile: remainingDeck,
    };

    return DeckManager.setupDiscardPile(updatedGameState);
  }

  static setupDiscardPile(gameState: GameState): GameState {
    if (gameState.drawPile.length === 0) {
      throw new Error('No cards left to start discard pile');
    }

    const startingCard = gameState.drawPile.pop()!;

    return {
      ...gameState,
      drawPile: gameState.drawPile,
      discardPile: [startingCard],
    };
  }

  static drawCard(gameState: GameState, playerId: string): GameState {
    if (gameState.drawPile.length === 0) {
      gameState = DeckManager.reshuffleDiscardPile(gameState);
    }

    if (gameState.drawPile.length === 0) {
      throw new Error('No cards available to draw');
    }

    const card = gameState.drawPile.pop()!;
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      throw new Error('Player not found');
    }

    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex] = addCardToHand(
      updatedPlayers[playerIndex],
      card,
    );

    return {
      ...gameState,
      players: updatedPlayers,
      drawPile: gameState.drawPile,
    };
  }

  static reshuffleDiscardPile(gameState: GameState): GameState {
    if (gameState.discardPile.length <= 1) {
      return gameState;
    }

    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const cardsToShuffle = gameState.discardPile.slice(0, -1);
    const shuffledCards = shuffleDeck(cardsToShuffle);

    return {
      ...gameState,
      drawPile: [...gameState.drawPile, ...shuffledCards],
      discardPile: [topCard],
    };
  }

  static getTopDiscardCard(gameState: GameState): Card | undefined {
    return gameState.discardPile[gameState.discardPile.length - 1];
  }
}
