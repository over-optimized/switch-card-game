import { Suit } from '../../../shared/src/types/card';
import { useUIStore } from '../stores/uiStore';

// Utility functions for showing game-related toasts
export const gameToasts = {
  // Opponent move notifications
  showOpponentMove: (playerName: string, cardInfo: string, effect?: string) => {
    const scheduleToast = useUIStore.getState().scheduleToast;
    scheduleToast({
      type: 'opponent-move',
      title: `${playerName} played`,
      message: effect ? `${cardInfo} - ${effect}` : cardInfo,
      duration: 3000,
      priority: 'normal',
    });
  },

  // Penalty notifications
  showPenaltyCreated: (cards: number, targetPlayer?: string) => {
    const showToast = useUIStore.getState().showToast;
    showToast({
      type: 'penalty',
      title: 'Penalty Created',
      message: `${cards} card penalty${cards !== 1 ? 's' : ''}${targetPlayer ? ` for ${targetPlayer}` : ''}`,
      duration: 4000,
      priority: 'high',
    });
  },

  showPenaltyStacked: (totalCards: number, addedCards: number) => {
    const showToast = useUIStore.getState().showToast;
    showToast({
      type: 'penalty',
      title: 'Penalty Stacked!',
      message: `+${addedCards} cards → ${totalCards} total penalty`,
      duration: 4000,
      priority: 'high',
    });
  },

  showPenaltyServed: (playerName: string, cards: number) => {
    const scheduleToast = useUIStore.getState().scheduleToast;
    scheduleToast({
      type: 'penalty',
      title: 'Penalty Served',
      message: `${playerName} drew ${cards} penalty card${cards !== 1 ? 's' : ''}`,
      duration: 3000,
      priority: 'normal',
    });
  },

  // Trick card notifications
  showTrickCard: (cardName: string, effect: string, icon?: string) => {
    const scheduleToast = useUIStore.getState().scheduleToast;
    scheduleToast({
      type: 'trick-card',
      title: `${cardName} played!`,
      message: effect,
      ...(icon && { icon }),
      duration: 4000,
      priority: 'normal',
    });
  },

  // Specific trick card helpers
  showAceEffect: (suit: Suit, playerName?: string) => {
    const suitNames: Record<Suit, string> = {
      hearts: '♥️ Hearts',
      diamonds: '♦️ Diamonds',
      clubs: '♣️ Clubs',
      spades: '♠️ Spades',
    };

    gameToasts.showTrickCard(
      'Ace',
      `Suit changed to ${suitNames[suit]}${playerName ? ` by ${playerName}` : ''}`,
      '🎭',
    );
  },

  showJackEffect: (skipsRemaining: number, playerName?: string) => {
    gameToasts.showTrickCard(
      'Jack',
      `${skipsRemaining} player${skipsRemaining !== 1 ? 's' : ''} skipped${playerName ? ` by ${playerName}` : ''}`,
      '⏭️',
    );
  },

  show2sEffect: (penaltyCards: number, playerName?: string) => {
    gameToasts.showTrickCard(
      '2s',
      `+${penaltyCards} penalty cards${playerName ? ` from ${playerName}` : ''}`,
      '⚠️',
    );
  },

  // Turn prompt notifications
  showTurnPrompt: (message: string, options?: string[]) => {
    const showToast = useUIStore.getState().showToast;
    showToast({
      type: 'turn-prompt',
      title: 'Your Turn',
      message: options ? `${message}: ${options.join(' OR ')}` : message,
      duration: 5000,
      priority: 'high',
    });
  },

  // General info notifications
  showInfo: (title: string, message: string, duration = 3000) => {
    const scheduleToast = useUIStore.getState().scheduleToast;
    scheduleToast({
      type: 'info',
      title,
      message,
      duration,
      priority: 'normal',
    });
  },

  // Game state notifications
  showGameStart: () => {
    gameToasts.showInfo('Game Started!', 'Good luck!', 2000);
  },

  showGameEnd: (winner: string, isYou: boolean) => {
    const showToast = useUIStore.getState().showToast;
    showToast({
      type: 'info',
      title: isYou ? '🎉 You Won!' : 'Game Over',
      message: isYou ? 'Congratulations!' : `${winner} wins!`,
      duration: 6000,
      priority: 'high',
      icon: isYou ? '🏆' : '🎯',
    });
  },
};

// Utility to get card display string for toasts
export const getCardDisplayString = (rank: string, suit: string): string => {
  const suitSymbols: Record<string, string> = {
    hearts: '♥️',
    diamonds: '♦️',
    clubs: '♣️',
    spades: '♠️',
  };

  return `${rank}${suitSymbols[suit] || suit}`;
};

// Helper to determine if a card is a trick card for toast purposes
export const isTrickCard = (rank: string): boolean => {
  return ['2', '3', '5', '7', '8', 'J', 'K', 'A'].includes(rank);
};
