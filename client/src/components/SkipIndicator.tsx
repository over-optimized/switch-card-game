import React from 'react';
import { GameState } from 'switch-shared';

interface SkipIndicatorProps {
  gameState: GameState;
}

export const SkipIndicator: React.FC<SkipIndicatorProps> = ({ gameState }) => {
  if (gameState.skipsRemaining === 0) {
    return null;
  }

  const getNextPlayers = () => {
    const players = gameState.players;
    const currentIndex = gameState.currentPlayerIndex;
    const direction = gameState.direction;
    const skipsLeft = gameState.skipsRemaining;

    const skippedPlayers: string[] = [];
    let nextIndex = currentIndex;

    for (let i = 0; i < skipsLeft; i++) {
      nextIndex = (nextIndex + direction + players.length) % players.length;
      if (nextIndex < 0) nextIndex = players.length - 1;
      skippedPlayers.push(players[nextIndex].name);
    }

    return skippedPlayers;
  };

  const skippedPlayerNames = getNextPlayers();
  const skipMessage =
    gameState.skipsRemaining === 1
      ? `${skippedPlayerNames[0]} will be skipped`
      : `${skippedPlayerNames.join(', ')} will be skipped`;

  return (
    <div className="skip-indicator">
      <div className="skip-indicator-content">
        <span className="skip-icon">⏭️</span>
        <div className="skip-info">
          <div className="skip-title">Jack Effect Active</div>
          <div className="skip-message">{skipMessage}</div>
        </div>
      </div>
    </div>
  );
};
