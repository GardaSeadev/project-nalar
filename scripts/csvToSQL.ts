/**
 * Convert CSV file to SQL INSERT statements
 * 
 * Usage:
 * 1. Fill in questionTemplate.csv or create your own CSV
 * 2. Run: npm run generate:sql:csv
 * 3. Copy output and paste into Supabase SQL Editor
 */

import * as fs from 'fs';
import * as path from 'path';

interface CSVRow {
  type: string;
  difficulty: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctId: string;
  explanation: string;
}

function parseCSV(content: string): CSVRow[] {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    // Simple CSV parser (doesn't handle commas in quotes)
    const values = line.split(',');
    const row: any = {};
    headers.forEach((header, i) => {
      row[header.trim()] = values[i]?.trim() || '';
    });
    return row as CSVRow;
  });
}

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}

function rowToSQL(row: CSVRow): string {
  const options = [
    { id: 'A', text: row.optionA },
    { id: 'B', text: row.optionB },
    { id: 'C', text: row.optionC },
    { id: 'D', text: row.optionD },
    { id: 'E', text: row.optionE }
  ];
  
  const optionsJSON = JSON.stringify(options);
  
  return `  ('${escapeSQL(row.type)}', '${row.difficulty}', '${escapeSQL(row.question)}', '${escapeSQL(optionsJSON)}'::jsonb, '${row.correctId}', '${escapeSQL(row.explanation)}')`;
}

// Read CSV file
const csvPath = path.join(process.cwd(), 'scripts', 'questionTemplate.csv');

try {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);
  
  console.log('-- Generated SQL from CSV');
  console.log('-- Copy and paste this into Supabase SQL Editor\n');
  console.log('INSERT INTO questions (type, difficulty, question, options, "correctId", explanation)');
  console.log('VALUES');
  console.log(rows.map(rowToSQL).join(',\n'));
  console.log(';');
  console.log(`\n-- Total questions: ${rows.length}`);
} catch (error) {
  console.error('Error reading CSV file:', error);
  console.log('\nMake sure questionTemplate.csv exists in the scripts/ folder');
}
