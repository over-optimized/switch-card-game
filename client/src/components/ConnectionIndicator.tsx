import { ConnectionStatus } from '../stores/types';
import styles from './ConnectionIndicator.module.css';

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
  roomCode?: string | null;
  reconnectAttempts?: number;
  maxReconnectAttempts?: number;
  onManualReconnect?: () => void;
  compact?: boolean;
}

export function ConnectionIndicator({
  status,
  roomCode,
  reconnectAttempts = 0,
  maxReconnectAttempts = 10,
  onManualReconnect,
  compact = false,
}: ConnectionIndicatorProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'connected':
        return {
          text: 'Connected',
          icon: '●',
          color: '#4CAF50',
          pulse: false,
        };
      case 'connecting':
        return {
          text: 'Connecting...',
          icon: '●',
          color: '#FFA726',
          pulse: true,
        };
      case 'reconnecting':
        return {
          text: `Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})`,
          icon: '●',
          color: '#FF9800',
          pulse: true,
        };
      case 'offline':
      default:
        return {
          text: 'Offline',
          icon: '●',
          color: '#F44336',
          pulse: false,
        };
    }
  };

  const statusInfo = getStatusDisplay();

  if (compact) {
    return (
      <div className={styles.indicator}>
        <span
          className={`${styles.statusDot} ${statusInfo.pulse ? styles.pulse : ''}`}
          style={{ color: statusInfo.color }}
          title={`Connection: ${statusInfo.text}`}
        >
          {statusInfo.icon}
        </span>
        {roomCode && <span className={styles.roomCode}>{roomCode}</span>}
      </div>
    );
  }

  return (
    <div className={styles.indicator}>
      <div className={styles.statusRow}>
        <span
          className={`${styles.statusDot} ${statusInfo.pulse ? styles.pulse : ''}`}
          style={{ color: statusInfo.color }}
        >
          {statusInfo.icon}
        </span>
        <span className={styles.statusText}>{statusInfo.text}</span>
      </div>

      {roomCode && <div className={styles.roomCode}>{roomCode}</div>}

      {status === 'offline' && onManualReconnect && (
        <button
          className={styles.reconnectButton}
          onClick={onManualReconnect}
          title="Try to reconnect"
        >
          🔄 Reconnect
        </button>
      )}

      {status === 'reconnecting' &&
        reconnectAttempts >= maxReconnectAttempts &&
        onManualReconnect && (
          <div className={styles.recoveryOptions}>
            <button
              className={styles.reconnectButton}
              onClick={onManualReconnect}
            >
              🔄 Try Again
            </button>
          </div>
        )}
    </div>
  );
}
