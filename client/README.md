# Switch Card Game - Client Application

Frontend application for the Switch multiplayer card game, built with Vite and TypeScript.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- Built shared package (`pnpm build:shared` from root)

### Development Setup

```bash
# From project root - build shared dependencies first
pnpm build:shared

# Start client development server
pnpm dev:client
# OR from client directory
cd client && pnpm dev
```

Client will be available at: http://localhost:3000

## 🏗️ Architecture

### Technology Stack

- **Build Tool**: Vite 5.1+ with hot module replacement
- **Language**: TypeScript with strict mode
- **Styling**: Embedded CSS-in-JS approach
- **Game Logic**: Imported from shared package
- **Networking**: Socket.IO client for real-time multiplayer

### Project Structure

```
client/
├── src/
│   └── main.ts          # Main application entry point
├── public/              # Static assets
├── dist/               # Production build output
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Client dependencies
```

### Key Components

#### Game Interface (`main.ts`)

- **Game Board**: Visual representation of cards and game state
- **Card Interaction**: Click-to-play mechanics with visual feedback
- **Turn Management**: Player turn indicators and game flow
- **AI Opponent**: Computer player for single-player games
- **Game Status**: Real-time status messages and win conditions

#### UI Features

- **Responsive Design**: Works on desktop and mobile devices
- **Visual Feedback**: Card hover effects, playability indicators
- **Game Controls**: Start/restart game, draw cards, play cards
- **Status Display**: Current player, card counts, game messages

## ⚙️ Development Commands

```bash
# Development
pnpm dev                # Start development server (port 3000)
pnpm build              # Build for production
pnpm preview            # Preview production build

# Code Quality
pnpm lint               # ESLint validation
pnpm lint:fix           # Auto-fix lint issues
pnpm test               # Run unit tests
pnpm test:coverage      # Run tests with coverage
```

## 🎮 Current Features

### Single Player Game

- ✅ **Basic Switch Rules**: Match suit or rank, draw if can't play
- ✅ **Interactive UI**: Click cards to play, visual feedback system
- ✅ **AI Opponent**: Computer player with random valid moves
- ✅ **Game Management**: Win detection, restart functionality
- ✅ **Visual Polish**: Card animations, status indicators

### Multiplayer (In Development)

- 🔄 **Room System**: Create and join game rooms with codes
- 🔄 **Real-time Sync**: Live game state updates via WebSocket
- 🔄 **Multiple Players**: Support for 2-4 players per game

## 🔧 Configuration

### Vite Configuration (`vite.config.ts`)

- TypeScript compilation with strict mode
- Hot module replacement for development
- Production optimizations and minification
- Legacy browser support plugin

### Development Server

- **Port**: 3000 (configurable via VITE_PORT)
- **API Proxy**: Configured to proxy /api to server (port 3001)
- **Hot Reload**: Automatic reload on file changes
- **Source Maps**: Available in development mode

## 🎯 Game Implementation Details

### Game State Management

```typescript
// Game state is managed by shared GameEngine
import { GameEngine, GameState } from 'switch-shared';

const gameEngine = new GameEngine();
const gameState = gameEngine.getGameState();
```

### Card Rendering

- Cards rendered as HTML elements with CSS styling
- Visual feedback for playable vs unplayable cards
- Hover effects and smooth transitions
- Mobile-touch friendly interactions

### UI State vs Game State

- **UI State**: Visual elements, animations, user interactions
- **Game State**: Authoritative game logic from shared package
- **Separation**: UI never modifies game rules, only displays state

## 🧪 Testing

### Test Strategy

- **Unit Tests**: Focus on UI logic and user interactions
- **Integration Tests**: Test game state integration
- **Coverage**: Maintain reasonable coverage on client logic

```bash
# Run tests
pnpm test

# Coverage report
pnpm test:coverage
```

## 🚀 Deployment

### Production Build

```bash
# Build optimized client
pnpm build

# Preview production build locally
pnpm preview
```

### Deployment Targets

- **Vercel** (recommended): Automatic deployments from Git
- **Static Hosting**: Any static file hosting service
- **CDN**: Can be served from any CDN with proper routing

### Environment Configuration

- **Development**: http://localhost:3000 → http://localhost:3001 (API)
- **Production**: Configure API_URL environment variable for server endpoint

## 🔍 Troubleshooting

### Common Issues

**Build Failures**

- Ensure shared package is built: `pnpm build:shared`
- Check TypeScript errors: `pnpm tsc --noEmit`
- Verify all imports from switch-shared are valid

**Development Server Issues**

- Port 3000 conflict: Set VITE_PORT environment variable
- Hot reload not working: Check file watchers and restart dev server
- Module resolution errors: Verify shared package build and types

**Game Logic Issues**

- Game rules not working: Check shared package implementation
- State synchronization: Ensure proper GameEngine usage
- UI out of sync: Verify UI updates when game state changes

## 📚 Development Guidelines

### Code Style

- Use TypeScript strict mode (no implicit any)
- Follow ESLint configuration for consistency
- Use Prettier for code formatting
- Prefer functional programming patterns

### UI Development

- Keep UI responsive and accessible
- Provide clear visual feedback for user actions
- Handle loading and error states gracefully
- Test on multiple screen sizes

### Game Integration

- Import ALL game logic from shared package
- Never duplicate game rules in client code
- Use shared types for all game-related interfaces
- Validate user input but rely on shared validation

---

For more information, see the main project [README.md](../README.md) and [FEATURES.md](../FEATURES.md).
