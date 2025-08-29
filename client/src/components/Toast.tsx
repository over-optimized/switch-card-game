import { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import styles from './Toast.module.css';

export interface ToastMessage {
  id: string;
  type: 'opponent-move' | 'penalty' | 'trick-card' | 'turn-prompt' | 'info';
  title: string;
  message: string;
  icon?: string;
  duration?: number;
  priority?: 'low' | 'normal' | 'high';
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const theme = useUIStore(state => state.theme);

  useEffect(() => {
    const duration = toast.duration ?? 4000; // Default 4 seconds
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const handleClick = () => {
    onDismiss(toast.id);
  };

  const getToastIcon = () => {
    if (toast.icon) return toast.icon;

    switch (toast.type) {
      case 'opponent-move':
        return '🎭';
      case 'penalty':
        return '⚠️';
      case 'trick-card':
        return '🃏';
      case 'turn-prompt':
        return '🎯';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${styles[toast.priority || 'normal']}`}
      data-theme={theme}
      onClick={handleClick}
    >
      <div className={styles.toastIcon}>{getToastIcon()}</div>
      <div className={styles.toastContent}>
        <div className={styles.toastTitle}>{toast.title}</div>
        <div className={styles.toastMessage}>{toast.message}</div>
      </div>
      <button
        className={styles.dismissBtn}
        onClick={handleClick}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismissToast } = useUIStore(state => ({
    toasts: state.toasts,
    dismissToast: state.dismissToast,
  }));

  return (
    <div className={styles.toastContainer}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
