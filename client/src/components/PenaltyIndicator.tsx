import React from 'react';
import { PenaltyState } from '../stores/types';

interface PenaltyIndicatorProps {
  penaltyState: PenaltyState;
}

export const PenaltyIndicator: React.FC<PenaltyIndicatorProps> = ({
  penaltyState,
}) => {
  if (!penaltyState.active) {
    return null;
  }

  const getPenaltyMessage = () => {
    switch (penaltyState.type) {
      case '2s':
        return `2s Active: +${penaltyState.cards} cards penalty`;
      case 'run':
        return `Run Active: ${penaltyState.cards} card penalty`;
      default:
        return `Active penalty: ${penaltyState.cards} cards`;
    }
  };

  const getPenaltyIcon = () => {
    switch (penaltyState.type) {
      case '2s':
        return '🃏';
      case 'run':
        return '🏃‍♂️';
      default:
        return '⚠️';
    }
  };

  return (
    <div className="penalty-indicator">
      <div className="penalty-content">
        <span className="penalty-icon">{getPenaltyIcon()}</span>
        <span className="penalty-message">{getPenaltyMessage()}</span>
      </div>
      <div className="penalty-hint">
        {penaltyState.type === '2s' && (
          <span>
            Play a 2 to add to the penalty, or draw {penaltyState.cards} cards
          </span>
        )}
      </div>
    </div>
  );
};
