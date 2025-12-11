import { useState } from 'react';
import toast from 'react-hot-toast';
import { submitScore } from '../supabaseClient';

interface ScoreSubmissionProps {
  score: number;
  accuracy: number;
  onSuccess: () => void;
}

export default function ScoreSubmissionForm({ score, accuracy, onSuccess }: ScoreSubmissionProps) {
  const [username, setUsername] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    if (!username.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitScore(username.trim(), score, accuracy);
      
      // Show success toast
      toast.success('Score saved! 🎉');

      // Call onSuccess callback to refresh leaderboard
      onSuccess();
      
      // Clear form
      setUsername('');
    } catch (error) {
      console.error('Failed to submit score:', error);
      setSubmitError('Failed to save score. Please try again.');
      
      // Show error toast
      toast.error('Failed to save score. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUsernameValid = username.trim().length > 0 && username.length <= 50;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <div>
        <label htmlFor="username" className="block text-white text-sm font-medium mb-2">
          Enter your Name to save Score
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your name"
          maxLength={50}
          disabled={isSubmitting}
          className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 border border-white/20 
                     rounded-xl text-white placeholder-slate-400 focus:outline-none 
                     focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
          aria-label="Enter your username"
        />
      </div>

      <button
        type="submit"
        disabled={!isUsernameValid || isSubmitting}
        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold
                   hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed
                   transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </>
        ) : (
          'Save Score'
        )}
      </button>

      {submitError && (
        <p className="text-red-400 text-sm text-center" role="alert">
          {submitError}
        </p>
      )}
    </form>
  );
}
