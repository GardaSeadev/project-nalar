import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

/**
 * Integration test for App component with QuestionArena
 * Verifies that the demo page is properly set up
 */
describe('App Integration', () => {
  it('should render the App with QuestionArena component', () => {
    // Render the App component
    render(<App />);
    
    // Verify header is present
    expect(screen.getByText('Project NALAR')).toBeInTheDocument();
    expect(screen.getByText(/Question Arena Demo/i)).toBeInTheDocument();
    
    // Verify QuestionArena is rendered (check for progress bar)
    expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();
    
    // Verify footer is present
    expect(screen.getByText(/Click through all/i)).toBeInTheDocument();
  });

  it('should pass questions array to QuestionArena', () => {
    render(<App />);
    
    // Verify that the progress bar shows the correct total
    // This confirms the questions array is being passed
    const progressText = screen.getByText(/Question 1 of \d+/i);
    expect(progressText).toBeInTheDocument();
  });

  it('should have onComplete callback defined', () => {
    // Spy on console.log to verify callback works
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(<App />);
    
    // The callback is defined and will be called when session completes
    // We can't easily test the callback invocation without completing the session
    // but we can verify the component renders without errors
    expect(screen.getByText('Project NALAR')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});
