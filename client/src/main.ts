import { 
  getCardDisplayName,
  getCardColorClass,
  GameEngine, 
  DeckManager,
  createGameState,
  createPlayer,
  GameState,
  Card,
  Rank,
  Suit
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
  selectedCards: string[];
  selectionMode: 'none' | 'selecting' | 'ready';
  handSortOrder: 'dealt' | 'rank' | 'suit';
  selectionSequence: number;
  cardSelectionOrder: Record<string, number>;
  dragState: {
    isDragging: boolean;
    draggedCards: string[];
  };
}

class SwitchApp {
  private state: AppState = {
    isLoading: true,
    gameState: null,
    playerId: 'player-1',
    message: '',
    recentMoves: [],
    showRecentMoves: false,
    selectedCards: [],
    selectionMode: 'none',
    handSortOrder: 'dealt',
    selectionSequence: 0,
    cardSelectionOrder: {},
    dragState: {
      isDragging: false,
      draggedCards: [],
    },
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

  private getRankOrder(rank: Rank): number {
    const rankOrder: Record<Rank, number> = {
      'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
      '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
    };
    return rankOrder[rank];
  }

  private getSuitOrder(suit: Suit): number {
    const suitOrder: Record<Suit, number> = {
      'spades': 1, 'hearts': 2, 'diamonds': 3, 'clubs': 4
    };
    return suitOrder[suit];
  }

  private getSortedHand(cards: Card[]): Card[] {
    const cardsCopy = [...cards];
    
    switch (this.state.handSortOrder) {
      case 'rank':
        return cardsCopy.sort((a, b) => {
          const rankDiff = this.getRankOrder(a.rank) - this.getRankOrder(b.rank);
          return rankDiff !== 0 ? rankDiff : this.getSuitOrder(a.suit) - this.getSuitOrder(b.suit);
        });
      
      case 'suit':
        return cardsCopy.sort((a, b) => {
          const suitDiff = this.getSuitOrder(a.suit) - this.getSuitOrder(b.suit);
          return suitDiff !== 0 ? suitDiff : this.getRankOrder(a.rank) - this.getRankOrder(b.rank);
        });
      
      case 'dealt':
      default:
        return cardsCopy;
    }
  }

  private onSortHand(sortOrder: 'dealt' | 'rank' | 'suit') {
    // Add sorting animation class
    const handElement = this.appElement.querySelector('.hand');
    if (handElement) {
      handElement.classList.add('sorting');
      setTimeout(() => {
        handElement.classList.remove('sorting');
      }, 600); // Match CSS transition duration
    }
    
    this.state.handSortOrder = sortOrder;
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
        message: 'Game started! Click or drag cards to play them.',
        recentMoves: [{
          timestamp: new Date(),
          player: 'Game',
          action: 'Game started',
          details: topCard ? `Starting card: ${getCardDisplayName(topCard)}` : undefined
        }],
        showRecentMoves: false,
        selectedCards: [],
        selectionMode: 'none',
        handSortOrder: 'dealt',
        selectionSequence: 0,
        cardSelectionOrder: {},
        dragState: {
          isDragging: false,
          draggedCards: [],
        },
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
            
            <div class="hand-controls">
              <div class="sort-controls">
                <button class="sort-btn ${this.state.handSortOrder === 'rank' ? 'active' : ''}" data-sort="rank">By Rank</button>
                <button class="sort-btn ${this.state.handSortOrder === 'suit' ? 'active' : ''}" data-sort="suit">By Suit</button>
                <button class="sort-btn ${this.state.handSortOrder === 'dealt' ? 'active' : ''}" data-sort="dealt">As Dealt</button>
              </div>
              <div class="action-controls">
                <button class="play-btn ${this.state.selectedCards.length === 0 ? 'disabled' : ''}" 
                        ${this.state.selectedCards.length === 0 ? 'disabled' : ''} 
                        id="play-selected-btn"
                        title="${this.state.selectedCards.length > 1 ? 'Last selected card will be on top' : ''}">
                  Play Selected (${this.state.selectedCards.length})
                </button>
                <button class="clear-btn ${this.state.selectedCards.length === 0 ? 'hidden' : ''}" 
                        id="clear-selection-btn">
                  Clear Selection
                </button>
              </div>
            </div>
            
            <div class="hand">
              ${this.getSortedHand(currentPlayer.hand).map(card => {
                const isPlayable = playableCards.some(pc => pc.id === card.id);
                const isDisabled = currentTurnPlayer.id !== playerId || gameState.phase === 'finished';
                const isSelected = this.state.selectedCards.includes(card.id);
                const isDragging = this.state.dragState.isDragging && this.state.dragState.draggedCards.includes(card.id);
                const selectionOrder = isSelected ? this.state.cardSelectionOrder[card.id] : undefined;
                return `
                  <div class="card ${isPlayable && !isDisabled ? 'playable' : ''} ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${getCardColorClass(card)}" 
                       data-card-id="${card.id}"
                       draggable="${!isDisabled}">
                    ${getCardDisplayName(card)}
                    ${selectionOrder ? `<div class="selection-order">${selectionOrder}</div>` : ''}
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

      // Drag events
      card.addEventListener('dragstart', (e) => {
        const target = e.target as HTMLElement;
        const cardId = target.dataset.cardId;
        this.onDragStart(e as DragEvent, cardId);
      });

      card.addEventListener('dragend', () => {
        this.onDragEnd();
      });
    });

    // Sort button events
    const sortBtns = this.appElement.querySelectorAll('.sort-btn');
    sortBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const sortType = target.dataset.sort as 'dealt' | 'rank' | 'suit';
        if (sortType) {
          this.onSortHand(sortType);
        }
      });
    });

    // Play selected cards button
    const playSelectedBtn = this.appElement.querySelector('#play-selected-btn');
    if (playSelectedBtn) {
      playSelectedBtn.addEventListener('click', () => {
        this.onPlaySelectedCards();
      });
    }

    // Clear selection button
    const clearSelectionBtn = this.appElement.querySelector('#clear-selection-btn');
    if (clearSelectionBtn) {
      clearSelectionBtn.addEventListener('click', () => {
        this.onClearSelection();
      });
    }

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

    // Drop zone events (discard pile)
    const discardPile = this.appElement.querySelector('.discard-pile');
    if (discardPile) {
      discardPile.addEventListener('dragover', (e) => {
        this.onDragOver(e as DragEvent);
      });

      discardPile.addEventListener('drop', (e) => {
        this.onDrop(e as DragEvent);
      });

      discardPile.addEventListener('dragleave', (e) => {
        this.onDragLeave(e as DragEvent);
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

    // Toggle card selection
    const isCurrentlySelected = this.state.selectedCards.includes(cardId);
    
    if (isCurrentlySelected) {
      // Deselect the card
      this.state.selectedCards = this.state.selectedCards.filter(id => id !== cardId);
      delete this.state.cardSelectionOrder[cardId];
      this.state.selectionMode = this.state.selectedCards.length > 0 ? 'selecting' : 'none';
      this.updateMessage(`Card deselected. ${this.state.selectedCards.length} cards selected.`);
    } else {
      // Select the card
      const player = gameState.players.find(p => p.id === playerId);
      if (!player) return;
      
      const cardToSelect = player.hand.find(c => c.id === cardId);
      if (!cardToSelect) return;
      
      // Validate selection - all selected cards must have the same rank
      if (this.state.selectedCards.length > 0) {
        const firstSelectedCard = player.hand.find(c => c.id === this.state.selectedCards[0]);
        if (firstSelectedCard && firstSelectedCard.rank !== cardToSelect.rank) {
          this.updateMessage("Can only select cards of the same rank!");
          return;
        }
      }
      
      // Add to selection with order tracking
      this.state.selectedCards = [...this.state.selectedCards, cardId];
      this.state.selectionSequence += 1;
      this.state.cardSelectionOrder[cardId] = this.state.selectionSequence;
      this.state.selectionMode = 'selecting';
      
      const cardDisplayName = getCardDisplayName(cardToSelect);
      this.updateMessage(`${cardDisplayName} selected (#${this.state.selectionSequence}). ${this.state.selectedCards.length} cards selected.`);
    }
    
    this.render();
  }

  private onPlaySelectedCards() {
    if (this.state.selectedCards.length === 0 || !this.state.gameState) return;
    
    const { gameState, playerId } = this.state;
    const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (currentTurnPlayer.id !== playerId) {
      this.updateMessage("It's not your turn!");
      return;
    }

    if (gameState.phase === 'finished') {
      this.updateMessage("Game is already finished!");
      return;
    }

    try {
      // Get cards in selection order (first selected → last selected)
      const orderedCardIds = this.getSelectedCardsInOrder();
      const player = gameState.players.find(p => p.id === playerId);
      if (!player) return;

      // Validate all cards are still playable and belong to player
      const cardsToPlay: Card[] = [];
      for (const cardId of orderedCardIds) {
        const card = player.hand.find(c => c.id === cardId);
        if (!card) {
          this.updateMessage(`Card ${cardId} not found in hand!`);
          return;
        }
        cardsToPlay.push(card);
      }

      // Validate first card is playable against current top card
      const topCard = DeckManager.getTopDiscardCard(gameState);
      if (topCard && !GameEngine.isValidPlay(gameState, cardsToPlay[0])) {
        this.updateMessage(`Cannot play ${getCardDisplayName(cardsToPlay[0])} on ${getCardDisplayName(topCard)}!`);
        return;
      }

      // Validate that all cards in the sequence can form a valid chain
      for (let i = 1; i < cardsToPlay.length; i++) {
        const currentCard = cardsToPlay[i];
        const prevCard = cardsToPlay[i - 1];
        
        // Each card must match rank or suit with the previous card in the sequence
        if (currentCard.rank !== prevCard.rank && currentCard.suit !== prevCard.suit) {
          this.updateMessage(`Invalid sequence: ${getCardDisplayName(currentCard)} cannot follow ${getCardDisplayName(prevCard)}!`);
          return;
        }
      }

      // Play all cards in sequence, maintaining the original game state for turn checking
      // Each card after the first plays on the previous card in the sequence
      let updatedGameState = gameState;
      
      for (let i = 0; i < cardsToPlay.length; i++) {
        const card = cardsToPlay[i];
        
        // For multi-card plays, after the first card we manually update the game state
        // to play this card without advancing the turn
        if (i > 0) {
          // Manually update the game state to play this card without advancing turn
          const playerIndex = updatedGameState.players.findIndex(p => p.id === playerId);
          if (playerIndex === -1) return;

          const updatedPlayers = [...updatedGameState.players];
          updatedPlayers[playerIndex] = {
            ...updatedPlayers[playerIndex],
            hand: updatedPlayers[playerIndex].hand.filter(c => c.id !== card.id)
          };

          updatedGameState = {
            ...updatedGameState,
            players: updatedPlayers,
            discardPile: [...updatedGameState.discardPile, card],
          };
        } else {
          // First card: use normal game engine action (this will advance the turn)
          const action = {
            type: 'play-card' as const,
            playerId,
            cardId: card.id,
            timestamp: new Date()
          };
          updatedGameState = GameEngine.processAction(gameState, action);
        }
      }

      // Update game state
      this.state.gameState = updatedGameState;
      
      // Clear selection
      this.state.selectedCards = [];
      this.state.selectionMode = 'none';
      this.state.cardSelectionOrder = {};
      
      // Track the move with order information
      if (cardsToPlay.length === 1) {
        this.addRecentMove('You', 'played card', getCardDisplayName(cardsToPlay[0]));
      } else {
        const cardSequence = cardsToPlay.map(c => getCardDisplayName(c)).join(' → ');
        const lastCard = cardsToPlay[cardsToPlay.length - 1];
        this.addRecentMove('You', `played ${cardsToPlay.length} cards`, `${cardSequence} (${getCardDisplayName(lastCard)} on top)`);
      }
      
      // Check win condition
      if (updatedGameState.phase === 'finished') {
        const winner = updatedGameState.winner;
        this.updateMessage(winner?.id === playerId ? 'You won! 🎉' : `${winner?.name} wins!`);
        this.addRecentMove('Game', winner?.id === playerId ? 'You won!' : `${winner?.name} won!`);
      } else {
        const nextPlayer = updatedGameState.players[updatedGameState.currentPlayerIndex];
        const lastCard = cardsToPlay[cardsToPlay.length - 1];
        this.updateMessage(`${cardsToPlay.length} card${cardsToPlay.length > 1 ? 's' : ''} played! ${getCardDisplayName(lastCard)} is on top. ${nextPlayer.name}'s turn.`);
        
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

  private getSelectedCardsInOrder(): string[] {
    return [...this.state.selectedCards].sort((a, b) => {
      const orderA = this.state.cardSelectionOrder[a] || 0;
      const orderB = this.state.cardSelectionOrder[b] || 0;
      return orderA - orderB;
    });
  }

  private onClearSelection() {
    this.state.selectedCards = [];
    this.state.selectionMode = 'none';
    this.state.cardSelectionOrder = {};
    this.updateMessage('Selection cleared.');
    this.render();
  }

  private onDragStart(event: DragEvent, cardId: string | undefined) {
    if (!cardId || !this.state.gameState) return;
    
    const { gameState, playerId } = this.state;
    const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Check if it's the player's turn
    if (currentTurnPlayer.id !== playerId) {
      event.preventDefault();
      return;
    }

    // Determine what cards are being dragged
    let cardsToDrag: string[] = [];
    
    if (this.state.selectedCards.includes(cardId)) {
      // If dragging a selected card, drag all selected cards
      cardsToDrag = [...this.state.selectedCards];
    } else {
      // If dragging an unselected card, just drag that card
      cardsToDrag = [cardId];
    }

    this.state.dragState = {
      isDragging: true,
      draggedCards: cardsToDrag,
    };

    // Set drag data
    event.dataTransfer?.setData('text/plain', JSON.stringify(cardsToDrag));
    
    // Create custom drag image for multiple cards
    if (cardsToDrag.length > 1) {
      const dragPreview = this.createDragPreview(cardsToDrag);
      event.dataTransfer?.setDragImage(dragPreview, 50, 75);
      document.body.appendChild(dragPreview);
      setTimeout(() => document.body.removeChild(dragPreview), 0);
    }

    this.render();
  }

  private onDragEnd() {
    this.state.dragState = {
      isDragging: false,
      draggedCards: [],
    };
    this.render();
  }

  private onDragOver(event: DragEvent) {
    event.preventDefault(); // Allow drop
    
    // Add visual feedback
    const target = event.currentTarget as HTMLElement;
    target.classList.add('drag-over');
  }

  private onDragLeave(event: DragEvent) {
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
  }

  private onDrop(event: DragEvent) {
    event.preventDefault();
    
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');

    const dragData = event.dataTransfer?.getData('text/plain');
    if (!dragData) return;

    try {
      const cardIds = JSON.parse(dragData) as string[];
      
      // Update selection to match dragged cards
      this.state.selectedCards = cardIds;
      this.state.selectionMode = cardIds.length > 0 ? 'selecting' : 'none';
      
      // Play the dragged cards
      this.onPlaySelectedCards();
      
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  }

  private createDragPreview(cardIds: string[]): HTMLElement {
    const preview = document.createElement('div');
    preview.style.position = 'absolute';
    preview.style.top = '-1000px';
    preview.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    preview.style.border = '2px solid #34495e';
    preview.style.borderRadius = '8px';
    preview.style.padding = '10px';
    preview.style.fontSize = '14px';
    preview.style.fontWeight = 'bold';
    preview.style.color = '#2c3e50';
    preview.style.whiteSpace = 'nowrap';
    
    if (cardIds.length === 1) {
      // Single card preview
      const { gameState, playerId } = this.state;
      const player = gameState?.players.find(p => p.id === playerId);
      const card = player?.hand.find(c => c.id === cardIds[0]);
      preview.textContent = card ? getCardDisplayName(card) : 'Card';
    } else {
      // Multiple cards preview
      preview.textContent = `${cardIds.length} cards`;
    }
    
    return preview;
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
    
    /* Hand controls */
    .hand-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }
    
    .sort-controls {
      display: flex;
      gap: 8px;
    }
    
    .action-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .sort-btn, .play-btn, .clear-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 0.9em;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    
    .sort-btn {
      background: rgba(52, 152, 219, 0.2);
      color: #3498db;
      border: 1px solid rgba(52, 152, 219, 0.4);
    }
    
    .sort-btn:hover {
      background: rgba(52, 152, 219, 0.3);
      border-color: #3498db;
    }
    
    .sort-btn.active {
      background: #3498db;
      color: white;
      border-color: #2980b9;
    }
    
    .play-btn {
      background: #27ae60;
      color: white;
      border: 1px solid #229954;
    }
    
    .play-btn:hover:not(.disabled) {
      background: #229954;
    }
    
    .play-btn.disabled {
      background: rgba(39, 174, 96, 0.3);
      color: rgba(255, 255, 255, 0.6);
      cursor: not-allowed;
    }
    
    .clear-btn {
      background: rgba(231, 76, 60, 0.2);
      color: #e74c3c;
      border: 1px solid rgba(231, 76, 60, 0.4);
    }
    
    .clear-btn:hover {
      background: rgba(231, 76, 60, 0.3);
      border-color: #e74c3c;
    }
    
    .clear-btn.hidden {
      opacity: 0;
      pointer-events: none;
    }
    
    /* Card selection states */
    .card.selected {
      transform: translateY(-20px);
      box-shadow: 0 15px 30px rgba(52, 152, 219, 0.4);
      border-color: #3498db !important;
      border-width: 3px;
      background: #e8f4fd !important;
      z-index: 10;
      position: relative;
    }
    
    .card.selected:hover {
      transform: translateY(-25px) scale(1.05);
    }
    
    /* Selection order indicator */
    .selection-order {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      background: #3498db;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 15;
    }
    
    /* Drag and drop states */
    .card[draggable="true"] {
      cursor: grab;
    }
    
    .card[draggable="true"]:active {
      cursor: grabbing;
    }
    
    .card.dragging {
      opacity: 0.5;
      transform: rotate(5deg);
    }
    
    .discard-pile.drag-over {
      background: rgba(39, 174, 96, 0.2);
      transform: scale(1.1);
    }
    
    .discard-pile.drag-over .card {
      border-color: #27ae60 !important;
      box-shadow: 0 0 20px rgba(39, 174, 96, 0.6);
    }
    
    /* Card animations */
    .card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .hand.sorting .card {
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Responsive design for controls */
    @media (max-width: 768px) {
      .hand-controls {
        flex-direction: column;
        gap: 12px;
      }
      
      .sort-controls {
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .action-controls {
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .sort-btn, .play-btn, .clear-btn {
        font-size: 0.8em;
        padding: 6px 12px;
      }
    }
  </style>
`;

document.head.insertAdjacentHTML('beforeend', styles);