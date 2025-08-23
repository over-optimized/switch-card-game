import { 
  getCardDisplayName,
  getCardColorClass,
  GameEngine, 
  DeckManager,
  createGameState,
  createPlayer,
  GameState
} from 'switch-shared';

interface RecentMove {
  timestamp: Date;
  player: string;
  action: string;
  details?: string;
}

interface AppState {
  isLoading: boolean;
  gameState: GameState | null;
  playerId: string;
  message: string;
  recentMoves: RecentMove[];
  showRecentMoves: boolean;
}

class SwitchApp {
  private state: AppState = {
    isLoading: true,
    gameState: null,
    playerId: 'player-1',
    message: '',
    recentMoves: [],
    showRecentMoves: false,
  };

  private appElement: HTMLElement;

  constructor() {
    this.appElement = document.getElementById('app')!;
    this.initialize();
  }

  private initialize() {
    this.setupGame();
    this.render();
  }

  private setupGame() {
    try {
      // Create a simple 2-player game for now
      const players = [
        createPlayer('player-1', 'You'),
        createPlayer('player-2', 'Computer'),
      ];
      
      const gameState = createGameState('local-game', players, []);
      const startedGame = GameEngine.startGame(gameState);
      
      const topCard = DeckManager.getTopDiscardCard(startedGame);
      
      this.state = {
        isLoading: false,
        gameState: startedGame,
        playerId: 'player-1',
        message: 'Game started! Click a card to play it.',
        recentMoves: [{
          timestamp: new Date(),
          player: 'Game',
          action: 'Game started',
          details: topCard ? `Starting card: ${getCardDisplayName(topCard)}` : undefined
        }],
        showRecentMoves: false,
      };
    } catch (error) {
      this.state = {
        ...this.state,
        isLoading: false,
        message: `Error starting game: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recentMoves: [],
        showRecentMoves: false,
      };
    }
  }

  private render() {
    if (this.state.isLoading) {
      this.appElement.innerHTML = `
        <div class="loading">Loading Switch Card Game...</div>
      `;
      return;
    }

    if (!this.state.gameState) {
      this.appElement.innerHTML = `
        <div class="error">
          <h2>Game Error</h2>
          <p>${this.state.message}</p>
          <button onclick="location.reload()">Restart Game</button>
        </div>
      `;
      return;
    }

    const { gameState, playerId } = this.state;
    const currentPlayer = gameState.players.find(p => p.id === playerId)!;
    const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
    const topCard = DeckManager.getTopDiscardCard(gameState);
    const playableCards = GameEngine.getPlayableCards(gameState, playerId);
    const canDraw = GameEngine.canPlayerPlay(gameState, playerId) === false;

    this.appElement.innerHTML = `
      <div class="game-container">
        <header class="game-header">
          <h1>🎴 Switch Card Game</h1>
          <p>${gameState.phase === 'finished' ? 'Game Finished!' : 'Basic Switch Rules - No Special Cards Yet'}</p>
        </header>
        
        <div class="game-board">
          <div class="deck-area">
            <div class="deck" ${canDraw && currentTurnPlayer.id === playerId ? 'id="draw-deck"' : ''}>
              <div class="card-back">🂠</div>
              <span class="deck-count">${gameState.drawPile.length} cards</span>
              ${canDraw && currentTurnPlayer.id === playerId ? '<span class="draw-hint">Click to draw</span>' : ''}
            </div>
            
            <div class="discard-pile">
              <div class="card ${topCard ? 'playable' : ''} ${topCard ? getCardColorClass(topCard) : ''}">
                ${topCard ? getCardDisplayName(topCard) : '🃏'}
              </div>
              <span>Top Card</span>
            </div>
          </div>
          
          <div class="opponents-area">
            ${gameState.players.filter(p => p.id !== playerId).map(player => `
              <div class="opponent ${currentTurnPlayer.id === player.id ? 'current-turn' : ''}">
                <h4>${player.name}</h4>
                <div class="opponent-hand">
                  ${Array(player.hand.length).fill(0).map(() => 
                    '<div class="card-back small">🂠</div>'
                  ).join('')}
                </div>
                <span class="card-count">${player.hand.length} cards</span>
              </div>
            `).join('')}
          </div>
          
          <div class="hand-area">
            <h3>Your Hand (${currentPlayer.hand.length} cards) ${currentTurnPlayer.id === playerId ? '- Your Turn' : ''}</h3>
            <div class="hand">
              ${currentPlayer.hand.map(card => {
                const isPlayable = playableCards.some(pc => pc.id === card.id);
                const isDisabled = currentTurnPlayer.id !== playerId || gameState.phase === 'finished';
                return `
                  <div class="card ${isPlayable && !isDisabled ? 'playable' : ''} ${isDisabled ? 'disabled' : ''} ${getCardColorClass(card)}" 
                       data-card-id="${card.id}">
                    ${getCardDisplayName(card)}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
        
        <div class="game-info">
          <div class="game-status">
            <p><strong>Status:</strong> ${this.getGameStatus()}</p>
            <p><strong>Message:</strong> ${this.state.message}</p>
            ${gameState.phase === 'finished' ? `
              <button id="restart-btn" class="restart-btn">New Game</button>
            ` : ''}
          </div>
          
          <div class="debug-controls">
            <button id="recent-moves-btn" class="debug-btn">
              Recent Moves ${this.state.showRecentMoves ? '▼' : '▶'}
            </button>
            ${this.state.showRecentMoves ? `
              <div class="recent-moves-panel">
                ${this.state.recentMoves.length > 0 ? 
                  this.state.recentMoves.slice(-6).reverse().map(move => `
                    <div class="recent-move">
                      <span class="move-time">${move.timestamp.toLocaleTimeString()}</span>
                      <span class="move-text">${move.player}: ${move.action}</span>
                      ${move.details ? `<span class="move-details">${move.details}</span>` : ''}
                    </div>
                  `).join('') : 
                  '<div class="no-moves">No recent moves</div>'
                }
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    this.addEventListeners();
  }

  private addEventListeners() {
    // Card click events
    const cards = this.appElement.querySelectorAll('.card[data-card-id]');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const cardId = target.dataset.cardId;
        this.onCardClick(cardId);
      });
    });

    // Draw deck click event
    const drawDeck = this.appElement.querySelector('#draw-deck');
    if (drawDeck) {
      drawDeck.addEventListener('click', () => {
        this.onDrawCard();
      });
    }

    // Restart button
    const restartBtn = this.appElement.querySelector('#restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.restartGame();
      });
    }

    // Recent moves button
    const recentMovesBtn = this.appElement.querySelector('#recent-moves-btn');
    if (recentMovesBtn) {
      recentMovesBtn.addEventListener('click', () => {
        this.toggleRecentMoves();
      });
    }
  }

  private onCardClick(cardId: string | undefined) {
    if (!cardId || !this.state.gameState) return;
    
    const { gameState, playerId } = this.state;
    const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Check if it's the player's turn
    if (currentTurnPlayer.id !== playerId) {
      this.updateMessage("It's not your turn!");
      return;
    }

    // Check if game is finished
    if (gameState.phase === 'finished') {
      this.updateMessage("Game is already finished!");
      return;
    }

    try {
      const action = {
        type: 'play-card' as const,
        playerId,
        cardId,
        timestamp: new Date()
      };

      const updatedGameState = GameEngine.processAction(gameState, action);
      this.state.gameState = updatedGameState;
      
      // Track the move
      const playedCard = gameState.players.find(p => p.id === playerId)?.hand.find(c => c.id === cardId);
      if (playedCard) {
        this.addRecentMove('You', 'played card', getCardDisplayName(playedCard));
      }
      
      if (updatedGameState.phase === 'finished') {
        const winner = updatedGameState.winner;
        this.updateMessage(winner?.id === playerId ? 'You won! 🎉' : `${winner?.name} wins!`);
        this.addRecentMove('Game', winner?.id === playerId ? 'You won!' : `${winner?.name} won!`);
      } else {
        const nextPlayer = updatedGameState.players[updatedGameState.currentPlayerIndex];
        this.updateMessage(`Card played! ${nextPlayer.name}'s turn.`);
        
        // Simple AI for computer player
        if (nextPlayer.id !== playerId) {
          setTimeout(() => this.computerTurn(), 1000);
        }
      }
      
      this.render();
    } catch (error) {
      this.updateMessage(error instanceof Error ? error.message : 'Invalid move!');
      this.render();
    }
  }

  private onDrawCard() {
    if (!this.state.gameState) return;
    
    const { gameState, playerId } = this.state;
    const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Check if it's the player's turn
    if (currentTurnPlayer.id !== playerId) {
      this.updateMessage("It's not your turn!");
      return;
    }

    try {
      const action = {
        type: 'draw-card' as const,
        playerId,
        timestamp: new Date()
      };

      const updatedGameState = GameEngine.processAction(gameState, action);
      this.state.gameState = updatedGameState;
      
      // Track the move
      this.addRecentMove('You', 'drew a card');
      
      const nextPlayer = updatedGameState.players[updatedGameState.currentPlayerIndex];
      this.updateMessage(`Card drawn! ${nextPlayer.name}'s turn.`);
      
      // Simple AI for computer player
      if (nextPlayer.id !== playerId) {
        setTimeout(() => this.computerTurn(), 1000);
      }
      
      this.render();
    } catch (error) {
      this.updateMessage(error instanceof Error ? error.message : 'Cannot draw card!');
      this.render();
    }
  }

  private computerTurn() {
    if (!this.state.gameState) return;
    
    const { gameState } = this.state;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (currentPlayer.id === this.state.playerId) return; // Not computer's turn
    
    try {
      const playableCards = GameEngine.getPlayableCards(gameState, currentPlayer.id);
      
      if (playableCards.length > 0) {
        // Computer plays a random valid card
        const randomCard = playableCards[Math.floor(Math.random() * playableCards.length)];
        const action = {
          type: 'play-card' as const,
          playerId: currentPlayer.id,
          cardId: randomCard.id,
          timestamp: new Date()
        };
        
        const updatedGameState = GameEngine.processAction(gameState, action);
        this.state.gameState = updatedGameState;
        
        // Track the move
        this.addRecentMove(currentPlayer.name, 'played card', getCardDisplayName(randomCard));
        
        if (updatedGameState.phase === 'finished') {
          const winner = updatedGameState.winner;
          this.updateMessage(winner?.id === this.state.playerId ? 'You won! 🎉' : `${winner?.name} wins!`);
          this.addRecentMove('Game', winner?.id === this.state.playerId ? 'You won!' : `${winner?.name} won!`);
        } else {
          this.updateMessage(`${currentPlayer.name} played ${getCardDisplayName(randomCard)}`);
        }
      } else {
        // Computer draws a card
        const action = {
          type: 'draw-card' as const,
          playerId: currentPlayer.id,
          timestamp: new Date()
        };
        
        const updatedGameState = GameEngine.processAction(gameState, action);
        this.state.gameState = updatedGameState;
        
        // Track the move
        this.addRecentMove(currentPlayer.name, 'drew a card');
        
        this.updateMessage(`${currentPlayer.name} drew a card`);
      }
      
      this.render();
    } catch (error) {
      console.error('Computer turn error:', error);
    }
  }

  private getGameStatus(): string {
    if (!this.state.gameState) return 'No game';
    
    const { gameState, playerId } = this.state;
    
    if (gameState.phase === 'finished') {
      const winner = gameState.winner;
      return winner?.id === playerId ? 'You Win!' : `${winner?.name} Wins!`;
    }
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return currentPlayer.id === playerId ? 'Your Turn' : `${currentPlayer.name}'s Turn`;
  }

  private updateMessage(message: string) {
    this.state.message = message;
  }

  private restartGame() {
    this.state.isLoading = true;
    this.render();
    setTimeout(() => {
      this.setupGame();
      this.render();
    }, 500);
  }

  private addRecentMove(player: string, action: string, details?: string) {
    const move: RecentMove = {
      timestamp: new Date(),
      player,
      action,
      details
    };
    
    // Add to beginning and keep only last 6 moves
    this.state.recentMoves = [move, ...this.state.recentMoves].slice(0, 6);
  }

  private toggleRecentMoves() {
    this.state.showRecentMoves = !this.state.showRecentMoves;
    this.render();
  }
}

new SwitchApp();

const styles = `
  <style>
    .game-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .game-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .game-header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
    }
    
    .game-board {
      display: flex;
      flex-direction: column;
      gap: 30px;
      align-items: center;
    }
    
    .deck-area {
      display: flex;
      gap: 80px;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .deck, .discard-pile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
    }
    
    .deck#draw-deck {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .card-back {
      width: 80px;
      height: 120px;
      background: linear-gradient(135deg, #2c3e50, #34495e);
      border: 2px solid #ecf0f1;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2em;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .card-back:hover, .deck#draw-deck .card-back:hover {
      transform: translateY(-5px);
    }
    
    .card-back.small {
      width: 30px;
      height: 45px;
      font-size: 1em;
      cursor: default;
    }
    
    .deck-count, .card-count {
      font-size: 0.9em;
      opacity: 0.8;
    }
    
    .draw-hint {
      font-size: 0.8em;
      color: #f39c12;
      font-weight: bold;
      animation: blink 1.5s infinite;
    }
    
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.5; }
    }
    
    .opponents-area {
      display: flex;
      gap: 40px;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .opponent {
      text-align: center;
      padding: 15px;
      border-radius: 8px;
      background: rgba(255,255,255,0.05);
      min-width: 150px;
    }
    
    .opponent.current-turn {
      background: rgba(52, 152, 219, 0.2);
      border: 2px solid #3498db;
    }
    
    .opponent h4 {
      margin: 0 0 10px 0;
      color: #ecf0f1;
    }
    
    .opponent-hand {
      display: flex;
      gap: 2px;
      justify-content: center;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    
    .hand-area {
      width: 100%;
      text-align: center;
    }
    
    .hand-area h3 {
      margin-bottom: 15px;
      color: #ecf0f1;
    }
    
    .hand {
      display: flex;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 15px;
    }
    
    .card {
      width: 65px;
      height: 95px;
      background: white;
      color: #2c3e50;
      border: 2px solid #34495e;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1em;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
      position: relative;
    }
    
    .card-red {
      color: #e74c3c;
    }
    
    .card-black {
      color: #2c3e50;
    }
    
    .card.playable {
      border-color: #27ae60;
      box-shadow: 0 0 10px rgba(39, 174, 96, 0.5);
    }
    
    .card.playable:hover {
      transform: translateY(-15px) scale(1.1);
      background: #e8f5e8;
      box-shadow: 0 15px 30px rgba(39, 174, 96, 0.4);
      z-index: 10;
      border-color: #27ae60;
    }
    
    .card.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .card.disabled:hover {
      transform: none;
      background: white;
      box-shadow: none;
    }
    
    .card:not(.disabled):not(.playable):hover {
      transform: translateY(-8px) scale(1.05);
      background: #f8f9fa;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      z-index: 5;
    }
    
    .discard-pile .card {
      width: 80px;
      height: 120px;
      font-size: 1.2em;
      cursor: default;
      border-color: #e74c3c;
    }
    
    .discard-pile .card:hover {
      transform: none;
      box-shadow: none;
    }
    
    .game-info {
      margin-top: 30px;
      text-align: center;
      background: rgba(255,255,255,0.1);
      padding: 20px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }
    
    .game-status {
      margin-bottom: 20px;
    }
    
    .game-info p {
      margin: 8px 0;
      color: #ecf0f1;
    }
    
    .debug-controls {
      border-top: 1px solid rgba(255,255,255,0.2);
      padding-top: 15px;
    }
    
    .debug-btn {
      background: rgba(52, 152, 219, 0.2);
      color: #3498db;
      border: 1px solid #3498db;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 0.9em;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .debug-btn:hover {
      background: rgba(52, 152, 219, 0.3);
    }
    
    .recent-moves-panel {
      margin-top: 15px;
      background: rgba(0,0,0,0.3);
      border-radius: 4px;
      padding: 12px;
      text-align: left;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .recent-move {
      display: flex;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 0.85em;
      line-height: 1.4;
    }
    
    .move-time {
      color: #95a5a6;
      flex-shrink: 0;
      font-family: monospace;
    }
    
    .move-text {
      color: #ecf0f1;
      font-weight: 500;
    }
    
    .move-details {
      color: #f39c12;
      font-weight: bold;
    }
    
    .no-moves {
      color: #95a5a6;
      font-style: italic;
      text-align: center;
    }
    
    .restart-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 1em;
      cursor: pointer;
      margin-top: 15px;
      transition: background 0.2s;
    }
    
    .restart-btn:hover {
      background: #2980b9;
    }
    
    .error {
      text-align: center;
      padding: 40px;
      color: #e74c3c;
    }
    
    .error button {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 15px;
    }
    
    .loading {
      text-align: center;
      font-size: 1.2em;
      color: #ecf0f1;
      animation: pulse 2s infinite;
    }
  </style>
`;

document.head.insertAdjacentHTML('beforeend', styles);