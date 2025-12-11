import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';
import Leaderboard from '../components/Leaderboard';
import ScoreSubmissionForm from '../components/ScoreSubmissionForm';
import * as supabaseClient from '../supabaseClient';
import type { LeaderboardEntry } from '../types';

// Mock the supabaseClient module
vi.mock('../supabaseClient', () => ({
  fetchTopLeaderboard: vi.fn(),
  submitScore: vi.fn(),
}));

/**
 * Unit tests for Leaderboard component
 * Task 2.2: Write unit tests for Leaderboard component
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
describe('Leaderboard Component Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Test: Loading state display
   * Validates: Requirements 1.4
   */
  it('should display loading state with skeleton loaders', () => {
    // Mock fetchTopLeaderboard to never resolve (keeps loading state)
    vi.mocked(supabaseClient.fetchTopLeaderboard).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<Leaderboard />);

    // Verify loading state elements are present
    expect(screen.getByText('Top 5 Players Today')).toBeInTheDocument();
    
    // Verify skeleton loaders are present (5 placeholder entries)
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  /**
   * Test: Error state display
   * Validates: Requirements 1.5
   */
  it('should display error state with friendly message when fetch fails', async () => {
    // Mock fetchTopLeaderboard to reject with error
    vi.mocked(supabaseClient.fetchTopLeaderboard).mockRejectedValue(
      new Error('Network error')
    );

    render(<Leaderboard />);

    // Wait for error state to appear
    await waitFor(() => {
      expect(screen.getByText('Unable to load leaderboard. Please try again later.')).toBeInTheDocument();
    });

    // Verify retry button is present
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  /**
   * Test: Empty state display
   * Validates: Requirements 1.5
   */
  it('should display empty state when no entries exist', async () => {
    // Mock fetchTopLeaderboard to return empty array
    vi.mocked(supabaseClient.fetchTopLeaderboard).mockResolvedValue([]);

    render(<Leaderboard />);

    // Wait for empty state to appear
    await waitFor(() => {
      expect(screen.getByText('Be the first to set a score!')).toBeInTheDocument();
    });

    // Verify encouraging message is present
    expect(screen.getByText('Complete a quiz to appear on the leaderboard')).toBeInTheDocument();
  });

  /**
   * Test: Successful data rendering with rank, username, score
   * Validates: Requirements 1.3
   */
  it('should render leaderboard entries with rank, username, and score', async () => {
    // Mock leaderboard data
    const mockEntries: LeaderboardEntry[] = [
      { id: 1, username: 'Alice', score: 100, created_at: '2024-12-09T10:00:00Z' },
      { id: 2, username: 'Bob', score: 90, created_at: '2024-12-09T09:00:00Z' },
      { id: 3, username: 'Charlie', score: 80, created_at: '2024-12-09T08:00:00Z' },
    ];

    vi.mocked(supabaseClient.fetchTopLeaderboard).mockResolvedValue(mockEntries);

    render(<Leaderboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Verify all entries are rendered with rank, username, and score
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('100 XP')).toBeInTheDocument();

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('90 XP')).toBeInTheDocument();

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('80 XP')).toBeInTheDocument();
  });

  /**
   * Test: Glassmorphism styling classes
   * Validates: Requirements 1.6, 3.1, 3.2, 3.3
   */
  it('should use glassmorphism styling with transparent backgrounds and white text', async () => {
    const mockEntries: LeaderboardEntry[] = [
      { id: 1, username: 'Alice', score: 100, created_at: '2024-12-09T10:00:00Z' },
    ];

    vi.mocked(supabaseClient.fetchTopLeaderboard).mockResolvedValue(mockEntries);

    render(<Leaderboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Verify glassmorphism container classes
    const container = document.querySelector('.backdrop-blur-lg.bg-white\\/5.border.border-white\\/10.rounded-2xl');
    expect(container).toBeInTheDocument();

    // Verify white text for title
    const title = screen.getByText('Top 5 Players Today');
    expect(title).toHaveClass('text-white');

    // Verify entry styling
    const entryRow = document.querySelector('.flex.justify-between.items-center.py-2.sm\\:py-3.border-b.border-white\\/10');
    expect(entryRow).toBeInTheDocument();

    // Verify rank badge styling
    const rankBadge = document.querySelector('.bg-indigo-500\\/20.text-indigo-300');
    expect(rankBadge).toBeInTheDocument();

    // Verify username has white text
    const username = screen.getByText('Alice');
    expect(username).toHaveClass('text-white');

    // Verify score has indigo text
    const score = screen.getByText('100 XP');
    expect(score).toHaveClass('text-indigo-400');
  });

  /**
   * Test: Supabase query parameters
   * Validates: Requirements 1.2
   */
  it('should call fetchTopLeaderboard on component mount', async () => {
    const mockEntries: LeaderboardEntry[] = [
      { id: 1, username: 'Alice', score: 100, created_at: '2024-12-09T10:00:00Z' },
    ];

    vi.mocked(supabaseClient.fetchTopLeaderboard).mockResolvedValue(mockEntries);

    render(<Leaderboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Verify fetchTopLeaderboard was called exactly once
    expect(supabaseClient.fetchTopLeaderboard).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Retry button functionality
   * Validates: Requirements 1.5
   */
  it('should retry fetching leaderboard when retry button is clicked', async () => {
    const user = userEvent.setup();

    // First call fails
    vi.mocked(supabaseClient.fetchTopLeaderboard).mockRejectedValueOnce(
      new Error('Network error')
    );

    // Second call succeeds
    const mockEntries: LeaderboardEntry[] = [
      { id: 1, username: 'Alice', score: 100, created_at: '2024-12-09T10:00:00Z' },
    ];
    vi.mocked(supabaseClient.fetchTopLeaderboard).mockResolvedValueOnce(mockEntries);

    render(<Leaderboard />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Unable to load leaderboard. Please try again later.')).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByText('Retry');
    await user.click(retryButton);

    // Wait for successful data load
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Verify fetchTopLeaderboard was called twice (initial + retry)
    expect(supabaseClient.fetchTopLeaderboard).toHaveBeenCalledTimes(2);
  });

  /**
   * Test: Display top 5 entries only
   * Validates: Requirements 1.1, 1.2
   */
  it('should display maximum of 5 leaderboard entries', async () => {
    // Mock 5 entries
    const mockEntries: LeaderboardEntry[] = [
      { id: 1, username: 'Player1', score: 100, created_at: '2024-12-09T10:00:00Z' },
      { id: 2, username: 'Player2', score: 90, created_at: '2024-12-09T09:00:00Z' },
      { id: 3, username: 'Player3', score: 80, created_at: '2024-12-09T08:00:00Z' },
      { id: 4, username: 'Player4', score: 70, created_at: '2024-12-09T07:00:00Z' },
      { id: 5, username: 'Player5', score: 60, created_at: '2024-12-09T06:00:00Z' },
    ];

    vi.mocked(supabaseClient.fetchTopLeaderboard).mockResolvedValue(mockEntries);

    render(<Leaderboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Player1')).toBeInTheDocument();
    });

    // Verify all 5 entries are displayed
    expect(screen.getByText('Player1')).toBeInTheDocument();
    expect(screen.getByText('Player2')).toBeInTheDocument();
    expect(screen.getByText('Player3')).toBeInTheDocument();
    expect(screen.getByText('Player4')).toBeInTheDocument();
    expect(screen.getByText('Player5')).toBeInTheDocument();

    // Verify ranks 1-5 are displayed
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

/**
 * Unit tests for ScoreSubmissionForm component
 * Task 4.3: Write unit tests for Score Submission Form
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.5, 4.2
 */
describe('ScoreSubmissionForm Component Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Test: Form rendering in FINISHED state
   * Validates: Requirements 2.1
   */
  it('should render form with label, input field, and submit button', () => {
    const onSuccessMock = vi.fn();

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    // Verify label is present
    expect(screen.getByText('Enter your Name to save Score')).toBeInTheDocument();

    // Verify input field is present
    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('maxLength', '50');

    // Verify submit button is present
    expect(screen.getByText('Save Score')).toBeInTheDocument();
  });

  /**
   * Test: Input field accepts text
   * Validates: Requirements 2.2
   */
  it('should accept text input in username field', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    const input = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;

    // Type username
    await user.type(input, 'TestPlayer');

    // Verify input value
    expect(input.value).toBe('TestPlayer');
  });

  /**
   * Test: Submit button disabled when username empty
   * Validates: Requirements 2.2, 4.2
   */
  it('should disable submit button when username is empty', () => {
    const onSuccessMock = vi.fn();

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    const submitButton = screen.getByText('Save Score');
    expect(submitButton).toBeDisabled();
  });

  /**
   * Test: Submit button enabled when username non-empty
   * Validates: Requirements 2.2, 4.2
   */
  it('should enable submit button when username is non-empty', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    const input = screen.getByPlaceholderText('Enter your name');
    const submitButton = screen.getByText('Save Score');

    // Initially disabled
    expect(submitButton).toBeDisabled();

    // Type username
    await user.type(input, 'TestPlayer');

    // Now enabled
    expect(submitButton).not.toBeDisabled();
  });

  /**
   * Test: Loading state during submission
   * Validates: Requirements 2.3
   */
  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    // Mock submitScore to delay resolution
    vi.mocked(supabaseClient.submitScore).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    const input = screen.getByPlaceholderText('Enter your name');
    await user.type(input, 'TestPlayer');

    const submitButton = screen.getByText('Save Score');
    await user.click(submitButton);

    // Verify loading state
    await waitFor(() => {
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    // Verify button is disabled during submission
    expect(submitButton).toBeDisabled();

    // Verify spinner is present
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  /**
   * Test: Success toast display
   * Validates: Requirements 2.4
   */
  it('should display success toast on successful submission', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    // Mock submitScore to succeed
    vi.mocked(supabaseClient.submitScore).mockResolvedValue();

    // Mock toast.success
    const toastSuccessSpy = vi.spyOn(toast, 'success');

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    const input = screen.getByPlaceholderText('Enter your name');
    await user.type(input, 'TestPlayer');

    const submitButton = screen.getByText('Save Score');
    await user.click(submitButton);

    // Wait for submission to complete
    await waitFor(() => {
      expect(toastSuccessSpy).toHaveBeenCalledWith('Score saved! 🎉');
    });
  });

  /**
   * Test: Error toast display
   * Validates: Requirements 2.6
   */
  it('should display error toast on failed submission', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    // Mock submitScore to fail
    vi.mocked(supabaseClient.submitScore).mockRejectedValue(
      new Error('Network error')
    );

    // Mock toast.error
    const toastErrorSpy = vi.spyOn(toast, 'error');

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    const input = screen.getByPlaceholderText('Enter your name');
    await user.type(input, 'TestPlayer');

    const submitButton = screen.getByText('Save Score');
    await user.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledWith('Failed to save score. Please try again.');
    });

    // Verify error message is displayed
    expect(screen.getByText('Failed to save score. Please try again.')).toBeInTheDocument();
  });

  /**
   * Test: Supabase insert called with correct values
   * Validates: Requirements 2.3
   */
  it('should call submitScore with correct username, score, and accuracy', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    // Mock submitScore to succeed
    vi.mocked(supabaseClient.submitScore).mockResolvedValue();

    render(
      <ScoreSubmissionForm 
        score={150} 
        accuracy={92} 
        onSuccess={onSuccessMock} 
      />
    );

    const input = screen.getByPlaceholderText('Enter your name');
    await user.type(input, 'TestPlayer');

    const submitButton = screen.getByText('Save Score');
    await user.click(submitButton);

    // Wait for submission
    await waitFor(() => {
      expect(supabaseClient.submitScore).toHaveBeenCalledWith('TestPlayer', 150, 92);
    });
  });

  /**
   * Test: onSuccess callback invoked
   * Validates: Requirements 2.5
   */
  it('should invoke onSuccess callback after successful submission', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    // Mock submitScore to succeed
    vi.mocked(supabaseClient.submitScore).mockResolvedValue();

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    const input = screen.getByPlaceholderText('Enter your name');
    await user.type(input, 'TestPlayer');

    const submitButton = screen.getByText('Save Score');
    await user.click(submitButton);

    // Wait for submission to complete
    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Test: Glassmorphism styling
   * Validates: Requirements 3.5
   */
  it('should use glassmorphism styling for input and button', () => {
    const onSuccessMock = vi.fn();

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    // Verify input has glassmorphism classes
    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toHaveClass('backdrop-blur-lg');
    expect(input).toHaveClass('bg-white/10');
    expect(input).toHaveClass('border');
    expect(input).toHaveClass('border-white/20');
    expect(input).toHaveClass('rounded-xl');
    expect(input).toHaveClass('text-white');

    // Verify button has correct styling
    const submitButton = screen.getByText('Save Score');
    expect(submitButton).toHaveClass('bg-indigo-600');
    expect(submitButton).toHaveClass('text-white');
    expect(submitButton).toHaveClass('rounded-xl');
  });

  /**
   * Test: Form clears after successful submission
   * Validates: Requirements 2.5
   */
  it('should clear username input after successful submission', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    // Mock submitScore to succeed
    vi.mocked(supabaseClient.submitScore).mockResolvedValue();

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    const input = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
    await user.type(input, 'TestPlayer');

    expect(input.value).toBe('TestPlayer');

    const submitButton = screen.getByText('Save Score');
    await user.click(submitButton);

    // Wait for submission to complete and form to clear
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  /**
   * Test: Username trimming
   * Validates: Requirements 4.2
   */
  it('should trim whitespace from username before submission', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    // Mock submitScore to succeed
    vi.mocked(supabaseClient.submitScore).mockResolvedValue();

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    const input = screen.getByPlaceholderText('Enter your name');
    await user.type(input, '  TestPlayer  ');

    const submitButton = screen.getByText('Save Score');
    await user.click(submitButton);

    // Wait for submission
    await waitFor(() => {
      expect(supabaseClient.submitScore).toHaveBeenCalledWith('TestPlayer', 100, 85);
    });
  });

  /**
   * Test: Whitespace-only username validation
   * Validates: Requirements 4.2
   */
  it('should disable submit button for whitespace-only username', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    const input = screen.getByPlaceholderText('Enter your name');
    const submitButton = screen.getByText('Save Score');

    // Type only whitespace
    await user.type(input, '   ');

    // Button should still be disabled
    expect(submitButton).toBeDisabled();
  });

  /**
   * Test: Max length validation
   * Validates: Requirements 4.2
   */
  it('should enforce maximum username length of 50 characters', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    const input = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;

    // Try to type more than 50 characters
    const longUsername = 'A'.repeat(60);
    await user.type(input, longUsername);

    // Input should be limited to 50 characters
    expect(input.value.length).toBeLessThanOrEqual(50);
  });

  /**
   * Test: Input disabled during submission
   * Validates: Requirements 2.3
   */
  it('should disable input field during submission', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    // Mock submitScore to delay resolution
    vi.mocked(supabaseClient.submitScore).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    const input = screen.getByPlaceholderText('Enter your name');
    await user.type(input, 'TestPlayer');

    const submitButton = screen.getByText('Save Score');
    await user.click(submitButton);

    // Verify input is disabled during submission
    await waitFor(() => {
      expect(input).toBeDisabled();
    });
  });

  /**
   * Test: Error state allows retry
   * Validates: Requirements 2.6
   */
  it('should allow retry after failed submission', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    // First call fails
    vi.mocked(supabaseClient.submitScore).mockRejectedValueOnce(
      new Error('Network error')
    );

    // Second call succeeds
    vi.mocked(supabaseClient.submitScore).mockResolvedValueOnce(undefined);

    render(
      <ScoreSubmissionForm 
        score={100} 
        accuracy={85} 
        onSuccess={onSuccessMock} 
      />
    );

    const input = screen.getByPlaceholderText('Enter your name');
    await user.type(input, 'TestPlayer');

    const submitButton = screen.getByText('Save Score');
    await user.click(submitButton);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Failed to save score. Please try again.')).toBeInTheDocument();
    });

    // Verify button is enabled for retry
    expect(submitButton).not.toBeDisabled();

    // Click retry
    await user.click(submitButton);

    // Wait for success
    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
    });
  });
});
