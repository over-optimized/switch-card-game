import { GameState, GameAction } from '../types/game.js';
import { Card } from '../types/card.js';
export declare class GameEngine {
    static startGame(gameState: GameState): GameState;
    static processAction(gameState: GameState, action: GameAction): GameState;
    static playCard(gameState: GameState, playerId: string, cardId: string): GameState;
    static drawCard(gameState: GameState, playerId: string): GameState;
    static isValidPlay(gameState: GameState, card: Card): boolean;
    static advanceTurn(gameState: GameState): GameState;
    static canPlayerPlay(gameState: GameState, playerId: string): boolean;
}
