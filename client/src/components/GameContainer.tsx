import { useGameStore } from '../stores';
import { GameHeader } from './GameHeader';
import { GameBoard } from './GameBoard';
import { GameInfo } from './GameInfo';
import { LoadingScreen } from './LoadingScreen';
import { ErrorScreen } from './ErrorScreen';

interface GameContainerProps {
  onBackToMenu?: () => void;
}

export function GameContainer({ onBackToMenu }: GameContainerProps) {
  const { gameState, isLoading, message } = useGameStore(state => ({
    gameState: state.gameState,
    isLoading: state.isLoading,
    message: state.message,
  }));

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!gameState) {
    return <ErrorScreen message={message || 'Failed to load game'} />;
  }

  return (
    <div className="game-container">
      <GameHeader onBackToMenu={onBackToMenu} />
      <GameBoard />
      <GameInfo />
    </div>
  );
}
