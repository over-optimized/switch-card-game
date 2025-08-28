import { useState, useEffect } from 'react';
import { useGameStore, useUIStore } from '../stores';

interface GameHeaderProps {
  onBackToMenu?: (() => void) | undefined;
}

export function GameHeader({ onBackToMenu }: GameHeaderProps) {
  const [isMobile, setIsMobile] = useState(false);

  const { roomCode, connectionStatus } = useGameStore(state => ({
    roomCode: state.roomCode,
    connectionStatus: state.connectionStatus,
  }));

  const { toggleInGameMenu, toggleRoomInfo } = useUIStore(state => ({
    toggleInGameMenu: state.toggleInGameMenu,
    toggleRoomInfo: state.toggleRoomInfo,
  }));

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Note: handleLeaveRoom is now handled by the InGameMenu component

  const showLeaveButton = roomCode && connectionStatus === 'connected';

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
        {showLeaveButton || onBackToMenu ? (
          // Show hamburger menu for in-game options
          <button
            className={`hamburger-menu-btn ${isMobile ? 'mobile-hamburger' : ''}`}
            onClick={toggleInGameMenu}
            title="Game Menu"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 'bold',
              minWidth: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            ☰
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

      {/* Room Info Section - Clickable */}
      {roomCode && (
        <div
          className="room-info clickable"
          onClick={toggleRoomInfo}
          title="Click for room details"
          style={{
            fontSize: isMobile ? '10px' : '11px',
            opacity: 0.8,
            textAlign: 'right',
            flexShrink: 0,
            lineHeight: '1.2',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'all 0.2s ease',
            border: '1px solid transparent',
          }}
          onMouseEnter={e => {
            const target = e.target as HTMLElement;
            target.style.opacity = '1';
            target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={e => {
            const target = e.target as HTMLElement;
            target.style.opacity = '0.8';
            target.style.backgroundColor = 'transparent';
            target.style.borderColor = 'transparent';
          }}
        >
          <div>{roomCode}</div>
          <div>{connectionStatus}</div>
        </div>
      )}
    </header>
  );
}
