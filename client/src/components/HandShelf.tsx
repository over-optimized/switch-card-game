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
    settings,
    setHandShelfPosition,
    setHandShelfDragging,
    enableHandShelf,
    resetHandShelfPosition,
  } = useUIStore(state => ({
    handShelf: state.handShelf,
    settings: state.settings,
    setHandShelfPosition: state.setHandShelfPosition,
    setHandShelfDragging: state.setHandShelfDragging,
    enableHandShelf: state.enableHandShelf,
    resetHandShelfPosition: state.resetHandShelfPosition,
  }));

  // Initialize shelf position from persisted settings
  useEffect(() => {
    if (
      isMobile &&
      handShelf.isEnabled &&
      handShelf.position !== settings.handShelfPosition
    ) {
      setHandShelfPosition(settings.handShelfPosition);
    }
  }, [
    isMobile,
    handShelf.isEnabled,
    settings.handShelfPosition,
    handShelf.position,
    setHandShelfPosition,
  ]);

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

  // Calculate positioning constraints based on current layout
  const calculateConstraints = () => {
    const viewportHeight = window.innerHeight;

    // Minimum position: default bottom (0px offset)
    const minPosition = 0;

    // Maximum position: ensure hand area content remains accessible
    // Account for: mobile opponent area (~120px), deck area (~140px), safe margins (~40px)
    const reservedTopSpace = 300; // Space needed for opponent area + deck area + margins
    const minHandAreaHeight = 200; // Minimum height to keep hand area functional

    const maxPosition = Math.max(
      0,
      viewportHeight - reservedTopSpace - minHandAreaHeight,
    );

    return { minPosition, maxPosition };
  };

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

    const { minPosition, maxPosition } = calculateConstraints();
    const constrainedPosition = Math.min(
      Math.max(newPosition, minPosition),
      maxPosition,
    );

    setHandShelfPosition(constrainedPosition);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);
    setHandShelfDragging(false);

    // Snap to nearest comfortable position
    const { maxPosition } = calculateConstraints();
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

  return (
    <div className="hand-shelf-container">
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
          {handShelf.position > 0 ? 'Custom' : 'Default'}
        </div>
      </div>
    </div>
  );
}
