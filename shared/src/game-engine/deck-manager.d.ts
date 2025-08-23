import { Card } from '../types/card.js';
import { GameState } from '../types/game.js';
export declare class DeckManager {
    static createShuffledDeck(): Card[];
    static dealInitialHands(gameState: GameState): GameState;
    static setupDiscardPile(gameState: GameState): GameState;
    static drawCard(gameState: GameState, playerId: string): GameState;
    static reshuffleDiscardPile(gameState: GameState): GameState;
    static getTopDiscardCard(gameState: GameState): Card | undefined;
}
