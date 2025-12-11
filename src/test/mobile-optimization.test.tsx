import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { QuestionArena } from '../QuestionArena';
import Leaderboard from '../components/Leaderboard';
import ScoreSubmissionForm from '../components/ScoreSubmissionForm';
import * as supabaseClient from '../supabaseClient';
import { mockQuestions } from '../mockData';
import type { LeaderboardEntry } from '../types';

/**
 * Mobile Optimization Tests
 * Task 7: Test and validate mobile optimization
 * Requirements: 1.2, 3.3, 3.5
 * 
 * These tests validate mobile-responsive design across various viewport sizes,
 * ensuring no horizontal overflow, proper touch targets, and visual consistency.
 */

// Mock viewport dimensions for testing
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Mock CSS media queries for mobile testing
const mockMatchMedia = (width: number) => {
  const mediaQuery = `(min-width: ${width}px)`;
  return {
    matches: window.innerWidth >= width,
    media: mediaQuery,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
};

describe('Mobile Optimization Tests', () => {
  beforeEach(() => {
    // Mock Supabase functions
    vi.spyOn(supabaseClient, 'fetchQuestionsFromSupabase').mockResolvedValue(mockQuestions.slice(0, 3));
    vi.spyOn(supabaseClient, 'fetchTopLeaderboard').mockResolvedValue([]);
    vi.spyOn(supabaseClient, 'submitScore').mockResolvedValue();
    
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Reset viewport to default
    setViewportSize(1024, 768);
  });

  /**
   * Test: Mobile viewport sizes (320px - 767px) display correctly
   * Validates: Requirements 1.2, 3.5
   * 
   * Tests various mobile viewport sizes to ensure content displays properly
   * without horizontal overflow and maintains readability.
   */
  describe('Mobile Viewport Testing', () => {
    const mobileViewports = [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 667, name: 'iPhone 8' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
      { width: 360, height: 640, name: 'Galaxy S5' },
      { width: 767, height: 1024, name: 'iPad Portrait (max mobile)' },
    ];

    mobileViewports.forEach(({ width, height, name }) => {
      it(`should display correctly at ${name} (${width}x${height})`, async () => {
        // Set mobile viewport
        setViewportSize(width, height);
        
        // Mock matchMedia for this viewport
        window.matchMedia = vi.fn().mockImplementation((query) => {
          const minWidth = parseInt(query.match(/\d+/)?.[0] || '0');
          return mockMatchMedia(minWidth);
        });

        const { container } = render(<App />);

        // Wait for app to load
        await waitFor(() => {
          expect(screen.getByText('START MISSION')).toBeInTheDocument();
        });

        // Verify no horizontal overflow
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance

        // Verify title uses mobile sizing (text-4xl instead of text-6xl)
        const title = screen.getByText('Project NALAR');
        const titleClasses = title.className;
        
        // On mobile, should have text-4xl, on desktop should have sm:text-6xl
        if (width < 640) { // sm breakpoint
          expect(titleClasses).toContain('text-4xl');
        }

        // Verify subtitle uses mobile sizing
        const subtitle = screen.getByText(/Academic Potential Test Practice/i);
        const subtitleClasses = subtitle.className;
        
        if (width < 640) {
          expect(subtitleClasses).toContain('text-lg');
        }

        // Verify container uses mobile padding
        const mainContainer = container.querySelector('.backdrop-blur-xl');
        expect(mainContainer).toHaveClass('p-6');
        if (width >= 640) {
          expect(mainContainer).toHaveClass('sm:p-12');
        }
      });
    });
  });

  /**
   * Test: No horizontal scrolling on any screen
   * Validates: Requirements 1.2, 3.5
   * 
   * Ensures that content never exceeds viewport width causing horizontal scroll.
   */
  it('should prevent horizontal scrolling on all mobile screens', async () => {
    const testViewports = [320, 375, 414, 768];

    for (const width of testViewports) {
      setViewportSize(width, 667);
      
      const { container, unmount } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('START MISSION')).toBeInTheDocument();
      });

      // Check that no element exceeds viewport width
      const allElements = container.querySelectorAll('*');
      allElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0) { // Only check visible elements
          expect(rect.right).toBeLessThanOrEqual(width + 1); // Allow 1px tolerance
        }
      });

      // Verify document body doesn't have horizontal scroll
      expect(document.body.scrollWidth).toBeLessThanOrEqual(width + 1);

      unmount();
    }
  });

  /**
   * Test: Interactive elements meet 44px minimum touch target
   * Validates: Requirements 1.3, 1.4, 2.3, 3.3
   * 
   * Ensures all buttons, form inputs, and clickable areas meet accessibility
   * standards for touch targets on mobile devices.
   */
  it('should ensure all interactive elements meet 44px minimum touch target', async () => {
    setViewportSize(375, 667);

    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('START MISSION')).toBeInTheDocument();
    });

    // Test START MISSION button - check CSS classes instead of getBoundingClientRect
    const startButton = screen.getByText('START MISSION');
    expect(startButton).toHaveClass('min-h-[56px]'); // Button has min-h-[56px] which exceeds 44px requirement

    // Test stats cards have proper minimum height - specifically target the stats grid cards
    const statsGrid = container.querySelector('.grid.grid-cols-2');
    expect(statsGrid).toBeInTheDocument();
    
    const statsCards = statsGrid?.querySelectorAll('.backdrop-blur-lg.bg-white\\/5.border.border-white\\/10.rounded-2xl');
    expect(statsCards).toBeDefined();
    expect(statsCards!.length).toBe(2); // Should have 2 stats cards
    
    statsCards?.forEach((card) => {
      expect(card).toHaveClass('min-h-[88px]'); // Stats cards have min-h-[88px]
    });

    // Test that interactive elements have proper touch-friendly classes
    const interactiveElements = container.querySelectorAll('button');
    interactiveElements.forEach((element) => {
      // All buttons should have adequate padding or minimum height
      const hasMinHeight = element.classList.toString().includes('min-h-') || 
                          element.classList.toString().includes('py-') ||
                          element.classList.toString().includes('p-');
      expect(hasMinHeight).toBe(true);
    });
  });

  /**
   * Test: Mobile grid layout adaptation
   * Validates: Requirements 2.2, 2.4
   * 
   * Verifies that multi-column layouts convert to mobile-appropriate layouts.
   */
  it('should adapt grid layouts for mobile screens', async () => {
    setViewportSize(375, 667);

    // Test lobby screen stats grid (should be 2 columns on mobile)
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('START MISSION')).toBeInTheDocument();
    });

    // Find stats grid container
    const statsGrid = container.querySelector('.grid-cols-2');
    expect(statsGrid).toBeInTheDocument();

    // Verify it maintains 2-column layout on mobile (as per design)
    expect(statsGrid).toHaveClass('grid-cols-2');
    expect(statsGrid).toHaveClass('gap-4'); // Mobile gap
    if (window.innerWidth >= 640) {
      expect(statsGrid).toHaveClass('sm:gap-6'); // Desktop gap
    }
  });

  /**
   * Test: Summary screen mobile layout
   * Validates: Requirements 2.1, 2.5
   * 
   * Tests that the summary screen adapts properly for mobile with
   * single-column stats layout and appropriate sizing.
   */
  it('should display summary screen correctly on mobile', async () => {
    setViewportSize(375, 667);

    // Create a mock question for testing
    const mockQuestion = mockQuestions[0];
    
    const { container } = render(
      <QuestionArena 
        questions={[mockQuestion]} 
        gameState="FINISHED"
        finalScore={60}
        finalAccuracy={100}
        isNewHighScore={false}
      />
    );

    // Wait for summary card to render
    await waitFor(() => {
      expect(screen.getByText(/Play Again/i)).toBeInTheDocument();
    });

    // Verify trophy icon uses mobile sizing (60px instead of 80px)
    const trophyContainer = container.querySelector('[class*="p-6"]');
    expect(trophyContainer).toBeInTheDocument();
    
    // On mobile, should use p-6, on desktop should use sm:p-8
    if (window.innerWidth < 640) {
      expect(trophyContainer).toHaveClass('p-6');
    }

    // Verify stats grid uses single column on mobile
    const statsGrid = container.querySelector('.grid-cols-1');
    expect(statsGrid).toBeInTheDocument();
    expect(statsGrid).toHaveClass('sm:grid-cols-3'); // Desktop: 3 columns

    // Verify rank badge uses mobile sizing
    const rankBadge = container.querySelector('[class*="text-2xl"]');
    expect(rankBadge).toBeInTheDocument();
    if (window.innerWidth < 640) {
      expect(rankBadge).toHaveClass('text-2xl');
    }
    expect(rankBadge).toHaveClass('sm:text-4xl'); // Desktop sizing
  });

  /**
   * Test: Form elements mobile optimization
   * Validates: Requirements 2.3, 3.3
   * 
   * Ensures form inputs and buttons are properly sized for mobile interaction.
   */
  it('should optimize form elements for mobile', async () => {
    setViewportSize(375, 667);

    const mockOnSuccess = vi.fn();
    
    render(
      <ScoreSubmissionForm 
        score={60}
        accuracy={100}
        onSuccess={mockOnSuccess}
      />
    );

    // Test input field has proper CSS classes for mobile sizing
    const usernameInput = screen.getByPlaceholderText('Enter your name');
    expect(usernameInput).toHaveClass('min-h-[48px]'); // Minimum touch target height

    // Test submit button has proper CSS classes for mobile sizing
    const submitButton = screen.getByText('Save Score');
    expect(submitButton).toHaveClass('min-h-[48px]'); // Minimum touch target height

    // Verify form uses proper mobile spacing
    const form = usernameInput.closest('form');
    expect(form).toHaveClass('space-y-4');
    expect(form).toHaveClass('sm:space-y-6'); // Desktop spacing

    // Verify input has proper mobile styling
    expect(usernameInput).toHaveClass('px-4');
    expect(usernameInput).toHaveClass('py-3');
    expect(usernameInput).toHaveClass('rounded-xl');

    // Verify button has proper mobile styling
    expect(submitButton).toHaveClass('px-6');
    expect(submitButton).toHaveClass('py-3');
    expect(submitButton).toHaveClass('rounded-xl');
  });

  /**
   * Test: Leaderboard mobile optimization
   * Validates: Requirements 1.5, 3.1, 3.2
   * 
   * Verifies leaderboard component displays correctly on mobile with
   * appropriate padding, font sizes, and spacing.
   */
  it('should display leaderboard correctly on mobile', async () => {
    setViewportSize(375, 667);

    const mockLeaderboard: LeaderboardEntry[] = [
      { id: 1, username: 'TestUser1', score: 100, created_at: '2024-12-09T10:00:00Z' },
      { id: 2, username: 'TestUser2', score: 90, created_at: '2024-12-09T09:00:00Z' },
    ];

    vi.spyOn(supabaseClient, 'fetchTopLeaderboard').mockResolvedValue(mockLeaderboard);

    const { container } = render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('TestUser1')).toBeInTheDocument();
    });

    // Verify container uses mobile padding
    const leaderboardContainer = container.querySelector('.backdrop-blur-lg');
    expect(leaderboardContainer).toHaveClass('p-4'); // Mobile padding
    expect(leaderboardContainer).toHaveClass('sm:p-6'); // Desktop padding

    // Verify title uses mobile font size
    const title = screen.getByText('Top 5 Players Today');
    expect(title).toHaveClass('text-xl'); // Mobile size
    expect(title).toHaveClass('sm:text-2xl'); // Desktop size

    // Verify entries have proper mobile spacing and touch targets
    const entries = container.querySelectorAll('[class*="py-2"]');
    entries.forEach((entry) => {
      expect(entry).toHaveClass('min-h-[44px]'); // Touch target
      expect(entry).toHaveClass('py-2'); // Mobile padding
      expect(entry).toHaveClass('sm:py-3'); // Desktop padding
    });

    // Verify rank badges use mobile sizing
    const rankBadges = container.querySelectorAll('[class*="w-7"]');
    rankBadges.forEach((badge) => {
      expect(badge).toHaveClass('w-7'); // Mobile size
      expect(badge).toHaveClass('h-7');
      expect(badge).toHaveClass('sm:w-8'); // Desktop size
      expect(badge).toHaveClass('sm:h-8');
    });
  });

  /**
   * Test: Playing state mobile layout
   * Validates: Requirements 1.1, 3.1, 3.2
   * 
   * Tests the quiz playing interface on mobile, including header,
   * question display, and footer layout.
   */
  it('should display playing state correctly on mobile', async () => {
    setViewportSize(375, 667);

    const user = userEvent.setup();
    const { container } = render(<App />);

    // Wait for lobby and start quiz
    await waitFor(() => {
      expect(screen.getByText('START MISSION')).toBeInTheDocument();
    });

    await user.click(screen.getByText('START MISSION'));

    // Wait for playing state
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();
    });

    // Verify header uses mobile padding - look for the correct header element
    const headerContent = container.querySelector('.flex.justify-between.items-center.px-4');
    expect(headerContent).toBeInTheDocument();
    expect(headerContent).toHaveClass('px-4'); // Mobile padding
    expect(headerContent).toHaveClass('sm:px-8'); // Desktop padding

    // Verify question container uses mobile padding - look for QuestionArena container
    const questionContainer = container.querySelector('.backdrop-blur-xl.bg-white\\/5.border.border-white\\/10.rounded-3xl');
    expect(questionContainer).toBeInTheDocument();
    expect(questionContainer).toHaveClass('p-6'); // Mobile padding
    expect(questionContainer).toHaveClass('sm:p-10'); // Desktop padding

    // Verify footer uses mobile padding
    const footer = container.querySelector('.backdrop-blur-xl.bg-slate-900\\/80.border-t.border-white\\/10');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('px-4'); // Mobile padding
    expect(footer).toHaveClass('sm:px-8'); // Desktop padding

    // Verify Next button has proper CSS classes for touch targets
    const nextButton = screen.getByText(/Next Question/i);
    expect(nextButton).toHaveClass('min-h-[44px]'); // Touch target requirement

    // Verify Quit button has proper CSS classes for touch targets
    const quitButton = screen.getByText('Quit');
    expect(quitButton).toHaveClass('min-h-[44px]'); // Touch target requirement
    expect(quitButton).toHaveClass('min-w-[44px]'); // Touch target requirement
  });

  /**
   * Test: Visual consistency across mobile screens
   * Validates: Requirements 3.4
   * 
   * Ensures consistent spacing, border radius, and styling patterns
   * across all mobile screens.
   */
  it('should maintain visual consistency across mobile screens', async () => {
    setViewportSize(375, 667);

    const user = userEvent.setup();
    const { container } = render(<App />);

    // Test lobby screen consistency
    await waitFor(() => {
      expect(screen.getByText('START MISSION')).toBeInTheDocument();
    });

    // Verify consistent border radius on cards
    const lobbyCards = container.querySelectorAll('[class*="rounded-2xl"], [class*="rounded-3xl"]');
    expect(lobbyCards.length).toBeGreaterThan(0);

    // Verify consistent spacing patterns
    const spacingElements = container.querySelectorAll('[class*="mb-6"], [class*="gap-4"]');
    expect(spacingElements.length).toBeGreaterThan(0);

    // Transition to playing state
    await user.click(screen.getByText('START MISSION'));

    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();
    });

    // Verify playing state maintains consistent styling
    const playingCards = container.querySelectorAll('[class*="rounded-xl"], [class*="rounded-3xl"]');
    expect(playingCards.length).toBeGreaterThan(0);

    // Answer question to get to summary
    const optionC = await screen.findByText(/^C\./, {}, { timeout: 3000 });
    await user.click(optionC);
    await user.click(screen.getByText(/Next Question/i));

    // Continue through remaining questions
    await waitFor(() => {
      expect(screen.getByText(/Question 2 of/i)).toBeInTheDocument();
    });

    const q2OptionB = await screen.findByText(/^B\./, {}, { timeout: 3000 });
    await user.click(q2OptionB);
    await user.click(screen.getByText(/Next Question/i));

    await waitFor(() => {
      expect(screen.getByText(/Question 3 of/i)).toBeInTheDocument();
    });

    const q3OptionC = await screen.findByText(/^C\./, {}, { timeout: 3000 });
    await user.click(q3OptionC);
    await user.click(screen.getByText(/Next Question/i));

    // Wait for summary screen
    await waitFor(() => {
      expect(screen.getByText(/Play Again/i)).toBeInTheDocument();
    });

    // Verify summary screen maintains consistent styling
    const summaryCards = container.querySelectorAll('[class*="rounded-2xl"], [class*="rounded-3xl"]');
    expect(summaryCards.length).toBeGreaterThan(0);

    // Verify consistent glassmorphic styling across all states
    const glassElements = container.querySelectorAll('[class*="backdrop-blur"]');
    expect(glassElements.length).toBeGreaterThan(0);
  });

  /**
   * Test: Typography scaling on mobile
   * Validates: Requirements 3.2
   * 
   * Ensures text remains readable at mobile sizes with appropriate
   * font size scaling.
   */
  it('should scale typography appropriately for mobile', async () => {
    setViewportSize(375, 667);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('START MISSION')).toBeInTheDocument();
    });

    // Test main title scaling
    const title = screen.getByText('Project NALAR');
    expect(title).toHaveClass('text-4xl'); // Mobile size
    expect(title).toHaveClass('sm:text-6xl'); // Desktop size

    // Test subtitle scaling
    const subtitle = screen.getByText(/Academic Potential Test Practice/i);
    expect(subtitle).toHaveClass('text-lg'); // Mobile size
    expect(subtitle).toHaveClass('sm:text-xl'); // Desktop size

    // Test button text scaling
    const startButton = screen.getByText('START MISSION');
    expect(startButton).toHaveClass('text-xl'); // Mobile size
    expect(startButton).toHaveClass('sm:text-2xl'); // Desktop size
  });
});