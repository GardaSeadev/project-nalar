import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { questionDataArbitrary } from './generators';

describe('Question Data Generator', () => {
  it('should generate valid question data with 5 options A-E', () => {
    fc.assert(
      fc.property(questionDataArbitrary, (questionData) => {
        // Verify we have exactly 5 options
        expect(questionData.options).toHaveLength(5);
        
        // Verify option IDs are A-E
        const optionIds = questionData.options.map(opt => opt.id);
        expect(optionIds).toEqual(['A', 'B', 'C', 'D', 'E']);
        
        // Verify correctId is one of the option IDs
        expect(['A', 'B', 'C', 'D', 'E']).toContain(questionData.correctId);
        
        // Verify all required fields exist
        expect(questionData.id).toBeGreaterThan(0);
        expect(questionData.type.length).toBeGreaterThanOrEqual(5);
        expect(['Easy', 'Medium', 'Hard']).toContain(questionData.difficulty);
        expect(questionData.question.length).toBeGreaterThanOrEqual(10);
        expect(questionData.explanation.length).toBeGreaterThanOrEqual(10);
        
        // Verify each option has required fields
        questionData.options.forEach(option => {
          expect(option.id).toBeTruthy();
          expect(option.text.length).toBeGreaterThanOrEqual(5);
        });
      }),
      { numRuns: 100 }
    );
  });
});
