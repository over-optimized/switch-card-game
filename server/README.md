# Switch Card Game - Server Application

Backend server for the Switch multiplayer card game, built with Node.js, Express, and Socket.IO.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- Built shared package (`pnpm build:shared` from root)

### Development Setup

```bash
# From project root - build shared dependencies first
pnpm build:shared

# Start server development
pnpm dev:server
# OR from server directory
cd server && pnpm dev
```

Server will start at: http://localhost:3001

## 🏗️ Architecture

### Technology Stack

- **Runtime**: Node.js 18+ with ES modules
- **Framework**: Express.js for HTTP endpoints
- **Real-time**: Socket.IO for WebSocket communication
- **Language**: TypeScript with strict mode
- **Game Logic**: Imported from shared package
- **Security**: CORS, Helmet, and input validation

### Project Structure

```
server/
├── src/
│   └── index.ts         # Main server entry point
├── dist/               # Compiled JavaScript output
├── tsconfig.json       # TypeScript configuration
└── package.json        # Server dependencies
```

### Key Components

#### WebSocket Server (`index.ts`)

- **Room Management**: Create, join, and manage game rooms
- **Real-time Communication**: Socket.IO event handling
- **Game State Sync**: Authoritative server game state
- **Player Connection**: Handle connect/disconnect events
- **Security**: Input validation and rate limiting

#### Express API Endpoints

- **Health Check**: `/health` - Server status
- **Room Info**: `/api/rooms/:id` - Room details (if implemented)
- **Static Assets**: Serve client assets in production

## ⚙️ Development Commands

```bash
# Development
pnpm dev                # Start development server with hot reload
pnpm build              # Compile TypeScript to JavaScript
pnpm start              # Start production server

# Code Quality
pnpm lint               # ESLint validation
pnpm lint:fix           # Auto-fix lint issues
pnpm test               # Run unit tests
pnpm test:coverage      # Run tests with coverage
```

## 🌐 WebSocket Events

### Client → Server Events

```typescript
// Room Management
'create-room'           # Create a new game room
'join-room'            # Join existing room with code
'leave-room'           # Leave current room

// Game Actions
'play-card'            # Play a card from hand
'draw-card'            # Draw card from deck
'start-game'           # Start the game (host only)

// Player Actions
'player-ready'         # Mark player as ready
'player-chat'          # Send chat message (if implemented)
```

### Server → Client Events

```typescript
// Room Updates
'room-joined'          # Successfully joined room
'room-left'            # Left room
'player-joined'        # Another player joined
'player-left'          # Player disconnected

// Game State
'game-started'         # Game has begun
'game-state-update'    # Full game state sync
'card-played'          # Card played by another player
'turn-changed'         # Turn advanced to next player
'game-ended'           # Game finished with winner

// Error Handling
'error'                # General error message
'room-error'           # Room-specific errors
```

## 🎮 Current Features

### Room Management System

- ✅ **Room Creation**: Generate unique 6-character room codes
- ✅ **Room Joining**: Players join using room codes
- ✅ **Player Management**: Track connected players per room
- ✅ **Host Privileges**: Room creator controls game start
- ✅ **Disconnect Handling**: Cleanup on player disconnect

### Game State Management

- ✅ **Authoritative Server**: All game logic server-side
- ✅ **State Synchronization**: Real-time updates to all clients
- ✅ **Turn Management**: Enforce turn order and valid plays
- ✅ **Game Engine Integration**: Use shared GameEngine class
- ✅ **Win Condition**: Detect and broadcast game end

### Real-time Features

- ✅ **WebSocket Connection**: Stable Socket.IO implementation
- ✅ **Event-driven Architecture**: Clean event handling system
- ✅ **Connection Management**: Handle connect/disconnect gracefully
- ✅ **Room Broadcasting**: Send updates to room members only
- ✅ **Error Handling**: Comprehensive error responses

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3001                    # Server port (default: 3001)
NODE_ENV=development         # Environment mode
CORS_ORIGIN=http://localhost:3000  # Allowed client origins

# Production Settings
DATABASE_URL=               # Database connection (when added)
LOG_LEVEL=info             # Logging verbosity
```

### Socket.IO Configuration

- **CORS**: Configured for localhost:3000 in development
- **Transports**: WebSocket and polling fallback
- **Timeout**: Connection timeout and ping interval
- **Rooms**: Namespace isolation for game rooms

## 🛡️ Security Features

### Input Validation

- **Room Codes**: Validate format and existence
- **Card Plays**: Validate using shared game engine
- **Player Names**: Sanitize and length limits
- **Rate Limiting**: Prevent spam and abuse

### CORS Configuration

```typescript
// Development
origin: ['http://localhost:3000'];

// Production
origin: ['https://your-domain.vercel.app'];
```

### Error Handling

- **Graceful Failures**: Never crash server on invalid input
- **Client Feedback**: Send meaningful error messages
- **Logging**: Comprehensive error logging
- **Recovery**: Automatic room cleanup on errors

## 🧪 Testing

### Test Strategy

- **Unit Tests**: Room management and game logic integration
- **Socket Tests**: WebSocket event handling
- **Integration Tests**: Full client-server communication
- **Load Tests**: Multiple concurrent rooms and players

```bash
# Run server tests
pnpm test

# Coverage report
pnpm test:coverage

# Integration tests (when implemented)
pnpm test:integration
```

## 🚀 Deployment

### Production Build

```bash
# Compile TypeScript
pnpm build

# Start production server
pnpm start
```

### Deployment Platforms

#### Railway (Recommended)

```bash
# Railway deployment
railway login
railway link [project-id]
railway up
```

#### Manual Deployment

```bash
# Build and prepare
pnpm build
NODE_ENV=production pnpm start
```

### Production Configuration

- **Process Management**: PM2 or similar for production
- **Load Balancing**: Multiple server instances if needed
- **Database**: PostgreSQL for persistent room/game data
- **Monitoring**: Error tracking and performance monitoring

## 🔍 Room Management Details

### Room Lifecycle

1. **Creation**: Generate unique 6-character code
2. **Joining**: Players join with code, validate room exists
3. **Ready State**: Players mark ready, host can start game
4. **Game Active**: Real-time game state synchronization
5. **Game End**: Winner declared, option to restart
6. **Cleanup**: Room cleanup after inactivity

### Room Data Structure

```typescript
interface Room {
  id: string; // 6-character room code
  host: string; // Host player socket ID
  players: Player[]; // Connected players
  gameState: GameState; // Current game state
  status: 'waiting' | 'active' | 'finished';
  createdAt: Date;
  lastActivity: Date;
}
```

## 🎯 Game Server Logic

### Authoritative Server Model

- **Client Requests**: Players send action requests
- **Server Validation**: Validate using shared game engine
- **State Update**: Update authoritative game state
- **Broadcast**: Send updates to all room players

### Turn Management

```typescript
// Example turn handling
socket.on('play-card', data => {
  // 1. Validate it's player's turn
  // 2. Validate card play using GameEngine
  // 3. Update game state
  // 4. Broadcast to room
  // 5. Advance turn if valid
});
```

## 📊 Performance Considerations

### Scalability

- **Room Limits**: Maximum players per room (4)
- **Concurrent Rooms**: Support multiple simultaneous games
- **Memory Management**: Clean up inactive rooms
- **Connection Limits**: Handle connection pooling

### Optimization

- **State Sync**: Only send necessary game state updates
- **Event Batching**: Batch related events when possible
- **Database Queries**: Optimize room lookups (when DB added)
- **WebSocket Efficiency**: Minimize message size

## 🔧 Troubleshooting

### Common Issues

**Server Won't Start**

- Check port 3001 is available
- Verify shared package is built: `pnpm build:shared`
- Check Node.js version (18+ required)

**WebSocket Connection Issues**

- Verify CORS origin configuration
- Check client connecting to correct port
- Test with Socket.IO debugging enabled

**Room Management Problems**

- Check room code generation uniqueness
- Verify room cleanup on disconnect
- Monitor memory usage for room storage

**Game State Issues**

- Ensure shared GameEngine is properly imported
- Validate all game actions server-side
- Check state synchronization timing

## 📚 Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use async/await for asynchronous operations
- Implement comprehensive error handling

### WebSocket Development

- Always validate incoming events
- Use room-based broadcasting
- Handle disconnections gracefully
- Implement event acknowledgments

### Game Integration

- Import ALL game logic from shared package
- Never implement game rules in server code
- Use shared types for all events
- Maintain authoritative game state

---

For more information, see the main project [README.md](../README.md) and [FEATURES.md](../FEATURES.md).
