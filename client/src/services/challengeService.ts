import {
  ChallengeStorage,
  ChallengeStreak,
  DailyChallengeProgress,
  getTodayDateString,
  getYesterdayDateString,
  createTodayChallenge,
  isToday,
} from '../../../shared/src/types/challenges';

const CHALLENGE_STORAGE_KEY = 'switch-game-challenges';

class ChallengeService {
  private storage: ChallengeStorage;

  constructor() {
    this.storage = this.loadFromStorage();
  }

  /**
   * Load challenge data from localStorage, initialize if needed
   */
  private loadFromStorage(): ChallengeStorage {
    try {
      const stored = localStorage.getItem(CHALLENGE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChallengeStorage;
        // Ensure we have valid structure
        const storage: ChallengeStorage = {
          dailyProgress: parsed.dailyProgress || {},
          streak: parsed.streak || { current: 0, best: 0 },
          totalChallengesCompleted: parsed.totalChallengesCompleted || 0,
        };

        // Only add firstChallengeDate if it exists
        if (parsed.firstChallengeDate) {
          storage.firstChallengeDate = parsed.firstChallengeDate;
        }

        return storage;
      }
    } catch (error) {
      console.warn('[ChallengeService] Failed to load from storage:', error);
    }

    // Return default storage if loading fails or doesn't exist
    return {
      dailyProgress: {},
      streak: { current: 0, best: 0 },
      totalChallengesCompleted: 0,
    };
  }

  /**
   * Save challenge data to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(this.storage));
    } catch (error) {
      console.error('[ChallengeService] Failed to save to storage:', error);
    }
  }

  /**
   * Get today's challenge progress, creating it if it doesn't exist
   */
  public getTodayChallenge(): DailyChallengeProgress {
    const today = getTodayDateString();

    if (!this.storage.dailyProgress[today]) {
      this.storage.dailyProgress[today] = createTodayChallenge();
      this.saveToStorage();
    }

    return this.storage.dailyProgress[today];
  }

  /**
   * Get current streak information
   */
  public getStreak(): ChallengeStreak {
    return { ...this.storage.streak };
  }

  /**
   * Mark today's base challenge as completed
   */
  public completeBaseChallenge(): boolean {
    const todayChallenge = this.getTodayChallenge();

    // If already completed, no need to do anything
    if (todayChallenge.baseChallenge.completed) {
      return false; // Not a new completion
    }

    // Mark as completed
    todayChallenge.baseChallenge.completed = true;
    todayChallenge.baseChallenge.completedAt = new Date();

    // Update streak
    this.updateStreak();

    // Update total completion count
    this.storage.totalChallengesCompleted += 1;

    // Set first challenge date if this is the first one
    if (!this.storage.firstChallengeDate) {
      this.storage.firstChallengeDate = getTodayDateString();
    }

    this.saveToStorage();
    return true; // New completion
  }

  /**
   * Update streak based on today's completion
   */
  private updateStreak(): void {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    if (!this.storage.streak.lastCompletedDate) {
      // First ever completion
      this.storage.streak.current = 1;
      this.storage.streak.best = 1;
    } else if (this.storage.streak.lastCompletedDate === yesterday) {
      // Consecutive day completion
      this.storage.streak.current += 1;
      if (this.storage.streak.current > this.storage.streak.best) {
        this.storage.streak.best = this.storage.streak.current;
      }
    } else if (!isToday(this.storage.streak.lastCompletedDate)) {
      // Streak broken, start new streak
      this.storage.streak.current = 1;
    }
    // If lastCompletedDate is today, don't change anything (already completed today)

    this.storage.streak.lastCompletedDate = today;
  }

  /**
   * Check if today's base challenge is completed
   */
  public isTodayChallengeCompleted(): boolean {
    const todayChallenge = this.getTodayChallenge();
    return todayChallenge.baseChallenge.completed;
  }

  /**
   * Get total statistics for display
   */
  public getStatistics() {
    return {
      totalCompleted: this.storage.totalChallengesCompleted,
      currentStreak: this.storage.streak.current,
      bestStreak: this.storage.streak.best,
      firstChallengeDate: this.storage.firstChallengeDate,
      daysActive: Object.keys(this.storage.dailyProgress).length,
    };
  }

  /**
   * Reset all challenge data (for testing or user request)
   */
  public resetAll(): void {
    this.storage = {
      dailyProgress: {},
      streak: { current: 0, best: 0 },
      totalChallengesCompleted: 0,
    };
    this.saveToStorage();
  }
}

// Export singleton instance
export const challengeService = new ChallengeService();
