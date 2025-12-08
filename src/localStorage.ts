import type { UserProgress } from './types';

/**
 * Storage key for user progress data in localStorage
 */
export const STORAGE_KEY = 'nalar_user_progress';

/**
 * Default user progress values
 */
const DEFAULT_USER_PROGRESS: UserProgress = {
  userXP: 0,
  highScore: 0,
  currentStreak: 0,
  lastPlayedDate: new Date().toISOString().split('T')[0]
};

/**
 * Load user progress from localStorage
 * Returns default values if data is missing, corrupted, or localStorage is unavailable
 */
export const loadUserProgress = (): UserProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Validate the structure of the parsed data
      if (
        typeof parsed === 'object' &&
        typeof parsed.userXP === 'number' &&
        typeof parsed.highScore === 'number' &&
        typeof parsed.currentStreak === 'number' &&
        typeof parsed.lastPlayedDate === 'string'
      ) {
        return parsed as UserProgress;
      } else {
        console.warn('Corrupted user progress data, using defaults');
        return DEFAULT_USER_PROGRESS;
      }
    }
  } catch (error) {
    console.error('Failed to load user progress:', error);
  }
  
  // Return default values if nothing was stored or an error occurred
  return DEFAULT_USER_PROGRESS;
};

/**
 * Save user progress to localStorage
 * Handles quota exceeded errors gracefully
 */
export const saveUserProgress = (progress: UserProgress): void => {
  try {
    const serialized = JSON.stringify(progress);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Unable to save user progress.');
    } else {
      console.error('Failed to save user progress:', error);
    }
  }
};

/**
 * Calculate the new streak based on last played date and current date
 * @param lastPlayedDate - ISO date string of last play (e.g., "2024-12-08")
 * @param currentStreak - Current streak value
 * @returns Updated streak value
 */
export const calculateStreak = (lastPlayedDate: string, currentStreak: number): number => {
  const today = new Date().toISOString().split('T')[0];
  
  // If same day, keep streak unchanged
  if (lastPlayedDate === today) {
    return currentStreak;
  }
  
  // Calculate difference in days
  const lastDate = new Date(lastPlayedDate);
  const currentDate = new Date(today);
  const diffTime = currentDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // If consecutive day (exactly 1 day difference), increment streak
  if (diffDays === 1) {
    return currentStreak + 1;
  }
  
  // If gap > 1 day, reset streak to 1
  return 1;
};
