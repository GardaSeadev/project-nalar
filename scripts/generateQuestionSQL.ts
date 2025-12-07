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
  {
    type: 'Logika Aritmatika',
    difficulty: 'Easy',
    question: 'Jika 3x - 4 = 11, maka nilai x adalah?',
    options: [
      { id: 'A', text: '3' },
      { id: 'B', text: '4' },
      { id: 'C', text: '5' },
      { id: 'D', text: '6' },
      { id: 'E', text: '7' }
    ],
    correctId: 'C',
    explanation: '3x - 4 = 11 -> 3x = 15 -> x = 5'
  },
  {
    type: 'Deret Angka',
    difficulty: 'Medium',
    question: 'Tentukan angka berikutnya: 4, 9, 16, 25, ...?',
    options: [
      { id: 'A', text: '30' },
      { id: 'B', text: '36' },
      { id: 'C', text: '40' },
      { id: 'D', text: '49' },
      { id: 'E', text: '35' }
    ],
    correctId: 'B',
    explanation: 'Ini adalah deret kuadrat bilangan asli: 2^2, 3^2, 4^2, 5^2. Selanjutnya 6^2 = 36'
  },
  {
    type: 'Penalaran Verbal - Sinonim',
    difficulty: 'Easy',
    question: 'EKSKAVASI = ...?',
    options: [
      { id: 'A', text: 'Penggalian' },
      { id: 'B', text: 'Pertolongan' },
      { id: 'C', text: 'Penyelundupan' },
      { id: 'D', text: 'Pengiriman' },
      { id: 'E', text: 'Pencurian' }
    ],
    correctId: 'A',
    explanation: 'Ekskavasi adalah tindakan penggalian (biasanya dalam konteks arkeologi).'
  },
  {
    type: 'Penalaran Verbal - Antonim',
    difficulty: 'Medium',
    question: 'SPORADIS >< ...?',
    options: [
      { id: 'A', text: 'Jarang' },
      { id: 'B', text: 'Kerap' },
      { id: 'C', text: 'Berhenti' },
      { id: 'D', text: 'Pelan' },
      { id: 'E', text: 'Dinanti' }
    ],
    correctId: 'B',
    explanation: 'Sporadis artinya kadang-kadang atau tidak tentu. Lawan katanya adalah Kerap (sering/terus-menerus).'
  },
  {
    type: 'Penalaran Verbal - Analogi',
    difficulty: 'Easy',
    question: 'GURU : SEKOLAH = ... : ...',
    options: [
      { id: 'A', text: 'Penebang : Pohon' },
      { id: 'B', text: 'Musisi : Gitar' },
      { id: 'C', text: 'Pengacara : Panggung' },
      { id: 'D', text: 'Aktor : Film' },
      { id: 'E', text: 'Dokter : Rumah Sakit' }
    ],
    correctId: 'E',
    explanation: 'Hubungan profesi dan tempat bekerja. Guru bekerja di Sekolah, Dokter bekerja di Rumah Sakit.'
  },
  {
    type: 'Logika Aritmatika',
    difficulty: 'Hard',
    question: '0.875 : 0.25 + 0.44 = ...?',
    options: [
      { id: 'A', text: '3.50' },
      { id: 'B', text: '3.94' },
      { id: 'C', text: '4.25' },
      { id: 'D', text: '2.50' },
      { id: 'E', text: '3.44' }
    ],
    correctId: 'B',
    explanation: '0.875 = 7/8, 0.25 = 2/8. Maka 7/8 : 2/8 = 3.5. Kemudian 3.5 + 0.44 = 3.94'
  },
  {
    type: 'Logika Silogisme',
    difficulty: 'Medium',
    question: 'Semua anggota asosiasi harus hadir rapat. Sebagian dokter adalah anggota asosiasi. Simpulan?',
    options: [
      { id: 'A', text: 'Semua dokter harus hadir rapat' },
      { id: 'B', text: 'Sebagian dokter harus hadir rapat' },
      { id: 'C', text: 'Semua yang hadir rapat adalah dokter' },
      { id: 'D', text: 'Dokter tidak perlu hadir rapat' },
      { id: 'E', text: 'Tidak dapat disimpulkan' }
    ],
    correctId: 'B',
    explanation: 'Karena sebagian dokter adalah anggota asosiasi, dan semua anggota wajib rapat, maka sebagian dokter (yang jadi anggota) wajib rapat.'
  },
  {
    type: 'Logika Analitis',
    difficulty: 'Hard',
    question: 'Dalam antrian tiket: A ada di belakang B. C ada di depan B. D ada di belakang A. Siapa yang paling depan?',
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' },
      { id: 'D', text: 'D' },
      { id: 'E', text: 'Tidak bisa ditentukan' }
    ],
    correctId: 'C',
    explanation: 'Urutan: C - B - A - D. Maka C yang paling depan.'
  },
  {
    type: 'Tes Wawasan Kebangsaan',
    difficulty: 'Easy',
    question: 'Lambang negara Indonesia adalah?',
    options: [
      { id: 'A', text: 'Pancasila' },
      { id: 'B', text: 'Garuda Pancasila' },
      { id: 'C', text: 'UUD 1945' },
      { id: 'D', text: 'Bendera Merah Putih' },
      { id: 'E', text: 'Bhinneka Tunggal Ika' }
    ],
    correctId: 'B',
    explanation: 'Lambang negara adalah Garuda Pancasila dengan semboyan Bhinneka Tunggal Ika.'
  },
  {
    type: 'Soal Cerita Aritmatika',
    difficulty: 'Medium',
    question: 'Harga sebuah baju didiskon 20% menjadi Rp 160.000. Berapakah harga awal baju tersebut?',
    options: [
      { id: 'A', text: 'Rp 180.000' },
      { id: 'B', text: 'Rp 190.000' },
      { id: 'C', text: 'Rp 200.000' },
      { id: 'D', text: 'Rp 220.000' },
      { id: 'E', text: 'Rp 250.000' }
    ],
    correctId: 'C',
    explanation: 'Harga setelah diskon = 80% harga awal. 160.000 = 0.8 * X. Maka X = 160.000 / 0.8 = 200.000'
  },
  {
    type: 'Tes Karakteristik Pribadi',
    difficulty: 'Medium',
    question: 'Atasan Anda memberikan tugas yang mendadak saat Anda sedang mengerjakan tugas lain yang juga deadline. Sikap Anda?',
    options: [
      { id: 'A', text: 'Menolak tugas baru dengan tegas' },
      { id: 'B', text: 'Mengerjakan tugas baru dan mengabaikan tugas lama' },
      { id: 'C', text: 'Meminta rekan lain mengerjakan tugas baru tersebut' },
      { id: 'D', text: 'Menerima tugas baru, lalu menentukan prioritas pengerjaan berdasarkan deadline' },
      { id: 'E', text: 'Mengeluh kepada rekan kerja' }
    ],
    correctId: 'D',
    explanation: 'Menunjukkan profesionalisme, kemampuan manajemen waktu, dan skala prioritas yang baik.'
  },
  {
    type: 'Deret Angka',
    difficulty: 'Hard',
    question: '2, 3, 5, 8, 13, 21, ...?',
    options: [
      { id: 'A', text: '28' },
      { id: 'B', text: '30' },
      { id: 'C', text: '34' },
      { id: 'D', text: '35' },
      { id: 'E', text: '40' }
    ],
    correctId: 'C',
    explanation: 'Deret Fibonacci: angka selanjutnya adalah penjumlahan dua angka sebelumnya. 13 + 21 = 34'
  },
  {
    type: 'Penalaran Verbal - Antonim',
    difficulty: 'Easy',
    question: 'ABSURD >< ...?',
    options: [
      { id: 'A', text: 'Aneh' },
      { id: 'B', text: 'Masuk akal' },
      { id: 'C', text: 'Mustahil' },
      { id: 'D', text: 'Lucu' },
      { id: 'E', text: 'Kacau' }
    ],
    correctId: 'B',
    explanation: 'Absurd artinya tidak masuk akal atau mustahil. Lawan katanya adalah masuk akal atau rasional.'
  },
  {
    type: 'Figural',
    difficulty: 'Easy',
    question: 'Manakah yang tidak termasuk kelompoknya?',
    options: [
      { id: 'A', text: 'Kubus' },
      { id: 'B', text: 'Balok' },
      { id: 'C', text: 'Bola' },
      { id: 'D', text: 'Lingkaran' },
      { id: 'E', text: 'Tabung' }
    ],
    correctId: 'D',
    explanation: 'Lingkaran adalah bangun datar 2 dimensi, sedangkan yang lain adalah bangun ruang 3 dimensi.'
  },
  {
    type: 'Tes Wawasan Kebangsaan',
    difficulty: 'Hard',
    question: 'Dekrit Presiden 5 Juli 1959 menandai berlakunya kembali...',
    options: [
      { id: 'A', text: 'UUDS 1950' },
      { id: 'B', text: 'UUD 1945' },
      { id: 'C', text: 'Konstitusi RIS' },
      { id: 'D', text: 'UUD 1945 Amandemen' },
      { id: 'E', text: 'Piagam Jakarta' }
    ],
    correctId: 'B',
    explanation: 'Isi Dekrit Presiden salah satunya adalah menetapkan berlakunya kembali UUD 1945 dan tidak berlakunya UUDS 1950.'
  },
  {
    type: 'Logika Aritmatika',
    difficulty: 'Medium',
    question: 'Jika p = 3, q = 2, dan r = p^2 + 2pq + q^2, berapakah nilai r?',
    options: [
      { id: 'A', text: '10' },
      { id: 'B', text: '15' },
      { id: 'C', text: '20' },
      { id: 'D', text: '25' },
      { id: 'E', text: '30' }
    ],
    correctId: 'D',
    explanation: 'Rumus (p+q)^2. Jadi (3+2)^2 = 5^2 = 25.'
  },
  {
    type: 'Penalaran Verbal - Analogi',
    difficulty: 'Medium',
    question: 'AIR : UAP = ... : ...',
    options: [
      { id: 'A', text: 'Es : Air' },
      { id: 'B', text: 'Mendidih : Mencair' },
      { id: 'C', text: 'Kayu : Arang' },
      { id: 'D', text: 'Logam : Panas' },
      { id: 'E', text: 'Beku : Dingin' }
    ],
    correctId: 'A',
    explanation: 'Perubahan wujud benda. Air dipanaskan jadi uap, Es dipanaskan jadi air.'
  },
  {
    type: 'Logika Silogisme',
    difficulty: 'Hard',
    question: 'Semua wisatawan asing memiliki paspor. Sebagian orang yang memiliki paspor lancar berbahasa Inggris. Kesimpulan yang mungkin benar adalah?',
    options: [
      { id: 'A', text: 'Semua wisatawan asing lancar berbahasa Inggris' },
      { id: 'B', text: 'Sebagian wisatawan asing lancar berbahasa Inggris' },
      { id: 'C', text: 'Semua yang lancar bahasa Inggris adalah wisatawan asing' },
      { id: 'D', text: 'Tidak ada wisatawan asing yang lancar bahasa Inggris' },
      { id: 'E', text: 'Pemilik paspor pasti wisatawan asing' }
    ],
    correctId: 'B',
    explanation: 'Karena wisatawan asing pasti punya paspor, dan sebagian pemilik paspor lancar bahasa Inggris, maka ada kemungkinan (irisan) sebagian wisatawan asing lancar bahasa Inggris.'
  },
  {
    type: 'Soal Cerita Aritmatika',
    difficulty: 'Hard',
    question: 'Pekerja A dapat menyelesaikan rumah dalam 10 hari, B dalam 15 hari. Jika mereka bekerja bersama-sama, berapa hari pekerjaan selesai?',
    options: [
      { id: 'A', text: '4 hari' },
      { id: 'B', text: '5 hari' },
      { id: 'C', text: '6 hari' },
      { id: 'D', text: '7 hari' },
      { id: 'E', text: '8 hari' }
    ],
    correctId: 'C',
    explanation: 'Rumus gabungan: (AxB)/(A+B) = (10*15)/(10+15) = 150/25 = 6 hari.'
  },
  {
    type: 'Penalaran Verbal - Sinonim',
    difficulty: 'Medium',
    question: 'AGITASI = ...?',
    options: [
      { id: 'A', text: 'Perjanjian' },
      { id: 'B', text: 'Hasutan' },
      { id: 'C', text: 'Penolakan' },
      { id: 'D', text: 'Persetujuan' },
      { id: 'E', text: 'Perdebatan' }
    ],
    correctId: 'B',
    explanation: 'Agitasi adalah upaya untuk menggerakkan massa dengan cara menghasut atau membangkitkan emosi.'
  },
  {
    type: 'Tes Wawasan Kebangsaan',
    difficulty: 'Medium',
    question: 'Lembaga yang berwenang menguji undang-undang terhadap UUD 1945 adalah?',
    options: [
      { id: 'A', text: 'Mahkamah Agung' },
      { id: 'B', text: 'Mahkamah Konstitusi' },
      { id: 'C', text: 'Komisi Yudisial' },
      { id: 'D', text: 'DPR' },
      { id: 'E', text: 'MPR' }
    ],
    correctId: 'B',
    explanation: 'Mahkamah Konstitusi (MK) berwenang menguji UU terhadap UUD. Mahkamah Agung (MA) menguji peraturan di bawah UU terhadap UU.'
  },
  {
    type: 'Logika Aritmatika',
    difficulty: 'Easy',
    question: 'Berapakah 15% dari 200?',
    options: [
      { id: 'A', text: '20' },
      { id: 'B', text: '25' },
      { id: 'C', text: '30' },
      { id: 'D', text: '35' },
      { id: 'E', text: '40' }
    ],
    correctId: 'C',
    explanation: '15/100 x 200 = 15 x 2 = 30.'
  },
  {
    type: 'Tes Karakteristik Pribadi',
    difficulty: 'Medium',
    question: 'Rekan kerja Anda sering datang terlambat dan mengganggu kinerja tim. Sikap Anda?',
    options: [
      { id: 'A', text: 'Memarahinya di depan umum' },
      { id: 'B', text: 'Melaporkannya langsung ke atasan tanpa memberitahunya' },
      { id: 'C', text: 'Mengingatkannya secara personal agar lebih disiplin' },
      { id: 'D', text: 'Mendiamkannya karena itu bukan urusan saya' },
      { id: 'E', text: 'Ikut datang terlambat sebagai protes' }
    ],
    correctId: 'C',
    explanation: 'Menunjukkan integritas, kemampuan komunikasi, dan kepedulian terhadap tim tanpa menimbulkan konflik yang tidak perlu.'
  },
  {
    type: 'Logika Analitis',
    difficulty: 'Hard',
    question: 'Di meja bundar duduk 5 orang: A, B, C, D, E. A duduk di antara B dan E. C duduk di sebelah kanan B. Siapakah yang duduk di sebelah kiri E?',
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' },
      { id: 'D', text: 'D' },
      { id: 'E', text: 'Tidak ada' }
    ],
    correctId: 'D',
    explanation: 'Susunannya melingkar. Jika A diapit B dan E, dan C dikanan B, maka D pasti berada di antara C dan E (atau di kiri E).'
  },
  {
    type: 'Penalaran Verbal - Analogi',
    difficulty: 'Easy',
    question: 'TELEPON : PULSA = ... : ...',
    options: [
      { id: 'A', text: 'Televisi : Listrik' },
      { id: 'B', text: 'Motor : Bensin' },
      { id: 'C', text: 'Lampu : Cahaya' },
      { id: 'D', text: 'Kertas : Tinta' },
      { id: 'E', text: 'Radio : Suara' }
    ],
    correctId: 'B',
    explanation: 'Telepon membutuhkan pulsa untuk beroperasi (dalam konteks fungsi utamanya). Motor membutuhkan bensin untuk beroperasi.'
  }
  
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

console.log('-- STEP 1: Fix the sequence (if you get duplicate key error)');
console.log('-- Run this FIRST if you already have questions in your database:');
console.log('SELECT setval(\'questions_id_seq\', (SELECT MAX(id) FROM questions));\n');

console.log('-- STEP 2: Insert new questions');
console.log(generateSQL(newQuestions));

console.log(`\n-- Total new questions: ${newQuestions.length}`);
console.log('\n-- TROUBLESHOOTING:');
console.log('-- If you still get "duplicate key" error after running STEP 1:');
console.log('-- 1. Check current max ID: SELECT MAX(id) FROM questions;');
console.log('-- 2. Check sequence value: SELECT last_value FROM questions_id_seq;');
console.log('-- 3. If they don\'t match, run STEP 1 again');
console.log('\n-- See DOCS_FOR_INTERNAL/FIX_SEQUENCE.md for detailed explanation.');
