import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTodayDateString,
  createTodayChallenge,
  isToday,
  areConsecutiveDays,
  getYesterdayDateString,
} from './challenges';

describe('Challenge Helper Functions', () => {
  beforeEach(() => {
    // Mock Date to ensure consistent test results
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getTodayDateString', () => {
    it('should return today date in YYYY-MM-DD format', () => {
      // Set a specific date
      const testDate = new Date('2024-03-15T10:30:00Z');
      vi.setSystemTime(testDate);

      const result = getTodayDateString();
      expect(result).toBe('2024-03-15');
    });

    it('should handle different months correctly', () => {
      const testDate = new Date('2024-12-01T15:45:00Z');
      vi.setSystemTime(testDate);

      const result = getTodayDateString();
      expect(result).toBe('2024-12-01');
    });
  });

  describe('getYesterdayDateString', () => {
    it('should return yesterday date in YYYY-MM-DD format', () => {
      // Set today to March 15th
      const testDate = new Date('2024-03-15T10:30:00Z');
      vi.setSystemTime(testDate);

      const result = getYesterdayDateString();
      expect(result).toBe('2024-03-14');
    });

    it('should handle month boundaries correctly', () => {
      // Set today to March 1st, yesterday should be Feb 29th (leap year)
      const testDate = new Date('2024-03-01T10:30:00Z');
      vi.setSystemTime(testDate);

      const result = getYesterdayDateString();
      expect(result).toBe('2024-02-29');
    });
  });

  describe('createTodayChallenge', () => {
    it('should create a challenge with today date', () => {
      const testDate = new Date('2024-03-15T10:30:00Z');
      vi.setSystemTime(testDate);

      const challenge = createTodayChallenge();

      expect(challenge.date).toBe('2024-03-15');
      expect(challenge.baseChallenge.title).toBe('Daily Victory');
      expect(challenge.baseChallenge.description).toBe('Win any game today');
      expect(challenge.baseChallenge.completed).toBe(false);
      expect(challenge.baseChallenge.completedAt).toBeUndefined();
    });

    it('should create consistent challenge structure', () => {
      const challenge = createTodayChallenge();

      expect(challenge).toHaveProperty('date');
      expect(challenge).toHaveProperty('baseChallenge');
      expect(challenge.baseChallenge).toHaveProperty('title');
      expect(challenge.baseChallenge).toHaveProperty('description');
      expect(challenge.baseChallenge).toHaveProperty('completed');
    });
  });

  describe('isToday', () => {
    it('should return true for today date string', () => {
      const testDate = new Date('2024-03-15T10:30:00Z');
      vi.setSystemTime(testDate);

      expect(isToday('2024-03-15')).toBe(true);
    });

    it('should return false for non-today date string', () => {
      const testDate = new Date('2024-03-15T10:30:00Z');
      vi.setSystemTime(testDate);

      expect(isToday('2024-03-14')).toBe(false);
      expect(isToday('2024-03-16')).toBe(false);
      expect(isToday('2024-04-15')).toBe(false);
    });

    it('should handle edge cases', () => {
      const testDate = new Date('2024-03-15T10:30:00Z');
      vi.setSystemTime(testDate);

      expect(isToday('')).toBe(false);
      expect(isToday('invalid-date')).toBe(false);
    });
  });

  describe('areConsecutiveDays', () => {
    it('should return true for consecutive days', () => {
      expect(areConsecutiveDays('2024-03-14', '2024-03-15')).toBe(true);
      expect(areConsecutiveDays('2024-03-15', '2024-03-14')).toBe(true);
    });

    it('should return false for non-consecutive days', () => {
      expect(areConsecutiveDays('2024-03-14', '2024-03-16')).toBe(false);
      expect(areConsecutiveDays('2024-03-10', '2024-03-15')).toBe(false);
    });

    it('should handle month boundaries', () => {
      // February 29th to March 1st (leap year)
      expect(areConsecutiveDays('2024-02-29', '2024-03-01')).toBe(true);

      // Month boundary in regular year
      expect(areConsecutiveDays('2023-02-28', '2023-03-01')).toBe(true);

      // Year boundary
      expect(areConsecutiveDays('2023-12-31', '2024-01-01')).toBe(true);
    });

    it('should return false for same day', () => {
      expect(areConsecutiveDays('2024-03-15', '2024-03-15')).toBe(false);
    });

    it('should handle invalid dates gracefully', () => {
      expect(areConsecutiveDays('invalid', '2024-03-15')).toBe(false);
      expect(areConsecutiveDays('2024-03-15', 'invalid')).toBe(false);
      expect(areConsecutiveDays('invalid', 'invalid')).toBe(false);
    });
  });
});
