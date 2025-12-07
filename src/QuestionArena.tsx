import { useState, useEffect } from 'react';
import { Clock, CheckCircle, ArrowRight, Trophy, RotateCcw } from 'lucide-react';
import type { QuestionArenaProps } from './types';

/**
 * QuestionArena Component
 * 
 * An interactive quiz component that displays a multiple-choice question
 * with immediate feedback, explanations, and a countdown timer.
 */
export function QuestionArena({ questions, onComplete }: QuestionArenaProps) {
  // Session management state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [showXPAnimation, setShowXPAnimation] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  
  // Question state management
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(30); // seconds
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  // Get current question data
  const questionData = questions[currentQuestionIndex];

  // Timer countdown logic
  useEffect(() => {
    // Set up interval to decrement time every second
    const intervalId = setInterval(() => {
      setTimeRemaining((prevTime) => {
        // Stop at zero, don't go negative
        if (prevTime <= 0) {
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array - only run once on mount

  // Option click handler
  const handleOptionClick = (optionId: string) => {
    // Prevent state changes if already answered
    if (isAnswered) {
      return;
    }

    // Set selected option and mark as answered
    setSelectedOption(optionId);
    setIsAnswered(true);

    // Check if selected option is correct
    const isCorrect = optionId === questionData.correctId;
    
    if (isCorrect) {
      // Increase score by 20 for correct answer
      setScore(score + 20);
      // Increment correct answers count
      setCorrectAnswers(correctAnswers + 1);
      // Increment streak by 1 for consecutive correct answer
      setStreak(streak + 1);
      
      // Trigger +20 XP animation
      setShowXPAnimation(true);
      
      // Auto-hide animation after 2 seconds
      setTimeout(() => {
        setShowXPAnimation(false);
      }, 2000);
    } else {
      // If incorrect, reset streak to 0
      setStreak(0);
    }
  };

  // Next button click handler
  const handleNext = () => {
    // Only allow click when button is enabled (isAnswered is true)
    if (!isAnswered) {
      return;
    }

    // Check if this is the last question
    if (currentQuestionIndex === questions.length - 1) {
      // Session complete - calculate accuracy and invoke callback
      // Need to account for the current answer in correctAnswers
      const finalCorrectAnswers = selectedOption === questionData.correctId 
        ? correctAnswers 
        : correctAnswers;
      const finalScore = selectedOption === questionData.correctId 
        ? score 
        : score;
      const accuracy = (finalCorrectAnswers / questions.length) * 100;
      
      setIsComplete(true);
      
      if (onComplete) {
        onComplete(finalScore, accuracy);
      }
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      // Reset question-specific state for the next question
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeRemaining(30);
    }
  };

  // Try Again button click handler - resets session
  const handleTryAgain = () => {
    // Reset all state to initial values
    setScore(0);
    setStreak(0);
    setCorrectAnswers(0);
    setCurrentQuestionIndex(0);
    setIsComplete(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeRemaining(30);
    setShowXPAnimation(false);
  };

  // Helper function to determine option styling
  const getOptionClassName = (optionId: string) => {
    const baseClasses = 'w-full text-left p-4 rounded-lg border-2 transition-all duration-200 relative';
    
    // If not answered yet, show default styling with hover and active effects
    if (!isAnswered) {
      return `${baseClasses} border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95`;
    }

    // After answering, disable hover effects
    const isSelected = selectedOption === optionId;
    const isCorrect = optionId === questionData.correctId;

    // Selected correct option - green
    if (isSelected && isCorrect) {
      return `${baseClasses} border-green-500 bg-green-100 cursor-not-allowed`;
    }

    // Selected incorrect option - red
    if (isSelected && !isCorrect) {
      return `${baseClasses} border-red-500 bg-red-100 cursor-not-allowed`;
    }

    // Correct option when user selected wrong - green
    if (!isSelected && isCorrect) {
      return `${baseClasses} border-green-500 bg-green-100 cursor-not-allowed`;
    }

    // Other options after answering - disabled
    return `${baseClasses} border-gray-200 bg-gray-50 cursor-not-allowed opacity-60`;
  };

  // Calculate accuracy for summary card
  const accuracy = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;

  // Render Summary Card when session is complete
  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          {/* Trophy Icon */}
          <div className="flex justify-center mb-6">
            <div className={`p-6 rounded-full ${
              accuracy >= 80 ? 'bg-yellow-100' : accuracy >= 60 ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Trophy 
                size={64} 
                className={
                  accuracy >= 80 ? 'text-yellow-600' : accuracy >= 60 ? 'text-blue-600' : 'text-gray-600'
                } 
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {accuracy >= 80 ? 'Excellent Work!' : accuracy >= 60 ? 'Good Job!' : 'Keep Practicing!'}
          </h2>
          <p className="text-gray-600 mb-8">You've completed all questions</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Final Score */}
            <div className="p-6 bg-indigo-50 rounded-lg">
              <p className="text-sm font-semibold text-indigo-600 mb-2">Final Score</p>
              <p className="text-3xl font-bold text-indigo-900">{score} XP</p>
            </div>

            {/* Accuracy */}
            <div className="p-6 bg-green-50 rounded-lg">
              <p className="text-sm font-semibold text-green-600 mb-2">Accuracy</p>
              <p className="text-3xl font-bold text-green-900">{accuracy.toFixed(0)}%</p>
            </div>

            {/* Correct Count */}
            <div className="p-6 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-600 mb-2">Correct Answers</p>
              <p className="text-3xl font-bold text-blue-900">
                {correctAnswers}/{questions.length}
              </p>
            </div>
          </div>

          {/* Try Again Button */}
          <button
            onClick={handleTryAgain}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 active:scale-95 transition-all duration-200 mx-auto"
          >
            <RotateCcw size={20} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render Question Interface
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      {/* Progress Bar Section */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-600">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Score & Streak Display */}
      <div className="mb-6 relative flex items-center gap-6">
        <div className="text-xl font-bold text-indigo-600">
          {score} XP
        </div>
        
        {/* Streak Display */}
        <div className="text-xl font-bold text-orange-600 flex items-center gap-1">
          <span>🔥</span>
          <span>{streak}</span>
        </div>
        
        {/* +20 XP Floating Animation */}
        {showXPAnimation && (
          <div className="absolute left-0 top-0 text-xl font-bold text-green-600 animate-float-up">
            +20 XP
          </div>
        )}
      </div>

      {/* Header Section */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          {/* Question Badge */}
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded">
            Soal Harian #{questionData.id}
          </span>
          
          {/* Difficulty Badge */}
          <span
            className={`px-3 py-1 text-sm font-semibold rounded ${
              questionData.difficulty === 'Easy'
                ? 'bg-green-100 text-green-700'
                : questionData.difficulty === 'Medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {questionData.difficulty}
          </span>
        </div>

        {/* Countdown Timer */}
        <div
          className={`flex items-center gap-2 text-sm font-semibold ${
            timeRemaining <= 10 ? 'text-red-600' : 'text-gray-700'
          }`}
        >
          <Clock size={16} />
          <span>
            {Math.floor(timeRemaining / 60)
              .toString()
              .padStart(2, '0')}
            :{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </header>

      {/* Question Section */}
      <section className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 leading-relaxed">
          {questionData.question}
        </h2>
      </section>

      {/* Options Section */}
      <section className="mb-6 space-y-3">
        {questionData.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.id === questionData.correctId;
          const showCorrectBadge = isAnswered && isSelected && isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={getOptionClassName(option.id)}
            >
              <span className="font-semibold text-gray-700 mr-3">{option.id}.</span>
              <span className="text-gray-900">{option.text}</span>
              
              {/* Correct Answer Badge */}
              {showCorrectBadge && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-700 font-semibold text-sm">
                  <CheckCircle size={18} />
                  Benar!
                </span>
              )}
            </button>
          );
        })}
      </section>

      {/* Explanation Section (Conditional) */}
      <section
        className={`mb-6 overflow-hidden transition-all duration-500 ease-in-out ${
          isAnswered
            ? 'max-h-96 opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2">Penjelasan:</h3>
          <p className="text-blue-800 leading-relaxed">{questionData.explanation}</p>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="flex justify-end">
        <button
          disabled={!isAnswered}
          onClick={handleNext}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
            isAnswered
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next Question
          <ArrowRight size={18} />
        </button>
      </footer>
    </div>
  );
}
