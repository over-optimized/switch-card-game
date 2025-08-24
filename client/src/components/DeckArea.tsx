import { useGameStore } from '../stores';
import { DeckManager, GameEngine } from 'switch-shared';
import { Card } from './Card';

export function DeckArea() {
  const { gameState, playerId, drawCard } = useGameStore(state => ({
    gameState: state.gameState,
    playerId: state.playerId,
    drawCard: state.drawCard,
  }));

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
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const dragData = e.dataTransfer?.getData('text/plain');
    if (!dragData) return;

    try {
      const cardIds = JSON.parse(dragData) as string[];
      // This would trigger the drop action in the store
      console.log('Cards dropped on discard pile:', cardIds);
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  return (
    <div className="deck-area">
      <div 
        className={`deck ${canDrawNow ? 'draw-enabled' : ''}`}
        onClick={handleDrawClick}
        style={{ cursor: canDrawNow ? 'pointer' : 'default' }}
      >
        <div className="card-back">🂠</div>
        <span className="deck-count">{gameState.drawPile.length} cards</span>
        {canDrawNow && <span className="draw-hint">Click to draw</span>}
      </div>
      
      <div 
        className="discard-pile"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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