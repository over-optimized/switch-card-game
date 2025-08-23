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

export function createPlayer(id: string, name: string, isHost = false): Player {
  return {
    id,
    name,
    hand: [],
    isConnected: true,
    isHost,
  };
}

export function addCardToHand(player: Player, card: Card): Player {
  return {
    ...player,
    hand: [...player.hand, card],
  };
}

export function removeCardFromHand(player: Player, cardId: string): Player {
  return {
    ...player,
    hand: player.hand.filter(card => card.id !== cardId),
  };
}

export function getHandSize(player: Player): number {
  return player.hand.length;
}
