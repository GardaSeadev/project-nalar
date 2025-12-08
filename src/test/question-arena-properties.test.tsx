import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { QuestionArena } from '../QuestionArena';
import { questionDataArbitrary } from './generators';

/**
 * Property-Based Tests for QuestionArena Component
 * Using fast-check to verify correctness properties across random inputs
 */

describe('QuestionArena Property-Based Tests', () => {
  beforeEach(() => {
    // Use fake timers to control time progression
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up any rendered components
    cleanup();
    // Restore real timers after each test
    vi.restoreAllMocks();
  });

  /**
   * Feature: question-arena, Property 2: Timer countdown behavior
   * Validates: Requirements 2.2
   * 
   * For any time value greater than zero, after one second elapses,
   * the displayed time should decrease by exactly one second.
   */
  it('Property 2: Timer countdown behavior - timer decrements correctly over time', () => {
    fc.assert(
      fc.property(
        fc.array(questionDataArbitrary, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 1, max: 10 }), // Number of seconds to advance
        (questions, secondsToAdvance) => {
          // Render component with generated questions
          const { container, unmount } = render(<QuestionArena questions={questions} />);

          // Get initial timer value (should be 00:30 for 30 seconds)
          // Use container to query within this specific render
          const timerElement = container.querySelector('.flex.items-center.gap-2 span:last-child');
          expect(timerElement).toBeTruthy();
          
          const initialTimerText = timerElement!.textContent;
          const initialMatch = initialTimerText?.match(/(\d{2}):(\d{2})/);
          expect(initialMatch).toBeTruthy();
          
          const initialMinutes = parseInt(initialMatch![1], 10);
          const initialSeconds = parseInt(initialMatch![2], 10);
          const initialTotalSeconds = initialMinutes * 60 + initialSeconds;

          // Advance time by the specified number of seconds
          act(() => {
            vi.advanceTimersByTime(secondsToAdvance * 1000);
          });

          // Get updated timer value
          const updatedTimerElement = container.querySelector('.flex.items-center.gap-2 span:last-child');
          expect(updatedTimerElement).toBeTruthy();
          
          const updatedTimerText = updatedTimerElement!.textContent;
          const updatedMatch = updatedTimerText?.match(/(\d{2}):(\d{2})/);
          expect(updatedMatch).toBeTruthy();
          
          const updatedMinutes = parseInt(updatedMatch![1], 10);
          const updatedSeconds = parseInt(updatedMatch![2], 10);
          const updatedTotalSeconds = updatedMinutes * 60 + updatedSeconds;

          // Expected time should be initial time minus seconds advanced
          // But should not go below 0
          const expectedTotalSeconds = Math.max(0, initialTotalSeconds - secondsToAdvance);

          // Verify timer decremented correctly
          expect(updatedTotalSeconds).toBe(expectedTotalSeconds);

          // Clean up this specific render
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: question-arena, Property 3: Correct answer feedback
   * Validates: Requirements 3.1, 3.2
   * 
   * For any question data, when a user clicks the correct option,
   * that option should display with green styling and a "Benar!" badge should appear.
   */
  it('Property 3: Correct answer feedback - clicking correct option shows green styling and badge', () => {
    fc.assert(
      fc.property(
        fc.array(questionDataArbitrary, { minLength: 1, maxLength: 5 }),
        (questions) => {
          // Render component with generated questions
          const { container, unmount } = render(<QuestionArena questions={questions} />);

          // Get the current question's correct option
          const currentQuestion = questions[0];
          const correctOptionId = currentQuestion.correctId;

          // Find the correct option button by its ID
          const optionButtons = container.querySelectorAll('button[class*="w-full text-left"]');
          let correctButton: HTMLElement | null = null;

          for (const button of Array.from(optionButtons)) {
            const buttonText = button.textContent || '';
            // Check if this button starts with the correct option ID (e.g., "A.")
            if (buttonText.startsWith(`${correctOptionId}.`)) {
              correctButton = button as HTMLElement;
              break;
            }
          }

          expect(correctButton).toBeTruthy();

          // Click the correct option using fireEvent for synchronous testing
          act(() => {
            correctButton!.click();
          });

          // Verify green glassmorphic styling is applied
          const buttonClasses = correctButton!.className;
          expect(buttonClasses).toContain('bg-green-500/20');
          expect(buttonClasses).toContain('border-green-500');

          // Verify CheckCircle icon appears (replaces "Benar!" text)
          const checkIcon = correctButton!.querySelector('.lucide-circle-check-big');
          expect(checkIcon).toBeTruthy();

          // Clean up this specific render
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000); // 30 second timeout for property-based test with 100 runs

  /**
   * Feature: question-arena, Property 5: Single attempt enforcement
   * Validates: Requirements 3.5
   * 
   * For any question data and any selected option, after the first click,
   * all subsequent clicks on any option should not change the selected state
   * or visual feedback.
   */
  it('Property 5: Single attempt enforcement - second click does not change state', () => {
    fc.assert(
      fc.property(
        fc.array(questionDataArbitrary, { minLength: 1, maxLength: 5 }),
        fc.constantFrom('A', 'B', 'C', 'D', 'E'), // First option to click
        fc.constantFrom('A', 'B', 'C', 'D', 'E'), // Second option to click
        (questions, firstOptionId, secondOptionId) => {
          // Render component with generated questions
          const { container, unmount } = render(<QuestionArena questions={questions} />);

          // Get the current question
          const currentQuestion = questions[0];

          // Find all option buttons
          const optionButtons = container.querySelectorAll('button[class*="w-full text-left"]');
          
          // Find the first option button to click
          let firstButton: HTMLElement | null = null;
          let secondButton: HTMLElement | null = null;

          for (const button of Array.from(optionButtons)) {
            const buttonText = button.textContent || '';
            if (buttonText.startsWith(`${firstOptionId}.`)) {
              firstButton = button as HTMLElement;
            }
            if (buttonText.startsWith(`${secondOptionId}.`)) {
              secondButton = button as HTMLElement;
            }
          }

          expect(firstButton).toBeTruthy();
          expect(secondButton).toBeTruthy();

          // Click the first option
          act(() => {
            firstButton!.click();
          });

          // Capture the state after first click
          const firstButtonClassesAfterFirstClick = firstButton!.className;
          const secondButtonClassesAfterFirstClick = secondButton!.className;
          
          // Determine expected styling based on correctness
          const isFirstCorrect = firstOptionId === currentQuestion.correctId;

          // Verify first click worked correctly with glassmorphic styling
          if (isFirstCorrect) {
            expect(firstButtonClassesAfterFirstClick).toContain('bg-green-500/20');
            expect(firstButtonClassesAfterFirstClick).toContain('border-green-500');
          } else {
            expect(firstButtonClassesAfterFirstClick).toContain('bg-red-500/20');
            expect(firstButtonClassesAfterFirstClick).toContain('border-red-500');
          }

          // Click the second option (should have no effect)
          act(() => {
            secondButton!.click();
          });

          // Capture the state after second click
          const firstButtonClassesAfterSecondClick = firstButton!.className;
          const secondButtonClassesAfterSecondClick = secondButton!.className;

          // Verify that the state did NOT change after second click
          expect(firstButtonClassesAfterSecondClick).toBe(firstButtonClassesAfterFirstClick);
          expect(secondButtonClassesAfterSecondClick).toBe(secondButtonClassesAfterFirstClick);

          // Verify the first button still has the same glassmorphic styling
          if (isFirstCorrect) {
            expect(firstButtonClassesAfterSecondClick).toContain('bg-green-500/20');
            expect(firstButtonClassesAfterSecondClick).toContain('border-green-500');
          } else {
            expect(firstButtonClassesAfterSecondClick).toContain('bg-red-500/20');
            expect(firstButtonClassesAfterSecondClick).toContain('border-red-500');
          }

          // Clean up this specific render
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000); // 30 second timeout for property-based test with 100 runs

  /**
   * Feature: question-arena, Property 8: Next button callback invocation
   * Validates: Requirements 5.3
   * 
   * For any question data with an onComplete callback, when the last question
   * is answered and Next is clicked, the callback should be invoked exactly once
   * with the correct score and accuracy values.
   */
  it('Property 8: Next button callback invocation - onComplete called exactly once with correct values', () => {
    fc.assert(
      fc.property(
        fc.array(questionDataArbitrary, { minLength: 1, maxLength: 5 }),
        fc.array(fc.constantFrom('A', 'B', 'C', 'D', 'E')), // Answer sequence
        (questions, answerSequence) => {
          // Ensure answer sequence matches question count
          const answers = answerSequence.slice(0, questions.length);
          while (answers.length < questions.length) {
            answers.push('A'); // Fill with default if needed
          }

          // Create mock callback function
          const mockOnComplete = vi.fn();

          // Render component with generated questions and mock callback
          const { container, unmount } = render(
            <QuestionArena questions={questions} onComplete={mockOnComplete} />
          );

          // Calculate expected score and correct answers
          let expectedScore = 0;
          let expectedCorrectAnswers = 0;

          // Go through all questions
          for (let i = 0; i < questions.length; i++) {
            const currentQuestion = questions[i];
            const selectedAnswer = answers[i];

            // Find all option buttons
            const optionButtons = container.querySelectorAll('button[class*="w-full text-left"]');
            
            // Find the option button to click
            let optionButton: HTMLElement | null = null;
            for (const button of Array.from(optionButtons)) {
              const buttonText = button.textContent || '';
              if (buttonText.startsWith(`${selectedAnswer}.`)) {
                optionButton = button as HTMLElement;
                break;
              }
            }

            expect(optionButton).toBeTruthy();

            // Click the option
            act(() => {
              optionButton!.click();
            });

            // Update expected values
            if (selectedAnswer === currentQuestion.correctId) {
              expectedScore += 20;
              expectedCorrectAnswers += 1;
            }

            // Find the Next button by looking for button with "Next Question" text
            const allButtons = Array.from(container.querySelectorAll('button'));
            const nextButton = allButtons.find(btn => 
              btn.textContent?.includes('Next Question')
            ) as HTMLElement;
            
            expect(nextButton).toBeTruthy();

            act(() => {
              nextButton!.click();
            });

            // If this was the last question, callback should be invoked
            if (i === questions.length - 1) {
              // Verify callback was called exactly once
              expect(mockOnComplete).toHaveBeenCalledTimes(1);

              // Calculate expected accuracy
              const expectedAccuracy = (expectedCorrectAnswers / questions.length) * 100;

              // Verify callback was called with correct values
              expect(mockOnComplete).toHaveBeenCalledWith(expectedScore, expectedAccuracy);
            } else {
              // For non-last questions, callback should not be called yet
              expect(mockOnComplete).not.toHaveBeenCalled();
            }
          }

          // Clean up this specific render
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for property-based test with 100 runs (longer due to multiple questions)
});
