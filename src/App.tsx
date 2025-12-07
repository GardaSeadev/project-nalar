import { useState, useEffect } from 'react'
import { QuestionArena } from './QuestionArena'
import { fetchRandomQuestions } from './supabaseClient'
import type { QuestionData } from './types'
import './App.css'

function App() {
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true)
        const data = await fetchRandomQuestions(10)
        setQuestions(data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch questions from Supabase:', err)
        setError('Failed to load questions from database. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [])

  const handleComplete = (score: number, accuracy: number) => {
    console.log('Session completed!')
    console.log(`Final Score: ${score} XP`)
    console.log(`Accuracy: ${accuracy.toFixed(1)}%`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Questions</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h2>
          <p className="text-gray-600 mb-6">
            There are no questions in the database yet. Please add some questions to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Project NALAR
          </h1>
          <p className="text-gray-600 text-lg">
            Academic Potential Test Practice
          </p>
        </header>

        {/* Question Arena Component */}
        <QuestionArena 
          questions={questions} 
          onComplete={handleComplete} 
        />

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            Click through all {questions.length} questions to see different difficulty levels and question types.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
