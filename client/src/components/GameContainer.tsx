import { useGameStore } from '../stores';
import { GameHeader } from './GameHeader';
import { GameBoard } from './GameBoard';
import { GameInfo } from './GameInfo';
import { LoadingScreen } from './LoadingScreen';
import { ErrorScreen } from './ErrorScreen';

export function GameContainer() {
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
      <GameHeader />
      <GameBoard />
      <GameInfo />
    </div>
  );
}