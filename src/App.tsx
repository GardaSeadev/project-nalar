import { QuestionArena } from './QuestionArena'
import { mockQuestions } from './mockData'
import './App.css'

function App() {
  const handleComplete = (score: number, accuracy: number) => {
    console.log('Session completed!')
    console.log(`Final Score: ${score} XP`)
    console.log(`Accuracy: ${accuracy.toFixed(1)}%`)
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
        </header>

        {/* Question Arena Component */}
        <QuestionArena 
          questions={mockQuestions} 
          onComplete={handleComplete} 
        />

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            This is a demo of the Question Arena component. 
            Click through all {mockQuestions.length} questions to see different difficulty levels and question types.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
