import { createRoom } from '../types/game.js';
import { createPlayer } from '../types/player.js';
import { GAME_CONFIG } from '../index.js';
export class RoomManager {
    static rooms = new Map();
    static generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < GAME_CONFIG.ROOM_CODE_LENGTH; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    static createRoom(hostId, hostName, maxPlayers = 4) {
        let roomCode = RoomManager.generateRoomCode();
        while (RoomManager.rooms.has(roomCode)) {
            roomCode = RoomManager.generateRoomCode();
        }
        const host = createPlayer(hostId, hostName, true);
        const room = createRoom(roomCode, hostId, maxPlayers);
        room.players.push(host);
        RoomManager.rooms.set(roomCode, room);
        return room;
    }
    static getRoom(roomCode) {
        return RoomManager.rooms.get(roomCode);
    }
    static joinRoom(roomCode, playerId, playerName) {
        const room = RoomManager.rooms.get(roomCode);
        if (!room) {
            throw new Error('Room not found');
        }
        if (room.status !== 'waiting') {
            throw new Error('Room is not accepting new players');
        }
        if (room.players.length >= room.maxPlayers) {
            throw new Error('Room is full');
        }
        if (room.players.some(p => p.id === playerId)) {
            throw new Error('Player already in room');
        }
        const player = createPlayer(playerId, playerName);
        room.players.push(player);
        return room;
    }
    static leaveRoom(roomCode, playerId) {
        const room = RoomManager.rooms.get(roomCode);
        if (!room) {
            return null;
        }
        const playerIndex = room.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
            return room;
        }
        const wasHost = room.players[playerIndex].isHost;
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
            RoomManager.rooms.delete(roomCode);
            return null;
        }
        if (wasHost && room.players.length > 0) {
            room.players[0].isHost = true;
            room.hostId = room.players[0].id;
        }
        return room;
    }
    static removeRoom(roomCode) {
        RoomManager.rooms.delete(roomCode);
    }
    static getAllRooms() {
        return Array.from(RoomManager.rooms.values());
    }
    static getPlayerRoom(playerId) {
        for (const room of RoomManager.rooms.values()) {
            if (room.players.some(p => p.id === playerId)) {
                return room;
            }
        }
        return undefined;
    }
    static updatePlayerConnection(roomCode, playerId, isConnected) {
        const room = RoomManager.rooms.get(roomCode);
        if (!room)
            return undefined;
        const player = room.players.find(p => p.id === playerId);
        if (player) {
            player.isConnected = isConnected;
        }
        return room;
    }
    static cleanupExpiredRooms() {
        const now = new Date();
        const expiryTime = GAME_CONFIG.ROOM_EXPIRY_HOURS * 60 * 60 * 1000;
        for (const [code, room] of RoomManager.rooms.entries()) {
            const roomAge = now.getTime() - room.createdAt.getTime();
            if (roomAge > expiryTime) {
                RoomManager.rooms.delete(code);
            }
        }
    }
}
