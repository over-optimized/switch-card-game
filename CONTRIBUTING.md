# Contributing to Switch Card Game

Thanks for your interest in contributing to Switch Card Game! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository** and clone your fork
2. **Install dependencies**: `pnpm install`
3. **Build shared package**: `pnpm run build:shared`  
4. **Start development**: `pnpm run dev`
5. **Make your changes** following our coding standards
6. **Test your changes**: `pnpm run test && pnpm run build`
7. **Submit a pull request**

## 📋 Development Workflow

### Feature Development
1. **Check FEATURES.md** to see if your feature is already planned
2. **Create an issue** using our feature request template
3. **Create a feature branch**: `git checkout -b feature/your-feature-name`
4. **Implement the feature** following our architecture patterns
5. **Add tests** for new functionality
6. **Update documentation** if needed
7. **Submit a pull request** with clear description

### Bug Fixes
1. **Check existing issues** to avoid duplicates
2. **Create a bug report** if one doesn't exist
3. **Create a bugfix branch**: `git checkout -b fix/issue-description`
4. **Fix the bug** and add regression tests
5. **Verify the fix** doesn't break existing functionality
6. **Submit a pull request**

## 🏗️ Project Architecture

### Package Structure
```
switch/
├── client/              # Frontend (Vite + TypeScript)
├── server/              # Backend (Node.js + Socket.IO)  
├── shared/              # Game engine & shared types
└── .github/             # GitHub templates and workflows
```

### Key Principles
- **Type Safety**: Full TypeScript coverage required
- **Authoritative Server**: Game logic must run server-side
- **Event-Driven**: Use WebSocket events for real-time features
- **Modular Design**: Keep components loosely coupled
- **Test Coverage**: Maintain >75% code coverage

## 💻 Coding Standards

### TypeScript
- Use strict mode configuration
- Prefer interfaces over types for object shapes
- Use explicit return types for public functions
- Avoid `any` type - use `unknown` if needed

### Code Style
- **Formatting**: Prettier handles formatting automatically
- **Linting**: ESLint enforces code quality rules
- **Naming**: Use camelCase for variables, PascalCase for types
- **Comments**: Document complex business logic only

### Git Commits
Use conventional commit format:
```
type(scope): description

feat(client): add room creation UI
fix(server): resolve WebSocket connection issue
docs(readme): update installation instructions
test(shared): add game engine test cases
```

## 🧪 Testing Guidelines

### Required Tests
- **Unit tests** for all game engine logic
- **Integration tests** for API endpoints
- **Component tests** for UI interactions
- **E2E tests** for critical user flows

### Test Commands
```bash
pnpm run test              # Run unit tests
pnpm run test:coverage     # Generate coverage report
pnpm run lint              # Check code quality
pnpm run build             # Verify build succeeds
```

### Coverage Requirements
- **Shared package**: >85% coverage
- **Server package**: >75% coverage  
- **Client package**: >70% coverage

## 📝 Documentation

### Code Documentation
- **JSDoc comments** for public APIs
- **Inline comments** for complex algorithms
- **README updates** for new features
- **FEATURES.md updates** for roadmap changes

### Types of Documentation
- **API Documentation**: Server endpoints and WebSocket events
- **Architecture Docs**: High-level design decisions
- **User Guides**: How to play and use features
- **Developer Docs**: Setup and contribution guides

## 🎯 Feature Priorities

### Current Focus Areas
1. **Multiplayer UI** - Connect client to server
2. **Game Rules** - Implement Switch card mechanics  
3. **User Experience** - Animations and polish
4. **Authentication** - Optional user accounts

### Feature Requests
- Review **FEATURES.md** before proposing new features
- Check if similar features are already planned
- Consider implementation complexity and user value
- Discuss major features in GitHub issues first

## 🔍 Code Review Process

### Pull Request Requirements
- [ ] Clear description of changes
- [ ] Tests pass and coverage maintained
- [ ] Code follows style guidelines
- [ ] Documentation updated if needed
- [ ] No breaking changes without discussion

### Review Checklist
- **Functionality**: Does it work as intended?
- **Architecture**: Fits with existing design patterns?
- **Performance**: No unnecessary performance impact?
- **Security**: No security vulnerabilities introduced?
- **Maintainability**: Code is readable and well-structured?

## 🛠️ Development Tools

### Required Tools
- **Node.js 18+**: JavaScript runtime
- **pnpm**: Package manager (faster than npm)
- **Git**: Version control
- **VS Code**: Recommended editor with TypeScript support

### Helpful Extensions (VS Code)
- **TypeScript Hero**: Auto import management
- **ESLint**: Code quality checking
- **Prettier**: Code formatting
- **GitLens**: Enhanced Git integration
- **Thunder Client**: API testing

## 🐛 Debugging

### Client Debugging
- Use browser dev tools for client-side issues
- Check network tab for WebSocket connection problems
- Use React/Vue dev tools if we add frameworks later

### Server Debugging  
- Use Node.js debugger or VS Code debugging
- Check server logs for error messages
- Monitor WebSocket connections and events

### Game Logic Debugging
- Run unit tests to isolate issues
- Use debugger in shared package code
- Add logging to game engine functions

## 📊 Performance Guidelines

### Client Performance
- Minimize DOM manipulations
- Use efficient CSS for animations
- Optimize bundle size with code splitting
- Test on mobile devices

### Server Performance  
- Keep WebSocket message sizes small
- Use efficient data structures
- Profile memory usage in long-running games
- Implement proper cleanup for disconnected players

## 🚨 Security Considerations

### Input Validation
- Validate all user inputs on server
- Sanitize data before database storage
- Use parameterized queries to prevent SQL injection

### Game Security
- Never trust client-side game state
- Validate all game actions server-side
- Implement rate limiting for actions
- Secure WebSocket connections

## 💬 Getting Help

### Community Support
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Code Reviews**: Get feedback on your contributions

### Documentation Resources
- **README.md**: Project overview and setup
- **FEATURES.md**: Feature roadmap and status
- **API Docs**: Server endpoints and data structures

## 📜 License

By contributing to Switch Card Game, you agree that your contributions will be licensed under the project's MIT License.

---

Thank you for contributing to Switch Card Game! 🎴✨