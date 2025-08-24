import { GameState } from 'switch-shared';

// Connection states
export type ConnectionStatus = 'offline' | 'connecting' | 'connected' | 'reconnecting';

// Game modes for trick cards
export type GameMode = 'normal' | 'active-2s' | 'active-run' | 'mirror-mode';

// Drag and drop state
export interface DragState {
  isDragging: boolean;
  draggedCards: string[];
}

// Penalty state for trick cards
export interface PenaltyState {
  active: boolean;
  cards: number;
  type: '2s' | 'run' | null;
  playerId?: string;
}

// Recent move tracking
export interface RecentMove {
  timestamp: Date;
  player: string;
  action: string;
  details?: string;
}

// Optimistic update tracking
export interface OptimisticUpdate {
  id: string;
  type: 'play-card' | 'draw-card';
  timestamp: Date;
  originalState: GameState;
  cardId?: string;
}

// Player info for multiplayer
export interface PlayerInfo {
  id: string;
  name: string;
  connected: boolean;
  status: 'waiting' | 'ready' | 'playing';
}

// Game settings
export interface GameSettings {
  // Rule toggles
  enable2s: boolean;
  enable8s: boolean;
  enableAces: boolean;
  enableRuns: boolean;
  enableMirror: boolean;
  enable5Hearts: boolean;
  
  // UI preferences
  handSortOrder: 'dealt' | 'rank' | 'suit';
  showAnimations: boolean;
  playSound: boolean;
  showRecentMoves: boolean;
  
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
}