# Project NALAR - Question Arena

A modern, gamified quiz interface for Academic Potential Tests (TPA/CPNS) built with React, TypeScript, and Tailwind CSS.

## Features

- 🎯 **Interactive Quiz Interface** - Engaging multiple-choice question component
- ⏱️ **Countdown Timer** - 30-second timer per question with visual warnings
- 🎨 **Modern Design** - Card-based UI with Slate-50/White/Indigo-600 color palette
- ⚡ **Instant Feedback** - Immediate visual feedback on answer selection
- 🏆 **Gamification** - XP system and streak counter to motivate users
- 📊 **Progress Tracking** - Visual progress bar and session summary
- ✅ **Comprehensive Testing** - Property-based tests with fast-check + unit tests
- 🎭 **Tactile Interactions** - Smooth animations and button feedback

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Supabase** - Database and backend (optional)
- **Vitest** - Testing framework
- **fast-check** - Property-based testing
- **React Testing Library** - Component testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd nalar

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
npm run lint             # Run ESLint
npm run generate:sql     # Generate SQL from TypeScript questions
npm run generate:sql:csv # Generate SQL from CSV file
```

## Project Structure

```
src/
├── QuestionArena.tsx      # Main quiz component
├── App.tsx                # Demo application
├── types.ts               # TypeScript interfaces
├── mockData.ts            # Sample questions
├── test/                  # Test files
│   ├── question-arena-properties.test.tsx
│   ├── edge-cases.test.tsx
│   ├── app-integration.test.tsx
│   └── generators.ts      # fast-check generators
└── ...
```

## Testing

The project includes comprehensive testing:

- **Property-Based Tests** - 4 properties tested with 100 iterations each
- **Unit Tests** - 6 edge case tests
- **Integration Tests** - 3 app integration tests

Run tests with:
```bash
npm test
```

## Database Setup (Required)

This project uses Supabase as the database for questions.

### Setup Supabase

You need to configure Supabase to use this application:

1. Create a free Supabase account at https://supabase.com
2. Create a new project
3. Set up the questions table (see setup documentation)
4. Add environment variables to `.env`:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

**Benefits:**
- Add/edit questions without code changes
- Scale to 100+ questions easily
- Free tier supports thousands of questions
- Real-time updates

**Note:** Mock data (`src/mockData.ts`) is kept for reference and testing purposes only.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will auto-detect Vite and configure build settings
4. Add environment variables (if using Supabase):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

Build settings (auto-detected):
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Component Usage

```tsx
import { QuestionArena } from './QuestionArena';
import { questions } from './mockData';

function App() {
  const handleComplete = (score: number, accuracy: number) => {
    console.log(`Final Score: ${score} XP`);
    console.log(`Accuracy: ${accuracy}%`);
  };

  return (
    <QuestionArena 
      questions={questions} 
      onComplete={handleComplete}
    />
  );
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
