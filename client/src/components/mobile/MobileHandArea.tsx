import React, { useMemo, useState, useEffect } from 'react';
import { useGameStore, useUIStore } from '../../stores';
import { GameEngine } from 'switch-shared';
import { Card } from '../Card';

interface ResponsiveHandAreaProps {
  className?: string;
}

export function MobileHandArea({ className }: ResponsiveHandAreaProps) {
  const [isDesktop, setIsDesktop] = useState(false);

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

  const { handSortOrder, showCardHints, handShelf } = useUIStore(state => ({
    handSortOrder: state.settings.handSortOrder,
    showCardHints: state.settings.showCardHints,
    handShelf: state.handShelf,
  }));

  // Responsive breakpoint detection
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const currentPlayer = gameState?.players.find(p => p.id === playerId);

  // Calculate playable cards for hints
  const playableCards = useMemo(() => {
    if (!gameState || !currentPlayer) return [];

    return currentPlayer.hand.filter(card => {
      try {
        return GameEngine.isValidPlay(gameState, card);
      } catch {
        return false;
      }
    });
  }, [gameState, currentPlayer]);

  // Enhanced hand sorting with all options
  const sortedHand = useMemo(() => {
    if (!currentPlayer) return [];
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

      default:
        return cards; // Keep original order
    }
  }, [currentPlayer, handSortOrder]);

  // CSS classes for responsive layout
  const handAreaClasses = useMemo(() => {
    const classes = ['responsive-hand-area'];

    if (className) classes.push(className);
    if (isDesktop) classes.push('desktop-mode');
    else classes.push('mobile-mode');

    if (!isDesktop && handShelf.isEnabled) {
      classes.push('with-shelf');
      if (handShelf.isDragging) classes.push('dragging');
    }

    return classes.join(' ');
  }, [className, isDesktop, handShelf.isEnabled, handShelf.isDragging]);

  if (!gameState || !currentPlayer) return null;

  const isGameFinished = gameState.phase === 'finished';

  // Enhanced card interaction handlers
  const handleCardClick = (cardId: string) => {
    selectCard(cardId);
  };

  // Desktop drag and drop handlers
  const handleCardDragStart = (e: React.DragEvent, cardId: string) => {
    if (!isDesktop) return;

    let cardsToDrag: string[] = [];

    if (selectedCards.includes(cardId)) {
      cardsToDrag = [...selectedCards];
    } else {
      cardsToDrag = [cardId];
    }

    startDrag(cardsToDrag);
    e.dataTransfer?.setData('text/plain', JSON.stringify(cardsToDrag));
  };

  return (
    <div className={handAreaClasses}>
      {/* Sort and Hint Controls - moved below cards for better UX */}

      {/* Hand Shelf handled by MobilePlayerSheet - removed duplicate */}

      <div
        className={`hand ${isDesktop ? 'desktop-layout' : 'mobile-horizontal'}`}
      >
        {sortedHand.map(card => {
          const isPlayable =
            showCardHints && playableCards.some(pc => pc.id === card.id);
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
              isDragging={isDragging}
              selectionOrder={selectionOrder}
              disabled={isGameFinished}
              onClick={isDesktop ? () => handleCardClick(card.id) : undefined}
              onTouchStart={!isDesktop ? () => {} : undefined}
              onTouchEnd={
                !isDesktop ? () => handleCardClick(card.id) : undefined
              }
              onDragStart={
                isDesktop ? e => handleCardDragStart(e, card.id) : undefined
              }
              onDragEnd={isDesktop ? endDrag : undefined}
            />
          );
        })}
      </div>

      {/* Sort and Hint Controls moved to MobilePlayerSheet for proper positioning */}
    </div>
  );
}
