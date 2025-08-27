# Switch Card Game

A mobile-first multiplayer card game built with React and TypeScript. Play Switch with 2-4 players online with friends using shareable room codes, optimized for both mobile and desktop play.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Build shared types
pnpm run build:shared

# Start development servers
pnpm run dev
```

This will start:

- Client development server at http://localhost:3000
- Backend server at http://localhost:3001

### Development Commands

```bash
# Development
pnpm run dev              # Start both client and server
pnpm run dev:client       # Client only
pnpm run dev:server       # Server only

# Building
pnpm run build            # Build all packages
pnpm run build:prod       # Production build with optimizations
pnpm run build:client     # Build client only
pnpm run build:server     # Build server only

# Testing
pnpm test                 # Run all tests
pnpm test:coverage        # Run tests with coverage

# Maintenance
pnpm clean                # Clean build artifacts from all packages

# Quality Checks
pnpm lint                 # Lint shared package
pnpm lint:all             # Lint all packages (shared, client, server)
pnpm format               # Format code with Prettier
pnpm ci                   # Full CI pipeline (lint + test + build)
```

## 🎮 How to Play

### Game Rules

- Each player starts with 7 cards
- Players take turns playing cards that match the top card's suit or rank
- If you can't play, draw a card from the deck
- First player to empty their hand wins!

### Multiplayer Setup

1. **Create Room**: One player creates a room and gets a 6-character room code
2. **Join Room**: Other players use the room code to join
3. **Start Game**: Room host starts the game when ready
4. **Play**: Take turns playing cards or drawing from deck

## 🏗️ Architecture

### Project Structure

```
switch-card-game/
├── client/              # Frontend (React + TypeScript + Vite)
│   ├── src/components/  # React components
│   │   ├── mobile/      # Mobile-specific components
│   │   └── ...          # Shared/desktop components
│   └── src/stores/      # Zustand state management
├── server/              # Backend (Node.js + Socket.IO)
├── shared/              # Shared types and game logic
└── docs/                # Documentation
```

### Technology Stack

- **Frontend**: React 18, TypeScript, Zustand, CSS Modules, Vite
- **Backend**: Node.js, Express, Socket.IO
- **Shared**: TypeScript types and game engine
- **Testing**: Vitest, React Testing Library, coverage reporting
- **Development**: ESLint, Prettier, hot reloading

### Key Components

#### Mobile-First Architecture
- **MobileGameBoard**: Mobile-optimized game layout with bottom sheets
- **MobileWinModal**: Full-screen celebration modal for game completion
- **MobilePlayerSheet**: Draggable bottom sheet for player hand management
- **MobileHandArea**: Touch-optimized card interaction system

#### Shared Components
- **Game Engine**: Core game logic with penalty and special card systems
- **GameContainer**: Main app wrapper with responsive design detection
- **State Management**: Zustand stores with network-ready architecture
- **Room Manager**: Handles multiplayer room creation/joining
- **WebSocket Events**: Real-time communication between players
- **Type Safety**: Shared TypeScript interfaces across client/server

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run specific test suites
pnpm --filter shared test
pnpm --filter server test
pnpm --filter client test

# Generate coverage reports
pnpm test:coverage
```

## 🔧 Development Features

- **Hot Reloading**: Client and server automatically restart on changes
- **Type Safety**: Full TypeScript coverage with strict mode
- **Code Quality**: ESLint + Prettier with pre-commit hooks
- **Monorepo**: Efficient workspace management with pnpm
- **Testing**: Unit tests with Vitest and coverage reporting

## 🚀 Deployment

### Docker (Recommended)

```bash
# Build Docker images
docker build -t switch-client ./client
docker build -t switch-server ./server

# Run with Docker Compose
docker-compose up -d
```

### Manual Deployment

```bash
# Production build with optimizations
pnpm run build:prod

# Start production server
cd server && pnpm start
```

## 📋 Roadmap

### 🚨 CRITICAL: Architecture Consolidation (Week 5) 🟡

**Phase 1 Complete (85% Done)** - Major architecture simplification achieved:

- [x] **Network-First Architecture** - All games use WebSocket connections (local = localhost)
- [x] **Component Consolidation** - ~60% reduction in mobile/desktop duplication
- [x] **Responsive Design** - Unified components work seamlessly across all devices
- [x] **Server Enhancement** - Local single-player rooms with AI opponent support
- [x] **Feature Branch Safety** - Development isolated from production deployment

**Phase 2 (Remaining 15%)**:
- [ ] Complete remaining component consolidation (GameInfo → MobileWinModal)
- [ ] Remove obsolete desktop-specific components
- [ ] Deploy server to Railway with production configuration
- [ ] Final testing across all platforms and game modes

### Phase 1: Core Game ✅ Complete

- [x] Basic game mechanics (deck, dealing, turns)
- [x] TypeScript type system
- [x] Game engine with validation
- [x] Unit test coverage
- [x] React architecture migration
- [x] Mobile-first responsive design

### Phase 2: Multiplayer ✅ Complete

- [x] WebSocket server setup
- [x] Room-based matchmaking
- [x] Real-time game state sync
- [x] React client UI for multiplayer
- [x] Local single-player mode with AI

### Phase 3: Advanced Features 🔴 Deferred

- [ ] Game animations and transitions
- [ ] Player avatars and themes
- [ ] Game statistics and history
- [ ] Additional special cards (8s, runs, etc.)

### Phase 4: Enhanced Features 🔴 Future

- [ ] Optional user registration
- [ ] Friend lists and invites
- [ ] Advanced matchmaking
- [ ] Tournament mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run quality checks: `pnpm ci`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
