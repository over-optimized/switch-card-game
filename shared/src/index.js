export * from './types/card.js';
export * from './types/player.js';
export * from './types/game.js';
export * from './types/events.js';
export * from './game-engine/deck-manager.js';
export * from './game-engine/game-engine.js';
export * from './game-engine/room-manager.js';
export const GAME_CONFIG = {
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 4,
    INITIAL_HAND_SIZE: 7,
    ROOM_CODE_LENGTH: 6,
    ROOM_EXPIRY_HOURS: 24,
};
