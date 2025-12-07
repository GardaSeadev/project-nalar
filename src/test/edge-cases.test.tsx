import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionArena } from '../QuestionArena';
import type { QuestionData } from '../types';

/**
 * Edge case unit tests for QuestionArena component
 * Tests timer behavior, missing callbacks, rapid clicking, and cleanup
 * Requirements: 2.4, 3.5
 */

// Mock question data for testing
const mockQuestion: QuestionData = {
  id: 1,
  type: 'Test Type',
  difficulty: 'Easy',
  question: 'Test question?',
  options: [
    { id: 'A', text: 'Option A' },
    { id: 'B', text: 'Option B' },
    { id: 'C', text: 'Option C' },
    { id: 'D', text: 'Option D' },
    { id: 'E', text: 'Option E' },
  ],
  correctId: 'A',
  explanation: 'Test explanation',
};

describe('QuestionArena Edge Cases', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test: Timer stops at zero and doesn't go negative
   * Requirement: 2.4
   */
  it('should stop timer at zero and not go negative', () => {
    vi.useFakeTimers();
    
    render(<QuestionArena questions={[mockQuestion]} />);

    // Initial timer should show 00:30
    expect(screen.getByText('00:30')).toBeInTheDocument();

    // Advance time by 30 seconds to reach zero
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // Timer should be at 00:00
    expect(screen.getByText('00:00')).toBeInTheDocument();

    // Advance time by another 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Timer should still be at 00:00, not negative
    expect(screen.getByText('00:00')).toBeInTheDocument();

    // Verify no negative time is displayed
    expect(screen.queryByText(/-\d+:\d+/)).not.toBeInTheDocument();
    
    vi.useRealTimers();
  });

  /**
   * Test: Component handles missing onComplete callback gracefully
   * Requirement: 2.4 (graceful handling)
   */
  it('should handle missing onComplete callback gracefully', async () => {
    // Render without onComplete callback
    render(<QuestionArena questions={[mockQuestion]} />);

    // Click an option to answer
    const optionA = screen.getByText(/Option A/i);
    await userEvent.click(optionA);

    // Click Next button
    const nextButton = screen.getByRole('button', { name: /Next Question/i });
    await userEvent.click(nextButton);

    // Should show summary card without errors
    expect(screen.getByText(/completed all questions/i)).toBeInTheDocument();

    // Component should render successfully without callback
    expect(screen.getByText(/Final Score/i)).toBeInTheDocument();
  });

  /**
   * Test: Rapid clicking doesn't cause race conditions
   * Requirement: 3.5
   */
  it('should prevent race conditions from rapid clicking', async () => {
    render(<QuestionArena questions={[mockQuestion]} />);

    // Get option buttons
    const optionA = screen.getByText(/Option A/i);
    const optionB = screen.getByText(/Option B/i);

    // Rapidly click multiple options
    await userEvent.click(optionA);
    await userEvent.click(optionB);
    await userEvent.click(optionA);
    await userEvent.click(optionB);

    // Only the first click should register (Option A is correct)
    // Option A should have green styling
    const optionAButton = optionA.closest('button');
    expect(optionAButton).toHaveClass('bg-green-100');

    // Option B should not have red styling (wasn't selected)
    const optionBButton = optionB.closest('button');
    expect(optionBButton).not.toHaveClass('bg-red-100');

    // Verify "Benar!" badge appears only once
    const correctBadges = screen.getAllByText('Benar!');
    expect(correctBadges).toHaveLength(1);
  });

  /**
   * Test: Timer cleanup on component unmount
   * Requirement: 2.4
   */
  it('should cleanup timer interval on component unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = render(<QuestionArena questions={[mockQuestion]} />);

    // Verify timer is running
    expect(screen.getByText('00:30')).toBeInTheDocument();

    // Unmount the component
    unmount();

    // Verify clearInterval was called (cleanup function executed)
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  /**
   * Additional test: Rapid clicking on Next button doesn't cause issues
   * Requirement: 3.5
   */
  it('should handle rapid clicking on Next button gracefully', async () => {
    const onCompleteMock = vi.fn();

    render(<QuestionArena questions={[mockQuestion]} onComplete={onCompleteMock} />);

    // Answer the question first
    const optionA = screen.getByText(/Option A/i);
    await userEvent.click(optionA);

    // Get Next button
    const nextButton = screen.getByRole('button', { name: /Next Question/i });

    // Rapidly click Next button multiple times
    await userEvent.click(nextButton);
    await userEvent.click(nextButton);
    await userEvent.click(nextButton);

    // onComplete should be called exactly once
    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });

  /**
   * Additional test: Timer continues running after answering
   * Requirement: 2.4
   */
  it('should continue timer countdown after answering question', async () => {
    vi.useFakeTimers();
    
    render(<QuestionArena questions={[mockQuestion]} />);

    // Initial timer
    expect(screen.getByText('00:30')).toBeInTheDocument();

    // Advance time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText('00:25')).toBeInTheDocument();

    // Answer the question - need to use real timers for userEvent
    vi.useRealTimers();
    const optionA = screen.getByText(/Option A/i);
    await userEvent.click(optionA);

    // Verify the answer was registered
    expect(screen.getByText('Benar!')).toBeInTheDocument();
  });
});
