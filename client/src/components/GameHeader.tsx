import { useGameStore } from '../stores';

export function GameHeader() {
  const gameState = useGameStore(state => state.gameState);
  
  const getSubtitle = () => {
    if (gameState?.phase === 'finished') {
      return 'Game Finished!';
    }
    return 'Basic Switch Rules - No Special Cards Yet';
  };

  return (
    <header className="game-header">
      <h1>🎴 Switch Card Game</h1>
      <p>{getSubtitle()}</p>
    </header>
  );
}