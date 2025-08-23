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

## 🎯 Current Focus (Week 2) - First Special Card Implementation

### Immediate Tasks - 2s Implementation
- [ ] **Test current basic gameplay thoroughly**
  - [ ] Verify all basic rules work correctly
  - [ ] Test edge cases (deck running out, win conditions)
  - [ ] Confirm AI behavior is reasonable

- [ ] **Design trick card state system**
  - [ ] Add game modes to GameState ('normal', 'active-2s', 'active-run', etc.)
  - [ ] Create penalty tracking system
  - [ ] Design card state management (active vs dead)

- [ ] **Implement 2s - "Pick Up Two" cards**
  - [ ] Update isValidPlay to handle 2s stacking
  - [ ] Add penalty accumulation logic (2+2+2 = 6 cards)
  - [ ] Implement "play 2 or pick up penalty" mechanic
  - [ ] Handle 2s becoming "dead" after penalty served

- [ ] **Update UI for trick cards**
  - [ ] Show penalty counter when 2s are active
  - [ ] Visual feedback for "must counter or draw" state
  - [ ] Update game status messages for trick card states
  - [ ] Add visual distinction for active vs dead cards

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

### 🎯 **Next Milestone: 2s Implementation**
- Add first special card (Pick Up Two mechanics)
- Introduce penalty system and card stacking
- Update UI to show active penalties

### 📈 **Development Velocity:**
- **Week 1**: Core foundation ✅ (Completed)
- **Week 2**: First special card (2s) 🎯 (Current focus)
- **Week 3**: Second special card (8s or Aces)
- **Week 4**: Third special card + polish
- **Week 5+**: Advanced features (Runs, networking, etc.)

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

*Last Updated: 2024-08-23*
*Review and update weekly during active development*