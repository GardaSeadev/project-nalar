import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import Leaderboard from '../components/Leaderboard';
import ScoreSubmissionForm from '../components/ScoreSubmissionForm';
import { leaderboardArrayArbitrary, usernameArbitrary, scoreArbitrary, accuracyArbitrary } from './generators';
import * as supabaseClient from '../supabaseClient';

// Mock the supabaseClient module
vi.mock('../supabaseClient', () => ({
  fetchTopLeaderboard: vi.fn(),
  submitScore: vi.fn(),
}));

describe('Leaderboard Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Feature: global-leaderboard, Property 1: Leaderboard entry completeness
   * Validates: Requirements 1.3
   * 
   * Property: For any leaderboard entry data, when rendered, each entry should 
   * display a rank number, username, and score value.
   */
  it('Property 1: All leaderboard entries display rank, username, and score', async () => {
    await fc.assert(
      fc.asyncProperty(leaderboardArrayArbitrary, async (entries) => {
        // Clean up any previous renders
        cleanup();
        
        // Mock the fetchTopLeaderboard to return our generated entries
        vi.mocked(supabaseClient.fetchTopLeaderboard).mockResolvedValue(entries);

        // Render the Leaderboard component
        render(<Leaderboard />);

        // Wait for loading to complete and data to be displayed
        await waitFor(() => {
          expect(screen.getByText(/Top 5 Players Today/i)).toBeInTheDocument();
        });

        // For each entry, verify that rank, username, and score are displayed
        // Get all entry rows
        const entryRows = screen.getAllByRole('generic').filter(el => 
          el.className.includes('flex justify-between items-center') && 
          el.className.includes('py-2')
        );
        
        // Ensure we have the expected number of entry rows
        expect(entryRows.length).toBe(entries.length);
        
        entries.forEach((entry, index) => {
          const rank = index + 1;
          const entryRow = entryRows[index];
          
          // Ensure the entry row exists
          expect(entryRow).toBeDefined();
          expect(entryRow.textContent).toBeDefined();
          
          // Check that rank number is displayed in this row
          expect(entryRow.textContent).toContain(rank.toString());
          
          // Check that username is displayed in this row
          expect(entryRow.textContent).toContain(entry.username);
          
          // Check that score is displayed in this row (with "XP" suffix)
          expect(entryRow.textContent).toContain(`${entry.score} XP`);
        });
      }),
      { numRuns: 100 }
    );
  }, 30000); // 30 second timeout for property test with 100 runs

  /**
   * Feature: global-leaderboard, Property 2: Score submission data integrity
   * Validates: Requirements 2.3
   * 
   * Property: For any valid username (non-empty string) and any score value, 
   * when the form is submitted, the system should call the Supabase insert 
   * function with exactly those username and score values.
   */
  it('Property 2: Score submission calls Supabase with correct username and score', async () => {
    await fc.assert(
      fc.asyncProperty(
        usernameArbitrary,
        scoreArbitrary,
        accuracyArbitrary,
        async (username, score, accuracy) => {
          // Clean up any previous renders
          cleanup();
          
          // Clear all mocks before each test
          vi.clearAllMocks();
          
          // Mock submitScore to resolve successfully
          vi.mocked(supabaseClient.submitScore).mockResolvedValue(undefined);

          // Mock onSuccess callback
          const onSuccessMock = vi.fn();

          // Render the ScoreSubmissionForm component
          render(
            <ScoreSubmissionForm 
              score={score} 
              accuracy={accuracy} 
              onSuccess={onSuccessMock} 
            />
          );

          // Find the username input field
          const usernameInput = screen.getByLabelText(/Enter your username/i) as HTMLInputElement;
          
          // Find the submit button
          const submitButton = screen.getByRole('button', { name: /Save Score/i });

          // Set the username value directly (avoids userEvent.type issues with special characters)
          fireEvent.change(usernameInput, { target: { value: username } });

          // Click the submit button
          fireEvent.click(submitButton);

          // Wait for the submission to complete
          await waitFor(() => {
            expect(supabaseClient.submitScore).toHaveBeenCalled();
          });

          // Verify that submitScore was called with the correct parameters
          // The username should be trimmed
          expect(supabaseClient.submitScore).toHaveBeenCalledWith(
            username.trim(),
            score,
            accuracy
          );

          // Verify it was called exactly once
          expect(supabaseClient.submitScore).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000); // 30 second timeout for property test with 100 runs

  /**
   * Feature: global-leaderboard, Property 3: Username validation acceptance
   * Validates: Requirements 4.2
   * 
   * Property: For any non-empty string, when entered as a username, the system 
   * should accept it as valid and enable the submit button.
   */
  it('Property 3: Non-empty usernames enable the submit button', async () => {
    await fc.assert(
      fc.asyncProperty(
        usernameArbitrary,
        scoreArbitrary,
        accuracyArbitrary,
        async (username, score, accuracy) => {
          // Clean up any previous renders
          cleanup();
          
          // Clear all mocks before each test
          vi.clearAllMocks();
          
          // Mock submitScore to resolve successfully
          vi.mocked(supabaseClient.submitScore).mockResolvedValue(undefined);

          // Mock onSuccess callback
          const onSuccessMock = vi.fn();

          // Render the ScoreSubmissionForm component
          render(
            <ScoreSubmissionForm 
              score={score} 
              accuracy={accuracy} 
              onSuccess={onSuccessMock} 
            />
          );

          // Find the username input field
          const usernameInput = screen.getByLabelText(/Enter your username/i) as HTMLInputElement;
          
          // Find the submit button
          const submitButton = screen.getByRole('button', { name: /Save Score/i }) as HTMLButtonElement;

          // Initially, the submit button should be disabled (empty username)
          expect(submitButton.disabled).toBe(true);

          // Set the username value
          fireEvent.change(usernameInput, { target: { value: username } });

          // After entering a non-empty username, the submit button should be enabled
          // Wait for the state to update
          await waitFor(() => {
            expect(submitButton.disabled).toBe(false);
          });

          // Verify the username was accepted (input value matches)
          expect(usernameInput.value).toBe(username);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000); // 30 second timeout for property test with 100 runs
});
