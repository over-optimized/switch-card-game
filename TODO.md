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

## ✅ COMPLETED - React Migration Foundation (Week 2)

### High Priority - Architecture Migration ✅

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

## ✅ COMPLETED - Mobile-First Architecture Implementation (Week 3-4)

### ✅ Mobile Component System - COMPLETE

- [x] **Mobile-Responsive Game Board**
  - [x] Created MobileGameBoard component with fixed header and bottom sheet
  - [x] Implemented responsive opponent area (MobileOpponentArea)
  - [x] Added mobile-optimized deck area integration
  - [x] Full mobile game layout with proper touch targets

- [x] **Bottom Sheet Player Interface**
  - [x] Built MobilePlayerSheet with draggable bottom sheet
  - [x] Added drag handle with haptic feedback and visual indicators
  - [x] Implemented expandable player hand area (0-300px expansion)
  - [x] Created mobile-friendly play/clear button controls

- [x] **Mobile Hand Management**
  - [x] Developed MobileHandArea with touch-optimized card interactions
  - [x] Connected to global game store for state management
  - [x] Added card selection visual feedback for mobile
  - [x] Implemented proper card layout for small screens

- [x] **Mobile Win Screen System**
  - [x] Created MobileWinModal with full-screen celebration overlay
  - [x] Added responsive win screen with animations and confetti
  - [x] Integrated "New Game" and "Back to Menu" actions
  - [x] Mobile-optimized victory experience with proper styling

- [x] **Mobile Game State Management**
  - [x] Fixed missing win detection for player card plays
  - [x] Added comprehensive penalty system debugging for mobile
  - [x] Enhanced mobile card selection state synchronization
  - [x] Implemented mobile-specific game flow handling

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

## 🚨 CRITICAL PRIORITY (Week 5) - Architecture Consolidation

**⚠️ STOP - Complete This Before Any New Features ⚠️**

The current architecture has grown complex with mobile/desktop duplication and local/network code paths. This technical debt must be resolved before adding more features to prevent exponential complexity growth.

### Critical Priority - Architecture Simplification Strategy

- [x] **Network-First Architecture Implementation** ✅ COMPLETED
  - [x] Eliminate local/network code path duplication in game store
  - [x] Convert local games to localhost WebSocket connections
  - [x] Remove `playCardsLocally` and local game branches from stores
  - [x] Unify all games under optimistic update + rollback system
  - [x] Implement lightweight local WebSocket server for "local" games (with AI support)
  - [x] Environment-based WebSocket URLs for production vs development
  - [x] Railway deployment configuration ready

- [x] **Mobile-First Desktop Consolidation** ✅ COMPLETED
  - [x] Replace `PlayerHandArea` with responsive `MobileHandArea`
  - [x] Replace `MultiOpponentArea` with responsive `MobileOpponentArea`  
  - [x] Unified `GameBoard` component using mobile-first approach
  - [x] Convert `GameBoard` to use mobile bottom sheet patterns with desktop scaling
  - [x] Enhance mobile components with desktop-friendly sizing and interactions
  - [x] Fix mobile layout issues with secondary controls positioning and width distribution
  - [x] Replace desktop `GameInfo` with `MobileWinModal` for all platforms (final cleanup)

- [x] **Component Architecture Cleanup** ✅ COMPLETED  
  - [x] Map all [Mobile/Desktop] × [Local/Network] component combinations
  - [x] Document duplication impact and maintenance burden
  - [x] Create migration plan for gradual component consolidation
  - [x] Implement feature branch isolation for safe development
  - [x] Convert HandControls to CSS modules with proper responsive layout
  - [x] Create safe deployment strategy with Vercel pause during server setup
  - [x] Test unified components across all platforms and game modes (final testing)
  - [x] Remove obsolete desktop-specific components (final cleanup)
  - [x] Centralize layout detection in single context/hook (final cleanup)

### Success Metrics (Must Achieve Before Proceeding)

- [x] **Code Reduction**: ✅ Achieved ~70% component duplication elimination
- [x] **Single Game Mode**: ✅ All games use network architecture (local = localhost WebSocket)
- [x] **Unified UX**: ✅ Mobile patterns work consistently on desktop (with responsive breakpoints)
- [x] **Simplified Testing**: ✅ Single test matrix - unified components handle both modes
- [x] **Production Ready**: ✅ Railway deployment configuration complete with environment-based URLs
- [x] **Safe Deployment**: ✅ Vercel deployments paused during server setup to prevent broken production
- [x] **Maintainability**: ✅ Single codebase for all platforms and game modes

### 🎯 ARCHITECTURE CONSOLIDATION: ✅ 100% COMPLETE - FINAL CLEANUP FINISHED! 🚀

**✅ MAJOR ACCOMPLISHMENTS - ALL COMPLETE:**
- **Network-First Architecture**: ✅ All games use WebSocket connections (local = localhost)
- **Component Consolidation**: ✅ PlayerHandArea → MobileHandArea, MultiOpponentArea → MobileOpponentArea, GameBoard unified
- **Mobile Layout Fixes**: ✅ Complete mobile UI overhaul with proper secondary controls positioning  
- **Server Enhancement**: ✅ Added local single-player room support with AI opponents
- **Production Deployment**: ✅ Railway + Vercel fully operational with monitoring
- **Environment Configuration**: ✅ WebSocket URLs environment-based (dev vs production)
- **Responsive Design**: ✅ Unified components work seamlessly across mobile and desktop
- **Code Reduction**: ✅ ~70% reduction in component duplication achieved
- **CI/CD Pipeline**: ✅ GitHub Actions with quality gates and deployment automation
- **Session Management**: ✅ Leave Room functionality with graceful disconnect
- **Server Optimization**: ✅ Resource monitoring and Railway trial optimizations
- **Final Architecture Cleanup**: ✅ Centralized responsive hooks, removed obsolete components, unified win modals

**🎉 PRODUCTION STATUS: FULLY OPERATIONAL**
- ✅ **Frontend**: https://switch-card-game.vercel.app (Vercel)
- ✅ **Backend**: https://switch-server-production.up.railway.app (Railway)  
- ✅ **CI/CD**: GitHub Actions pipeline with quality gates
- ✅ **Monitoring**: Server resource tracking (12MB heap usage - highly optimized!)
- ✅ **Session Management**: Users can join/leave rooms gracefully
- ✅ **Smart Deployments**: Vercel skips server-only changes automatically

**📊 ARCHITECTURE CONSOLIDATION RESULTS:**
- **Component Consolidation**: ~70% code reduction achieved
- **Mobile-First Success**: Single responsive codebase for all platforms  
- **Network-First**: Eliminated local/network duplication entirely
- **Production Ready**: Full deployment pipeline with monitoring
- **User Experience**: Seamless session management and optimized performance

---

## ✅ COMPLETED - Connection Stability & Online Room Management (Week 5)

### ✅ Connection Stability Implementation - COMPLETE

- [x] **Visual Connection Status System**
  - [x] ConnectionIndicator component with real-time WebSocket state feedback
  - [x] Status indicators: 🟢 Connected, 🟠 Connecting/Reconnecting, 🔴 Offline
  - [x] Integrated into GameHeader with click-to-view room info
  - [x] Responsive mobile layout with proper touch targets

- [x] **Automatic Reconnection System**
  - [x] Exponential backoff strategy (1s → 2s → 4s → 8s → max 30s)
  - [x] Smart reconnection logic triggered only when room code exists
  - [x] Progress tracking with attempt counter display (e.g., "Reconnecting... 3/10")
  - [x] Max attempt limits to prevent infinite retry loops
  - [x] Manual reconnection buttons when automatic attempts fail

- [x] **Enhanced Error Handling & User Feedback**
  - [x] Connection-aware error messages replacing misleading "Invalid card play" errors
  - [x] Context-specific feedback: "Connecting...", "Reconnecting...", "Connection failed"
  - [x] Toast notification system replacing intrusive browser alerts
  - [x] Recovery guidance directing users to manual reconnection options

- [x] **Room Session Persistence**
  - [x] localStorage integration saving room sessions for 30 minutes
  - [x] Automatic session restoration on page refresh or reconnection
  - [x] Session cleanup removing expired room data
  - [x] Rejoin capability after temporary disconnections

### ✅ Online Multiplayer Features - COMPLETE

- [x] **Room Management System**
  - [x] Create Room functionality generating shareable 6-character codes
  - [x] Join Room interface with auto-uppercase formatting
  - [x] Connection prerequisites ensuring server connection before operations
  - [x] Timeout protection with 10-second operation timeouts

- [x] **MenuScreen Integration**
  - [x] New "Online Play" section with collapsible interface
  - [x] Connection status display showing server availability
  - [x] Player name input with validation and character limits
  - [x] Room code input with monospace formatting for readability
  - [x] Loading states with disabled buttons during operations

- [x] **Enhanced User Experience**
  - [x] Toast notifications replacing browser alert() calls
  - [x] Validation messages guiding users through form completion
  - [x] Loading indicators showing progress during async operations
  - [x] Mobile optimization with touch-friendly buttons and responsive layouts

### ✅ Technical Implementation - COMPLETE

- [x] **New Components & Features**
  - [x] ConnectionIndicator component with status animations
  - [x] Enhanced GameHeader with connection integration
  - [x] Updated MenuScreen with online play section
  - [x] Enhanced gameStore with connection management
  - [x] Enhanced uiStore with menu section support

- [x] **Type Safety & Configuration**
  - [x] Enhanced global types for browser APIs (localStorage, NodeJS.Timeout)
  - [x] ESLint configuration updates with missing global definitions
  - [x] TypeScript compatibility fixes for setTimeout return types
  - [x] Interface extensions for room management methods

## 🎮 ENGAGEMENT FEATURES & SOCIAL SYSTEMS - NEW PRIORITY

**⭐ HIGH IMPACT: Leverage existing statistics system for player retention and engagement**

### Phase 1: Daily Challenges & Basic Engagement (4-6 weeks) - HIGH PRIORITY

#### Daily Challenges System ⭐ HIGHEST IMPACT, LOW EFFORT

- [ ] **Guest-Friendly Challenge System**
  - [ ] Design challenge types leveraging existing game statistics
    - Speed challenges: "Win a game in under 5 minutes" (uses gameDurationMs)
    - Skill challenges: "Win without drawing any cards" (uses cardsDrawn stat)
    - Trick card challenges: "Reverse direction 5 times in one game" (uses directionChanges)
    - Streak challenges: "Win 3 games in a row" (new streak tracking)
  - [ ] localStorage-based progress tracking (no authentication required)
  - [ ] Daily challenge refresh mechanism with weekend specials
  - [ ] Challenge progress UI component with completion indicators

- [ ] **Streak Tracking & Progress Systems**
  - [ ] Win streak tracking with visual progression
  - [ ] "Hot streak" indicators and celebration animations
  - [ ] Personal best tracking (fastest wins, longest games, trick card mastery)
  - [ ] Level-up system based on games played and achievements
  - [ ] Progress bars and achievement unlock notifications

- [ ] **Achievement Badge System**
  - [ ] Badge collection for game accomplishments
    - "Trick Card Master": Play 10 special cards in one game
    - "Penalty Avoider": Win 5 games without receiving penalties
    - "Speed Demon": Win 10 games under 3 minutes
    - "Direction Master": Change direction 50 times total
  - [ ] Achievement progress tracking and completion celebrations
  - [ ] Badge display in game UI and win screens

### Phase 2: Tournament & Competition Systems (6-8 weeks) - MEDIUM PRIORITY  

#### Tournament Mode

- [ ] **Single Elimination Tournaments**
  - [ ] 4/8/16 player bracket generation
  - [ ] Automated tournament progression
  - [ ] Tournament leaderboards and winner celebrations
  - [ ] Guest-friendly tournament participation

- [ ] **Daily/Weekly Tournaments**
  - [ ] Automated tournament scheduling
  - [ ] Different tournament formats (speed, trick card masters, classic rules)
  - [ ] Tournament history and results tracking

#### Leaderboard Systems

- [ ] **Multiple Leaderboard Categories**
  - [ ] Speed leaderboard (fastest wins using gameDurationMs)
  - [ ] Win rate leaderboard (wins/total games)
  - [ ] Trick card mastery leaderboard (specialCardsPlayed)
  - [ ] Streak leaderboard (longest win streaks)
  - [ ] Seasonal rankings with monthly/weekly resets

- [ ] **Guest vs Account Leaderboards**
  - [ ] Device-local leaderboards for guest players
  - [ ] Global leaderboards for account holders
  - [ ] Leaderboard UI components with ranking visualization

### Phase 3: Social Features & Advanced Engagement (8-12 weeks) - FUTURE

#### Social Features

- [ ] **Friend Systems**
  - [ ] Friend lists with guest account bridging
  - [ ] Send challenges to friends
  - [ ] Private leaderboards among friend groups
  - [ ] Share game highlights and achievements

#### Advanced Customization

- [ ] **Unlockable Content System**
  - [ ] Unlockable card backs through achievement progress
  - [ ] Theme unlocks (dark mode, seasonal themes)
  - [ ] Animation unlocks (special win celebrations)
  - [ ] Unlock progression tied to daily challenges and achievements

- [ ] **Game Variants & Custom Modes**
  - [ ] Speed Switch (faster turn timers)
  - [ ] Trick Card Masters (all special cards enabled)
  - [ ] Classic Mode (basic rules only)
  - [ ] Custom rule lobbies with player-created settings

### 🔐 Authentication Strategy

#### Phase 1: Guest-First Approach (Immediate Implementation)

- [ ] **Persistent Guest System**
  - [ ] Browser fingerprinting for returning player recognition
  - [ ] Persistent nicknames with localStorage
  - [ ] Local statistics and achievement storage
  - [ ] "Create account to sync across devices" upgrade path

#### Phase 2: Lightweight Authentication (Later)

- [ ] **Minimal Registration System**
  - [ ] Guest account bridge (convert existing progress)
  - [ ] Nickname + optional email registration
  - [ ] OAuth integration (Google/GitHub)
  - [ ] Cloud sync for cross-device progress preservation

#### Phase 3: Full Social Features (Advanced)

- [ ] **Complete Profile System**
  - [ ] Public profiles with statistics and achievements
  - [ ] Friend discovery by username/email
  - [ ] Account linking across multiple devices

### 🛠️ Technical Architecture Extensions

#### Database Schema Requirements

- [ ] **Guest Tracking Tables**
  - [ ] guest_sessions (browser_fingerprint, nickname, progress)
  - [ ] daily_challenges (challenge definitions and requirements)
  - [ ] player_progress (challenge completion tracking)
  - [ ] achievement_progress (badge collection progress)

- [ ] **Statistics Enhancement**
  - [ ] Extend existing GameStats for challenge requirements
  - [ ] Add streak tracking to player statistics
  - [ ] Personal best tracking across multiple metrics
  - [ ] Historical data aggregation for leaderboards

#### API Endpoints

- [ ] **Challenge & Achievement APIs**
  - [ ] `/api/challenges/daily` - Today's challenges
  - [ ] `/api/achievements/{player}` - Player progress
  - [ ] `/api/leaderboards/{type}` - Ranking data
  - [ ] `/api/tournaments/active` - Current tournaments

### 📊 Success Metrics & Targets

#### Engagement Metrics

- [ ] **Set Up Tracking**
  - [ ] Daily active user tracking
  - [ ] Average session duration monitoring (target: >20 minutes)
  - [ ] Daily challenge completion rate (target: >40%)
  - [ ] Player return rate (target: 60% next-day, 30% next-week)

#### Feature Adoption Metrics

- [ ] **Monitor Feature Usage**
  - [ ] Tournament participation rate
  - [ ] Achievement collection progress
  - [ ] Social feature usage (friends, challenges)
  - [ ] Custom game mode usage

**🎯 IMPLEMENTATION STRATEGY: Start with Daily Challenges (highest impact, leverages existing stats system)**

---

## 🎯 NEXT PRIORITIES - Fourth Trick Card & Game Polish

**✅ Architecture Consolidation Complete - Ready for Feature Development!**
**✅ Connection Stability & Online Multiplayer Complete - Robust Network Experience!**

### Remaining Trick Card Implementation Plan

**Current Status: 3/7 Complete** (2s ✅, Aces ✅, Jacks ✅)

### Priority 1: **8s (Reverse Direction)** - NEXT IMPLEMENTATION

- [ ] **Backend Implementation (Shared Engine)**
  - [ ] Add `direction` field to GameState ('clockwise' | 'counterclockwise')
  - [ ] Add `handle8sEffect()` method to GameEngine
  - [ ] Update `advanceTurn()` logic to respect current direction
  - [ ] Handle odd/even 8s stacking (1=reverse, 2=same direction, etc.)

- [ ] **Frontend Implementation (Client)**
  - [ ] Add DirectionIndicator component showing current turn order
  - [ ] Update game status messages for direction changes
  - [ ] AI integration for strategic 8s usage
  - [ ] Enable `enable8s: true` setting in uiStore

### Priority 2: **5♥ (Pick Up Five)** - MEDIUM COMPLEXITY

- [ ] **Backend Implementation (Shared Engine)**
  - [ ] Add `handle5HeartsEffect()` method with 5-card penalty
  - [ ] Implement 2♥ counter logic (only card that can stop 5♥)
  - [ ] Add 5♥-specific penalty state management
  - [ ] Handle 5♥ + 2s chaining interactions

- [ ] **Frontend Implementation (Client)**
  - [ ] Create 5Hearts-specific penalty indicator (different from 2s)
  - [ ] Update penalty serving logic for 5-card draws
  - [ ] AI logic for 5♥ play timing and 2♥ countering
  - [ ] Enable `enable5Hearts: true` setting in uiStore

### Priority 3: **7s (Mirror Cards)** - HIGH COMPLEXITY

- [ ] **Backend Implementation (Shared Engine)**
  - [ ] Add `mirroredRank` and `mirroredSuit` fields to GameState
  - [ ] Add `handle7sEffect()` method with card mirroring logic
  - [ ] Update `isValidPlay()` to use mirrored values when 7 is top card
  - [ ] Handle multiple 7s stacking (each mirrors previous card)

- [ ] **Frontend Implementation (Client)**
  - [ ] Create MirrorIndicator component showing current mirrored state
  - [ ] Update top card display to show mirrored rank/suit (7♠ → K♥ format)
  - [ ] AI logic for strategic 7s usage and card bridging
  - [ ] Add `enable7s` setting to uiStore and types

### Priority 4: **Runs (Sequential Chains)** - MOST COMPLEX

- [ ] **Backend Implementation (Shared Engine)**
  - [ ] Add 'active-run' game mode to existing mode system
  - [ ] Add `currentRunRank` field to GameState for sequence tracking
  - [ ] Add `handleRunsEffect()` method for 3s (run starters)
  - [ ] Implement sequential rank validation (3→4→5→...→King→Ace)
  - [ ] Add run termination logic (success on Ace, failure penalties)
  - [ ] Handle run failure penalties (cards = current rank)

- [ ] **Frontend Implementation (Client)**
  - [ ] Create RunIndicator component showing current sequence progress
  - [ ] Update card hints to show valid run continuations
  - [ ] Enhanced game status messages for run state
  - [ ] AI logic for run strategy (when to start, continue, or fail)
  - [ ] Enable `enableRuns: true` setting in uiStore

### Implementation Strategy

- **Follow established patterns**: Each card follows handle[Card]Effect() → UI component → AI integration → settings
- **Test incrementally**: Enable one card at a time to verify interactions
- **Maintain compatibility**: Ensure new cards work with existing 2s, Aces, Jacks
- **Mobile-first UI**: All new indicators must work on mobile and desktop

## 🎮 Game Customization UI - NEXT PRIORITY

**Current Issue**: Players can't customize trick card rules from the main menu

### Phase 1: MenuScreen Game Rules Section

- [ ] **Add Game Rules Section to MenuScreen**
  - [ ] Add `gameRulesExpanded: boolean` to menuSections in uiStore
  - [ ] Create expandable "Game Rules" section with toggle switches
  - [ ] Follow existing section pattern (Quick Start, Online Play, Player Setup)

- [ ] **Trick Card Toggle Controls**
  - [ ] Individual toggle switches for implemented cards (2s, Aces, Jacks, 8s)
  - [ ] Disabled toggles for future cards (5♥, 7s, Runs) with "Coming Soon"
  - [ ] Visual card icons + descriptions for each toggle

- [ ] **Enhanced Game Creation Flow**
  - [ ] Update GameSetupConfig to include trick card settings
  - [ ] Pass custom settings to createRoom/createLocalGame
  - [ ] Server-side validation of rule combinations

### Phase 2: Visual Rule Indicators

- [ ] **In-Game Menu Enhancements** ✅ COMPLETED
  - [x] Fixed incorrect rule descriptions (8s: "Miss Turn" → "Reverse Direction")  
  - [x] Added all missing rule indicators (5♥, 7s, Runs)
  - [x] Proper active/inactive visual states with green/red styling

- [ ] **Game Setup Preview**
  - [ ] Active rules summary in game creation
  - [ ] "Classic Rules" vs "Full Rules" preset buttons
  - [ ] Rule conflict validation and warnings

### Medium Priority - Game Polish

- [x] **Add game statistics** ✅ COMPLETED
  - [x] Track comprehensive game metrics (duration, moves, cards played/drawn, penalties)
  - [x] Enhanced win screen with meaningful statistics display
  - [x] Smart statistics selection algorithm showing 4 most relevant stats
  - [x] Player performance summaries with achievements (trick card master, penalty avoider)
  - [x] Real-time statistics tracking throughout game engine
  - [ ] Add "quick restart" option (deferred)

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

## ✅ COMPLETED - Phase 4 - Player vs Computer (Partial)

### ✅ Basic AI Implementation - COMPLETE

- [x] **Basic AI player** ✅
  - [x] Valid card selection with game rule compliance
  - [x] Smart penalty handling (2s, Aces, Jacks)
  - [x] Reasonable play timing with delays
  - [x] Strategic suit selection for Aces based on hand composition
  - [x] Tactical use of skip cards (Jacks) and penalty avoidance

- [x] **AI difficulty UI** ✅
  - [x] Easy/Medium/Hard dropdown in MenuScreen.tsx
  - [x] Player configuration with AI difficulty selection
  - [x] UI state management for AI players

### 🔴 AI Implementation - INCOMPLETE

- [ ] **AI difficulty logic implementation** 
  - [ ] Easy: Random valid plays (currently not differentiated)
  - [ ] Medium: Current smart behavior (already works well)
  - [ ] Hard: Advanced strategy with card counting and probability
  - [ ] Connect MenuScreen AI difficulty setting to actual game logic

- [ ] **Mixed PvP/PvC games**
  - [ ] Allow human and AI players in same game (currently single human + AI only)
  - [ ] AI player indicators in multiplayer UI
  - [ ] Balanced gameplay experience across difficulty levels

## ✅ COMPLETED - Phase 5 - Frontend Deployment (Vercel)

### ✅ Vercel Deployment - COMPLETE

- [x] **Frontend deployment (Vercel)** ✅
  - [x] Configure Vite build for production with vercel.json
  - [x] Set up workspace-aware build command using pnpm filters
  - [x] Deploy static client with SPA routing support
  - [x] Configure asset caching headers for performance
  - [x] Automatic Git deployments configured

### 🟡 Backend Deployment - READY TO DEPLOY (Railway)

- [x] **Backend deployment preparation (Railway)** ✅ CONFIGURATION COMPLETE
  - [x] Created railway.toml with production build and start commands
  - [x] Added nixpacks.toml for monorepo build configuration
  - [x] Configure Node.js build and start scripts (tested locally)
  - [x] Set up environment variables (CORS origins, port config)
  - [x] Added comprehensive Railway deployment documentation
  - [ ] **Next**: Deploy server with WebSocket support (requires Railway CLI setup)
  - [ ] **Then**: Configure health checks and monitoring

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

- **Fully playable Switch game with mobile-first design** at http://localhost:3000
- **Core mechanics**: Match suit/rank, draw when can't play, win by emptying hand
- **Interactive UI**: Click/touch cards to play, visual feedback for valid moves
- **AI opponent**: Computer plays valid moves with penalty handling
- **Mobile-optimized experience**: Bottom sheet, drag handles, touch targets
- **Win screen system**: Mobile celebration modal with restart/menu options
- **Game management**: Win detection, penalty system, turn indicators
- **Responsive design**: Dedicated mobile and desktop layouts

### ✅ **Completed Milestone: React Migration** 

- **Architecture Migration**: Successfully migrated from vanilla JS to React + Zustand
- **Component System**: Built modular React component architecture
- **State Management**: Implemented network-aware Zustand stores
- **Feature Parity**: Maintained 100% compatibility with existing game functionality
- **Build Status**: Production ready with optimized bundle

### ✅ **Completed Milestone: Mobile-First Architecture**

- **Mobile Component System**: Built comprehensive mobile-first UI with bottom sheets
- **Responsive Design**: Dedicated mobile and desktop layouts with proper touch targets
- **Mobile Win Screen**: Full-screen celebration modal with animations and proper actions
- **Touch Optimization**: Drag handles, haptic feedback, expandable interfaces
- **State Management**: Mobile-specific game state handling and debugging
- **Legacy Cleanup**: Removed unused vanilla TypeScript implementation (main.ts)

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

### ✅ **Completed Milestone: Game Statistics & Enhanced Win Screen**

- **Comprehensive Tracking**: Real-time statistics for all game actions (cards played/drawn, penalties, special cards)
- **Smart Statistics Display**: Algorithm selects 4 most relevant stats based on game context and priority
- **Enhanced Win Screen**: Replaced meaningless "Final Cards: 0" with dynamic player performance summary
- **Player Achievements**: Contextual highlights (trick card master, penalty avoider, most active player)
- **Game Metrics**: Duration tracking, total moves, direction changes, penalty cards served
- **Responsive Design**: Mobile-first statistics display with CSS grid layout and proper styling
- **TypeScript Integration**: Full type safety with GameStats and PlayerGameStats interfaces

### 🎯 **Next Milestone: Fourth Trick Card (8s, 7s, or Runs)**

- Add fourth special card to continue building trick card variety
- Options: 8s (direction change), 7s (mirror), or Runs (sequential)
- Continue refining trick card architecture and UI patterns

### 📈 **Development Velocity (Updated for Engagement Features Priority):**

- **Week 1**: Core foundation ✅ (Completed)
- **Week 2**: React migration foundation ✅ (Completed)
- **Week 3**: First special card (2s) ✅ (Completed - Commit: 79adea8)
- **Week 3-4**: Mobile-first architecture ✅ (Completed - Commits: 4acab70, 9028a11, 1708d2c)
- **Week 4**: Second special card (Aces) ✅ (Completed - Commit: 43cae5f)
- **Week 4**: Third special card (Jacks) ✅ (Completed - Commit: TBD)
- **Week 5**: 🚨 **CRITICAL Architecture consolidation** ✅ (100% COMPLETE - production deployed!)
- **Week 6**: **NEW PRIORITY** - Engagement Features Phase 1 (Daily challenges, streaks, achievements)
- **Week 7-8**: Daily challenges implementation + Achievement badge system
- **Week 9-10**: Tournament mode + Basic leaderboards  
- **Week 11+**: Social features, advanced customization, additional trick cards

### 🏗️ **Architecture Strategy (Updated for Consolidation):**
- **Network-First Architecture**: Eliminate local/network complexity by treating all games as network games
- **Mobile-First Desktop**: Proven mobile UX patterns extended to desktop with responsive scaling
- **Unified Component System**: Single responsive components replace mobile/desktop duplication
- **Simplified State Management**: One code path for all platforms and game modes
- **Technical Debt Resolution**: Critical consolidation before feature expansion

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

## 📊 ANALYTICS & USER INSIGHTS SYSTEM

### Phase 1: Core Game Lifecycle Events ✅ COMPLETE

- [x] **Game Start Tracking**
  - [x] `game_started` event in MenuScreen for all game types
  - [x] Track: type (quick_start/custom/multiplayer), mode, player_count, has_ai
  - [x] Separate tracking for quick start vs custom setup vs multiplayer

- [x] **Game Completion Tracking**
  - [x] `game_finished` event in game store when games complete
  - [x] Track: duration_seconds, player_count, winner_type (human/ai), final_stats
  - [x] Include game statistics data for completion analysis

- [x] **Game Abandonment Tracking**
  - [x] `game_abandoned` event when users leave mid-game
  - [x] Track: duration_seconds, progress_percentage, abandonment_reason
  - [x] Hook into existing leave room and navigation logic

- [x] **Multiplayer Room Events**
  - [x] `room_created` event with room_code and max_players
  - [x] `room_joined` event with join_method (code_entry/link)
  - [x] Track multiplayer engagement and success rates

- [x] **Vercel Analytics Integration**
  - [x] Added @vercel/analytics package to client
  - [x] Basic web analytics with automatic page view tracking
  - [x] Custom event tracking system with TypeScript integration
  - [x] Privacy-compliant implementation with no PII collection

### Phase 2: Gameplay Analytics (Medium Priority - 2-3 days)

- [ ] **Card Play Patterns**
  - [ ] `card_played` event for understanding play patterns
  - [ ] `special_card_activated` for trick card usage (2s/8s/ace/jack)
  - [ ] `penalty_received` for penalty system engagement

### Phase 3: UX Analytics (Lower Priority - 1-2 days)

- [ ] **User Preference Tracking**
  - [ ] `settings_changed` for configuration preferences
  - [ ] `menu_section_expanded` for navigation patterns
  - [ ] `hand_sorting_changed` for UI preference analysis

### Phase 4: Future Engagement Events (After Engagement Features)

- [ ] **Achievement & Challenge Events**
  - [ ] `achievement_unlocked` for future achievement system
  - [ ] `daily_challenge_completed` for future challenge system
  - [ ] `streak_milestone` for future streak tracking

### Implementation Benefits

- **User Behavior Insights**: Understand most popular game modes and player preferences
- **Completion Rate Analysis**: Track game abandonment vs completion patterns
- **Feature Usage Metrics**: See which special cards and rules are most engaging
- **Multiplayer Adoption**: Monitor room creation success and player retention
- **A/B Testing Foundation**: Support future feature experiments and optimization

### Technical Notes

- Uses Vercel Analytics `track()` function for custom events
- Privacy-compliant (no PII tracking, just game behavior patterns)
- Leverages existing game statistics system for rich event context
- Integrates with current game store and component architecture

## 📈 Implementation Results

### Analytics System Benefits Achieved

- **Complete Game Lifecycle Tracking**: All major user interactions now tracked with rich context
- **Data-Driven Insights**: Ready to analyze user behavior patterns, game preferences, and engagement
- **Privacy-First Approach**: GDPR-compliant tracking focused on game behavior, not personal data
- **Production-Ready**: Integrated with Vercel's robust analytics infrastructure
- **Leveraged Existing Architecture**: Built on top of comprehensive game statistics system

### Custom Events Implemented

1. **game_started** - Track game initiation across all modes (quick start, custom, multiplayer)
2. **game_finished** - Comprehensive completion tracking with game statistics integration
3. **game_abandoned** - User engagement analysis with progress and abandonment reasons
4. **room_created/room_joined** - Multiplayer adoption and success rate monitoring

### Technical Integration Complete

- TypeScript-safe event tracking with proper type definitions
- Integrated with existing game store and component architecture
- No performance impact with optimized event timing
- Ready for A/B testing and feature experimentation

---

_Last Updated: 2024-08-31 (After Vercel Analytics Phase 1 Implementation)_
_Review and update weekly during active development_
