import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameSettings, HandShelfState } from './types';
import { GameSetupConfig } from '../components/MenuScreen';
import { ToastMessage } from '../components/Toast';

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

  // Menu UI state
  menuSections: {
    quickStartExpanded: boolean;
    playerSetupExpanded: boolean;
  };

  // In-game menu state
  inGameMenuOpen: boolean;
  roomInfoOpen: boolean;

  // Theme and appearance
  theme: 'light' | 'dark' | 'auto';

  // Toast notifications
  toasts: ToastMessage[];

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

  // Menu section actions
  toggleMenuSection: (section: 'quickStart' | 'playerSetup') => void;
  setMenuSectionExpanded: (
    section: 'quickStart' | 'playerSetup',
    expanded: boolean,
  ) => void;

  // In-game menu actions
  toggleInGameMenu: () => void;
  toggleRoomInfo: () => void;
  setInGameMenuOpen: (open: boolean) => void;
  setRoomInfoOpen: (open: boolean) => void;

  // Hand shelf actions
  setHandShelfPosition: (position: number) => void;
  setHandShelfDragging: (isDragging: boolean) => void;
  enableHandShelf: (enabled: boolean) => void;
  resetHandShelfPosition: () => void;

  // Toast notification actions
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
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
  handShelfPosition: 300, // Default to 100% expanded position

  // Accessibility
  highContrast: false,
  largeText: false,
};

const defaultHandShelf: HandShelfState = {
  position: 300, // Start at 100% expanded position
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
      menuSections: {
        quickStartExpanded: true, // Show quick start by default for mobile-first approach
        playerSetupExpanded: false, // Hide advanced config by default
      },
      inGameMenuOpen: false,
      roomInfoOpen: false,
      theme: 'auto',
      toasts: [],

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

      // Menu section actions
      toggleMenuSection: (section: 'quickStart' | 'playerSetup') => {
        set(state => ({
          menuSections: {
            ...state.menuSections,
            [`${section}Expanded`]:
              !state.menuSections[
                `${section}Expanded` as keyof typeof state.menuSections
              ],
          },
        }));
      },

      setMenuSectionExpanded: (
        section: 'quickStart' | 'playerSetup',
        expanded: boolean,
      ) => {
        set(state => ({
          menuSections: {
            ...state.menuSections,
            [`${section}Expanded`]: expanded,
          },
        }));
      },

      // In-game menu actions
      toggleInGameMenu: () => {
        set(state => ({
          inGameMenuOpen: !state.inGameMenuOpen,
          roomInfoOpen: false, // Close room info when opening in-game menu
        }));
      },

      toggleRoomInfo: () => {
        set(state => ({
          roomInfoOpen: !state.roomInfoOpen,
          inGameMenuOpen: false, // Close in-game menu when opening room info
        }));
      },

      setInGameMenuOpen: (open: boolean) => {
        set({ inGameMenuOpen: open });
      },

      setRoomInfoOpen: (open: boolean) => {
        set({ roomInfoOpen: open });
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

      // Toast notification actions
      showToast: (toast: Omit<ToastMessage, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: ToastMessage = { ...toast, id };

        set(state => ({
          toasts: [...state.toasts, newToast],
        }));

        // Auto-dismiss high priority toasts after longer duration
        if (toast.priority === 'high' && !toast.duration) {
          setTimeout(() => {
            set(state => ({
              toasts: state.toasts.filter(t => t.id !== id),
            }));
          }, 6000);
        }
      },

      dismissToast: (id: string) => {
        set(state => ({
          toasts: state.toasts.filter(toast => toast.id !== id),
        }));
      },

      clearAllToasts: () => {
        set({ toasts: [] });
      },
    }),
    {
      name: 'switch-game-ui',
      // Only persist settings, theme, and menu preferences - not ephemeral UI state
      partialize: state => ({
        settings: {
          ...state.settings,
          handShelfPosition: 0, // Always reset shelf position to default
        },
        theme: state.theme,
        menuSections: state.menuSections, // Persist user's menu expansion preferences
        // Don't persist handShelf state or in-game menus - let them initialize fresh each time
      }),
    },
  ),
);
