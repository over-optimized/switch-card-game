import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameSettings, HandShelfState } from './types';
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

  // Mobile hand shelf state
  handShelf: HandShelfState;

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

  // Hand shelf actions
  setHandShelfPosition: (position: number) => void;
  setHandShelfDragging: (isDragging: boolean) => void;
  enableHandShelf: (enabled: boolean) => void;
  resetHandShelfPosition: () => void;
}

const defaultSettings: GameSettings = {
  // Rule toggles - enable implemented trick cards by default
  enable2s: true,
  enable8s: false,
  enableAces: true,
  enableJacks: true,
  enableRuns: false,
  enableMirror: false,
  enable5Hearts: false,

  // UI preferences
  handSortOrder: 'dealt',
  showAnimations: true,
  playSound: false, // Default off to avoid autoplay issues
  showRecentMoves: false,
  showCardHints: true, // Default on to help new players

  // Mobile preferences
  handShelfPosition: 0, // Default to bottom position

  // Accessibility
  highContrast: false,
  largeText: false,
};

const defaultHandShelf: HandShelfState = {
  position: 0, // Start at default bottom position
  isDragging: false,
  isEnabled: false, // Will be enabled automatically on mobile devices
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
      handShelf: defaultHandShelf,
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

      // Hand shelf actions
      setHandShelfPosition: (position: number) => {
        set(state => ({
          handShelf: { ...state.handShelf, position },
          settings: { ...state.settings, handShelfPosition: position },
        }));
      },

      setHandShelfDragging: (isDragging: boolean) => {
        set(state => ({
          handShelf: { ...state.handShelf, isDragging },
        }));
      },

      enableHandShelf: (enabled: boolean) => {
        set(state => ({
          handShelf: { ...state.handShelf, isEnabled: enabled },
        }));
      },

      resetHandShelfPosition: () => {
        set(state => ({
          handShelf: { ...state.handShelf, position: 0 },
          settings: { ...state.settings, handShelfPosition: 0 },
        }));
      },
    }),
    {
      name: 'switch-game-ui',
      // Only persist settings, theme, and shelf position, not UI state or screens
      partialize: state => ({
        settings: state.settings,
        theme: state.theme,
        handShelf: {
          position: state.handShelf.position,
          isEnabled: state.handShelf.isEnabled,
          isDragging: false, // Never persist dragging state
        },
      }),
    },
  ),
);
