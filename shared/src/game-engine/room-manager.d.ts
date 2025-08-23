import { Room } from '../types/game.js';
export declare class RoomManager {
    private static rooms;
    static generateRoomCode(): string;
    static createRoom(hostId: string, hostName: string, maxPlayers?: number): Room;
    static getRoom(roomCode: string): Room | undefined;
    static joinRoom(roomCode: string, playerId: string, playerName: string): Room;
    static leaveRoom(roomCode: string, playerId: string): Room | null;
    static removeRoom(roomCode: string): void;
    static getAllRooms(): Room[];
    static getPlayerRoom(playerId: string): Room | undefined;
    static updatePlayerConnection(roomCode: string, playerId: string, isConnected: boolean): Room | undefined;
    static cleanupExpiredRooms(): void;
}
