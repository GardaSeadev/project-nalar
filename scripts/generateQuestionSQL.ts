/**
 * Helper script to generate SQL INSERT statements from question objects
 * 
 * Usage:
 * 1. Add your questions to the `newQuestions` array below
 * 2. Run: npx tsx scripts/generateQuestionSQL.ts
 * 3. Copy the output SQL and run it in Supabase SQL Editor
 */

interface Option {
  id: string;
  text: string;
}

interface Question {
  type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: Option[];
  correctId: string;
  explanation: string;
}

// Add your new questions here
const newQuestions: Question[] = [
  {
    type: 'Logika Aritmatika',
    difficulty: 'Easy',
    question: 'Jika 2x + 5 = 15, maka nilai x adalah?',
    options: [
      { id: 'A', text: '3' },
      { id: 'B', text: '5' },
      { id: 'C', text: '7' },
      { id: 'D', text: '10' },
      { id: 'E', text: '15' }
    ],
    correctId: 'B',
    explanation: '2x + 5 = 15, maka 2x = 10, sehingga x = 5'
  },
  // Add more questions here...
];

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}

function generateSQL(questions: Question[]): string {
  const values = questions.map(q => {
    const optionsJSON = JSON.stringify(q.options);
    return `  ('${escapeSQL(q.type)}', '${q.difficulty}', '${escapeSQL(q.question)}', '${escapeSQL(optionsJSON)}'::jsonb, '${q.correctId}', '${escapeSQL(q.explanation)}')`;
  });

  return `INSERT INTO questions (type, difficulty, question, options, "correctId", explanation)
VALUES
${values.join(',\n')};`;
}

// Generate and print SQL
console.log('-- Generated SQL for Supabase');
console.log('-- Copy and paste this into Supabase SQL Editor\n');
console.log(generateSQL(newQuestions));
console.log(`\n-- Total questions: ${newQuestions.length}`);
