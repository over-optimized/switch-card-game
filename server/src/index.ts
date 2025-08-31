import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import { Server } from 'socket.io';
import {
  ClientToServerEvents,
  createGameState,
  createPlayer,
  GAME_CONFIG,
  GameEngine,
  InterServerEvents,
  RoomManager,
  ServerToClientEvents,
  SocketData,
} from 'switch-shared';

// Inactivity tracking for Railway optimization
const playerLastActivity = new Map<string, Date>();

// Update player activity timestamp
const updatePlayerActivity = (playerId: string) => {
  playerLastActivity.set(playerId, new Date());
};

// Check for and disconnect inactive players
const cleanupInactivePlayers = () => {
  const now = new Date();
  const timeoutMs = GAME_CONFIG.INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;

  for (const [playerId, lastActivity] of playerLastActivity.entries()) {
    const inactiveTime = now.getTime() - lastActivity.getTime();

    if (inactiveTime > timeoutMs) {
      logSystem(
        `Disconnecting inactive player: ${playerId} (inactive for ${Math.floor(
          inactiveTime / 60000,
        )} minutes)`,
      );

      // Find and disconnect the socket
      const socket = io.sockets.sockets.get(playerId);
      if (socket) {
        socket.emit('error', {
          message: 'Disconnected due to inactivity',
          code: 'INACTIVITY_TIMEOUT',
        });
        socket.disconnect(true);
      }

      // Clean up tracking
      playerLastActivity.delete(playerId);
    }
  }
};

const app = express();
const server = createServer(app);

// Environment detection
const isProduction = process.env.RAILWAY_ENVIRONMENT_NAME === 'production';
const isDevelopment = process.env.NODE_ENV === 'development' || !isProduction;
const PORT = process.env.PORT || 3001;

// Logging utility - only log game moves in development
const logGameMove = (message: string, ...args: unknown[]) => {
  if (isDevelopment) {
    console.log(message, ...args);
  }
};

// System logging - always log in both dev and production
const logSystem = (message: string, ...args: unknown[]) => {
  console.log(message, ...args);
};

// Error logging - always log in both environments
const logError = (message: string, ...args: unknown[]) => {
  console.error(message, ...args);
};

// CORS configuration for dual-mode operation
const corsOrigins = isProduction
  ? [process.env.CLIENT_URL || 'https://switch-card-game.vercel.app']
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// AI Turn Management
const handleAITurns = async (roomCode: string) => {
  const room = RoomManager.getRoom(roomCode);
  if (!room?.gameState || room.gameState.phase !== 'playing') return;

  const currentPlayer =
    room.gameState.players[room.gameState.currentPlayerIndex];
  if (!currentPlayer.isAI) return;

  // Simple AI logic: try to play valid cards, otherwise draw
  try {
    const validCards = currentPlayer.hand.filter(card => {
      return GameEngine.isValidPlay(room.gameState!, card);
    });

    if (validCards.length > 0) {
      // AI plays first valid card
      const cardToPlay = validCards[0];

      // Log opponent move details
      logGameMove(
        `[OPPONENT-MOVE] AI ${currentPlayer.id} playing ${cardToPlay.rank}${cardToPlay.suit} (${cardToPlay.id})`,
      );

      // Log penalty state before AI plays
      const beforePenalty = room.gameState.penaltyState;
      if (beforePenalty.active) {
        logGameMove(
          `[PENALTY-BEFORE] Active penalty: ${beforePenalty.cards} cards (type: ${beforePenalty.type}), target: ${beforePenalty.playerId}`,
        );
      }

      // Log Jack effects before and after
      const beforeSkips = room.gameState.skipsRemaining;
      const beforeTurn = room.gameState.currentPlayerIndex;
      if (cardToPlay.rank === 'J') {
        logGameMove(
          `[JACK-EFFECT] AI playing Jack ${cardToPlay.suit} - skipsRemaining: ${beforeSkips}, currentPlayer: ${beforeTurn}`,
        );
      }

      const updatedGame = GameEngine.playCard(
        room.gameState,
        currentPlayer.id,
        cardToPlay.id,
      );
      room.gameState = updatedGame;

      // Log skip behavior after Jack play
      const afterSkips = updatedGame.skipsRemaining;
      const afterTurn = updatedGame.currentPlayerIndex;
      if (
        cardToPlay.rank === 'J' ||
        beforeSkips !== afterSkips ||
        beforeTurn !== afterTurn
      ) {
        const nextPlayer = updatedGame.players[afterTurn];
        logGameMove(
          `[TURN-ADVANCE] After ${cardToPlay.rank}${cardToPlay.suit}: skipsRemaining ${beforeSkips} -> ${afterSkips}, turn ${beforeTurn} -> ${afterTurn} (${nextPlayer?.name || 'Unknown'})`,
        );
      }

      // Log penalty state after AI plays
      const afterPenalty = updatedGame.penaltyState;
      if (
        beforePenalty.active !== afterPenalty.active ||
        beforePenalty.cards !== afterPenalty.cards
      ) {
        logGameMove(
          `[PENALTY-AFTER] Penalty changed: active=${afterPenalty.active}, cards=${afterPenalty.cards}, type=${afterPenalty.type}, target=${afterPenalty.playerId}`,
        );

        if (cardToPlay.rank === '2') {
          logGameMove(
            `[TRICK-CARD-2s] 2${cardToPlay.suit} played - penalty should stack by +2 cards`,
          );
        }
      }

      logGameMove(
        `[NETWORK] Broadcasting card-played event for AI ${currentPlayer.name} (${currentPlayer.id}): ${cardToPlay.rank}${cardToPlay.suit}`,
      );
      io.to(roomCode).emit('card-played', {
        playerId: currentPlayer.id,
        cardId: cardToPlay.id,
        gameState: updatedGame,
      });

      if (updatedGame.phase === 'finished' && updatedGame.winner) {
        io.to(roomCode).emit('game-finished', {
          winner: updatedGame.winner,
          gameState: updatedGame,
        });
        return;
      }

      // Continue with next AI turn if needed
      setTimeout(() => handleAITurns(roomCode), 1000);
    } else {
      // AI draws a card
      const drawAction = {
        type: 'draw-card' as const,
        playerId: currentPlayer.id,
        timestamp: new Date(),
      };

      // Log penalty state before draw action
      const hadActivePenalty = room.gameState.penaltyState.active;
      const penaltyCards = room.gameState.penaltyState.cards;

      if (hadActivePenalty) {
        logGameMove(
          `[AI-PENALTY] AI ${currentPlayer.id} serving penalty: ${penaltyCards} cards (type: ${room.gameState.penaltyState.type})`,
        );
      }

      const updatedGame = GameEngine.processAction(room.gameState, drawAction);
      room.gameState = updatedGame;

      // Log results
      if (hadActivePenalty) {
        logGameMove(
          `[AI-PENALTY-RESULT] Penalty cleared: ${!updatedGame.penaltyState.active}, mode: ${updatedGame.gameMode}`,
        );
      }

      io.to(roomCode).emit('card-drawn', {
        playerId: currentPlayer.id,
        gameState: updatedGame,
      });

      // Continue with next turn after drawing
      setTimeout(() => handleAITurns(roomCode), 1000);
    }
  } catch (error) {
    logError(`AI turn error in room ${roomCode}:`, error);
  }
};

app.use(helmet());
app.use(
  cors({
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }),
);
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: isProduction ? 'production' : 'development',
    isRailway: !!process.env.RAILWAY_ENVIRONMENT_NAME,
    activeRooms: RoomManager.getAllRooms().length,
    port: PORT,
  });
});

app.get('/api/rooms', (_req, res) => {
  const rooms = RoomManager.getAllRooms().map(room => ({
    code: room.code,
    playerCount: room.players.length,
    maxPlayers: room.maxPlayers,
    status: room.status,
  }));
  res.json(rooms);
});

io.on('connection', socket => {
  logSystem(`Player connected: ${socket.id}`);

  // Track initial connection activity
  updatePlayerActivity(socket.id);

  // Create local single-player room with AI opponents
  socket.on('create-local-game', ({ playerName, aiOpponents = 1 }) => {
    logSystem(
      `Creating local game: ${playerName} with ${aiOpponents} AI opponent(s)`,
    );
    updatePlayerActivity(socket.id);
    try {
      // Create room with max players = human + AI
      const maxPlayers = aiOpponents + 1;
      const room = RoomManager.createRoom(socket.id, playerName, maxPlayers);

      // Add AI players to the room
      for (let i = 0; i < aiOpponents; i++) {
        const aiPlayer = createPlayer(
          `ai-${i + 1}`,
          `Computer ${i + 1}`,
          false,
        );
        aiPlayer.isAI = true;
        room.players.push(aiPlayer);
      }

      const host = room.players.find(p => p.isHost)!;

      socket.data.playerId = socket.id;
      socket.data.roomCode = room.code;
      socket.data.isLocalGame = true;

      socket.join(room.code);

      // Immediately start the local game
      const gameState = createGameState(room.code, room.players, []);
      const startedGame = GameEngine.startGame(gameState);

      room.gameState = startedGame;
      room.status = 'playing';

      socket.emit('local-game-created', {
        room,
        player: host,
        gameState: startedGame,
      });

      logSystem(
        `Local game created: ${room.code} by ${playerName} with ${aiOpponents} AI opponent(s)`,
      );

      // Handle AI turns after a short delay
      setTimeout(() => handleAITurns(room.code), 1000);
    } catch (error) {
      socket.emit('error', {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create local game',
      });
    }
  });

  socket.on(
    'create-room',
    ({ playerName, maxPlayers = GAME_CONFIG.MAX_PLAYERS }) => {
      updatePlayerActivity(socket.id);
      try {
        const room = RoomManager.createRoom(socket.id, playerName, maxPlayers);
        const host = room.players.find(p => p.isHost)!;

        socket.data.playerId = socket.id;
        socket.data.roomCode = room.code;

        socket.join(room.code);

        socket.emit('room-created', { room, player: host });

        logSystem(`Room created: ${room.code} by ${playerName}`);
      } catch (error) {
        socket.emit('error', {
          message:
            error instanceof Error ? error.message : 'Failed to create room',
        });
      }
    },
  );

  socket.on('join-room', ({ roomCode, playerName }) => {
    updatePlayerActivity(socket.id);
    try {
      const room = RoomManager.joinRoom(roomCode, socket.id, playerName);
      const player = room.players.find(p => p.id === socket.id)!;

      socket.data.playerId = socket.id;
      socket.data.roomCode = roomCode;

      socket.join(roomCode);

      socket.emit('room-joined', { room, player });
      socket.to(roomCode).emit('player-joined', { player, room });
      io.to(roomCode).emit('room-updated', { room });

      logSystem(`Player ${playerName} joined room ${roomCode}`);
    } catch (error) {
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Failed to join room',
      });
    }
  });

  socket.on('start-game', () => {
    const { roomCode, playerId } = socket.data;

    if (!roomCode || !playerId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    updatePlayerActivity(socket.id);
    try {
      const room = RoomManager.getRoom(roomCode);

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.hostId !== playerId) {
        socket.emit('error', { message: 'Only host can start game' });
        return;
      }

      if (room.players.length < GAME_CONFIG.MIN_PLAYERS) {
        socket.emit('error', { message: 'Not enough players to start' });
        return;
      }

      const gameState = createGameState(room.code, room.players, []);
      const startedGame = GameEngine.startGame(gameState);

      room.gameState = startedGame;
      room.status = 'playing';

      io.to(roomCode).emit('game-started', { gameState: startedGame });

      logSystem(`Game started in room ${roomCode}`);
    } catch (error) {
      socket.emit('error', {
        message:
          error instanceof Error ? error.message : 'Failed to start game',
      });
    }
  });

  socket.on('play-card', ({ cardId, chosenSuit }) => {
    const { roomCode, playerId } = socket.data;

    if (!roomCode || !playerId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    updatePlayerActivity(socket.id);
    try {
      const room = RoomManager.getRoom(roomCode);

      if (!room?.gameState) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Find the card being played for detailed logging
      const player = room.gameState.players.find(p => p.id === playerId);
      const cardToPlay = player?.hand.find(c => c.id === cardId);

      if (cardToPlay) {
        logGameMove(
          `[HUMAN-MOVE] Player ${playerId} playing ${cardToPlay.rank}${cardToPlay.suit} (${cardId})`,
        );

        // Log Ace suit selection
        if (cardToPlay.rank === 'A' && chosenSuit) {
          logGameMove(
            `[ACE-SUIT-SELECTION] Player chose ${chosenSuit} for ${cardToPlay.rank}${cardToPlay.suit}`,
          );
        } else if (cardToPlay.rank === 'A' && !chosenSuit) {
          logGameMove(
            `[ACE-NO-SUIT] Player played ${cardToPlay.rank}${cardToPlay.suit} without suit selection - will default to ${cardToPlay.suit}`,
          );
        }

        // Log penalty state before human plays
        const beforePenalty = room.gameState.penaltyState;
        if (beforePenalty.active) {
          logGameMove(
            `[PENALTY-BEFORE] Active penalty: ${beforePenalty.cards} cards (type: ${beforePenalty.type}), target: ${beforePenalty.playerId}`,
          );
        }
      }

      const action = {
        type: 'play-card' as const,
        playerId,
        cardId,
        chosenSuit,
        timestamp: new Date(),
      };

      // Log Jack effects before and after for human players
      const beforeSkips = room.gameState.skipsRemaining;
      const beforeTurn = room.gameState.currentPlayerIndex;
      if (cardToPlay?.rank === 'J') {
        logGameMove(
          `[JACK-EFFECT] Human playing Jack ${cardToPlay.suit} - skipsRemaining: ${beforeSkips}, currentPlayer: ${beforeTurn}`,
        );
      }

      const updatedGame = GameEngine.processAction(room.gameState, action);
      room.gameState = updatedGame;

      // Log skip behavior after human Jack play
      const afterSkips = updatedGame.skipsRemaining;
      const afterTurn = updatedGame.currentPlayerIndex;
      if (
        cardToPlay?.rank === 'J' ||
        beforeSkips !== afterSkips ||
        beforeTurn !== afterTurn
      ) {
        const nextPlayer = updatedGame.players[afterTurn];
        logGameMove(
          `[TURN-ADVANCE] After ${cardToPlay?.rank}${cardToPlay?.suit}: skipsRemaining ${beforeSkips} -> ${afterSkips}, turn ${beforeTurn} -> ${afterTurn} (${nextPlayer?.name || 'Unknown'})`,
        );
      }

      // Log penalty state after human plays
      if (cardToPlay) {
        const afterPenalty = updatedGame.penaltyState;
        const beforePenalty = room.gameState.penaltyState;

        if (
          beforePenalty.active !== afterPenalty.active ||
          beforePenalty.cards !== afterPenalty.cards
        ) {
          logGameMove(
            `[PENALTY-AFTER] Penalty changed: active=${afterPenalty.active}, cards=${afterPenalty.cards}, type=${afterPenalty.type}, target=${afterPenalty.playerId}`,
          );

          if (cardToPlay.rank === '2') {
            logGameMove(
              `[TRICK-CARD-2s] 2${cardToPlay.suit} played - penalty should activate/stack by +2 cards`,
            );
          }
        }
      }

      const humanPlayer = room.players.find(p => p.id === playerId);
      const playedCard =
        room.gameState.discardPile[room.gameState.discardPile.length - 1];
      logGameMove(
        `[NETWORK] Broadcasting card-played event for human ${humanPlayer?.name || 'Unknown'} (${playerId}): ${playedCard?.rank}${playedCard?.suit}`,
      );
      io.to(roomCode).emit('card-played', {
        playerId,
        cardId,
        gameState: updatedGame,
      });

      if (updatedGame.phase === 'finished' && updatedGame.winner) {
        io.to(roomCode).emit('game-finished', {
          winner: updatedGame.winner,
          gameState: updatedGame,
        });
      } else {
        // Check if next turn is AI and trigger AI turn
        setTimeout(() => handleAITurns(roomCode), 1000);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid card play';
      logError(
        `[PLAY-CARD ERROR] Player ${playerId} in room ${roomCode}:`,
        errorMessage,
      );
      socket.emit('error', {
        message: errorMessage,
      });
    }
  });

  socket.on('play-cards', ({ cardIds }) => {
    const { roomCode, playerId } = socket.data;

    if (!roomCode || !playerId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    updatePlayerActivity(socket.id);
    try {
      const room = RoomManager.getRoom(roomCode);

      if (!room?.gameState) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      logGameMove(
        `[PLAY-CARDS] Player ${playerId} attempting to play ${cardIds.length} cards:`,
        cardIds,
      );

      const action = {
        type: 'play-cards' as const,
        playerId,
        cardIds,
        timestamp: new Date(),
      };

      const updatedGame = GameEngine.processAction(room.gameState, action);
      room.gameState = updatedGame;

      logGameMove(
        `[PLAY-CARDS SUCCESS] Player ${playerId} played cards successfully`,
      );

      const multiCardPlayer = room.players.find(p => p.id === playerId);
      logGameMove(
        `[NETWORK] Broadcasting cards-played event for ${multiCardPlayer?.name || 'Unknown'} (${playerId}): ${cardIds.length} cards`,
      );
      io.to(roomCode).emit('cards-played', {
        playerId,
        cardIds,
        gameState: updatedGame,
      });

      if (updatedGame.phase === 'finished' && updatedGame.winner) {
        io.to(roomCode).emit('game-finished', {
          winner: updatedGame.winner,
          gameState: updatedGame,
        });
      } else {
        // Check if next turn is AI and trigger AI turn
        setTimeout(() => handleAITurns(roomCode), 1000);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid cards play';
      logError(
        `[PLAY-CARDS ERROR] Player ${playerId} in room ${roomCode}:`,
        errorMessage,
        'Cards:',
        cardIds,
      );
      socket.emit('error', {
        message: errorMessage,
      });
    }
  });

  socket.on('draw-card', () => {
    const { roomCode, playerId } = socket.data;

    if (!roomCode || !playerId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    updatePlayerActivity(socket.id);
    try {
      const room = RoomManager.getRoom(roomCode);

      if (!room?.gameState) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Log penalty state for human players too
      const hadActivePenalty = room.gameState.penaltyState.active;
      const penaltyCards = room.gameState.penaltyState.cards;

      if (hadActivePenalty) {
        logGameMove(
          `[HUMAN-PENALTY] Player ${playerId} serving penalty: ${penaltyCards} cards (type: ${room.gameState.penaltyState.type})`,
        );
      }

      const action = {
        type: 'draw-card' as const,
        playerId,
        timestamp: new Date(),
      };

      const updatedGame = GameEngine.processAction(room.gameState, action);
      room.gameState = updatedGame;

      // Log results for human players
      if (hadActivePenalty) {
        logGameMove(
          `[HUMAN-PENALTY-RESULT] Penalty cleared: ${!updatedGame.penaltyState.active}, mode: ${updatedGame.gameMode}`,
        );
      }

      io.to(roomCode).emit('card-drawn', { playerId, gameState: updatedGame });

      // Check if next turn is AI and trigger AI turn after human draws
      setTimeout(() => handleAITurns(roomCode), 1000);
    } catch (error) {
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Failed to draw card',
      });
    }
  });

  // Graceful room leaving
  socket.on('leave-room', () => {
    const { roomCode, playerId } = socket.data;

    if (roomCode && playerId) {
      logSystem(`Player ${playerId} leaving room ${roomCode} gracefully`);

      // Clean up activity tracking
      playerLastActivity.delete(playerId);

      // Immediately remove player (no grace period for manual leave)
      const updatedRoom = RoomManager.leaveRoom(roomCode, playerId);

      if (updatedRoom) {
        // Notify remaining players
        socket.to(roomCode).emit('player-left', {
          playerId,
          room: updatedRoom,
          graceful: true,
        });
        socket.to(roomCode).emit('room-updated', { room: updatedRoom });

        // Confirm to leaving player
        socket.emit('left-room', {
          success: true,
          roomCode,
        });

        // Clear socket room membership
        socket.leave(roomCode);
        socket.data = {};

        logSystem(`Player ${playerId} successfully left room ${roomCode}`);
      } else {
        socket.emit('left-room', {
          success: false,
          error: 'Room not found or already empty',
        });
      }
    } else {
      socket.emit('left-room', {
        success: false,
        error: 'Not in a room',
      });
    }
  });

  // Handle player reconnection attempts
  socket.on('reconnect-player', ({ roomCode, playerId }) => {
    logSystem(`Player reconnection attempt: ${playerId} to room ${roomCode}`);
    
    const room = RoomManager.getRoom(roomCode);
    if (!room) {
      socket.emit('error', {
        message: 'Room no longer exists',
        code: 'ROOM_NOT_FOUND',
      });
      return;
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      socket.emit('error', {
        message: 'Player not found in room',
        code: 'PLAYER_NOT_FOUND',
      });
      return;
    }

    // Update socket data and rejoin room
    socket.data = { roomCode, playerId, isHost: player.isHost || false };
    socket.join(roomCode);
    
    // Update player connection status
    RoomManager.updatePlayerConnection(roomCode, playerId, true);
    
    // Update activity tracking
    updatePlayerActivity(playerId);

    // Send updated room state
    socket.emit('room-joined', { room, player });
    
    // If there's an active game, send game state
    if (room.gameState) {
      socket.emit('game-state', { gameState: room.gameState });
    }

    logSystem(`Player successfully reconnected: ${playerId}`);
  });

  socket.on('reconnect-host', ({ roomCode, playerId }) => {
    logSystem(`Host reconnection attempt: ${playerId} to room ${roomCode}`);
    
    const room = RoomManager.getRoom(roomCode);
    if (!room) {
      socket.emit('error', {
        message: 'Room no longer exists',
        code: 'ROOM_NOT_FOUND',
      });
      return;
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player || !player.isHost) {
      socket.emit('error', {
        message: 'Host not found in room',
        code: 'HOST_NOT_FOUND',
      });
      return;
    }

    // Update socket data and rejoin room
    socket.data = { roomCode, playerId, isHost: true };
    socket.join(roomCode);
    
    // Update player connection status
    RoomManager.updatePlayerConnection(roomCode, playerId, true);
    
    // Update activity tracking
    updatePlayerActivity(playerId);

    // Send updated room state to host
    socket.emit('room-created', { room, player });
    
    // If there's an active game, send game state
    if (room.gameState) {
      socket.emit('game-state', { gameState: room.gameState });
    }

    logSystem(`Host successfully reconnected: ${playerId}`);
  });

  socket.on('disconnect', () => {
    const { roomCode, playerId } = socket.data;

    if (roomCode && playerId) {
      RoomManager.updatePlayerConnection(roomCode, playerId, false);

      setTimeout(() => {
        const updatedRoom = RoomManager.leaveRoom(roomCode, playerId);

        if (updatedRoom) {
          io.to(roomCode).emit('player-left', { playerId, room: updatedRoom });
          io.to(roomCode).emit('room-updated', { room: updatedRoom });
        }

        // Clean up activity tracking after grace period
        playerLastActivity.delete(playerId);
      }, 30000); // 30 second grace period for reconnection
    }

    logSystem(`Player disconnected: ${socket.id}`);
  });
});

// Resource monitoring and cleanup for Railway optimization
const logResourceUsage = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const activeRooms = RoomManager.getAllRooms().length;
  const activePlayers = playerLastActivity.size;
  const uptime = process.uptime();
  const uptimeHours = Math.floor(uptime / 3600);
  const uptimeMinutes = Math.floor((uptime % 3600) / 60);

  // Calculate room statistics
  const rooms = RoomManager.getAllRooms();
  const playingRooms = rooms.filter(room => room.status === 'playing').length;
  const waitingRooms = rooms.filter(room => room.status === 'waiting').length;
  const totalPlayersInRooms = rooms.reduce(
    (sum, room) => sum + room.players.length,
    0,
  );

  logSystem(`📊 Resource Usage:`, {
    timestamp: new Date().toISOString(),
    environment: isProduction ? 'production' : 'development',
    uptime: `${uptimeHours}h ${uptimeMinutes}m`,
    memory: {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
    },
    cpu: {
      user: `${Math.round(cpuUsage.user / 1000)}ms`,
      system: `${Math.round(cpuUsage.system / 1000)}ms`,
    },
    connections: {
      connectedSockets: io.sockets.sockets.size,
      trackedPlayers: activePlayers,
    },
    rooms: {
      total: activeRooms,
      playing: playingRooms,
      waiting: waitingRooms,
      totalPlayers: totalPlayersInRooms,
    },
  });

  // Memory threshold warnings for Railway
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  if (heapUsedMB > 150) {
    logSystem(
      `⚠️ High memory usage: ${Math.round(heapUsedMB)}MB - consider cleanup`,
    );
  }

  // Connection monitoring
  if (io.sockets.sockets.size !== activePlayers) {
    logSystem(
      `🔍 Connection mismatch: ${io.sockets.sockets.size} sockets, ${activePlayers} tracked players`,
    );
  }
};

setInterval(() => {
  RoomManager.cleanupExpiredRooms();
}, 60000); // Cleanup expired rooms every minute

setInterval(
  () => {
    cleanupInactivePlayers();
  },
  GAME_CONFIG.INACTIVITY_CHECK_INTERVAL_MINUTES * 60 * 1000,
); // Cleanup inactive players every 5 minutes

// Resource monitoring - more frequent in dev, less frequent in production
const resourceMonitoringInterval = isDevelopment
  ? 2 * 60 * 1000
  : 5 * 60 * 1000; // 2min dev, 5min prod
setInterval(() => {
  logResourceUsage();
}, resourceMonitoringInterval);

server.listen(PORT, () => {
  logSystem(`🎴 Switch Card Game Server running on port ${PORT}`);
  logSystem(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Log initial resource usage
  setTimeout(() => {
    logSystem('🚀 Server startup complete - initial resource usage:');
    logResourceUsage();
  }, 1000);
});
