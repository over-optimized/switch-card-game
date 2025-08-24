import React from 'react';
import { Suit } from 'switch-shared';

interface SuitSelectorProps {
  isOpen: boolean;
  onSuitSelect: (suit: Suit) => void;
  onClose: () => void;
}

export const SuitSelector: React.FC<SuitSelectorProps> = ({
  isOpen,
  onSuitSelect,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  const suits: { suit: Suit; symbol: string; name: string; color: string }[] = [
    { suit: 'hearts', symbol: '♥', name: 'Hearts', color: 'red' },
    { suit: 'diamonds', symbol: '♦', name: 'Diamonds', color: 'red' },
    { suit: 'clubs', symbol: '♣', name: 'Clubs', color: 'black' },
    { suit: 'spades', symbol: '♠', name: 'Spades', color: 'black' },
  ];

  const handleSuitClick = (suit: Suit) => {
    onSuitSelect(suit);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="suit-selector-backdrop" onClick={handleBackdropClick}>
      <div className="suit-selector-modal">
        <div className="suit-selector-header">
          <h2>Choose a Suit</h2>
          <p>Select the new suit for your Ace</p>
        </div>

        <div className="suit-selector-grid">
          {suits.map(({ suit, symbol, name, color }) => (
            <button
              key={suit}
              className={`suit-button suit-${color}`}
              onClick={() => handleSuitClick(suit)}
              title={`Change suit to ${name}`}
            >
              <span className="suit-symbol">{symbol}</span>
              <span className="suit-name">{name}</span>
            </button>
          ))}
        </div>

        <div className="suit-selector-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
