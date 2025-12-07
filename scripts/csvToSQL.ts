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
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    // Parse CSV properly - split by comma but respect field boundaries
    // Since we know the exact structure: 10 fields
    const values: string[] = [];
    let currentValue = '';
    let fieldCount = 0;
    
    for (let i = 0; i < line.length; i++) {
      if (line[i] === ',' && fieldCount < 9) {
        values.push(currentValue.trim());
        currentValue = '';
        fieldCount++;
      } else {
        currentValue += line[i];
      }
    }
    // Add the last field
    values.push(currentValue.trim());
    
    const row: any = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || '';
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
  
  console.log('-- STEP 1: Fix the sequence (if you get duplicate key error)');
  console.log('-- Run this FIRST if you already have questions in your database:');
  console.log('SELECT setval(\'questions_id_seq\', (SELECT MAX(id) FROM questions));\n');
  
  console.log('-- STEP 2: Insert new questions');
  console.log('INSERT INTO questions (type, difficulty, question, options, "correctId", explanation)');
  console.log('VALUES');
  console.log(rows.map(rowToSQL).join(',\n'));
  console.log(';\n');
  
  console.log(`-- Total new questions: ${rows.length}`);
  console.log('\n-- TROUBLESHOOTING:');
  console.log('-- If you still get "duplicate key" error after running STEP 1:');
  console.log('-- 1. Check current max ID: SELECT MAX(id) FROM questions;');
  console.log('-- 2. Check sequence value: SELECT last_value FROM questions_id_seq;');
  console.log('-- 3. If they don\'t match, run STEP 1 again');
  console.log('\n-- See DOCS_FOR_INTERNAL/FIX_SEQUENCE.md for detailed explanation.');
} catch (error) {
  console.error('Error reading CSV file:', error);
  console.log('\nMake sure questionTemplate.csv exists in the scripts/ folder');
}
