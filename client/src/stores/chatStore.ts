import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'system' | 'game';
}

interface ChatStore {
  // Messages
  messages: ChatMessage[];
  unreadCount: number;
  maxMessages: number;

  // Typing indicators
  typingUsers: Record<string, { name: string; timestamp: Date }>;

  // Chat state
  isEnabled: boolean;
  isVisible: boolean;

  // Input state
  currentMessage: string;
  isTyping: boolean;

  // Actions
  addMessage: (message: Omit<ChatMessage, 'id'>) => void;
  addSystemMessage: (text: string) => void;
  addGameMessage: (text: string) => void;
  clearMessages: () => void;
  markAllRead: () => void;

  // Typing actions
  setTyping: (userId: string, userName: string, isTyping: boolean) => void;
  clearOldTypingUsers: () => void;

  // Input actions
  setCurrentMessage: (message: string) => void;
  sendMessage: () => void;

  // Visibility actions
  setVisible: (visible: boolean) => void;
  setEnabled: (enabled: boolean) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: [],
  unreadCount: 0,
  maxMessages: 100,
  typingUsers: {},
  isEnabled: true, // Will be disabled in local-only mode
  isVisible: false,
  currentMessage: '',
  isTyping: false,

  // Actions
  addMessage: (message: Omit<ChatMessage, 'id'>) => {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: ChatMessage = {
      id,
      ...message,
    };

    set(state => {
      const newMessages = [...state.messages, newMessage].slice(
        -state.maxMessages,
      );
      return {
        messages: newMessages,
        unreadCount: state.isVisible
          ? state.unreadCount
          : state.unreadCount + 1,
      };
    });
  },

  addSystemMessage: (text: string) => {
    get().addMessage({
      playerId: 'system',
      playerName: 'System',
      message: text,
      timestamp: new Date(),
      type: 'system',
    });
  },

  addGameMessage: (text: string) => {
    get().addMessage({
      playerId: 'game',
      playerName: 'Game',
      message: text,
      timestamp: new Date(),
      type: 'game',
    });
  },

  clearMessages: () => {
    set({
      messages: [],
      unreadCount: 0,
    });
  },

  markAllRead: () => {
    set({ unreadCount: 0 });
  },

  setTyping: (userId: string, userName: string, isTyping: boolean) => {
    set(state => {
      const newTypingUsers = { ...state.typingUsers };

      if (isTyping) {
        newTypingUsers[userId] = {
          name: userName,
          timestamp: new Date(),
        };
      } else {
        delete newTypingUsers[userId];
      }

      return { typingUsers: newTypingUsers };
    });
  },

  clearOldTypingUsers: () => {
    const now = new Date();
    const timeout = 5000; // 5 seconds

    set(state => {
      const newTypingUsers = { ...state.typingUsers };
      let hasChanges = false;

      Object.keys(newTypingUsers).forEach(userId => {
        const user = newTypingUsers[userId];
        if (now.getTime() - user.timestamp.getTime() > timeout) {
          delete newTypingUsers[userId];
          hasChanges = true;
        }
      });

      return hasChanges ? { typingUsers: newTypingUsers } : state;
    });
  },

  setCurrentMessage: (message: string) => {
    set({ currentMessage: message });
  },

  sendMessage: () => {
    const { currentMessage } = get();
    if (!currentMessage.trim()) return;

    // In the future, this would send via Socket.IO
    // For now, just add as a local message
    get().addMessage({
      playerId: 'local-player', // Would be actual player ID
      playerName: 'You',
      message: currentMessage.trim(),
      timestamp: new Date(),
      type: 'chat',
    });

    set({ currentMessage: '' });
  },

  setVisible: (visible: boolean) => {
    set({ isVisible: visible });
    if (visible) {
      get().markAllRead();
    }
  },

  setEnabled: (enabled: boolean) => {
    set({ isEnabled: enabled });
  },
}));

// Auto-cleanup typing users every 10 seconds
setInterval(() => {
  useChatStore.getState().clearOldTypingUsers();
}, 10000);
