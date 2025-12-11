import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { QuestionArena } from './QuestionArena'
import { fetchQuestionsFromSupabase } from './supabaseClient'
import { loadUserProgress, saveUserProgress, calculateStreak } from './localStorage'
import { mockQuestions } from './mockData'
import type { QuestionData, GameState } from './types'
import BackgroundGradient from './components/BackgroundGradient'
import Leaderboard from './components/Leaderboard'
import './App.css'

function App() {
  const [gameState, setGameState] = useState<GameState>('IDLE')
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)
  const [usingFallbackData, setUsingFallbackData] = useState(false)

  // Persistent state variables - initialized from localStorage
  const [userXP, setUserXP] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const [currentStreak, setCurrentStreak] = useState<number>(0)

  // State for leaderboard refresh trigger
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState<number>(0)

  // State for tracking current question index in PLAYING state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  
  // State for tracking score and streak in PLAYING state (for header display)
  const [currentScore, setCurrentScore] = useState<number>(0)
  const [currentStreakInGame, setCurrentStreakInGame] = useState<number>(0)
  
  // Ref for Next button handler in fixed footer
  const nextButtonHandlerRef = useRef<(() => void) | null>(null)
  const [isAnswered, setIsAnswered] = useState<boolean>(false)
  
  // State for tracking final results to display in FINISHED state
  const [finalScore, setFinalScore] = useState<number>(0)
  const [finalAccuracy, setFinalAccuracy] = useState<number>(0)
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false)

  // Load user progress from localStorage on mount
  useEffect(() => {
    const progress = loadUserProgress()
    setUserXP(progress.userXP)
    setHighScore(progress.highScore)
    setCurrentStreak(progress.currentStreak)
  }, [])

  // Fetch questions from Supabase when entering IDLE state
  // Task 26.3: Trigger fetch when gameState transitions to IDLE
  useEffect(() => {
    if (gameState === 'IDLE') {
      async function loadQuestions() {
        // Set isLoadingQuestions to true before fetch
        setIsLoadingQuestions(true)
        
        try {
          // On success: set questions state, set usingFallbackData to false
          const data = await fetchQuestionsFromSupabase()
          setQuestions(data)
          setUsingFallbackData(false)
        } catch (err) {
          console.error('Failed to fetch questions from Supabase:', err)
          // On failure: set questions to mockData, set usingFallbackData to true
          setQuestions(mockQuestions)
          setUsingFallbackData(true)
        } finally {
          // Set isLoadingQuestions to false in finally block
          setIsLoadingQuestions(false)
        }
      }

      loadQuestions()
    }
  }, [gameState])

  // Handler to transition from IDLE to PLAYING
  const handleStartQuiz = () => {
    // Reset score and streak for new game
    setCurrentScore(0);
    setCurrentStreakInGame(0);
    setIsAnswered(false);
    setIsNewHighScore(false);
    nextButtonHandlerRef.current = null;
    setGameState('PLAYING')
  }

  // Handler for quiz completion - transition from PLAYING to FINISHED
  const handleComplete = (score: number, accuracy: number) => {
    console.log('Session completed!')
    console.log(`Final Score: ${score} XP`)
    console.log(`Accuracy: ${accuracy.toFixed(1)}%`)
    
    // Store final results for display in FINISHED state
    setFinalScore(score)
    setFinalAccuracy(accuracy)
    
    // Check if this is a new high score
    const isNewHigh = score > highScore
    setIsNewHighScore(isNewHigh)
    
    // Load current progress to get lastPlayedDate
    const currentProgress = loadUserProgress()
    
    // Calculate new streak based on last played date
    const newStreak = calculateStreak(currentProgress.lastPlayedDate, currentProgress.currentStreak)
    
    // Update userXP with session score
    const newUserXP = userXP + score
    
    // Update highScore if current score exceeds it
    const newHighScore = score > highScore ? score : highScore
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0]
    
    // Save updated progress to localStorage
    saveUserProgress({
      userXP: newUserXP,
      highScore: newHighScore,
      currentStreak: newStreak,
      lastPlayedDate: today
    })
    
    // Update state
    setUserXP(newUserXP)
    setHighScore(newHighScore)
    setCurrentStreak(newStreak)
    
    setGameState('FINISHED')
  }

  // Handler for Try Again - transition from FINISHED to IDLE
  const handleTryAgain = () => {
    setCurrentQuestionIndex(0);
    setGameState('IDLE')
  }

  // Function to trigger leaderboard refresh
  const refreshLeaderboard = () => {
    setLeaderboardRefreshKey(prev => prev + 1)
  }

  // Handler for Quit - transition from PLAYING to IDLE
  const handleQuit = (currentScore: number) => {
    // Add current session score to userXP
    const newUserXP = userXP + currentScore
    
    // Load current progress to preserve other fields
    const currentProgress = loadUserProgress()
    
    // Save updated userXP to localStorage
    saveUserProgress({
      ...currentProgress,
      userXP: newUserXP
    })
    
    // Update state
    setUserXP(newUserXP)
    
    // Reset question index and Next button state
    setCurrentQuestionIndex(0);
    setIsAnswered(false);
    nextButtonHandlerRef.current = null;
    
    // Transition gameState to IDLE
    setGameState('IDLE')
  }



  // Render Lobby Screen when gameState === 'IDLE'
  if (gameState === 'IDLE') {
    return (
      <>
        <Toaster
          position="top-center"
          toastOptions={{
            // Default options for all toasts
            duration: 3000,
            style: {
              background: 'rgba(15, 23, 42, 0.9)', // slate-900 with opacity
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            },
            // Success toast styling
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981', // green-500
                secondary: '#fff',
              },
              style: {
                background: 'rgba(16, 185, 129, 0.2)', // green with glassmorphism
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              },
            },
            // Error toast styling
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444', // red-500
                secondary: '#fff',
              },
              style: {
                background: 'rgba(239, 68, 68, 0.2)', // red with glassmorphism
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              },
            },
          }}
        />
        <div className="min-h-screen flex items-center justify-center px-4">
          <BackgroundGradient />
          <motion.div 
            className="max-w-2xl w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
          {/* App Title */}
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-4xl sm:text-6xl font-bold text-white text-center mb-4">
              Project NALAR
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 text-center">
              Academic Potential Test Practice
            </p>
          </div>

          {/* High Score and Streak Display - Bento Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div 
              className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 text-center min-h-[88px]"
              whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.2)" }}
            >
              <p className="text-sm text-slate-400 mb-2">High Score</p>
              <p className="text-3xl sm:text-4xl font-bold text-indigo-400">{highScore} XP</p>
            </motion.div>
            <motion.div 
              className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 text-center min-h-[88px]"
              whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.2)" }}
            >
              <p className="text-sm text-slate-400 mb-2">Current Streak</p>
              <p className="text-3xl sm:text-4xl font-bold text-orange-400">🔥 {currentStreak}</p>
            </motion.div>
          </div>

          {/* Leaderboard Component */}
          <Leaderboard key={leaderboardRefreshKey} />

          {/* Start Button */}
          <motion.button
            onClick={handleStartQuiz}
            disabled={isLoadingQuestions}
            className="w-full py-4 sm:py-6 bg-indigo-600 text-white rounded-2xl font-bold text-xl sm:text-2xl shadow-lg shadow-indigo-500/50 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 min-h-[56px]"
            whileHover={!isLoadingQuestions ? { scale: 1.05, boxShadow: "0 0 40px rgba(99, 102, 241, 0.8)" } : {}}
            whileTap={!isLoadingQuestions ? { scale: 0.95 } : {}}
          >
            {isLoadingQuestions ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Loading Questions...
              </>
            ) : (
              'START MISSION'
            )}
          </motion.button>

          {/* Fallback Data Indicator */}
          {usingFallbackData && (
            <p className="mt-4 text-center text-sm text-gray-500">
              Using practice questions (database connection unavailable)
            </p>
          )}
        </motion.div>
        </div>
      </>
    )
  }

  // Render Quiz Arena when gameState === 'PLAYING'
  if (gameState === 'PLAYING') {
    return (
      <>
        <Toaster
          position="top-center"
          toastOptions={{
            // Default options for all toasts
            duration: 3000,
            style: {
              background: 'rgba(15, 23, 42, 0.9)', // slate-900 with opacity
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            },
            // Success toast styling
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981', // green-500
                secondary: '#fff',
              },
              style: {
                background: 'rgba(16, 185, 129, 0.2)', // green with glassmorphism
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              },
            },
            // Error toast styling
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444', // red-500
                secondary: '#fff',
              },
              style: {
                background: 'rgba(239, 68, 68, 0.2)', // red with glassmorphism
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              },
            },
          }}
        />
        <div className="h-dvh flex flex-col relative overflow-hidden">
          <BackgroundGradient />
        
        {/* SECTION 1: Fixed Header (Top) - flex-none */}
        <motion.div 
          className="flex-none backdrop-blur-xl bg-slate-900/50 border-b border-white/10 z-50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Progress Bar */}
          <div className="h-2 bg-white/10">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Header Content */}
          <div className="flex justify-between items-center px-4 sm:px-8 py-4">
            <div className="flex items-center gap-3 sm:gap-6">
              <p className="text-slate-300 text-xs sm:text-sm">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <div className="text-xl sm:text-2xl font-bold text-indigo-400">{currentScore} XP</div>
              <div className="text-xl sm:text-2xl font-bold text-orange-400 flex items-center gap-1">
                <span>🔥</span>
                <span>{currentStreakInGame}</span>
              </div>
            </div>
            
            {/* SINGLE Quit Button - Top Right */}
            <motion.button
              className="px-4 sm:px-6 py-3 backdrop-blur-lg bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg font-semibold text-sm sm:text-base min-h-[44px] min-w-[44px]"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuit(currentScore)}
            >
              Quit
            </motion.button>
          </div>
        </motion.div>
        
        {/* SECTION 2: Scrollable Content (Middle - flex-1) */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="container mx-auto max-w-5xl">
            {/* Question Arena Component */}
            <QuestionArena 
              questions={questions} 
              onComplete={handleComplete}
              highScore={highScore}
              gameState={gameState}
              onQuestionIndexChange={setCurrentQuestionIndex}
              onScoreChange={setCurrentScore}
              onStreakChange={setCurrentStreakInGame}
              renderNextButton={(handleNext, answered) => {
                // Store the handler in ref so we can call it from the footer
                nextButtonHandlerRef.current = handleNext;
                setIsAnswered(answered);
                return null; // Don't render inside the card
              }}
            />
          </div>
        </div>
        
        {/* SECTION 3: Fixed Footer (Bottom) - ALWAYS VISIBLE */}
        <div className="flex-none backdrop-blur-xl bg-slate-900/80 border-t border-white/10 px-4 sm:px-8 py-4">
          <div className="max-w-4xl mx-auto flex justify-end">
            <motion.button
              disabled={!isAnswered}
              onClick={() => nextButtonHandlerRef.current?.()}
              className={`flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg min-h-[44px] ${
                isAnswered
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
              whileHover={isAnswered ? { scale: 1.05, boxShadow: "0 0 30px rgba(99, 102, 241, 0.6)" } : {}}
              whileTap={isAnswered ? { scale: 0.95 } : {}}
            >
              Next Question
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </div>
        </div>
      </>
    )
  }

  // Render Summary Screen when gameState === 'FINISHED'
  if (gameState === 'FINISHED') {
    return (
      <>
        <Toaster
          position="top-center"
          toastOptions={{
            // Default options for all toasts
            duration: 3000,
            style: {
              background: 'rgba(15, 23, 42, 0.9)', // slate-900 with opacity
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            },
            // Success toast styling
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981', // green-500
                secondary: '#fff',
              },
              style: {
                background: 'rgba(16, 185, 129, 0.2)', // green with glassmorphism
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              },
            },
            // Error toast styling
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444', // red-500
                secondary: '#fff',
              },
              style: {
                background: 'rgba(239, 68, 68, 0.2)', // red with glassmorphism
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              },
            },
          }}
        />
        <div className="h-screen flex items-center justify-center p-2 sm:p-4">
          <BackgroundGradient />
        
        {/* Summary Card will be rendered here by QuestionArena */}
        <QuestionArena 
          questions={questions} 
          onComplete={handleComplete}
          onTryAgain={handleTryAgain}
          highScore={highScore}
          gameState={gameState}
          finalScore={finalScore}
          finalAccuracy={finalAccuracy}
          isNewHighScore={isNewHighScore}
          onRefreshLeaderboard={refreshLeaderboard}
        />
        </div>
      </>
    )
  }

  return null
}

export default App
