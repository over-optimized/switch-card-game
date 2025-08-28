import { useState, useEffect } from 'react';
import { useGameStore } from '../stores';
import { GameHeader } from './GameHeader';
import { GameBoard } from './GameBoard';
import { GameInfo } from './GameInfo';
import { LoadingScreen } from './LoadingScreen';
import { ErrorScreen } from './ErrorScreen';
import { InGameMenu } from './InGameMenu';
import { RoomInfoPanel } from './RoomInfoPanel';

interface GameContainerProps {
  onBackToMenu?: () => void;
}

export function GameContainer({ onBackToMenu }: GameContainerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { gameState, isLoading, message } = useGameStore(state => ({
    gameState: state.gameState,
    isLoading: state.isLoading,
    message: state.message,
  }));

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!gameState) {
    return <ErrorScreen message={message || 'Failed to load game'} />;
  }

  return (
    <div className="game-container">
      <GameHeader onBackToMenu={onBackToMenu} />
      <GameBoard onBackToMenu={onBackToMenu} />
      {!isMobile && <GameInfo />}

      {/* In-game menu components */}
      <InGameMenu onBackToMenu={onBackToMenu} />
      <RoomInfoPanel />
    </div>
  );
}
