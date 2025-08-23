import { createStandardDeck, shuffleDeck } from '../types/card.js';
import { addCardToHand } from '../types/player.js';
import { GAME_CONFIG } from '../index.js';
export class DeckManager {
    static createShuffledDeck() {
        const standardDeck = createStandardDeck();
        return shuffleDeck(standardDeck);
    }
    static dealInitialHands(gameState) {
        const updatedPlayers = [];
        let remainingDeck = [...gameState.drawPile];
        for (const player of gameState.players) {
            let updatedPlayer = { ...player, hand: [] };
            for (let i = 0; i < GAME_CONFIG.INITIAL_HAND_SIZE; i++) {
                if (remainingDeck.length === 0) {
                    throw new Error('Not enough cards to deal initial hands');
                }
                const card = remainingDeck.pop();
                updatedPlayer = addCardToHand(updatedPlayer, card);
            }
            updatedPlayers.push(updatedPlayer);
        }
        const updatedGameState = {
            ...gameState,
            players: updatedPlayers,
            drawPile: remainingDeck,
        };
        return DeckManager.setupDiscardPile(updatedGameState);
    }
    static setupDiscardPile(gameState) {
        if (gameState.drawPile.length === 0) {
            throw new Error('No cards left to start discard pile');
        }
        const startingCard = gameState.drawPile.pop();
        return {
            ...gameState,
            drawPile: gameState.drawPile,
            discardPile: [startingCard],
        };
    }
    static drawCard(gameState, playerId) {
        if (gameState.drawPile.length === 0) {
            gameState = DeckManager.reshuffleDiscardPile(gameState);
        }
        if (gameState.drawPile.length === 0) {
            throw new Error('No cards available to draw');
        }
        const card = gameState.drawPile.pop();
        const playerIndex = gameState.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
            throw new Error('Player not found');
        }
        const updatedPlayers = [...gameState.players];
        updatedPlayers[playerIndex] = addCardToHand(updatedPlayers[playerIndex], card);
        return {
            ...gameState,
            players: updatedPlayers,
            drawPile: gameState.drawPile,
        };
    }
    static reshuffleDiscardPile(gameState) {
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
    static getTopDiscardCard(gameState) {
        return gameState.discardPile[gameState.discardPile.length - 1];
    }
}
