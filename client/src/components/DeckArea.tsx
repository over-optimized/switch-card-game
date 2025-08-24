import { useGameStore } from '../stores';
import { DeckManager, GameEngine } from 'switch-shared';
import { Card } from './Card';
import { useEffect, useRef } from 'react';

export function DeckArea() {
  const { gameState, playerId, drawCard, dropCards, dragState } = useGameStore(state => ({
    gameState: state.gameState,
    playerId: state.playerId,
    drawCard: state.drawCard,
    dropCards: state.dropCards,
    dragState: state.dragState,
  }));

  const deckAreaRef = useRef<HTMLDivElement>(null);

  // Clean up drag-over class when drag state changes
  useEffect(() => {
    if (!dragState.isDragging && deckAreaRef.current) {
      // Force cleanup of any lingering drag-over classes
      deckAreaRef.current.classList.remove('drag-over');
    }
  }, [dragState.isDragging]);

  if (!gameState) return null;

  const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
  const topCard = DeckManager.getTopDiscardCard(gameState);
  const canDraw = GameEngine.canPlayerPlay(gameState, playerId) === false;
  const isPlayerTurn = currentTurnPlayer.id === playerId;
  const canDrawNow = canDraw && isPlayerTurn;

  const handleDrawClick = () => {
    if (canDrawNow) {
      drawCard();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Only add drag-over if we're currently dragging
    if (dragState.isDragging) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Remove drag-over class when leaving the area
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    // Only process drops if we're actually dragging
    if (!dragState.isDragging) {
      return;
    }
    
    const dragData = e.dataTransfer?.getData('text/plain');
    if (!dragData) return;

    try {
      const cardIds = JSON.parse(dragData) as string[];
      console.log('Cards dropped on discard pile:', cardIds);
      
      // Call the store's dropCards method to play the cards
      await dropCards(cardIds);
    } catch (error) {
      console.error('Error parsing drag data or playing cards:', error);
    }
  };

  const isDragging = dragState.isDragging;
  const deckAreaClass = `deck-area ${isDragging ? 'drag-target' : ''}`;

  return (
    <div 
      ref={deckAreaRef}
      className={deckAreaClass}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="drop-here-label">
          Drop here to play cards
        </div>
      )}
      
      <div 
        className={`deck ${canDrawNow ? 'draw-enabled' : ''}`}
        onClick={handleDrawClick}
        style={{ cursor: canDrawNow ? 'pointer' : 'default' }}
      >
        <div className="card-back">🂠</div>
        <span className="deck-count">{gameState.drawPile.length} cards</span>
        {canDrawNow && <span className="draw-hint">Click to draw</span>}
      </div>
      
      <div className="discard-pile">
        <Card 
          card={topCard || null}
          isDiscard={true}
          disabled={true}
        />
        <span>Top Card</span>
      </div>
    </div>
  );
}