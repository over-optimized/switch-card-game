import { useGameStore, useUIStore } from '../stores';
import { GameEngine } from 'switch-shared';
import { Card } from './Card';
import { HandControls } from './HandControls';
import { HandShelf } from './HandShelf';
import React, { useMemo, useState, useEffect } from 'react';

export function PlayerHandArea() {
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);

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

  const currentPlayer = gameState?.players.find(p => p.id === playerId);

  // Hand area style is now managed by GameBoard, just pass through the classes
  const handAreaStyle = useMemo(() => {
    return {}; // Styles are handled at GameBoard level
  }, []);

  // Create CSS classes for hand area (must be before early return)
  const handAreaClasses = useMemo(() => {
    const classes = ['hand-area'];

    if (isMobile && handShelf.isEnabled) {
      classes.push('with-shelf');
      if (handShelf.isDragging) {
        classes.push('dragging');
      }
    }

    return classes.join(' ');
  }, [isMobile, handShelf.isEnabled, handShelf.isDragging]);

  // Sort hand based on user preference (must be before early return)
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

      case 'dealt':
      default:
        return cards;
    }
  }, [currentPlayer, handSortOrder]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!gameState || !currentPlayer) return null;

  const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
  const playableCards = GameEngine.getPlayableCards(gameState, playerId);
  const isPlayerTurn = currentTurnPlayer.id === playerId;
  const isGameFinished = gameState.phase === 'finished';

  const handleCardClick = (cardId: string) => {
    console.log('🟢 PLAYER HAND AREA - Card clicked (desktop):', cardId);
    selectCard(cardId);
  };

  // Mobile-specific touch handlers
  const handleCardTouchStart = () => {
    if (isMobile) {
      setTouchStartTime(Date.now());
    }
  };

  const handleCardTouchEnd = (cardId: string) => {
    if (isMobile) {
      const touchDuration = Date.now() - touchStartTime;
      console.log('🟢 PLAYER HAND AREA - Touch end (mobile):', { cardId, touchDuration });

      // Long press for multi-select (500ms+)
      if (touchDuration >= 500) {
        console.log('🟢 PLAYER HAND AREA - Long press detected, selecting card');
        selectCard(cardId);
        // Add haptic feedback if available
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          (
            navigator as unknown as { vibrate: (duration: number) => void }
          ).vibrate(50);
        }
      } else {
        // Quick tap - play single card if playable
        const isPlayable = GameEngine.getPlayableCards(
          gameState!,
          playerId,
        ).some(pc => pc.id === cardId);
        if (isPlayable && isPlayerTurn && !isGameFinished) {
          console.log('🟢 PLAYER HAND AREA - Quick tap on playable card');
          // Quick play single card
          selectCard(cardId);
          setTimeout(() => playSelectedCards(), 100);
        } else {
          selectCard(cardId);
        }
      }
    }
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
    <div className={handAreaClasses} style={handAreaStyle}>
      <HandShelf />
      <h3>
        Your Hand ({currentPlayer.hand.length} cards)
        {isPlayerTurn ? ' - Your Turn' : ''}
      </h3>

      <HandControls
        selectedCount={selectedCards.length}
        onPlaySelected={handlePlaySelected}
        onClearSelection={handleClearSelection}
      />

      <div className={`hand ${isMobile ? 'mobile-horizontal' : ''}`}>
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
              onClick={isMobile ? undefined : () => handleCardClick(card.id)}
              onTouchStart={isMobile ? handleCardTouchStart : undefined}
              onTouchEnd={
                isMobile ? () => handleCardTouchEnd(card.id) : undefined
              }
              onDragStart={
                isMobile ? undefined : e => handleCardDragStart(e, card.id)
              }
              onDragEnd={isMobile ? undefined : handleCardDragEnd}
            />
          );
        })}
      </div>
    </div>
  );
}
