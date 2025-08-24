import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameSettings } from './types';
import { GameSetupConfig } from '../components/MenuScreen';

interface UIStore {
  // Screen navigation
  currentScreen: 'menu' | 'game' | 'settings';
  gameSetup: GameSetupConfig | null;

  // Settings
  settings: GameSettings;
  settingsOpen: boolean;

  // Chat (for future implementation)
  chatOpen: boolean;

  // UI state
  sidebarOpen: boolean;
  activeTab: 'game' | 'settings' | 'chat' | 'help';

  // Theme and appearance
  theme: 'light' | 'dark' | 'auto';

  // Actions
  setCurrentScreen: (screen: 'menu' | 'game' | 'settings') => void;
  setGameSetup: (config: GameSetupConfig) => void;
  updateSettings: (updates: Partial<GameSettings>) => void;
  resetSettings: () => void;
  toggleSettings: () => void;
  toggleChat: () => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: 'game' | 'settings' | 'chat' | 'help') => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

const defaultSettings: GameSettings = {
  // Rule toggles - start with basic rules only
  enable2s: false,
  enable8s: false,
  enableAces: false,
  enableRuns: false,
  enableMirror: false,
  enable5Hearts: false,

  // UI preferences
  handSortOrder: 'dealt',
  showAnimations: true,
  playSound: false, // Default off to avoid autoplay issues
  showRecentMoves: false,

  // Accessibility
  highContrast: false,
  largeText: false,
};

export const useUIStore = create<UIStore>()(
  persist(
    set => ({
      // Initial state
      currentScreen: 'menu',
      gameSetup: null,
      settings: defaultSettings,
      settingsOpen: false,
      chatOpen: false,
      sidebarOpen: false,
      activeTab: 'game',
      theme: 'auto',

      // Actions
      setCurrentScreen: (screen: 'menu' | 'game' | 'settings') => {
        set({ currentScreen: screen });
      },

      setGameSetup: (config: GameSetupConfig) => {
        set({ gameSetup: config });
      },
      updateSettings: (updates: Partial<GameSettings>) => {
        set(state => ({
          settings: {
            ...state.settings,
            ...updates,
          },
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      toggleSettings: () => {
        set(state => ({
          settingsOpen: !state.settingsOpen,
          // Close other panels
          chatOpen: false,
        }));
      },

      toggleChat: () => {
        set(state => ({
          chatOpen: !state.chatOpen,
          // Close other panels
          settingsOpen: false,
        }));
      },

      toggleSidebar: () => {
        set(state => ({
          sidebarOpen: !state.sidebarOpen,
        }));
      },

      setActiveTab: (tab: 'game' | 'settings' | 'chat' | 'help') => {
        set({ activeTab: tab });
      },

      setTheme: (theme: 'light' | 'dark' | 'auto') => {
        set({ theme });
      },
    }),
    {
      name: 'switch-game-ui',
      // Only persist settings and theme, not UI state or screens
      partialize: state => ({
        settings: state.settings,
        theme: state.theme,
      }),
    },
  ),
);
