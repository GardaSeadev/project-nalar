import { createClient } from '@supabase/supabase-js';
import type { QuestionData } from './types';

// Replace these with your actual Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch all questions from Supabase
 */
export async function fetchQuestions(): Promise<QuestionData[]> {
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
 * Fetch a random subset of questions
 */
export async function fetchRandomQuestions(count: number = 10): Promise<QuestionData[]> {
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
