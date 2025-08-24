import { Card } from './card.js';
import { Player } from './player.js';

export type GamePhase = 'waiting' | 'playing' | 'finished';
export type GameDirection = 1 | -1;
export type GameMode = 'normal' | 'active-2s' | 'active-run' | 'mirror-mode';

export interface PenaltyState {
  active: boolean;
  cards: number;
  type: '2s' | 'run' | null;
  playerId?: string;
}

export interface GameState {
  id: string;
  players: Player[];
  drawPile: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  direction: GameDirection;
  phase: GamePhase;
  gameMode: GameMode;
  penaltyState: PenaltyState;
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

export function createGameState(
  id: string,
  players: Player[],
  shuffledDeck: Card[],
): GameState {
  return {
    id,
    players: [...players],
    drawPile: [...shuffledDeck],
    discardPile: [],
    currentPlayerIndex: 0,
    direction: 1,
    phase: 'waiting',
    gameMode: 'normal',
    penaltyState: {
      active: false,
      cards: 0,
      type: null,
    },
    createdAt: new Date(),
  };
}

export function createRoom(code: string, hostId: string, maxPlayers = 4): Room {
  return {
    code,
    hostId,
    players: [],
    maxPlayers,
    status: 'waiting',
    createdAt: new Date(),
  };
}

export function getCurrentPlayer(gameState: GameState): Player | undefined {
  return gameState.players[gameState.currentPlayerIndex];
}

export function getNextPlayerIndex(gameState: GameState): number {
  const playerCount = gameState.players.length;
  let nextIndex = gameState.currentPlayerIndex + gameState.direction;

  if (nextIndex >= playerCount) {
    nextIndex = 0;
  } else if (nextIndex < 0) {
    nextIndex = playerCount - 1;
  }

  return nextIndex;
}

export function isGameFinished(gameState: GameState): boolean {
  return gameState.players.some(player => player.hand.length === 0);
}

export function getWinner(gameState: GameState): Player | undefined {
  return gameState.players.find(player => player.hand.length === 0);
}
