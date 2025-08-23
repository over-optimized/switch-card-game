# Switch Card Game

A multiplayer HTML5 card game with real-time networking capabilities. Play Switch with 2-4 players online with friends using shareable room codes.

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
pnpm run build:client     # Build client only
pnpm run build:server     # Build server only

# Testing
pnpm test                 # Run all tests
pnpm test:coverage        # Run tests with coverage

# Quality Checks
pnpm lint                 # Lint all packages  
pnpm format              # Format code with Prettier
pnpm ci                  # Full CI pipeline (lint + test + build)
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
├── client/              # Frontend (Vite + TypeScript)
├── server/              # Backend (Node.js + Socket.IO)
├── shared/              # Shared types and game logic
└── docs/                # Documentation
```

### Technology Stack
- **Frontend**: HTML5, TypeScript, CSS3, Vite
- **Backend**: Node.js, Express, Socket.IO
- **Shared**: TypeScript types and game engine
- **Testing**: Vitest, coverage reporting
- **Development**: ESLint, Prettier, hot reloading

### Key Components
- **Game Engine**: Core game logic with deck management
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
# Production build
pnpm run build

# Start production server
cd server && pnpm start
```

## 📋 Roadmap

### Phase 1: Core Game ✅
- [x] Basic game mechanics (deck, dealing, turns)  
- [x] TypeScript type system
- [x] Game engine with validation
- [x] Unit test coverage

### Phase 2: Multiplayer (In Progress)
- [x] WebSocket server setup
- [x] Room-based matchmaking
- [x] Real-time game state sync
- [ ] Client UI for multiplayer

### Phase 3: Polish
- [ ] Game animations and transitions
- [ ] Responsive UI design
- [ ] Player avatars and themes
- [ ] Game statistics

### Phase 4: Enhanced Features  
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