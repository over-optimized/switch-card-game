import { useState } from 'react';
import { useUIStore, useGameStore } from '../stores';

export function RoomInfoPanel() {
  const [copied, setCopied] = useState(false);

  const { roomInfoOpen, setRoomInfoOpen } = useUIStore(state => ({
    roomInfoOpen: state.roomInfoOpen,
    setRoomInfoOpen: state.setRoomInfoOpen,
  }));

  const { roomCode, connectionStatus, gameState } = useGameStore(state => ({
    roomCode: state.roomCode,
    connectionStatus: state.connectionStatus,
    gameState: state.gameState,
  }));

  const handleClose = () => {
    setRoomInfoOpen(false);
  };

  const handleCopyRoomCode = async () => {
    if (roomCode) {
      try {
        await navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy room code:', error);
      }
    }
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return '#27ae60';
      case 'connecting':
        return '#f39c12';
      case 'disconnected':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'disconnected':
        return '🔴';
      default:
        return '⚫';
    }
  };

  if (!roomInfoOpen || !roomCode) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="room-info-backdrop" onClick={handleClose}>
        <div className="room-info-panel" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="room-info-header">
            <h3>📡 Room Information</h3>
            <button className="room-close-btn" onClick={handleClose}>
              ✕
            </button>
          </div>

          {/* Room Details */}
          <div className="room-info-content">
            {/* Room Code Section */}
            <div className="info-section">
              <div className="room-code-display">
                <div className="room-code-label">Room Code</div>
                <div className="room-code-value">
                  <span className="code-text">{roomCode}</span>
                  <button
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopyRoomCode}
                    title="Copy room code"
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="info-section">
              <div className="connection-status">
                <div className="status-header">
                  <span>Connection Status</span>
                  <span
                    className="status-indicator"
                    style={{
                      color: getConnectionStatusColor(connectionStatus),
                    }}
                  >
                    {getConnectionStatusIcon(connectionStatus)}{' '}
                    {connectionStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Game Statistics */}
            {gameState && (
              <div className="info-section">
                <h4>📊 Game Statistics</h4>
                <div className="game-stats">
                  <div className="stat-item">
                    <span className="stat-label">Players:</span>
                    <span className="stat-value">
                      {gameState.players.length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Current Turn:</span>
                    <span className="stat-value">
                      {gameState.players[gameState.currentPlayerIndex]?.name ||
                        'Unknown'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Cards in Deck:</span>
                    <span className="stat-value">
                      {gameState.drawPile.length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Top Card:</span>
                    <span className="stat-value">
                      {gameState.discardPile.length > 0
                        ? `${gameState.discardPile[0].rank}${gameState.discardPile[0].suit}`
                        : 'None'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Direction:</span>
                    <span className="stat-value">
                      {gameState.direction === 1
                        ? '↻ Clockwise'
                        : '↺ Counter-clockwise'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Player List */}
            {gameState && (
              <div className="info-section">
                <h4>👥 Players</h4>
                <div className="player-list">
                  {gameState.players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`player-item ${index === gameState.currentPlayerIndex ? 'current-turn' : ''}`}
                    >
                      <span className="player-name">
                        {player.name}
                        {index === gameState.currentPlayerIndex && ' 👑'}
                      </span>
                      <span className="player-cards">
                        {player.hand?.length || 0} cards
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="info-section">
              <h4>❓ Need Help?</h4>
              <div className="help-tips">
                <p>• Share the room code with friends to join</p>
                <p>• Connection issues? Try refreshing the page</p>
                <p>• Use the game menu for settings and options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
