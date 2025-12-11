import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { QuestionData, LeaderboardEntry } from './types';

// Replace these with your actual Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create client if credentials are provided
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

/**
 * Fetch all questions from Supabase
 */
export async function fetchQuestions(): Promise<QuestionData[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch a random subset of questions from Supabase
 * Fetches all questions and returns a random subset of 10
 */
export async function fetchQuestionsFromSupabase(): Promise<QuestionData[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }

  try {
    // Fetch all questions first
    const { data, error } = await supabase
      .from('questions')
      .select('*');

    if (error) {
      throw error;
    }

    // Shuffle and return random subset of 10
    const shuffled = (data || []).sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  } catch (error) {
    console.error('Error fetching questions from Supabase:', error);
    throw error;
  }
}

/**
 * Fetch a random subset of questions
 * @deprecated Use fetchQuestionsFromSupabase instead
 */
export async function fetchRandomQuestions(count: number = 10): Promise<QuestionData[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }

  const { data, error } = await supabase
    .from('questions')
    .select('*');

  if (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }

  // Shuffle and return random subset
  const shuffled = (data || []).sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Fetch top 5 leaderboard entries ordered by score
 */
export async function fetchTopLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Failed to fetch leaderboard:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Insert a new score to the leaderboard
 */
export async function submitScore(
  username: string, 
  score: number, 
  accuracy?: number
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }

  const { error } = await supabase
    .from('leaderboard')
    .insert([{ username, score, accuracy }]);
  
  if (error) {
    console.error('Failed to submit score:', error);
    throw error;
  }
}
