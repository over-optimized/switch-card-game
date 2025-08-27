# Switch Card Game - Client Application

Mobile-first React frontend for the Switch multiplayer card game, built with Vite, TypeScript, and Zustand.

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
│   ├── components/      # React components
│   │   ├── mobile/      # Mobile-optimized components
│   │   ├── game/        # Game-related components
│   │   └── ui/          # Shared UI components
│   ├── stores/          # Zustand state management
│   ├── styles/          # CSS modules and global styles
│   ├── utils/           # Utility functions
│   └── main.tsx         # React application entry point
├── public/              # Static assets
├── dist/                # Production build output
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Client dependencies
```

### Key Components

#### Mobile-First Game Components

- **GameBoard**: Unified responsive game container using mobile-first patterns
- **MobileGameBoard**: Core game layout with fixed header/footer design
- **MobilePlayerSheet**: Draggable bottom sheet for player hand management
- **MobileHandArea**: Touch-optimized card interaction with selection feedback
- **MobileOpponentArea**: Responsive opponent display for 2-4 players
- **MobileWinModal**: Full-screen celebration modal for game completion

#### State Management (Zustand)

- **GameStore**: Core game state with network-first architecture
- **UIStore**: Interface state, mobile layout detection, modal management
- **WebSocket Integration**: Real-time multiplayer with optimistic updates
- **Persistent Settings**: Game preferences and user interface options

#### UI Features

- **Mobile-First Design**: Optimized for touch with desktop breakpoint support
- **Bottom Sheet Interface**: Expandable player hand area (0-300px)
- **Touch Interactions**: Card selection, drag gestures, tap-to-play
- **Visual Feedback**: Card selection states, playability indicators, animations
- **Responsive Layout**: CSS modules with 75%/25% control distribution

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

### Network-First Game Architecture

- ✅ **Unified Network Architecture**: All games use WebSocket connections (local = localhost)
- ✅ **Mobile-Optimized Interface**: Touch-first design with desktop compatibility
- ✅ **Real-time Multiplayer**: Live game state sync with optimistic updates
- ✅ **AI Opponent Integration**: Computer players managed by server
- ✅ **Room-Based Games**: Create/join rooms with 6-character codes
- ✅ **Cross-Platform**: Responsive design works on mobile and desktop

### Game Features

- ✅ **Switch Card Rules**: Match suit/rank, draw if can't play, win detection
- ✅ **Visual Feedback**: Card selection, hover effects, playability indicators
- ✅ **Mobile Gestures**: Bottom sheet expansion, touch-to-play mechanics
- ✅ **Game Management**: Start/restart, room creation, player management
- ✅ **Environment Aware**: Development (localhost) vs production (Railway) URLs

## 🔧 Configuration

### Vite Configuration (`vite.config.ts`)

- TypeScript compilation with strict mode
- Hot module replacement for development
- Production optimizations and minification
- Legacy browser support plugin

### Development Server

- **Port**: 3000 (configurable via VITE_PORT)
- **WebSocket Connection**: Connects to server at port 3001 (configurable via VITE_WS_URL)
- **Hot Module Replacement**: React Fast Refresh for instant component updates
- **Source Maps**: Available in development mode for debugging
- **Environment Variables**: Automatic loading of .env.development/.env.production

## 🎯 Game Implementation Details

### Game State Management

```typescript
// Zustand store with network-first architecture
import { useGameStore } from '../stores/gameStore';
import { GameEngine, GameState } from 'switch-shared';

// WebSocket connection with environment-based URLs
const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
const socket = io(wsUrl, {
  transports: ['websocket'],
  withCredentials: true,
});

// Zustand store integration
const { gameState, playCard, drawCard } = useGameStore();
```

### Card Rendering & Interactions

- **React Components**: Card components with TypeScript props and state
- **CSS Modules**: Scoped styling with responsive design patterns
- **Mobile Touch**: Optimized tap targets and gesture recognition
- **Selection State**: Visual feedback for selected/playable/unplayable cards
- **Smooth Animations**: CSS transitions for card movements and state changes
- **Accessibility**: Proper ARIA labels and keyboard navigation support

### State Architecture

- **Game Store (Zustand)**: Network-synchronized game state with optimistic updates
- **UI Store (Zustand)**: Interface state, mobile detection, modal management
- **Shared Logic**: All game rules imported from switch-shared package
- **Network Layer**: WebSocket events for real-time multiplayer synchronization
- **Persistence**: Game settings and UI preferences stored locally
- **Separation**: UI components never modify game rules, only trigger actions

## 🧪 Testing

### Test Strategy

- **Component Tests**: React components with React Testing Library
- **Store Tests**: Zustand store logic and state management
- **Integration Tests**: WebSocket connection and game state synchronization
- **Mobile Testing**: Touch interactions and responsive layout behavior
- **Coverage**: Focus on critical UI logic and store management

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

```bash
# Development (.env.development)
VITE_WS_URL=http://localhost:3001

# Production (.env.production)
VITE_WS_URL=https://switch-card-game-server.railway.app
```

- **Development**: Frontend (3000) connects to local server (3001)
- **Production**: Frontend (Vercel) connects to Railway-deployed server
- **Automatic**: Vite automatically selects environment based on build mode

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

- **Mobile-First Approach**: Design for mobile, enhance for desktop
- **Touch Optimization**: Proper tap targets (44px+), gesture support
- **Responsive Design**: CSS modules with breakpoint-based layouts
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Visual Feedback**: Clear selection states, loading indicators, error handling
- **Performance**: React.memo for expensive components, lazy loading

### Game Integration

- **Import Strategy**: ALL game logic from switch-shared package
- **Type Safety**: Use shared TypeScript interfaces for consistency
- **Network-First**: All games use WebSocket connections for state management
- **Optimistic Updates**: UI updates immediately, rolls back on server rejection
- **No Logic Duplication**: Never implement game rules in client code
- **Shared Validation**: Client validation for UX, server validation for authority

---

For more information, see the main project [README.md](../README.md) and [FEATURES.md](../FEATURES.md).
