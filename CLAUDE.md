# CLAUDE.md - Switch Card Game Project Configuration

## Project Overview

Switch Card Game is a multiplayer HTML5 card game with real-time networking capabilities. The project is structured as a pnpm monorepo with three main packages:

- **client/**: Frontend application (Vite + TypeScript)
- **server/**: Backend server (Node.js + Socket.IO + Express)
- **shared/**: Shared types and game engine logic

**Game Rules Reference**: See `docs/switch_game_rules.md` for complete Switch card game rules including all special cards (2s, 3s, 5♥, 7s, 8s, Jacks, Kings, Aces) and advanced mechanics like runs and penalty stacking.

## Development Workflow Standards

### Required Quality Gates

Before ANY commit, these commands MUST pass:

```bash
# Full CI pipeline (lint + test + build)
pnpm ci                # Root: runs shared package lint, test, and full build
pnpm lint              # Lint shared package (core game logic)
pnpm test:coverage     # Run tests with coverage thresholds
pnpm build             # Build all packages (shared, client, server)
```

### Project-Specific Commands

```bash
# Development
pnpm dev               # Start both client (3000) and server (3001)
pnpm dev:client        # Client development server only
pnpm dev:server        # Server development server only

# Building
pnpm build:shared      # Build shared types first (required)
pnpm build:client      # Build client for production
pnpm build:server      # Build server for production
pnpm build             # Build all packages in correct order

# Testing
pnpm test              # Run unit tests (shared package)
pnpm test:coverage     # Run tests with coverage reporting

# Quality
pnpm lint              # ESLint validation (shared package)
pnpm lint:fix          # Auto-fix linting issues
pnpm format            # Format all code with Prettier
```

### Critical Development Rules

1. **Shared Package First**: Always run `pnpm build:shared` after modifying shared types
2. **Monorepo Dependencies**: Use `workspace:*` for internal package dependencies
3. **Type Safety**: All packages use strict TypeScript - no `any` types allowed
4. **Game Logic Location**: All game rules and validation must be in shared package
5. **WebSocket Events**: Define all Socket.IO events in shared/types/events.ts

### Documentation Maintenance (Auto-Update Required)

Claude MUST keep these files updated when making changes:

#### Game Rules Documentation (`docs/switch_game_rules.md`)

- **When implementing special cards**: Update implementation status and examples
- **When changing game mechanics**: Verify rules documentation matches code behavior
- **When adding new features**: Document any rule modifications or additions
- **Game balance changes**: Update card effects, penalties, and strategic notes

#### README.md Updates

- **When adding features**: Update roadmap phase completion status
- **When changing commands**: Verify all script examples work
- **When adding dependencies**: Update technology stack section
- **When changing architecture**: Update project structure diagram

#### FEATURES.md Updates

- **Feature completion**: Move items from 🔴 Planned to 🟡 In Progress to 🟢 Complete
- **New features**: Add to appropriate phase with proper status indicators
- **Architecture changes**: Update technical notes and architecture decisions
- **Known issues**: Add bugs to Known Issues section, remove when fixed

#### TODO.md Updates

- **Task completion**: Mark completed tasks and update status sections
- **New bugs/issues**: Add to appropriate priority section
- **Milestone progress**: Update current focus and development velocity
- **Phase transitions**: Move completed phases to completed section

### Testing Standards

- **Unit Tests**: Focus on game engine logic (shared package)
- **Coverage Thresholds**: Maintain >75% coverage on game engine
- **Test Location**: Keep tests next to implementation files
- **Critical Functions**: 100% coverage on game rule validation

### Git Workflow Requirements (UPDATED - NO MORE MAIN BRANCH DEVELOPMENT)

```bash
# Feature development flow - ALWAYS use feature branches
git checkout -b feature/architecture-consolidation
# ... make changes ...
pnpm ci                # Must pass before commit
git commit -m "feat: implement network-first architecture"

# Documentation update (REQUIRED after feature completion)
# Update TODO.md, FEATURES.md, README.md, docs/switch_game_rules.md as needed
git add .
git commit -m "docs: update documentation after architecture consolidation"

git push origin feature/architecture-consolidation
# Create PR for review - NEVER merge directly to main
```

### MANDATORY Post-Feature Workflow

**After completing ANY feature, Claude MUST follow this exact sequence:**

1. **Feature Implementation Commit**
   ```bash
   pnpm ci  # Quality gates must pass
   git commit -m "feat: [feature description]"
   ```

2. **Documentation Update** (MANDATORY)
   - Update TODO.md: Move completed items, update status sections
   - Update FEATURES.md: Change status indicators (🔴 → 🟡 → 🟢)
   - Update README.md: Update roadmap, commands, architecture if needed
   - Update docs/switch_game_rules.md: If game mechanics changed

3. **Documentation Commit**
   ```bash
   git add .
   git commit -m "docs: update project documentation after [feature name]"
   ```

4. **Create Pull Request**
   ```bash
   git push origin feature/[branch-name]
   # Create PR via GitHub - NEVER merge to main without review
   ```

**🚨 CRITICAL RULE: NO MORE DIRECT DEVELOPMENT ON MAIN BRANCH**

All development must happen on feature branches with PRs for review.

### Error Prevention

- **Pre-commit**: Husky runs lint-staged on all staged files
- **Build Dependencies**: shared package must build before client/server
- **Type Checking**: All packages run TypeScript strict mode checking
- **Socket.IO Types**: Use shared event types for client/server communication

### Package-Specific Rules

#### Client Package (`client/`)

- **Framework**: React 18 + TypeScript with Vite
- **State Management**: Zustand stores for game and UI state
- **Game Logic**: Import ALL game logic from shared package
- **Styling**: CSS Modules with responsive mobile-first design

#### Server Package (`server/`)

- **Framework**: Express + Socket.IO
- **Game Authority**: Server is authoritative for all game state
- **Room Management**: Use shared RoomManager class
- **Error Handling**: Comprehensive error handling for WebSocket events

#### Shared Package (`shared/`)

- **Pure Logic**: No UI dependencies, no server dependencies
- **Comprehensive Types**: Define all interfaces in types/ directory
- **Game Engine**: All game rules and validation logic
- **Testing**: Highest test coverage requirements (>85%)

### Deployment Configuration

- **Frontend**: Vercel deployment (client package)
- **Backend**: Railway deployment (server package)
- **Environment**: Separate staging/production configs
- **Build Order**: shared → server → client (shared must build first)

### Development Phase Guidelines

Based on current TODO.md status:

- **Current Phase**: Week 5 - 🚨 CRITICAL Architecture Consolidation
- **Focus**: Network-first architecture and mobile-first desktop consolidation
- **Priority**: Architecture simplification > New features
- **Testing**: Test unified components across all platforms and game modes

### Code Quality Metrics

- **TypeScript**: Strict mode, no implicit any
- **ESLint**: Max 0 warnings allowed
- **Prettier**: All files must be formatted
- **Build**: All packages must build without errors
- **Tests**: All tests must pass, coverage thresholds met

### Emergency Procedures

If quality gates fail:

1. **Never bypass** - fix the underlying issue
2. **Isolate**: Test individual packages to find problem
3. **Shared First**: If shared package fails, fix before client/server
4. **Revert Strategy**: Use git to revert to last working state

---

## Project-Specific Reminders for Claude

- **Always run `pnpm build:shared`** after changing types or game engine
- **MANDATORY: Follow post-feature workflow** - Feature commit → Documentation update → Final commit → PR
- **NO MORE MAIN BRANCH DEVELOPMENT** - Always use feature branches with PRs
- **Update ALL documentation files** - TODO.md, FEATURES.md, README.md, switch_game_rules.md
- **Keep game logic in shared package** - never duplicate in client/server
- **Architecture consolidation priority** - Complete before any new features
- **Use exact port numbers**: client 3000, server 3001
- **Follow monorepo structure** - respect package boundaries
- **Reference game rules**: Always consult `docs/switch_game_rules.md` when implementing card mechanics
- **Validate rule implementation**: Ensure code matches documented game rules exactly
- **Quality gates before every commit** - pnpm ci must pass

This configuration ensures high code quality, prevents regressions, and maintains accurate documentation throughout development.

- Never include `Generated with Claude Code` in commit messages