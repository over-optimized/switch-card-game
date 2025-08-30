import { Card as CardType, getCardDisplayName } from 'switch-shared';
import { useRef } from 'react';
import styles from './Card.module.css';

interface CardProps {
  card: CardType | null;
  isPlayable?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  isDragging?: boolean;
  isDiscard?: boolean;
  selectionOrder?: number | undefined;
  disabled?: boolean;
  onClick?: (() => void) | undefined;
  onTouchStart?: (() => void) | undefined;
  onTouchEnd?: (() => void) | undefined;
  onDragStart?: ((e: React.DragEvent) => void) | undefined;
  onDragEnd?: (() => void) | undefined;
}

export function Card({
  card,
  isPlayable = false,
  isSelected = false,
  isDisabled = false,
  isDragging = false,
  isDiscard = false,
  selectionOrder,
  disabled = false,
  onClick,
  onTouchStart,
  onTouchEnd,
  onDragStart,
  onDragEnd,
}: CardProps) {
  const touchDataRef = useRef<{
    startTime: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  if (!card) {
    return <div className={styles.card}>🃏</div>;
  }

  const getCardColorClass = (card: CardType) => {
    return card.suit === 'hearts' || card.suit === 'diamonds'
      ? styles.cardRed
      : styles.cardBlack;
  };

  const classes = [
    styles.card,
    getCardColorClass(card),
    isPlayable && !isDisabled && !disabled ? styles.playable : '',
    isDisabled || disabled ? styles.disabled : '',
    isSelected ? styles.selected : '',
    isDragging ? styles.dragging : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (!disabled && !isDisabled && onClick) {
      onClick();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled || isDisabled) {
      e.preventDefault();
      return;
    }
    if (onDragStart) {
      onDragStart(e);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isDisabled) return;

    const touch = e.touches[0];
    touchDataRef.current = {
      startTime: Date.now(),
      startX: touch.clientX,
      startY: touch.clientY,
      moved: false,
    };

    if (onTouchStart) {
      onTouchStart();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDataRef.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchDataRef.current.startX);
    const deltaY = Math.abs(touch.clientY - touchDataRef.current.startY);

    // Consider it moved if touch moves more than 10px in any direction
    if (deltaX > 10 || deltaY > 10) {
      touchDataRef.current.moved = true;
    }
  };

  const handleTouchEnd = () => {
    if (disabled || isDisabled || !touchDataRef.current) return;

    const { startTime, moved } = touchDataRef.current;
    const touchDuration = Date.now() - startTime;

    // Only trigger selection if:
    // 1. Touch was short (less than 300ms) OR it was a long press (more than 500ms)
    // 2. Touch didn't move significantly (not a scroll gesture)
    const isQuickTap = touchDuration < 300;
    const isLongPress = touchDuration > 500;

    if ((isQuickTap || isLongPress) && !moved && onTouchEnd) {
      onTouchEnd();
    }

    touchDataRef.current = null;
  };

  return (
    <div
      className={classes}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      draggable={!disabled && !isDisabled && !isDiscard}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-card-id={card.id}
    >
      {getCardDisplayName(card)}
      {selectionOrder && (
        <div className={styles.selectionOrder}>{selectionOrder}</div>
      )}
    </div>
  );
}
