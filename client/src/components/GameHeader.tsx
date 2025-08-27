import { useState, useEffect } from 'react';
import { useGameStore } from '../stores';

interface GameHeaderProps {
  onBackToMenu?: (() => void) | undefined;
}

export function GameHeader({ onBackToMenu }: GameHeaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const gameState = useGameStore(state => state.gameState);
  const roomCode = useGameStore(state => state.roomCode);
  const connectionStatus = useGameStore(state => state.connectionStatus);
  const leaveRoom = useGameStore(state => state.leaveRoom);

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

  const handleLeaveRoom = async () => {
    if (isLeaving) return;
    
    setIsLeaving(true);
    try {
      const success = await leaveRoom();
      if (success && onBackToMenu) {
        onBackToMenu();
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    } finally {
      setIsLeaving(false);
    }
  };

  const showLeaveButton = roomCode && connectionStatus === 'connected' && !isLeaving;

  return (
    <header className={`game-header ${isMobile ? 'mobile' : ''}`}>
      <div className="header-controls">
        {onBackToMenu && (
          <button
            className={`back-to-menu-btn ${isMobile ? 'mobile-back' : ''}`}
            onClick={onBackToMenu}
            title="Back to Menu"
          >
            {isMobile ? '←' : '← Back to Menu'}
          </button>
        )}
        
        {showLeaveButton && (
          <button
            className={`leave-room-btn ${isMobile ? 'mobile-leave' : ''}`}
            onClick={handleLeaveRoom}
            disabled={isLeaving}
            title="Leave Room"
            style={{
              marginLeft: onBackToMenu ? '10px' : '0',
              backgroundColor: isLeaving ? '#666' : '#d32f2f',
              color: 'white',
              border: 'none',
              padding: isMobile ? '8px 12px' : '8px 16px',
              borderRadius: '4px',
              cursor: isLeaving ? 'not-allowed' : 'pointer',
              fontSize: isMobile ? '14px' : '16px',
            }}
          >
            {isLeaving ? (isMobile ? '...' : 'Leaving...') : (isMobile ? '✕' : '✕ Leave Room')}
          </button>
        )}
      </div>
      
      <div className="header-content">
        <h1>{isMobile ? 'Switch' : '🎴 Switch Card Game'}</h1>
        {!isMobile && <p>{getSubtitle()}</p>}
        {roomCode && (
          <div className="room-info" style={{ 
            fontSize: isMobile ? '12px' : '14px',
            opacity: 0.8,
            marginTop: '4px'
          }}>
            Room: {roomCode} | Status: {connectionStatus}
          </div>
        )}
      </div>
    </header>
  );
}
