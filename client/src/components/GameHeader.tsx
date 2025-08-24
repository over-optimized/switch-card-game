import { useGameStore } from '../stores';

interface GameHeaderProps {
  onBackToMenu?: () => void;
}

export function GameHeader({ onBackToMenu }: GameHeaderProps) {
  const gameState = useGameStore(state => state.gameState);

  const getSubtitle = () => {
    if (gameState?.phase === 'finished') {
      return 'Game Finished!';
    }
    return 'Basic Switch Rules - No Special Cards Yet';
  };

  return (
    <header className="game-header">
      <div className="header-content">
        <h1>🎴 Switch Card Game</h1>
        <p>{getSubtitle()}</p>
      </div>
      {onBackToMenu && (
        <button className="back-to-menu-btn" onClick={onBackToMenu}>
          ← Back to Menu
        </button>
      )}
    </header>
  );
}
