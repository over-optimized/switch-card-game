import { useState, useEffect } from 'react';
import { useGameStore } from '../stores';

interface GameHeaderProps {
  onBackToMenu?: (() => void) | undefined;
}

export function GameHeader({ onBackToMenu }: GameHeaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  const gameState = useGameStore(state => state.gameState);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getSubtitle = () => {
    if (gameState?.phase === 'finished') {
      return 'Game Finished!';
    }
    return 'Basic Switch Rules - No Special Cards Yet';
  };

  return (
    <header className={`game-header ${isMobile ? 'mobile' : ''}`}>
      {onBackToMenu && (
        <button 
          className={`back-to-menu-btn ${isMobile ? 'mobile-back' : ''}`} 
          onClick={onBackToMenu}
          title="Back to Menu"
        >
          {isMobile ? '←' : '← Back to Menu'}
        </button>
      )}
      <div className="header-content">
        <h1>{isMobile ? 'Switch' : '🎴 Switch Card Game'}</h1>
        {!isMobile && <p>{getSubtitle()}</p>}
      </div>
    </header>
  );
}
