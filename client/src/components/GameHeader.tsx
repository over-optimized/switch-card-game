import { useGameStore, useUIStore } from '../stores';
import { useIsMobile } from '../hooks';
import { ConnectionIndicator } from './ConnectionIndicator';
import { DirectionIndicator } from './DirectionIndicator';

interface GameHeaderProps {
  onBackToMenu?: (() => void) | undefined;
}

export function GameHeader({ onBackToMenu }: GameHeaderProps) {
  const isMobile = useIsMobile();

  const {
    roomCode,
    connectionStatus,
    reconnectAttempts,
    manualReconnect,
    gameState,
  } = useGameStore(state => ({
    roomCode: state.roomCode,
    connectionStatus: state.connectionStatus,
    reconnectAttempts: state.reconnectAttempts || 0,
    manualReconnect: state.manualReconnect,
    gameState: state.gameState,
  }));

  const { toggleInGameMenu, toggleRoomInfo } = useUIStore(state => ({
    toggleInGameMenu: state.toggleInGameMenu,
    toggleRoomInfo: state.toggleRoomInfo,
  }));

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

      {/* Status Section */}
      <div
        className="status-section"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {/* Direction Indicator - only show during gameplay */}
        {gameState &&
          gameState.phase === 'playing' &&
          gameState.players.length > 2 && (
            <DirectionIndicator
              direction={gameState.direction}
              playerCount={gameState.players.length}
              compact={isMobile}
            />
          )}

        {/* Connection Status */}
        <div
          className="connection-status"
          onClick={toggleRoomInfo}
          title="Click for room details"
          style={{
            cursor: roomCode ? 'pointer' : 'default',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'all 0.2s ease',
            border: '1px solid transparent',
          }}
          onMouseEnter={e => {
            if (roomCode) {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
          }}
          onMouseLeave={e => {
            if (roomCode) {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'transparent';
              target.style.borderColor = 'transparent';
            }
          }}
        >
          <ConnectionIndicator
            status={connectionStatus}
            roomCode={roomCode}
            reconnectAttempts={reconnectAttempts}
            onManualReconnect={manualReconnect}
            compact={isMobile}
          />
        </div>
      </div>
    </header>
  );
}
