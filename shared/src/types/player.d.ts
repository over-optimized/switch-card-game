import { Card } from './card.js';
export interface Player {
    id: string;
    name: string;
    hand: Card[];
    isConnected: boolean;
    isHost?: boolean;
}
export interface PlayerStats {
    playerId: string;
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    winRate: number;
}
export declare function createPlayer(id: string, name: string, isHost?: boolean): Player;
export declare function addCardToHand(player: Player, card: Card): Player;
export declare function removeCardFromHand(player: Player, cardId: string): Player;
export declare function getHandSize(player: Player): number;
