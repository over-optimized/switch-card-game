export * from './types/card.js';
export * from './types/player.js';
export * from './types/game.js';
export * from './types/events.js';
export * from './game-engine/deck-manager.js';
export * from './game-engine/game-engine.js';
export * from './game-engine/room-manager.js';
export declare const GAME_CONFIG: {
    readonly MIN_PLAYERS: 2;
    readonly MAX_PLAYERS: 4;
    readonly INITIAL_HAND_SIZE: 7;
    readonly ROOM_CODE_LENGTH: 6;
    readonly ROOM_EXPIRY_HOURS: 24;
};
