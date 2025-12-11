/**
 * Game state for the application state machine
 */
export type GameState = 'IDLE' | 'PLAYING' | 'FINISHED';

/**
 * Rank type based on performance
 */
export type RankType = 'Cadet Logika' | 'Captain Nalar' | 'Grandmaster';

/**
 * Represents a single answer option in a multiple-choice question
 */
export interface Option {
  id: string;        // "A", "B", "C", "D", "E"
  text: string;      // Option text content
}

/**
 * Represents the complete data structure for a question
 */
export interface QuestionData {
  id: number;
  type: string;           // e.g., "Logika Aritmatika"
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  options: Option[];      // Array of 5 options
  correctId: string;      // ID of correct option
  explanation: string;
}

/**
 * Props interface for the QuestionArena component
 */
export interface QuestionArenaProps {
  questions: QuestionData[];  // Array of all questions
  onComplete?: (score: number, accuracy: number) => void;  // Optional callback when session completes
  onTryAgain?: () => void;  // Optional callback when user clicks Try Again
  highScore?: number;  // Optional high score to check for new high score
  gameState?: GameState;  // Optional game state to determine what to render
  onQuestionIndexChange?: (index: number) => void;  // Optional callback when question index changes
  onScoreChange?: (score: number) => void;  // Optional callback when score changes
  onStreakChange?: (streak: number) => void;  // Optional callback when streak changes
  finalScore?: number;  // Optional final score to display in FINISHED state
  finalAccuracy?: number;  // Optional final accuracy to display in FINISHED state
  renderNextButton?: (handleNext: () => void, isAnswered: boolean) => React.ReactNode;  // Optional render prop for Next button
  onRefreshLeaderboard?: () => void;  // Optional callback to refresh leaderboard after score submission
}

/**
 * User progress data persisted in localStorage
 */
export interface UserProgress {
  userXP: number;           // Total XP across all sessions
  highScore: number;        // Best single session score
  currentStreak: number;    // Consecutive days played
  lastPlayedDate: string;   // ISO date string (e.g., "2024-12-08")
}

/**
 * Represents a leaderboard entry
 */
export interface LeaderboardEntry {
  id: number;
  username: string;
  score: number;
  accuracy?: number;  // Optional for tie-breaking
  created_at: string;
}
