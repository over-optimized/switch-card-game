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

const app = express();
const server = createServer(app);

// Environment detection
const isProduction = process.env.RAILWAY_ENVIRONMENT_NAME === 'production';
const PORT = process.env.PORT || 3001;

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
      const updatedGame = GameEngine.playCard(
        room.gameState,
        currentPlayer.id,
        cardToPlay.id,
      );
      room.gameState = updatedGame;

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

      const updatedGame = GameEngine.processAction(room.gameState, drawAction);
      room.gameState = updatedGame;

      io.to(roomCode).emit('card-drawn', {
        playerId: currentPlayer.id,
        gameState: updatedGame,
      });

      // Continue with next turn after drawing
      setTimeout(() => handleAITurns(roomCode), 1000);
    }
  } catch (error) {
    console.error(`AI turn error in room ${roomCode}:`, error);
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
  console.log(`Player connected: ${socket.id}`);

  // Create local single-player room with AI opponents
  socket.on('create-local-game', ({ playerName, aiOpponents = 1 }) => {
    console.log(
      `Creating local game: ${playerName} with ${aiOpponents} AI opponent(s)`,
    );
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

      console.log(
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
      try {
        const room = RoomManager.createRoom(socket.id, playerName, maxPlayers);
        const host = room.players.find(p => p.isHost)!;

        socket.data.playerId = socket.id;
        socket.data.roomCode = room.code;

        socket.join(room.code);

        socket.emit('room-created', { room, player: host });

        console.log(`Room created: ${room.code} by ${playerName}`);
      } catch (error) {
        socket.emit('error', {
          message:
            error instanceof Error ? error.message : 'Failed to create room',
        });
      }
    },
  );

  socket.on('join-room', ({ roomCode, playerName }) => {
    try {
      const room = RoomManager.joinRoom(roomCode, socket.id, playerName);
      const player = room.players.find(p => p.id === socket.id)!;

      socket.data.playerId = socket.id;
      socket.data.roomCode = roomCode;

      socket.join(roomCode);

      socket.emit('room-joined', { room, player });
      socket.to(roomCode).emit('player-joined', { player, room });
      io.to(roomCode).emit('room-updated', { room });

      console.log(`Player ${playerName} joined room ${roomCode}`);
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

      console.log(`Game started in room ${roomCode}`);
    } catch (error) {
      socket.emit('error', {
        message:
          error instanceof Error ? error.message : 'Failed to start game',
      });
    }
  });

  socket.on('play-card', ({ cardId }) => {
    const { roomCode, playerId } = socket.data;

    if (!roomCode || !playerId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    try {
      const room = RoomManager.getRoom(roomCode);

      if (!room?.gameState) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const action = {
        type: 'play-card' as const,
        playerId,
        cardId,
        timestamp: new Date(),
      };

      const updatedGame = GameEngine.processAction(room.gameState, action);
      room.gameState = updatedGame;

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
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Invalid card play',
      });
    }
  });

  socket.on('draw-card', () => {
    const { roomCode, playerId } = socket.data;

    if (!roomCode || !playerId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    try {
      const room = RoomManager.getRoom(roomCode);

      if (!room?.gameState) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const action = {
        type: 'draw-card' as const,
        playerId,
        timestamp: new Date(),
      };

      const updatedGame = GameEngine.processAction(room.gameState, action);
      room.gameState = updatedGame;

      io.to(roomCode).emit('card-drawn', { playerId, gameState: updatedGame });

      // Check if next turn is AI and trigger AI turn after human draws
      setTimeout(() => handleAITurns(roomCode), 1000);
    } catch (error) {
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Failed to draw card',
      });
    }
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
      }, 30000); // 30 second grace period for reconnection
    }

    console.log(`Player disconnected: ${socket.id}`);
  });
});

setInterval(() => {
  RoomManager.cleanupExpiredRooms();
}, 60000); // Cleanup every minute

server.listen(PORT, () => {
  console.log(`🎴 Switch Card Game Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
