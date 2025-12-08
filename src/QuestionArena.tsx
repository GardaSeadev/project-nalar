import { useState, useEffect } from 'react';
import { Clock, CheckCircle, ArrowRight, Trophy, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { QuestionArenaProps, RankType } from './types';

/**
 * Calculate rank based on score
 * @param score - The final score
 * @returns The rank type
 */
function calculateRank(score: number): RankType {
  if (score < 50) {
    return 'Cadet Logika';
  } else if (score <= 80) {
    return 'Captain Nalar';
  } else {
    return 'Grandmaster';
  }
}

/**
 * Get glassmorphic glow classes for rank badge
 * @param rank - The rank type
 * @returns Tailwind CSS classes for rank badge styling with glow effect
 */
function getRankGlowClasses(rank: RankType): string {
  switch (rank) {
    case 'Grandmaster':
      return 'bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-2xl shadow-yellow-500/50';
    case 'Captain Nalar':
      return 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-2xl shadow-blue-500/50';
    case 'Cadet Logika':
      return 'bg-slate-500/20 border-slate-500 text-slate-400 shadow-2xl shadow-slate-500/50';
  }
}

/**
 * Get glassmorphic glow classes for trophy based on accuracy
 * @param accuracy - The accuracy percentage
 * @returns Tailwind CSS classes for trophy container styling
 */
function getTrophyGlowClasses(accuracy: number): string {
  if (accuracy >= 80) {
    return 'bg-yellow-500/20 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/50';
  } else if (accuracy >= 60) {
    return 'bg-blue-500/20 border-2 border-blue-500/50 shadow-lg shadow-blue-500/50';
  }
  return 'bg-slate-500/20 border-2 border-slate-500/50 shadow-lg shadow-slate-500/50';
}

/**
 * Get trophy icon color classes based on accuracy
 * @param accuracy - The accuracy percentage
 * @returns Tailwind CSS classes for trophy icon color
 */
function getTrophyColorClasses(accuracy: number): string {
  if (accuracy >= 80) return 'text-yellow-400';
  if (accuracy >= 60) return 'text-blue-400';
  return 'text-slate-400';
}

/**
 * Trigger confetti celebration effect
 * Creates multiple bursts for visual impact
 */
function triggerConfetti(): void {
  const duration = 3000; // 3 seconds
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: ReturnType<typeof setInterval> = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Fire confetti from two different origins for better effect
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}

/**
 * QuestionArena Component
 * 
 * An interactive quiz component that displays a multiple-choice question
 * with immediate feedback, explanations, and a countdown timer.
 */
export function QuestionArena({ questions, onComplete, onQuit, onTryAgain, highScore = 0, gameState, onQuestionIndexChange, onScoreChange, onStreakChange, finalScore: propFinalScore, finalAccuracy: propFinalAccuracy }: QuestionArenaProps) {
  // Session management state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [showXPAnimation, setShowXPAnimation] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [internalIsComplete, setInternalIsComplete] = useState<boolean>(false);
  
  // Question state management
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(30); // seconds
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [showTimeoutToast, setShowTimeoutToast] = useState<boolean>(false);
  const [triggerShake, setTriggerShake] = useState<boolean>(false);

  // Get current question data
  const questionData = questions[currentQuestionIndex];

  // Notify parent component when question index changes
  useEffect(() => {
    if (onQuestionIndexChange) {
      onQuestionIndexChange(currentQuestionIndex);
    }
  }, [currentQuestionIndex, onQuestionIndexChange]);

  // Notify parent component when score changes
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(score);
    }
  }, [score, onScoreChange]);

  // Notify parent component when streak changes
  useEffect(() => {
    if (onStreakChange) {
      onStreakChange(streak);
    }
  }, [streak, onStreakChange]);

  // Notify parent component when score changes
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(score);
    }
  }, [score, onScoreChange]);

  // Notify parent component when streak changes
  useEffect(() => {
    if (onStreakChange) {
      onStreakChange(streak);
    }
  }, [streak, onStreakChange]);

  // Reset all quiz session state when transitioning to IDLE (for Try Again functionality)
  useEffect(() => {
    if (gameState === 'IDLE') {
      setScore(0);
      setStreak(0);
      setCorrectAnswers(0);
      setCurrentQuestionIndex(0);
      setInternalIsComplete(false);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeRemaining(30);
      setShowXPAnimation(false);
      setIsNewHighScore(false);
      setShowTimeoutToast(false);
      setTriggerShake(false);
    }
  }, [gameState]);

  // Timer countdown logic
  useEffect(() => {
    // Only run timer when in PLAYING state or when gameState is undefined (standalone mode)
    // Don't run timer in IDLE or FINISHED states
    if (gameState === 'IDLE' || gameState === 'FINISHED') {
      return;
    }

    // Set up interval to decrement time every second
    const intervalId = setInterval(() => {
      setTimeRemaining((prevTime) => {
        // Check if timer has expired
        if (prevTime <= 0) {
          return 0;
        }
        
        // Check if timer is about to expire (will be 0 after this decrement)
        if (prevTime === 1) {
          // Timer is expiring - handle timeout
          // Mark answer as incorrect (don't increment score/correctAnswers)
          // Reset streak to 0
          setStreak(0);
          // Set showTimeoutToast to true
          setShowTimeoutToast(true);
          // Mark as answered to prevent further interaction
          setIsAnswered(true);
          return 0;
        }
        
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup interval when leaving PLAYING state or on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [gameState]); // Add gameState to dependencies to clean up on state transitions

  // Auto-advance logic after timeout toast
  useEffect(() => {
    if (showTimeoutToast) {
      // Wait 1 second after toast appears
      const timeoutId = setTimeout(() => {
        // Reset showTimeoutToast to false
        setShowTimeoutToast(false);
        
        // Check if this is the last question
        if (currentQuestionIndex === questions.length - 1) {
          // Session complete - calculate accuracy and invoke callback
          const accuracy = (correctAnswers / questions.length) * 100;
          
          // Check if current score beats high score
          if (score > highScore) {
            setIsNewHighScore(true);
            triggerConfetti();
          }
          
          // Check if rank is Grandmaster and trigger confetti
          const finalRank = calculateRank(score);
          if (finalRank === 'Grandmaster') {
            triggerConfetti();
          }
          
          // Set internal completion state for standalone usage
          setInternalIsComplete(true);
          
          if (onComplete) {
            onComplete(score, accuracy);
          }
        } else {
          // Advance to next question
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          
          // Reset question-specific state for the next question
          setSelectedOption(null);
          setIsAnswered(false);
          setTimeRemaining(30); // Reset timer for next question
        }
      }, 1000); // 1 second delay
      
      // Cleanup timeout on component unmount or if showTimeoutToast changes
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [showTimeoutToast, currentQuestionIndex, questions.length, correctAnswers, score, onComplete]);

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
      // Trigger shake animation
      setTriggerShake(true);
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
      
      // Check if current score beats high score
      if (finalScore > highScore) {
        setIsNewHighScore(true);
        triggerConfetti();
      }
      
      // Check if rank is Grandmaster and trigger confetti
      const finalRank = calculateRank(finalScore);
      if (finalRank === 'Grandmaster') {
        triggerConfetti();
      }
      
      // Set internal completion state for standalone usage
      setInternalIsComplete(true);
      
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

  // Try Again button click handler - transitions to IDLE or resets for standalone
  const handleTryAgain = () => {
    if (onTryAgain) {
      // When used in App, transition to IDLE state
      onTryAgain();
    } else {
      // When used standalone, reset internal state
      setScore(0);
      setStreak(0);
      setCorrectAnswers(0);
      setCurrentQuestionIndex(0);
      setInternalIsComplete(false);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeRemaining(30);
      setShowXPAnimation(false);
      setIsNewHighScore(false);
      setShowTimeoutToast(false);
      setTriggerShake(false);
    }
  };

  // Quit button click handler - exits to lobby
  const handleQuitClick = () => {
    // Invoke onQuit callback with current score if provided
    if (onQuit) {
      onQuit(score);
    }
  };

  // Helper function to determine option styling with glassmorphic effects
  const getOptionGlassClasses = (optionId: string) => {
    const baseClasses = 'w-full text-left backdrop-blur-lg flex items-center p-6 rounded-xl border-2 transition-all duration-200';
    
    // If not answered yet, show default glassmorphic styling
    if (!isAnswered) {
      return `${baseClasses} bg-white/5 border-white/10`;
    }

    // After answering, apply color-coded glassmorphic styling
    const isSelected = selectedOption === optionId;
    const isCorrect = optionId === questionData.correctId;

    // Selected correct option - green glassmorphic
    if (isSelected && isCorrect) {
      return `${baseClasses} bg-green-500/20 border-green-500 shadow-lg shadow-green-500/30`;
    }

    // Selected incorrect option - red glassmorphic
    if (isSelected && !isCorrect) {
      return `${baseClasses} bg-red-500/20 border-red-500 shadow-lg shadow-red-500/30`;
    }

    // Correct option when user selected wrong - green glassmorphic
    if (!isSelected && isCorrect) {
      return `${baseClasses} bg-green-500/20 border-green-500 shadow-lg shadow-green-500/30`;
    }

    // Other options after answering - dimmed glassmorphic
    return `${baseClasses} bg-white/5 border-white/10 opacity-50`;
  };

  // Calculate accuracy for summary card
  const accuracy = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;

  // Determine if we should show summary: either gameState is FINISHED (when used in App)
  // or internalIsComplete is true (when used standalone)
  const shouldShowSummary = gameState === 'FINISHED' || internalIsComplete;

  // Render Summary Card when session is complete
  if (shouldShowSummary) {
    // Use props if provided (when in FINISHED state from App), otherwise use internal state
    const displayScore = propFinalScore !== undefined ? propFinalScore : score;
    const displayAccuracy = propFinalAccuracy !== undefined ? propFinalAccuracy : accuracy;
    const displayCorrectAnswers = propFinalAccuracy !== undefined 
      ? Math.round((propFinalAccuracy / 100) * questions.length) 
      : correctAnswers;
    
    // Calculate rank based on final score
    const rank = calculateRank(displayScore);

    return (
      <motion.div 
        className="max-w-4xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          {/* Trophy Icon - Animated with Glassmorphic Glow */}
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className={`p-8 rounded-full ${getTrophyGlowClasses(displayAccuracy)}`}>
              <Trophy 
                size={80} 
                className={getTrophyColorClasses(displayAccuracy)} 
              />
            </div>
          </motion.div>

          {/* Rank Badge - Large and Glowing */}
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className={`px-12 py-6 rounded-3xl text-4xl font-bold border-2 ${getRankGlowClasses(rank)}`}>
              {rank}
            </div>
          </motion.div>

          {/* New High Score Indicator */}
          {isNewHighScore && (
            <div className="mb-4">
              <p className="text-2xl font-bold text-yellow-600">
                🎉 New High Score!
              </p>
            </div>
          )}

          {/* Title */}
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            {displayAccuracy >= 80 ? 'Excellent Work!' : displayAccuracy >= 60 ? 'Good Job!' : 'Keep Practicing!'}
          </h2>
          <p className="text-slate-300 text-center text-lg mb-12">You've completed all questions</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Final Score */}
            <motion.div 
              className="backdrop-blur-lg bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05, borderColor: "rgba(99, 102, 241, 0.5)" }}
            >
              <p className="text-sm font-semibold text-indigo-300 mb-3">Final Score</p>
              <p className="text-5xl font-bold text-indigo-400">{displayScore} XP</p>
            </motion.div>

            {/* Accuracy */}
            <motion.div 
              className="backdrop-blur-lg bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05, borderColor: "rgba(34, 197, 94, 0.5)" }}
            >
              <p className="text-sm font-semibold text-green-300 mb-3">Accuracy</p>
              <p className="text-5xl font-bold text-green-400">{displayAccuracy.toFixed(0)}%</p>
            </motion.div>

            {/* Correct Count */}
            <motion.div 
              className="backdrop-blur-lg bg-blue-500/10 border border-blue-500/30 rounded-2xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.05, borderColor: "rgba(59, 130, 246, 0.5)" }}
            >
              <p className="text-sm font-semibold text-blue-300 mb-3">Correct Answers</p>
              <p className="text-5xl font-bold text-blue-400">
                {displayCorrectAnswers}/{questions.length}
              </p>
            </motion.div>
          </div>

          {/* Play Again Button */}
          <motion.button
            onClick={handleTryAgain}
            className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-bold text-2xl shadow-lg shadow-indigo-500/50 flex items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(99, 102, 241, 0.8)" }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={28} />
            Play Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Render Question Interface
  return (
    <motion.div 
      className="max-w-4xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10"
      animate={triggerShake ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => {
        if (triggerShake) {
          setTriggerShake(false);
        }
      }}
    >
      {/* Progress Bar Section with Quit Button */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm font-semibold text-gray-600">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        
        {/* Quit Button */}
        <button
          onClick={handleQuitClick}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 active:scale-95 transition-all duration-200"
        >
          Quit
        </button>
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
        <div className="flex gap-3 flex-wrap">
          {/* Question Badge */}
          <span className="px-3 py-1 bg-slate-800/50 border border-white/10 text-slate-300 text-sm font-semibold rounded">
            Soal #{questionData.id}
          </span>
          
          {/* Question Type Badge */}
          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 text-sm font-semibold rounded">
            {questionData.type}
          </span>
          
          {/* Difficulty Badge */}
          <span
            className={`px-3 py-1 text-sm font-semibold rounded border ${
              questionData.difficulty === 'Easy'
                ? 'bg-green-500/20 border-green-500/50 text-green-300'
                : questionData.difficulty === 'Medium'
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                : 'bg-red-500/20 border-red-500/50 text-red-300'
            }`}
          >
            {questionData.difficulty}
          </span>
        </div>

        {/* Countdown Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-lg ${
            timeRemaining <= 10 
              ? 'bg-red-500/20 border border-red-500/50 text-red-400' 
              : 'bg-white/5 border border-white/10 text-slate-300'
          }`}
        >
          <Clock size={20} />
          <span className="text-lg font-bold">
            {Math.floor(timeRemaining / 60)
              .toString()
              .padStart(2, '0')}
            :{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </header>

      {/* Question Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-white leading-relaxed">
          {questionData.question}
        </h2>
      </section>

      {/* Options Section */}
      <section className="mb-6 space-y-4">
        {questionData.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.id === questionData.correctId;
          const showCorrectBadge = isAnswered && isSelected && isCorrect;

          return (
            <motion.button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={getOptionGlassClasses(option.id)}
              whileHover={!isAnswered ? { scale: 1.02, borderColor: "rgba(255,255,255,0.3)" } : {}}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
            >
              <span className="font-bold text-slate-300 mr-4">{option.id}.</span>
              <span className="text-white">{option.text}</span>
              
              {/* Correct Answer Badge */}
              {showCorrectBadge && (
                <CheckCircle className="ml-auto text-green-400" size={24} />
              )}
            </motion.button>
          );
        })}
      </section>

      {/* Explanation Section (Conditional) */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            className="backdrop-blur-lg bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-semibold text-blue-300 mb-2">Penjelasan:</h3>
            <p className="text-slate-200 leading-relaxed">{questionData.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeout Toast Notification */}
      {showTimeoutToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-red-600 text-white px-8 py-4 rounded-lg shadow-2xl text-center">
            <p className="text-2xl font-bold">Waktu Habis!</p>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="flex justify-end">
        <motion.button
          disabled={!isAnswered}
          onClick={handleNext}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold ${
            isAnswered
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
              : 'bg-white/5 text-slate-500 cursor-not-allowed'
          }`}
          whileHover={isAnswered ? { scale: 1.05, boxShadow: "0 0 30px rgba(99, 102, 241, 0.6)" } : {}}
          whileTap={isAnswered ? { scale: 0.95 } : {}}
        >
          Next Question
          <ArrowRight size={20} />
        </motion.button>
      </footer>
    </motion.div>
  );
}
