# Switch Card Game - Development TODO

## ✅ **COMPLETED - Core Gameplay Foundation**

### High Priority - Game Rules Implementation ✅

- [x] **Research and document Switch card game rules**
  - [x] Define official rules to implement (basic matching: suit or rank)
  - [x] Decided to implement special cards incrementally (starting with 2s)
  - [x] Document win conditions and scoring
  - [x] Create rule validation logic

- [x] **Implement core game mechanics**
  - [x] Update GameEngine with Switch-specific rules
  - [x] Add card play validation (match suit or rank)
  - [x] Implement "must draw if can't play" rule
  - [x] Handle game end conditions
  - [x] Add deck reshuffling when empty

### High Priority - Interactive UI ✅

- [x] **Card interaction system**
  - [x] Click-to-play card functionality
  - [x] Visual feedback for playable cards (green glow/border)
  - [x] Show disabled card feedback (opacity, no-cursor)
  - [x] Draw card functionality with visual hints

- [x] **Game board enhancements**
  - [x] Improve card visual design (better colors, hover effects)
  - [x] Add discard pile with top card visible
  - [x] Show draw pile with card count and draw hints
  - [x] Add current player turn indicator
  - [x] Display comprehensive game status messages
  - [x] Add opponent display with card counts

## 🎯 Current Focus (Week 2) - React Migration Foundation

### High Priority - Architecture Migration

- [x] **Update project documentation** ✅
  - [x] Update TODO.md to reflect React migration priority
  - [x] Update FEATURES.md to include React architecture details
  - [x] Create React migration checklist with detailed task breakdown

- [x] **React + TypeScript setup** ✅
  - [x] Install React, ReactDOM, and TypeScript dependencies
  - [x] Configure Vite for React with TypeScript support
  - [x] Set up ESLint and Prettier for React development
  - [x] Add React testing utilities (React Testing Library)

- [x] **State Management Foundation** ✅
  - [x] Install and configure Zustand for state management
  - [x] Create network-aware store architecture
  - [x] Set up persistence middleware for settings
  - [x] Design action abstraction layer for local/network modes

- [x] **Base Component Architecture** ✅
  - [x] Create base component system and shared interfaces
  - [x] Build GameContainer as main app wrapper
  - [x] Implement Card component with drag/selection capabilities  
  - [x] Create PlayerHand component with sorting functionality
  - [x] Build GameBoard component for central game area

- [x] **Feature Parity Migration** ✅
  - [x] Migrate existing game functionality to React components
  - [x] Ensure 100% feature parity with current vanilla implementation
  - [x] Test all existing game mechanics work in React
  - [x] Verify AI behavior and game flow remain intact

## ✅ COMPLETED - 2s Trick Card Implementation (Commit: 79adea8)

### ✅ First Special Card on React Foundation - COMPLETE

- [x] **Test current basic gameplay thoroughly (on React)**
  - [x] Verified all migrated game rules work correctly
  - [x] Tested edge cases (deck running out, win conditions) 
  - [x] Confirmed AI behavior is reasonable in React version

- [x] **Design trick card state system (with Zustand)**
  - [x] Added game modes to Zustand stores ('normal', 'active-2s', 'active-run', etc.)
  - [x] Created penalty tracking system with React state management (PenaltyState interface)
  - [x] Designed card state management (active vs dead) in stores

- [x] **Implement 2s - "Pick Up Two" cards (React Components)**
  - [x] Updated game store actions to handle 2s stacking
  - [x] Added penalty accumulation logic with Zustand (2+2+2 = 6 cards)
  - [x] Implemented "play 2 or pick up penalty" mechanic in React
  - [x] Handle 2s becoming "dead" after penalty served with state transitions
  - [x] **CRITICAL FIX**: Penalty serving now correctly ends turn (no extra plays)

- [x] **Update React UI for trick cards**
  - [x] Created PenaltyIndicator component for active penalties with animations
  - [x] Added "Serve Penalty" button in HandControls with visual feedback
  - [x] Updated GameStatus component for trick card state messages  
  - [x] Added visual distinction components for active vs dead cards
  - [x] Enhanced CSS with penalty-specific styling and animations

## ✅ COMPLETED - Ace Trick Card Implementation

### ✅ Second Special Card (Ace - Suit Changer) - COMPLETE

- [x] **Design Ace implementation architecture**
  - [x] Added chosenSuit field to GameState for tracking suit changes
  - [x] Updated GameAction to support suit selection parameter  
  - [x] Planned suit selection UI/UX flow

- [x] **Backend Ace logic (Shared Engine)**
  - [x] Updated isValidPlay() to allow Aces on any suit (universal card)
  - [x] Blocked Aces during active penalties (cannot play on active 2s)
  - [x] Added handleAceEffect() method for suit changing
  - [x] Updated card matching logic to use chosenSuit when top card is Ace

- [x] **Frontend Ace implementation (Client)**
  - [x] Created SuitSelector component modal for suit selection
  - [x] Added suit selection state management to game store
  - [x] Implemented AI suit selection algorithm (smart choice based on hand)
  - [x] Updated card playing flow to handle suit selection step

- [x] **Ace visual system**
  - [x] Show chosen suit in top card display (A♠ → ♥ format)
  - [x] Added suit selection modal with animated suit buttons
  - [x] Updated card hints to show Aces as universally playable
  - [x] Responsive suit selection for mobile devices

## ✅ COMPLETED - Jack Trick Card Implementation

### ✅ Third Special Card (Jack - Skip Next Player) - COMPLETE

- [x] **Design Jack implementation architecture**
  - [x] Added skipsRemaining field to GameState for tracking active skips
  - [x] Planned skip logic integration with existing turn advancement
  - [x] No new game mode needed (unlike penalties)

- [x] **Backend Jack logic (Shared Engine)**
  - [x] Added handleJackEffect() method to increment skip counter per Jack played
  - [x] Modified advanceTurn() to recursively skip players when skipsRemaining > 0
  - [x] No special validation needed - Jacks follow normal matching rules
  - [x] Support for multiple Jack stacking (1 Jack = 1 skip, 2 Jacks = 2 skips)

- [x] **Frontend Jack implementation (Client)**
  - [x] Added enableJacks setting to GameSettings (enabled by default)
  - [x] Created SkipIndicator component showing which players will be skipped
  - [x] Enhanced game messages for Jack plays with skip notifications
  - [x] Updated recent moves tracking to show Jack effects

- [x] **Jack visual system**
  - [x] SkipIndicator with slide-in animation from right side
  - [x] Shows "Jack Effect Active" with player names to be skipped
  - [x] Blue gradient theme to distinguish from penalty indicator
  - [x] Animated skip icon with bounce effect

## 🎯 Next Focus (Week 5) - Fourth Trick Card Implementation

### High Priority Options for Next Card

- [ ] **8s (Reverse Direction)** - Changes turn order direction
  - [ ] Add direction change logic to advanceTurn system
  - [ ] Handle odd/even 8s stacking (1=reverse, 2=same direction)
  - [ ] Update turn indicators to show current direction

- [ ] **7s (Mirror Cards)** - Universal cards that mirror previous card rank/suit
  - [ ] Add card mirroring logic to game state
  - [ ] Update matching rules to use mirrored rank/suit
  - [ ] Visual indicators showing mirrored state

- [ ] **Runs (Starting with 3s)** - Sequential card chains
  - [ ] Most complex - requires new game mode and validation
  - [ ] Sequential rank progression system
  - [ ] Run termination and penalty logic

### Medium Priority - Game Polish

- [ ] **Add game statistics**
  - [ ] Track games played, won, lost
  - [ ] Show stats on restart screen
  - [ ] Add "quick restart" option

- [ ] **Improve AI behavior**
  - [ ] Make AI more strategic with 2s
  - [ ] Add slight delay for more realistic play
  - [ ] Consider different AI difficulty levels

## 📅 Phase 2 (Week 3-4) - Additional Special Cards

### Second Special Card Implementation

- [ ] **Choose next card type (8s or Aces recommended)**
  - [ ] 8s - Reverse Direction (simpler, good for 2-player)
  - [ ] Aces - Change Suit (more strategic complexity)
  - [ ] Design implementation approach

- [ ] **Implement chosen card**
  - [ ] Add card-specific logic to game engine
  - [ ] Update UI for new card effects
  - [ ] Test interaction with existing 2s

### Third Special Card Implementation

- [ ] **Implement remaining basic card (8s or Aces)**
  - [ ] Complete the simpler special cards first
  - [ ] Test all combinations work together
  - [ ] Refine AI to handle multiple special cards

### Advanced Features Planning

- [ ] **Prepare for complex cards**
  - [ ] Research Runs system architecture needs
  - [ ] Plan 7s Mirror card implementation
  - [ ] Consider 5♥ special case handling

## 📅 Phase 3 (Week 4-5) - Local Multiplayer & Polish

### Hot-Seat Multiplayer (Same Device)

- [ ] **Multiple players on one device**
  - [ ] Player turn management with hidden hands
  - [ ] "Pass device" screen between turns
  - [ ] Player name display and turn indicators
  - [ ] Hand hiding/showing based on current player

- [ ] **Local game state management**
  - [ ] Save/restore game state during device passing
  - [ ] Handle 2-4 players locally
  - [ ] Player setup screen (names, player count)
  - [ ] Local game statistics and history

### Visual Polish & Animations

- [ ] **Card animations**
  - [ ] Smooth card movement from hand to discard pile
  - [ ] Card flip animation when drawing from deck
  - [ ] Shuffle animation for deck
  - [ ] Special effects for trick cards

- [ ] **Game feedback**
  - [ ] Win/lose celebration animations
  - [ ] Turn transition effects
  - [ ] Penalty pickup animations
  - [ ] Sound effects for card plays

## 📅 Phase 3 (Week 4-5) - Networking Implementation

### WebSocket Connection (Deferred from Week 1)

- [ ] **Connect client to WebSocket server**
  - [ ] Add Socket.IO client connection in main.ts
  - [ ] Handle connection events (connect, disconnect, error)
  - [ ] Display connection status in UI

### Room Management UI (Deferred)

- [ ] **Implement room creation UI**
  - [ ] Add "Create Room" button and form
  - [ ] Display generated room code
  - [ ] Show player name input

- [ ] **Implement room joining UI**
  - [ ] Add "Join Room" form with code input
  - [ ] Handle join success/error states
  - [ ] Navigate to lobby after successful join

### Multiplayer Game Sync

- [ ] **Real-time game updates**
  - [ ] Sync game state changes across all clients
  - [ ] Handle player actions (play card, draw card)
  - [ ] Display turn changes and game events
  - [ ] Show game winner and reset options

## 📅 Phase 4 (Week 5-6) - Player vs Computer

### AI Implementation

- [ ] **Basic AI player**
  - [ ] Random valid card selection
  - [ ] Follow game rules correctly
  - [ ] Reasonable play timing

- [ ] **AI difficulty levels**
  - [ ] Easy: Random plays
  - [ ] Medium: Basic strategy (color/number matching)
  - [ ] Hard: Advanced strategy and card counting

- [ ] **Mixed PvP/PvC games**
  - [ ] Allow human and AI players in same game
  - [ ] AI player indicators in UI
  - [ ] Balanced gameplay experience

## 📅 Phase 5 (Week 6-7) - Deployment & Production

### Deployment Strategy: Vercel + Railway

- [ ] **Frontend deployment (Vercel)**
  - [ ] Configure Vite build for production
  - [ ] Set up environment variables for API endpoints
  - [ ] Deploy static client with automatic Git deployments
  - [ ] Configure custom domain (optional)

- [ ] **Backend deployment (Railway)**
  - [ ] Create Railway project and connect GitHub repo
  - [ ] Configure Node.js build and start scripts
  - [ ] Set up environment variables (CORS origins, port config)
  - [ ] Deploy server with WebSocket support
  - [ ] Configure health checks and monitoring

### Production Configuration

- [ ] **Environment setup**
  - [ ] Configure staging and production environments
  - [ ] Set up CORS to allow Vercel domain → Railway API
  - [ ] Configure SSL/TLS for secure WebSocket connections
  - [ ] Set up error monitoring and logging

- [ ] **Database integration (when ready)**
  - [ ] Add Railway PostgreSQL for persistent data
  - [ ] Update server to use database instead of in-memory storage
  - [ ] Implement user accounts and game history tables

## 🔄 Ongoing Tasks (Throughout Development)

### Code Quality & Testing

- [ ] **Expand test coverage**
  - [ ] Add integration tests for WebSocket events
  - [ ] Test multiplayer game scenarios
  - [ ] Add E2E tests with Playwright
  - [ ] Performance testing for multiple concurrent games

- [ ] **Code improvements**
  - [ ] Refactor shared types for better organization
  - [ ] Optimize client rendering performance
  - [ ] Add error boundaries and fallbacks
  - [ ] Implement proper logging system

### Documentation & DevOps

- [ ] **API documentation**
  - [ ] Document all WebSocket events
  - [ ] Create OpenAPI spec for REST endpoints
  - [ ] Add inline code documentation

- [ ] **Deployment preparation**
  - [ ] Create Dockerfile for server
  - [ ] Set up GitHub Actions CI/CD
  - [ ] Configure environment variables
  - [ ] Plan hosting strategy (Heroku, Railway, etc.)

## 🎯 Future Considerations (Backlog)

### Authentication System

- [ ] **User accounts (optional)**
  - [ ] Simple email/password registration
  - [ ] Guest player mode (current default)
  - [ ] User profile and statistics
  - [ ] Friend lists and invitations

### Advanced Features

- [ ] **Tournament mode**
  - [ ] Bracket-style tournaments
  - [ ] Leaderboards and rankings
  - [ ] Scheduled tournaments

- [ ] **Game variants**
  - [ ] Multiple rule sets to choose from
  - [ ] Custom room settings
  - [ ] Team play modes

### Mobile & Platform Support

- [ ] **Mobile optimization**
  - [ ] Touch-friendly card interactions
  - [ ] Responsive design improvements
  - [ ] PWA (Progressive Web App) features

- [ ] **Platform expansion**
  - [ ] Desktop app with Electron
  - [ ] Mobile app with React Native
  - [ ] Browser extension version

## 📊 Success Metrics to Track

### Technical Metrics

- [ ] WebSocket connection stability (>99% uptime)
- [ ] Game action latency (<100ms)
- [ ] Client load time (<3 seconds)
- [ ] Server memory usage monitoring
- [ ] Error rate tracking

### User Experience Metrics

- [ ] Game completion rate
- [ ] Average session duration
- [ ] Player return rate
- [ ] User feedback collection
- [ ] Mobile usability testing

---

## 📊 **Current Project Status**

### ✅ **What's Working Right Now:**

- **Fully playable basic Switch game** at http://localhost:3000
- **Core mechanics**: Match suit/rank, draw when can't play, win by emptying hand
- **Interactive UI**: Click cards to play, visual feedback for valid moves
- **AI opponent**: Computer plays random valid moves
- **Game management**: Win detection, restart functionality, turn indicators
- **Responsive design**: Works on desktop and mobile

### ✅ **Completed Milestone: React Migration** 

- **Architecture Migration**: Successfully migrated from vanilla JS to React + Zustand
- **Component System**: Built modular React component architecture
- **State Management**: Implemented network-aware Zustand stores
- **Feature Parity**: Maintained 100% compatibility with existing game functionality
- **Build Status**: Production ready with 170KB optimized bundle

### ✅ **Completed Milestone: 2s Trick Card (Commit: 79adea8)**

- **Penalty System**: Full penalty stacking with PenaltyState management
- **Visual Components**: Animated PenaltyIndicator and serve penalty button
- **AI Integration**: Smart computer penalty handling and turn management
- **Critical Fix**: Penalty serving correctly ends turn (no extra card plays)
- **Settings**: 2s enabled by default, fully configurable

### ✅ **Completed Milestone: Ace Trick Card (Commit: 43cae5f)**

- **Universal Card Logic**: Aces playable on any suit (except during penalties)
- **Suit Selection UI**: Modal with 2x2 grid, animations, mobile responsive
- **Smart AI**: Intelligent suit selection based on hand composition
- **Visual Indicators**: Golden glowing suit change display (♠ → ♥ format)
- **State Management**: Full suit selection integration with game store
- **Settings**: Aces enabled by default, fully configurable

### ✅ **Completed Milestone: Jack Trick Card (Commit: TBD)**

- **Skip Logic**: Players can skip opponents with strategic stacking
- **Turn Control**: 1 Jack = 1 skip, 2 Jacks = 2 skips, etc.
- **Visual Feedback**: SkipIndicator showing which players will be skipped
- **Direction Aware**: Respects current game direction for proper skip order
- **AI Integration**: Computer players can use Jacks tactically
- **Settings**: Jacks enabled by default, fully configurable

### 🎯 **Next Milestone: Fourth Trick Card (8s, 7s, or Runs)**

- Add fourth special card to continue building trick card variety
- Options: 8s (direction change), 7s (mirror), or Runs (sequential)
- Continue refining trick card architecture and UI patterns

### 📈 **Development Velocity (Updated for Trick Card Progress):**

- **Week 1**: Core foundation ✅ (Completed)
- **Week 2**: React migration foundation ✅ (Completed)
- **Week 3**: First special card (2s) ✅ (Completed - Commit: 79adea8)
- **Week 4**: Second special card (Aces) ✅ (Completed - Commit: 43cae5f)
- **Week 4**: Third special card (Jacks) ✅ (Completed - Commit: TBD)
- **Week 5**: Fourth special card (8s, 7s, or Runs) 🎯 (Next focus)
- **Week 6**: Advanced features (remaining trick cards, networking)  
- **Week 7+**: Polish, multiplayer, deployment

### 🏗️ **Architecture Strategy:**
- **React + Zustand foundation** enables complex state management for trick cards
- **Network-ready architecture** from day one accelerates PvP implementation
- **Component-based UI** makes feature additions and testing much easier

---

## 📝 Notes for Revised Development Strategy

### New Development Philosophy

- **Perfect the core gameplay experience first** before adding complexity
- **Single-player experience** must be polished and fun
- **Local multiplayer** validates UI before networking challenges
- **Networking last** ensures solid foundation before real-time complexity

### Architecture Reminders

- Keep all game logic in shared package (can be used locally or networked)
- Use TypeScript strictly across all packages
- Build UI to work locally first, then add network sync later
- Test each feature thoroughly in isolation

### Code Organization

- Update FEATURES.md when completing major items
- Focus on TODO.md Week 1-2 tasks first (core gameplay)
- Create GitHub issues for bugs found during development
- Document game rule decisions as they're made

### Development Tips for Current Phase

- Test game with different card combinations manually
- Focus on visual feedback and user experience
- Make cards feel responsive and fun to interact with
- Consider adding sound effects early for better feedback
- Keep shared package built when making game engine changes

### Deployment Strategy Summary

- **Frontend**: Vercel (great for static sites, you know it well)
- **Backend**: Railway (excellent WebSocket support for real-time gaming)
- **Database**: Railway PostgreSQL when needed
- **Cost**: Free tiers sufficient for development and early production

---

_Last Updated: 2024-08-24 (After Jack Trick Card Completion)_
_Review and update weekly during active development_
