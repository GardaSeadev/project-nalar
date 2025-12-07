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
}
