import * as fc from 'fast-check';
import type { QuestionData, Option, LeaderboardEntry } from '../types';

/**
 * Generator for valid option IDs (A-E)
 */
export const optionIdArbitrary = fc.constantFrom('A', 'B', 'C', 'D', 'E');

/**
 * Generator for a single Option with a specific ID
 */
export const optionArbitrary = (id: string): fc.Arbitrary<Option> =>
  fc.record({
    id: fc.constant(id),
    text: fc.string({ minLength: 5, maxLength: 100 }),
  });

/**
 * Generator for an array of exactly 5 options with IDs A-E
 */
export const optionsArrayArbitrary: fc.Arbitrary<Option[]> = fc.tuple(
  optionArbitrary('A'),
  optionArbitrary('B'),
  optionArbitrary('C'),
  optionArbitrary('D'),
  optionArbitrary('E')
).map(tuple => Array.from(tuple));

/**
 * Generator for valid QuestionData
 * Ensures:
 * - 5 options with IDs A-E
 * - correctId matches one of the option IDs
 */
export const questionDataArbitrary: fc.Arbitrary<QuestionData> = fc
  .record({
    id: fc.integer({ min: 1, max: 1000 }),
    type: fc.string({ minLength: 5, maxLength: 50 }),
    difficulty: fc.constantFrom('Easy' as const, 'Medium' as const, 'Hard' as const),
    question: fc.string({ minLength: 10, maxLength: 200 }),
    options: optionsArrayArbitrary,
    correctId: optionIdArbitrary,
    explanation: fc.string({ minLength: 10, maxLength: 300 }),
  });

/**
 * Generator for valid usernames (non-empty strings, 1-50 characters)
 * Filters out strings that are only whitespace
 */
export const usernameArbitrary: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0);

/**
 * Generator for valid leaderboard entries
 * Ensures:
 * - Valid ID (positive integer)
 * - Non-empty username (1-50 characters, no whitespace-only)
 * - Non-negative score
 * - Optional accuracy (0-100)
 * - Valid ISO timestamp
 */
export const leaderboardEntryArbitrary: fc.Arbitrary<LeaderboardEntry> = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  username: usernameArbitrary,
  score: fc.integer({ min: 0, max: 1000 }),
  accuracy: fc.option(fc.integer({ min: 0, max: 100 })),
  created_at: fc.date().map(d => d.toISOString()),
});

/**
 * Generator for an array of leaderboard entries (1-5 entries)
 * Ensures unique IDs for each entry
 */
export const leaderboardArrayArbitrary: fc.Arbitrary<LeaderboardEntry[]> = fc
  .array(leaderboardEntryArbitrary, { minLength: 1, maxLength: 5 })
  .map((entries) => {
    // Ensure unique IDs by reassigning them sequentially
    return entries.map((entry, index) => ({
      ...entry,
      id: index + 1,
    }));
  });

/**
 * Generator for scores (non-negative integers)
 */
export const scoreArbitrary: fc.Arbitrary<number> = fc.integer({ min: 0, max: 1000 });

/**
 * Generator for accuracy values (0-100)
 */
export const accuracyArbitrary: fc.Arbitrary<number> = fc.integer({ min: 0, max: 100 });
