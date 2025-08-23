import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  InterServerEvents, 
  SocketData,
  RoomManager,
  GameEngine,
  createGameState,
  GAME_CONFIG
} from 'switch-shared';

const app = express();
const server = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeRooms: RoomManager.getAllRooms().length
  });
});

app.get('/api/rooms', (_req, res) => {
  const rooms = RoomManager.getAllRooms().map(room => ({
    code: room.code,
    playerCount: room.players.length,
    maxPlayers: room.maxPlayers,
    status: room.status
  }));
  res.json(rooms);
});

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('create-room', ({ playerName, maxPlayers = GAME_CONFIG.MAX_PLAYERS }) => {
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
        message: error instanceof Error ? error.message : 'Failed to create room' 
      });
    }
  });

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
        message: error instanceof Error ? error.message : 'Failed to join room' 
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
        message: error instanceof Error ? error.message : 'Failed to start game' 
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
        timestamp: new Date()
      };

      const updatedGame = GameEngine.processAction(room.gameState, action);
      room.gameState = updatedGame;
      
      io.to(roomCode).emit('card-played', { playerId, cardId, gameState: updatedGame });
      
      if (updatedGame.phase === 'finished' && updatedGame.winner) {
        io.to(roomCode).emit('game-finished', { winner: updatedGame.winner, gameState: updatedGame });
      }
      
    } catch (error) {
      socket.emit('error', { 
        message: error instanceof Error ? error.message : 'Invalid card play' 
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
        timestamp: new Date()
      };

      const updatedGame = GameEngine.processAction(room.gameState, action);
      room.gameState = updatedGame;
      
      io.to(roomCode).emit('card-drawn', { playerId, gameState: updatedGame });
      
    } catch (error) {
      socket.emit('error', { 
        message: error instanceof Error ? error.message : 'Failed to draw card' 
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