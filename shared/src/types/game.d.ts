import { Card } from './card.js';
import { Player } from './player.js';
export type GamePhase = 'waiting' | 'playing' | 'finished';
export type GameDirection = 1 | -1;
export interface GameState {
    id: string;
    players: Player[];
    drawPile: Card[];
    discardPile: Card[];
    currentPlayerIndex: number;
    direction: GameDirection;
    phase: GamePhase;
    winner?: Player | undefined;
    createdAt: Date;
    startedAt?: Date | undefined;
    finishedAt?: Date | undefined;
}
export interface Room {
    code: string;
    hostId: string;
    players: Player[];
    maxPlayers: number;
    status: 'waiting' | 'playing' | 'finished';
    createdAt: Date;
    gameState?: GameState;
}
export interface GameAction {
    type: 'play-card' | 'draw-card' | 'pass-turn';
    playerId: string;
    cardId?: string;
    timestamp: Date;
}
export declare function createGameState(id: string, players: Player[], shuffledDeck: Card[]): GameState;
export declare function createRoom(code: string, hostId: string, maxPlayers?: number): Room;
export declare function getCurrentPlayer(gameState: GameState): Player | undefined;
export declare function getNextPlayerIndex(gameState: GameState): number;
export declare function isGameFinished(gameState: GameState): boolean;
export declare function getWinner(gameState: GameState): Player | undefined;
