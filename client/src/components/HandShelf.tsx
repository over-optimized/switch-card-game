import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '../stores';

export function HandShelf() {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startPosition, setStartPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null);

  const {
    handShelf,
    setHandShelfPosition,
    setHandShelfDragging,
    enableHandShelf,
    resetHandShelfPosition,
  } = useUIStore(state => ({
    handShelf: state.handShelf,
    setHandShelfPosition: state.setHandShelfPosition,
    setHandShelfDragging: state.setHandShelfDragging,
    enableHandShelf: state.enableHandShelf,
    resetHandShelfPosition: state.resetHandShelfPosition,
  }));

  // Initialize shelf position - always start at default (0) on fresh loads
  useEffect(() => {
    if (isMobile && handShelf.isEnabled) {
      // Reset to default position on component mount
      if (handShelf.position !== 0) {
        setHandShelfPosition(0);
      }
    }
  }, [isMobile, handShelf.isEnabled, setHandShelfPosition]);

  // Mobile detection and shelf enablement
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 480;
      setIsMobile(isMobileDevice);
      enableHandShelf(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [enableHandShelf]);

  // Layout constants for consistent spacing
  const LAYOUT_CONSTANTS = {
    OPPONENT_AREA_HEIGHT: 120, // Mobile opponent container (fixed height)
    DECK_AREA_HEIGHT: 179, // Deck area container (fixed height)
    SHELF_CONTROL_HEIGHT: 40, // Drag handle height (fixed)
    ELEMENT_GAP: 20, // Gap between all elements
    MIN_HAND_HEIGHT: 200, // Minimum functional hand area height
    MAX_HAND_HEIGHT: 400, // Maximum comfortable hand area height
  };

  // Calculate layout with fixed element heights and vertical positioning
  const calculateLayout = (shelfPosition: number) => {
    const viewportHeight = window.innerHeight;
    const {
      OPPONENT_AREA_HEIGHT,
      DECK_AREA_HEIGHT, 
      SHELF_CONTROL_HEIGHT,
      ELEMENT_GAP,
      MIN_HAND_HEIGHT,
      MAX_HAND_HEIGHT,
    } = LAYOUT_CONSTANTS;

    // Calculate total space needed for fixed elements and gaps
    const fixedElementsHeight = OPPONENT_AREA_HEIGHT + DECK_AREA_HEIGHT + SHELF_CONTROL_HEIGHT;
    const totalGapsHeight = ELEMENT_GAP * 3; // opponent→deck, deck→shelf, shelf→hand
    const availableForHand = viewportHeight - fixedElementsHeight - totalGapsHeight;
    
    // Calculate maximum possible shelf position
    const maxHandExpansion = Math.min(availableForHand - MIN_HAND_HEIGHT, MAX_HAND_HEIGHT - MIN_HAND_HEIGHT);
    const maxShelfPosition = Math.max(0, maxHandExpansion);
    
    // Calculate current hand height based on shelf position
    const expansionFactor = Math.min(shelfPosition / maxShelfPosition, 1) || 0;
    const handAreaHeight = MIN_HAND_HEIGHT + (maxHandExpansion * expansionFactor);
    
    // Dynamic positioning based on shelf expansion
    
    // Calculate shelf control position from bottom
    const shelfControlBottom = handAreaHeight + ELEMENT_GAP;
    
    // Calculate deck position: Should be above shelf control with proper gap
    const shelfControlTop = viewportHeight - shelfControlBottom - SHELF_CONTROL_HEIGHT;
    const deckAreaTop = Math.max(
      OPPONENT_AREA_HEIGHT + ELEMENT_GAP, // Never closer than 140px from top
      shelfControlTop - DECK_AREA_HEIGHT - ELEMENT_GAP // Or 20px above shelf control
    );
    
    return {
      constraints: {
        minPosition: 0,
        maxPosition: maxShelfPosition,
      },
      dimensions: {
        handAreaHeight,
        deckAreaTop,
        opponentAreaHeight: OPPONENT_AREA_HEIGHT, // Always fixed height
        shelfControlBottom,
      },
    };
  };

  // Get current layout calculations
  const currentLayout = calculateLayout(handShelf.position);
  const { constraints } = currentLayout;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!handShelf.isEnabled) return;

    e.preventDefault();
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setStartPosition(handShelf.position);
    setIsDragging(true);
    setHandShelfDragging(true);

    // Add haptic feedback if available
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      (navigator as unknown as { vibrate: (duration: number) => void }).vibrate(
        50,
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !handShelf.isEnabled) return;

    e.preventDefault();
    const touch = e.touches[0];
    const deltaY = startY - touch.clientY; // Positive = drag up, negative = drag down
    const newPosition = Math.max(0, startPosition + deltaY);

    const { minPosition, maxPosition } = constraints;
    const constrainedPosition = Math.min(
      Math.max(newPosition, minPosition),
      maxPosition,
    );

    setHandShelfPosition(constrainedPosition);
    console.log('HandShelf: Setting position to', constrainedPosition);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);
    setHandShelfDragging(false);

    // Snap to nearest comfortable position
    const { maxPosition } = constraints;
    const snapPositions = [
      0,
      maxPosition * 0.3,
      maxPosition * 0.6,
      maxPosition,
    ];
    const currentPosition = handShelf.position;

    // Find closest snap position
    const closestSnap = snapPositions.reduce((closest, snap) => {
      return Math.abs(currentPosition - snap) <
        Math.abs(currentPosition - closest)
        ? snap
        : closest;
    });

    setHandShelfPosition(closestSnap);
  };

  const handleDoubleTab = () => {
    // Double tap to reset to default position
    resetHandShelfPosition();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      (
        navigator as unknown as { vibrate: (pattern: number[]) => void }
      ).vibrate([50, 50, 50]);
    }
  };

  // Don't render on desktop or when not enabled
  if (!isMobile || !handShelf.isEnabled) {
    return null;
  }

  // Calculate shelf container positioning
  const shelfContainerStyles = {
    bottom: `${currentLayout.dimensions.shelfControlBottom}px`,
  };

  return (
    <div 
      className={`hand-shelf-container ${isDragging ? 'dragging' : ''}`}
      style={shelfContainerStyles}
    >
      <div
        ref={dragRef}
        className={`hand-shelf-drag-handle ${isDragging ? 'dragging' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleTab}
      >
        <div className="drag-handle-icon">
          <div className="grip-line" />
          <div className="grip-line" />
          <div className="grip-line" />
        </div>
        <div className="drag-handle-label">
          {handShelf.position > 0 
            ? `Expanded ${Math.round((handShelf.position / currentLayout.constraints.maxPosition) * 100)}%` 
            : 'Default'}
        </div>
      </div>
    </div>
  );
}
