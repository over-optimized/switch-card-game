import { Card as CardType, getCardDisplayName, getCardColorClass } from 'switch-shared';

interface CardProps {
  card: CardType | null;
  isPlayable?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  isDragging?: boolean;
  isDiscard?: boolean;
  selectionOrder?: number | undefined;
  disabled?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
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
  onDragStart,
  onDragEnd,
}: CardProps) {
  if (!card) {
    return (
      <div className="card">
        🃏
      </div>
    );
  }

  const classes = [
    'card',
    getCardColorClass(card),
    isPlayable && !isDisabled && !disabled ? 'playable' : '',
    isDisabled || disabled ? 'disabled' : '',
    isSelected ? 'selected' : '',
    isDragging ? 'dragging' : '',
  ].filter(Boolean).join(' ');

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

  return (
    <div
      className={classes}
      onClick={handleClick}
      draggable={!disabled && !isDisabled && !isDiscard}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-card-id={card.id}
    >
      {getCardDisplayName(card)}
      {selectionOrder && (
        <div className="selection-order">
          {selectionOrder}
        </div>
      )}
    </div>
  );
}