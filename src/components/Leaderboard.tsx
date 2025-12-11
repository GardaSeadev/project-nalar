import { useState, useEffect } from 'react';
import { fetchTopLeaderboard } from '../supabaseClient';
import type { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  onRefresh?: () => void;  // Optional callback to trigger data refresh
}

// @ts-expect-error - onRefresh is optional and reserved for future use
export default function Leaderboard({ onRefresh }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchTopLeaderboard();
      setEntries(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError('Unable to load leaderboard. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Top 5 Players Today</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                <div className="w-32 h-4 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Top 5 Players Today</h2>
        <div className="text-center py-8">
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={loadLeaderboard}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Top 5 Players Today</h2>
        <div className="text-center py-8">
          <p className="text-slate-400 text-lg">Be the first to set a score!</p>
          <p className="text-slate-500 text-sm mt-2">Complete a quiz to appear on the leaderboard</p>
        </div>
      </div>
    );
  }

  // Success state - display leaderboard entries
  return (
    <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Top 5 Players Today</h2>
      <div className="space-y-0">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="flex justify-between items-center py-3 border-b border-white/10 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <span className="text-white font-medium text-base">{entry.username}</span>
            </div>
            <span className="text-indigo-400 font-bold text-lg">{entry.score} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}
