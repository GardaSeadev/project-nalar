import { useState, useEffect } from 'react'
import { QuestionArena } from './QuestionArena'
import { mockQuestions } from './mockData'
import { fetchRandomQuestions } from './supabaseClient'
import type { QuestionData } from './types'
import './App.css'

function App() {
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useSupabase, setUseSupabase] = useState(true)

  useEffect(() => {
    async function loadQuestions() {
      // If Supabase is not configured, fall back to mock data
      if (!useSupabase || !import.meta.env.VITE_SUPABASE_URL) {
        setQuestions(mockQuestions)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await fetchRandomQuestions(10)
        setQuestions(data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch questions from Supabase:', err)
        setError('Failed to load questions from database. Using local questions.')
        setQuestions(mockQuestions)
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [useSupabase])

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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Project NALAR
          </h1>
          <p className="text-gray-600 text-lg">
            Question Arena Demo - Academic Potential Test Practice
          </p>
          
          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
              {error}
            </div>
          )}
          
          {/* Toggle for testing */}
          <div className="mt-4">
            <button
              onClick={() => setUseSupabase(!useSupabase)}
              className="text-sm text-indigo-600 hover:text-indigo-700 underline"
            >
              {useSupabase ? 'Switch to Mock Data' : 'Switch to Supabase'}
            </button>
          </div>
        </header>

        {/* Question Arena Component */}
        <QuestionArena 
          questions={questions} 
          onComplete={handleComplete} 
        />

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            This is a demo of the Question Arena component. 
            Click through all {questions.length} questions to see different difficulty levels and question types.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
