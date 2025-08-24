import { useGameStore, useUIStore } from '../stores';
import { GameEngine } from 'switch-shared';
import { Card } from './Card';
import { HandControls } from './HandControls';
import { useMemo } from 'react';

export function PlayerHandArea() {
  const {
    gameState,
    playerId,
    selectedCards,
    cardSelectionOrder,
    dragState,
    selectCard,
    playSelectedCards,
    clearSelection,
    startDrag,
    endDrag,
  } = useGameStore(state => ({
    gameState: state.gameState,
    playerId: state.playerId,
    selectedCards: state.selectedCards,
    cardSelectionOrder: state.cardSelectionOrder,
    dragState: state.dragState,
    selectCard: state.selectCard,
    playSelectedCards: state.playSelectedCards,
    clearSelection: state.clearSelection,
    startDrag: state.startDrag,
    endDrag: state.endDrag,
  }));

  const { handSortOrder, showCardHints } = useUIStore(state => ({
    handSortOrder: state.settings.handSortOrder,
    showCardHints: state.settings.showCardHints,
  }));

  const currentPlayer = gameState?.players.find(p => p.id === playerId);

  if (!gameState || !currentPlayer) return null;

  const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
  const playableCards = GameEngine.getPlayableCards(gameState, playerId);
  const isPlayerTurn = currentTurnPlayer.id === playerId;
  const isGameFinished = gameState.phase === 'finished';

  // Sort hand based on user preference
  const sortedHand = useMemo(() => {
    const cards = [...currentPlayer.hand];

    switch (handSortOrder) {
      case 'rank':
        return cards.sort((a, b) => {
          const rankOrder: Record<string, number> = {
            A: 1,
            '2': 2,
            '3': 3,
            '4': 4,
            '5': 5,
            '6': 6,
            '7': 7,
            '8': 8,
            '9': 9,
            '10': 10,
            J: 11,
            Q: 12,
            K: 13,
          };
          const suitOrder: Record<string, number> = {
            spades: 1,
            hearts: 2,
            diamonds: 3,
            clubs: 4,
          };

          const rankDiff = rankOrder[a.rank] - rankOrder[b.rank];
          return rankDiff !== 0
            ? rankDiff
            : suitOrder[a.suit] - suitOrder[b.suit];
        });

      case 'suit':
        return cards.sort((a, b) => {
          const suitOrder: Record<string, number> = {
            spades: 1,
            hearts: 2,
            diamonds: 3,
            clubs: 4,
          };
          const rankOrder: Record<string, number> = {
            A: 1,
            '2': 2,
            '3': 3,
            '4': 4,
            '5': 5,
            '6': 6,
            '7': 7,
            '8': 8,
            '9': 9,
            '10': 10,
            J: 11,
            Q: 12,
            K: 13,
          };

          const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
          return suitDiff !== 0
            ? suitDiff
            : rankOrder[a.rank] - rankOrder[b.rank];
        });

      case 'dealt':
      default:
        return cards;
    }
  }, [currentPlayer.hand, handSortOrder]);

  const handleCardClick = (cardId: string) => {
    selectCard(cardId);
  };

  const handleCardDragStart = (e: React.DragEvent, cardId: string) => {
    // Determine what cards are being dragged
    let cardsToDrag: string[] = [];

    if (selectedCards.includes(cardId)) {
      // If dragging a selected card, drag all selected cards
      cardsToDrag = [...selectedCards];
    } else {
      // If dragging an unselected card, just drag that card
      cardsToDrag = [cardId];
    }

    startDrag(cardsToDrag);

    // Set drag data
    e.dataTransfer?.setData('text/plain', JSON.stringify(cardsToDrag));

    // Create custom drag image for multiple cards
    if (cardsToDrag.length > 1) {
      const dragPreview = createDragPreview(cardsToDrag.length);
      e.dataTransfer?.setDragImage(dragPreview, 50, 75);
      document.body.appendChild(dragPreview);
      setTimeout(() => document.body.removeChild(dragPreview), 0);
    }
  };

  const handleCardDragEnd = () => {
    endDrag();
  };

  const handlePlaySelected = () => {
    playSelectedCards();
  };

  const handleClearSelection = () => {
    clearSelection();
  };

  const createDragPreview = (cardCount: number): HTMLElement => {
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
    preview.textContent = `${cardCount} cards`;
    return preview;
  };

  return (
    <div className="hand-area">
      <h3>
        Your Hand ({currentPlayer.hand.length} cards)
        {isPlayerTurn ? ' - Your Turn' : ''}
      </h3>

      <HandControls
        selectedCount={selectedCards.length}
        onPlaySelected={handlePlaySelected}
        onClearSelection={handleClearSelection}
      />

      <div className="hand">
        {sortedHand.map(card => {
          const isPlayable =
            showCardHints && playableCards.some(pc => pc.id === card.id);
          const isDisabled = !isPlayerTurn || isGameFinished;
          const isSelected = selectedCards.includes(card.id);
          const isDragging =
            dragState.isDragging && dragState.draggedCards.includes(card.id);
          const selectionOrder = isSelected
            ? cardSelectionOrder[card.id]
            : undefined;

          return (
            <Card
              key={card.id}
              card={card}
              isPlayable={isPlayable}
              isSelected={isSelected}
              isDisabled={isDisabled}
              isDragging={isDragging}
              selectionOrder={selectionOrder}
              onClick={() => handleCardClick(card.id)}
              onDragStart={e => handleCardDragStart(e, card.id)}
              onDragEnd={handleCardDragEnd}
            />
          );
        })}
      </div>
    </div>
  );
}
