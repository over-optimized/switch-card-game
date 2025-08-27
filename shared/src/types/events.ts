import { GameState, Room } from './game.js';
import { Player } from './player.js';

export interface ClientToServerEvents {
  'create-room': (data: { playerName: string; maxPlayers?: number }) => void;
  'create-local-game': (data: {
    playerName: string;
    aiOpponents?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  }) => void;
  'join-room': (data: { roomCode: string; playerName: string }) => void;
  'leave-room': () => void;
  'start-game': () => void;
  'play-card': (data: { cardId: string }) => void;
  'draw-card': () => void;
  'player-ready': () => void;
  'player-unready': () => void;
}

export interface ServerToClientEvents {
  'room-created': (data: { room: Room; player: Player }) => void;
  'local-game-created': (data: {
    room: Room;
    player: Player;
    gameState: GameState;
  }) => void;
  'room-joined': (data: { room: Room; player: Player }) => void;
  'room-updated': (data: { room: Room }) => void;
  'player-joined': (data: { player: Player; room: Room }) => void;
  'player-left': (data: { playerId: string; room: Room; graceful?: boolean }) => void;
  'left-room': (data: { success: boolean; roomCode?: string; error?: string }) => void;
  'game-started': (data: { gameState: GameState }) => void;
  'game-state-updated': (data: { gameState: GameState }) => void;
  'card-played': (data: {
    playerId: string;
    cardId: string;
    gameState: GameState;
  }) => void;
  'card-drawn': (data: { playerId: string; gameState: GameState }) => void;
  'turn-changed': (data: {
    currentPlayerId: string;
    gameState: GameState;
  }) => void;
  'game-finished': (data: { winner: Player; gameState: GameState }) => void;
  error: (data: { message: string; code?: string }) => void;
  disconnect: () => void;
}

export interface InterServerEvents {
  // For future scaling with multiple server instances
}

export interface SocketData {
  playerId?: string;
  roomCode?: string;
  isLocalGame?: boolean;
}
