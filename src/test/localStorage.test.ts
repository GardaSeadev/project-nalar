import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadUserProgress, saveUserProgress, calculateStreak, STORAGE_KEY } from '../localStorage';

describe('localStorage utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('loadUserProgress', () => {
    it('should return default values when localStorage is empty', () => {
      const progress = loadUserProgress();
      
      expect(progress.userXP).toBe(0);
      expect(progress.highScore).toBe(0);
      expect(progress.currentStreak).toBe(0);
      expect(progress.lastPlayedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/); // ISO date format
    });

    it('should load valid data from localStorage', () => {
      const testData = {
        userXP: 500,
        highScore: 180,
        currentStreak: 5,
        lastPlayedDate: '2024-12-07'
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(testData));
      
      const progress = loadUserProgress();
      
      expect(progress).toEqual(testData);
    });

    it('should return defaults when data is corrupted', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');
      
      const progress = loadUserProgress();
      
      expect(progress.userXP).toBe(0);
      expect(progress.highScore).toBe(0);
      expect(progress.currentStreak).toBe(0);
    });

    it('should return defaults when data structure is invalid', () => {
      const invalidData = {
        userXP: 'not a number',
        highScore: 100,
        currentStreak: 3
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidData));
      
      const progress = loadUserProgress();
      
      expect(progress.userXP).toBe(0);
      expect(progress.highScore).toBe(0);
      expect(progress.currentStreak).toBe(0);
    });
  });

  describe('saveUserProgress', () => {
    it('should save progress to localStorage', () => {
      const testData = {
        userXP: 500,
        highScore: 180,
        currentStreak: 5,
        lastPlayedDate: '2024-12-07'
      };
      
      saveUserProgress(testData);
      
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual(testData);
    });

    it('should overwrite existing data', () => {
      const firstData = {
        userXP: 100,
        highScore: 60,
        currentStreak: 1,
        lastPlayedDate: '2024-12-06'
      };
      
      const secondData = {
        userXP: 500,
        highScore: 180,
        currentStreak: 5,
        lastPlayedDate: '2024-12-07'
      };
      
      saveUserProgress(firstData);
      saveUserProgress(secondData);
      
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      
      expect(parsed).toEqual(secondData);
    });
  });

  describe('calculateStreak', () => {
    it('should keep streak unchanged when played on same day', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = calculateStreak(today, 5);
      
      expect(result).toBe(5);
    });

    it('should increment streak when played on consecutive day', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const result = calculateStreak(yesterdayStr, 5);
      
      expect(result).toBe(6);
    });

    it('should reset streak to 1 when gap is more than 1 day', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
      
      const result = calculateStreak(threeDaysAgoStr, 5);
      
      expect(result).toBe(1);
    });

    it('should reset streak to 1 when last played was a week ago', () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      
      const result = calculateStreak(weekAgoStr, 10);
      
      expect(result).toBe(1);
    });
  });
});
