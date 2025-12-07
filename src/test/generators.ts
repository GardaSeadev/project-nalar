import * as fc from 'fast-check';
import type { QuestionData, Option } from '../types';

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
