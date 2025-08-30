import { useEffect, useState } from 'react';
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
  // Stagger display properties
  queueDelay?: number | undefined;
  displayOrder?: number | undefined;
  animationState?: 'pending' | 'entering' | 'visible' | 'exiting' | undefined;
  scheduledTime?: number | undefined;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const theme = useUIStore(state => state.theme);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Skip auto-dismiss for pending/exiting toasts
    if (
      toast.animationState === 'pending' ||
      toast.animationState === 'exiting'
    ) {
      return;
    }

    const duration = toast.duration ?? 4000; // Default 4 seconds
    let timer: number;

    if (!isHovered) {
      timer = window.setTimeout(() => {
        onDismiss(toast.id);
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [toast.id, toast.duration, toast.animationState, isHovered, onDismiss]);

  const handleClick = () => {
    onDismiss(toast.id);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
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

  // Get CSS classes including animation state
  const toastClasses = [
    styles.toast,
    styles[toast.type],
    styles[toast.priority || 'normal'],
    toast.animationState ? styles[toast.animationState] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={toastClasses}
      data-theme={theme}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={
        {
          '--display-order': toast.displayOrder || 0,
          '--stagger-delay': `${toast.queueDelay || 0}ms`,
        } as React.CSSProperties & {
          '--display-order': number;
          '--stagger-delay': string;
        }
      }
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
  const {
    toasts,
    dismissToast,
    pauseToastAutoDismiss,
    resumeToastAutoDismiss,
  } = useUIStore(state => ({
    toasts: state.toasts,
    dismissToast: state.dismissToast,
    pauseToastAutoDismiss: state.pauseToastAutoDismiss,
    resumeToastAutoDismiss: state.resumeToastAutoDismiss,
  }));

  const handleContainerMouseEnter = () => {
    toasts.forEach(toast => {
      pauseToastAutoDismiss(toast.id);
    });
  };

  const handleContainerMouseLeave = () => {
    toasts.forEach(toast => {
      resumeToastAutoDismiss(toast.id);
    });
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={styles.toastContainer}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          toast={{ ...toast, displayOrder: toast.displayOrder ?? index }}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
}
