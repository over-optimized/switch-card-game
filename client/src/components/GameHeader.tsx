import { useState, useEffect } from 'react';
import { useGameStore } from '../stores';

interface GameHeaderProps {
  onBackToMenu?: (() => void) | undefined;
}

export function GameHeader({ onBackToMenu }: GameHeaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
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

  const showLeaveButton =
    roomCode && connectionStatus === 'connected' && !isLeaving;

  return (
    <header
      className={`game-header ${isMobile ? 'mobile' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'row', // Always horizontal layout
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '8px 12px' : '12px 24px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        gap: '12px',
        position: 'relative',
        zIndex: 10,
        minHeight: isMobile ? '50px' : '60px',
      }}
    >
      {/* Controls Section */}
      <div
        className="header-controls"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        {showLeaveButton ? (
          // When in a room, show Leave Room button instead of Back button
          <button
            className={`leave-room-btn ${isMobile ? 'mobile-leave' : ''}`}
            onClick={handleLeaveRoom}
            disabled={isLeaving}
            title="Leave Room"
            style={{
              backgroundColor: isLeaving ? '#666' : '#d32f2f',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: isLeaving ? 'not-allowed' : 'pointer',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 'bold',
              minWidth: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isLeaving ? '...' : '✕'}
          </button>
        ) : onBackToMenu ? (
          // When not in a room, show Back to Menu button
          <button
            className={`back-to-menu-btn ${isMobile ? 'mobile-back' : ''}`}
            onClick={onBackToMenu}
            title="Back to Menu"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: isMobile ? '14px' : '16px',
              minWidth: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ←
          </button>
        ) : null}
      </div>

      {/* Title Section */}
      <div
        className="header-content"
        style={{
          textAlign: 'center',
          flex: '1',
          minWidth: 0, // Allow shrinking
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {isMobile ? 'Switch' : '🎴 Switch'}
        </h1>
      </div>

      {/* Room Info Section */}
      {roomCode && (
        <div
          className="room-info"
          style={{
            fontSize: isMobile ? '10px' : '11px',
            opacity: 0.7,
            textAlign: 'right',
            flexShrink: 0,
            lineHeight: '1.2',
          }}
        >
          <div>{roomCode}</div>
          <div>{connectionStatus}</div>
        </div>
      )}
    </header>
  );
}
