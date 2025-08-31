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
    onlinePlayExpanded: boolean;
    playerSetupExpanded: boolean;
    gameRulesExpanded: boolean;
  };

  // In-game menu state
  inGameMenuOpen: boolean;
  roomInfoOpen: boolean;

  // Theme and appearance
  theme: 'light' | 'dark' | 'auto';

  // Toast notifications
  toasts: ToastMessage[];
  toastQueue: ToastMessage[];
  staggerDelay: number;
  maxSimultaneousToasts: number;
  pausedToasts: Set<string>;

  // Actions
  setCurrentScreen: (screen: 'menu' | 'game' | 'settings') => void;
  ensureCorrectDefaults: () => void;
  setGameSetup: (config: GameSetupConfig) => void;
  updateSettings: (updates: Partial<GameSettings>) => void;
  resetSettings: () => void;
  toggleSettings: () => void;
  toggleChat: () => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: 'game' | 'settings' | 'chat' | 'help') => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;

  // Menu section actions
  toggleMenuSection: (
    section: 'quickStart' | 'onlinePlay' | 'playerSetup' | 'gameRules',
  ) => void;
  setMenuSectionExpanded: (
    section: 'quickStart' | 'onlinePlay' | 'playerSetup' | 'gameRules',
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
  scheduleToast: (toast: Omit<ToastMessage, 'id'>) => void;
  processToastQueue: () => void;
  pauseToastAutoDismiss: (id: string) => void;
  resumeToastAutoDismiss: (id: string) => void;
  clearToastsOnGameEnd: () => void;
}

const defaultSettings: GameSettings = {
  // Rule toggles - enable implemented trick cards by default
  enable2s: true,
  enable8s: true,
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
    (set, get) => ({
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
        onlinePlayExpanded: false, // Hide online play by default
        playerSetupExpanded: false, // Hide advanced config by default
        gameRulesExpanded: false, // Hide game rules by default
      },
      inGameMenuOpen: false,
      roomInfoOpen: false,
      theme: 'auto',
      toasts: [],
      toastQueue: [],
      staggerDelay: 150, // 150ms between toast appearances
      maxSimultaneousToasts: 5,
      pausedToasts: new Set(),

      // Actions
      setCurrentScreen: (screen: 'menu' | 'game' | 'settings') => {
        set({ currentScreen: screen });
      },

      // Force correct default settings for implemented features
      ensureCorrectDefaults: () => {
        const currentSettings = get().settings;
        const correctedSettings = {
          ...currentSettings,
          // Ensure trick cards that are implemented show as active
          enable8s: true, // 8s reversal is implemented and working
          enable2s: true, // 2s penalty is implemented and working
          enableAces: true, // Aces suit change is implemented and working
          enableJacks: true, // Jacks skip is implemented and working
        };

        // Only update if something changed
        if (
          JSON.stringify(currentSettings) !== JSON.stringify(correctedSettings)
        ) {
          console.log(
            '[UI Store] Correcting trick card settings to match implementation',
          );
          set({ settings: correctedSettings });
        }
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
      toggleMenuSection: (
        section: 'quickStart' | 'onlinePlay' | 'playerSetup' | 'gameRules',
      ) => {
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
        section: 'quickStart' | 'onlinePlay' | 'playerSetup' | 'gameRules',
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

      // Enhanced toast scheduling with stagger support
      scheduleToast: (toast: Omit<ToastMessage, 'id'>) => {
        const { toasts, staggerDelay, maxSimultaneousToasts } = get();
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // High priority toasts appear immediately
        if (toast.priority === 'high') {
          get().showToast(toast);
          return;
        }

        // Calculate delay based on current visible toasts
        const visibleCount = toasts.filter(
          t =>
            t.animationState === 'visible' || t.animationState === 'entering',
        ).length;

        const queueDelay = visibleCount * staggerDelay;
        const scheduledTime = Date.now() + queueDelay;

        const newToast: ToastMessage = {
          ...toast,
          id,
          queueDelay,
          displayOrder: visibleCount,
          animationState: 'pending',
          scheduledTime,
        };

        // If we haven't hit the limit, schedule immediate display
        if (visibleCount < maxSimultaneousToasts) {
          setTimeout(() => {
            const toastWithStagger = {
              ...toast,
              animationState: 'entering' as const,
              displayOrder: visibleCount,
            };
            get().showToast(toastWithStagger);
          }, queueDelay);
        } else {
          // Add to queue for later processing
          set(state => ({
            toastQueue: [...state.toastQueue, newToast],
          }));
        }
      },

      showToast: (toast: Omit<ToastMessage, 'id'> | ToastMessage) => {
        const existingId = 'id' in toast ? toast.id : undefined;
        const id =
          existingId ||
          `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { toasts } = get();

        const newToast: ToastMessage = {
          ...toast,
          id,
          animationState: 'entering' as const,
          displayOrder: existingId
            ? (toast.displayOrder ?? toasts.length)
            : toasts.length,
        };

        set(state => ({
          toasts: [...state.toasts, newToast],
        }));

        // Update animation state after entrance
        setTimeout(() => {
          set(state => ({
            toasts: state.toasts.map(t =>
              t.id === id ? { ...t, animationState: 'visible' } : t,
            ),
          }));
        }, 300); // Match CSS animation duration

        // Auto-dismiss logic
        const dismissDuration =
          toast.priority === 'high' && !toast.duration
            ? 6000
            : (toast.duration ?? 4000);

        setTimeout(() => {
          const { pausedToasts } = get();
          if (!pausedToasts.has(id)) {
            get().dismissToast(id);
          }
        }, dismissDuration);
      },

      processToastQueue: () => {
        const { toastQueue, toasts, maxSimultaneousToasts } = get();
        const visibleCount = toasts.filter(
          t =>
            t.animationState === 'visible' || t.animationState === 'entering',
        ).length;

        if (toastQueue.length > 0 && visibleCount < maxSimultaneousToasts) {
          const [nextToast, ...remainingQueue] = toastQueue;

          set({ toastQueue: remainingQueue });
          get().showToast(nextToast);

          // Continue processing if more space available
          if (
            remainingQueue.length > 0 &&
            visibleCount < maxSimultaneousToasts - 1
          ) {
            setTimeout(() => get().processToastQueue(), get().staggerDelay);
          }
        }
      },

      dismissToast: (id: string) => {
        // Mark as exiting first for animation
        set(state => ({
          toasts: state.toasts.map(t =>
            t.id === id ? { ...t, animationState: 'exiting' } : t,
          ),
          pausedToasts: new Set(
            [...state.pausedToasts].filter(pausedId => pausedId !== id),
          ),
        }));

        // Actually remove after animation
        setTimeout(() => {
          set(state => ({
            toasts: state.toasts.filter(toast => toast.id !== id),
          }));
          // Process queue when space opens up
          get().processToastQueue();
        }, 300);
      },

      pauseToastAutoDismiss: (id: string) => {
        set(state => ({
          pausedToasts: new Set([...state.pausedToasts, id]),
        }));
      },

      resumeToastAutoDismiss: (id: string) => {
        const { pausedToasts } = get();
        const newPaused = new Set(pausedToasts);
        newPaused.delete(id);

        set({ pausedToasts: newPaused });

        // Find the toast and set a new dismiss timer
        const { toasts } = get();
        const toast = toasts.find(t => t.id === id);
        if (toast) {
          const remainingTime = toast.duration ?? 4000;
          setTimeout(() => {
            if (!get().pausedToasts.has(id)) {
              get().dismissToast(id);
            }
          }, remainingTime);
        }
      },

      clearAllToasts: () => {
        set({
          toasts: [],
          toastQueue: [],
          pausedToasts: new Set(),
        });
      },

      clearToastsOnGameEnd: () => {
        // Gracefully animate out all toasts
        const { toasts } = get();

        toasts.forEach((toast, index) => {
          setTimeout(() => {
            set(state => ({
              toasts: state.toasts.map(t =>
                t.id === toast.id ? { ...t, animationState: 'exiting' } : t,
              ),
            }));
          }, index * 50); // Stagger the exit animations
        });

        // Clear everything after animations complete
        setTimeout(
          () => {
            get().clearAllToasts();
          },
          toasts.length * 50 + 300,
        );
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
