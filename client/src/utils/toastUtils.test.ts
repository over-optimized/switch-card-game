import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { gameToasts, getCardDisplayString, isTrickCard } from './toastUtils';
import { useUIStore } from '../stores/uiStore';

// Mock the UI store
vi.mock('../stores/uiStore', () => ({
  useUIStore: {
    getState: vi.fn(() => ({
      showToast: vi.fn(),
      scheduleToast: vi.fn(),
    })),
  },
}));

describe('toastUtils', () => {
  let mockShowToast: ReturnType<typeof vi.fn>;
  let mockScheduleToast: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockShowToast = vi.fn();
    mockScheduleToast = vi.fn();

    const mockUIStore = useUIStore as { getState: ReturnType<typeof vi.fn> };
    mockUIStore.getState.mockReturnValue({
      showToast: mockShowToast,
      scheduleToast: mockScheduleToast,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('opponent move notifications', () => {
    it('should show opponent move with correct player name', () => {
      gameToasts.showOpponentMove('Alice', '♠️ Jack', 'Next player skipped');

      expect(mockScheduleToast).toHaveBeenCalledWith({
        type: 'opponent-move',
        title: 'Alice played',
        message: '♠️ Jack - Next player skipped',
        duration: 3000,
        priority: 'normal',
      });
    });

    it('should show opponent move without effect', () => {
      gameToasts.showOpponentMove('Bob', '♥️ 7');

      expect(mockScheduleToast).toHaveBeenCalledWith({
        type: 'opponent-move',
        title: 'Bob played',
        message: '♥️ 7',
        duration: 3000,
        priority: 'normal',
      });
    });

    it('should handle computer player correctly', () => {
      gameToasts.showOpponentMove('Computer', '♣️ King');

      expect(mockScheduleToast).toHaveBeenCalledWith({
        type: 'opponent-move',
        title: 'Computer played',
        message: '♣️ King',
        duration: 3000,
        priority: 'normal',
      });
    });
  });

  describe('trick card notifications', () => {
    it('should show Jack effect with correct attribution', () => {
      gameToasts.showJackEffect(1, 'Alice');

      expect(mockScheduleToast).toHaveBeenCalledWith({
        type: 'trick-card',
        title: 'Jack played!',
        message: '1 player skipped by Alice',
        duration: 4000,
        priority: 'normal',
        icon: '⏭️',
      });
    });

    it('should show Jack effect with multiple skips', () => {
      gameToasts.showJackEffect(2, 'Bob');

      expect(mockScheduleToast).toHaveBeenCalledWith({
        type: 'trick-card',
        title: 'Jack played!',
        message: '2 players skipped by Bob',
        duration: 4000,
        priority: 'normal',
        icon: '⏭️',
      });
    });

    it('should show Jack effect without player attribution', () => {
      gameToasts.showJackEffect(1);

      expect(mockScheduleToast).toHaveBeenCalledWith({
        type: 'trick-card',
        title: 'Jack played!',
        message: '1 player skipped',
        duration: 4000,
        priority: 'normal',
        icon: '⏭️',
      });
    });

    it('should show Ace effect with suit change', () => {
      gameToasts.showAceEffect('hearts', 'Charlie');

      expect(mockScheduleToast).toHaveBeenCalledWith({
        type: 'trick-card',
        title: 'Ace played!',
        message: 'Suit changed to ♥️ Hearts by Charlie',
        duration: 4000,
        priority: 'normal',
        icon: '🎭',
      });
    });

    it('should show 2s effect with penalty cards', () => {
      gameToasts.show2sEffect(2, 'David');

      expect(mockScheduleToast).toHaveBeenCalledWith({
        type: 'trick-card',
        title: '2s played!',
        message: '+2 penalty cards from David',
        duration: 4000,
        priority: 'normal',
        icon: '⚠️',
      });
    });
  });

  describe('penalty notifications', () => {
    it('should show penalty creation', () => {
      gameToasts.showPenaltyCreated(2, 'Alice');

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'penalty',
        title: 'Penalty Created',
        message: '2 card penaltys for Alice',
        duration: 4000,
        priority: 'high',
      });
    });

    it('should show penalty stacking', () => {
      gameToasts.showPenaltyStacked(4, 2);

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'penalty',
        title: 'Penalty Stacked!',
        message: '+2 cards → 4 total penalty',
        duration: 4000,
        priority: 'high',
      });
    });

    it('should show penalty served', () => {
      gameToasts.showPenaltyServed('Bob', 3);

      expect(mockScheduleToast).toHaveBeenCalledWith({
        type: 'penalty',
        title: 'Penalty Served',
        message: 'Bob drew 3 penalty cards',
        duration: 3000,
        priority: 'normal',
      });
    });
  });

  describe('game state notifications', () => {
    it('should show game start notification', () => {
      gameToasts.showGameStart();

      expect(mockScheduleToast).toHaveBeenCalledWith({
        type: 'info',
        title: 'Game Started!',
        message: 'Good luck!',
        duration: 2000,
        priority: 'normal',
      });
    });

    it('should show victory notification for current player', () => {
      gameToasts.showGameEnd('You', true);

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'info',
        title: '🎉 You Won!',
        message: 'Congratulations!',
        duration: 6000,
        priority: 'high',
        icon: '🏆',
      });
    });

    it('should show game over notification for other player', () => {
      gameToasts.showGameEnd('Alice', false);

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'info',
        title: 'Game Over',
        message: 'Alice wins!',
        duration: 6000,
        priority: 'high',
        icon: '🎯',
      });
    });
  });

  describe('utility functions', () => {
    it('should format card display strings correctly', () => {
      expect(getCardDisplayString('A', 'hearts')).toBe('A♥️');
      expect(getCardDisplayString('K', 'spades')).toBe('K♠️');
      expect(getCardDisplayString('Q', 'diamonds')).toBe('Q♦️');
      expect(getCardDisplayString('J', 'clubs')).toBe('J♣️');
    });

    it('should handle unknown suits gracefully', () => {
      expect(getCardDisplayString('7', 'unknown')).toBe('7unknown');
    });

    it('should identify trick cards correctly', () => {
      // Trick cards according to Switch rules
      expect(isTrickCard('2')).toBe(true);
      expect(isTrickCard('3')).toBe(true);
      expect(isTrickCard('5')).toBe(true);
      expect(isTrickCard('7')).toBe(true);
      expect(isTrickCard('8')).toBe(true);
      expect(isTrickCard('J')).toBe(true);
      expect(isTrickCard('K')).toBe(true);
      expect(isTrickCard('A')).toBe(true);

      // Non-trick cards
      expect(isTrickCard('4')).toBe(false);
      expect(isTrickCard('6')).toBe(false);
      expect(isTrickCard('9')).toBe(false);
      expect(isTrickCard('10')).toBe(false);
      expect(isTrickCard('Q')).toBe(false);
    });
  });

  describe('turn prompt notifications', () => {
    it('should show turn prompt with message only', () => {
      gameToasts.showTurnPrompt('Choose a card to play');

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'turn-prompt',
        title: 'Your Turn',
        message: 'Choose a card to play',
        duration: 5000,
        priority: 'high',
      });
    });

    it('should show turn prompt with options', () => {
      gameToasts.showTurnPrompt('Choose an action', ['Play card', 'Draw card']);

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'turn-prompt',
        title: 'Your Turn',
        message: 'Choose an action: Play card OR Draw card',
        duration: 5000,
        priority: 'high',
      });
    });
  });
});
