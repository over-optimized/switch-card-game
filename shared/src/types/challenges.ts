// Daily challenge system types and interfaces

export interface DailyChallengeProgress {
  date: string; // YYYY-MM-DD format
  baseChallenge: {
    title: string;
    description: string;
    completed: boolean;
    completedAt?: Date;
  };
  // Future: bonus challenges will be added here in Phase 2
}

export interface ChallengeStreak {
  current: number; // Current consecutive days
  best: number; // All-time best streak
  lastCompletedDate?: string; // YYYY-MM-DD of last completion
}

export interface ChallengeStorage {
  dailyProgress: Record<string, DailyChallengeProgress>; // date -> progress
  streak: ChallengeStreak;
  totalChallengesCompleted: number;
  firstChallengeDate?: string; // Track when user started doing challenges
}

// Helper function to get today's date in YYYY-MM-DD format
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Helper function to create a new daily challenge for today
export function createTodayChallenge(): DailyChallengeProgress {
  return {
    date: getTodayDateString(),
    baseChallenge: {
      title: 'Daily Victory',
      description: 'Win any game today',
      completed: false,
    },
  };
}

// Helper function to check if a date string is today
export function isToday(dateString: string): boolean {
  return dateString === getTodayDateString();
}

// Helper function to check if two dates are consecutive days
export function areConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

// Helper function to get yesterday's date string
export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}
