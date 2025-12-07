import type { QuestionData } from './types';

/**
 * Mock question data for development and testing
 */
export const mockQuestions: QuestionData[] = [
  {
    id: 1,
    type: "Logika Aritmatika",
    difficulty: "Medium",
    question: "Jika X > Y dan Y > Z, manakah pernyataan yang pasti benar?",
    options: [
      { id: "A", text: "X < Z" },
      { id: "B", text: "X = Z" },
      { id: "C", text: "X > Z" },
      { id: "D", text: "X ≤ Z" },
      { id: "E", text: "Tidak dapat ditentukan" }
    ],
    correctId: "C",
    explanation: "Karena X > Y dan Y > Z, maka berdasarkan sifat transitif, X pasti lebih besar dari Z (X > Z). Ini adalah prinsip dasar dalam logika matematika."
  },
  {
    id: 2,
    type: "Penalaran Verbal",
    difficulty: "Easy",
    question: "Semua kucing adalah mamalia. Semua mamalia bernapas dengan paru-paru. Kesimpulan yang tepat adalah?",
    options: [
      { id: "A", text: "Semua hewan bernapas dengan paru-paru" },
      { id: "B", text: "Semua kucing bernapas dengan paru-paru" },
      { id: "C", text: "Beberapa mamalia adalah kucing" },
      { id: "D", text: "Tidak ada kucing yang bernapas dengan insang" },
      { id: "E", text: "Semua hewan adalah mamalia" }
    ],
    correctId: "B",
    explanation: "Dari premis 'Semua kucing adalah mamalia' dan 'Semua mamalia bernapas dengan paru-paru', kita dapat menyimpulkan bahwa 'Semua kucing bernapas dengan paru-paru' menggunakan silogisme kategorikal."
  },
  {
    id: 3,
    type: "Deret Angka",
    difficulty: "Hard",
    question: "Tentukan angka berikutnya dalam deret: 2, 6, 12, 20, 30, ?",
    options: [
      { id: "A", text: "38" },
      { id: "B", text: "40" },
      { id: "C", text: "42" },
      { id: "D", text: "44" },
      { id: "E", text: "46" }
    ],
    correctId: "C",
    explanation: "Pola deret ini adalah n × (n + 1), di mana n dimulai dari 1. Jadi: 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42. Angka berikutnya adalah 42."
  },
  {
    id: 4,
    type: "Logika Aritmatika",
    difficulty: "Easy",
    question: "Sebuah toko memberikan diskon 20% untuk semua barang. Jika harga sebuah buku setelah diskon adalah Rp 40.000, berapa harga asli buku tersebut?",
    options: [
      { id: "A", text: "Rp 45.000" },
      { id: "B", text: "Rp 48.000" },
      { id: "C", text: "Rp 50.000" },
      { id: "D", text: "Rp 52.000" },
      { id: "E", text: "Rp 60.000" }
    ],
    correctId: "C",
    explanation: "Jika diskon 20%, maka harga setelah diskon adalah 80% dari harga asli. Jadi: 80% × harga asli = Rp 40.000. Harga asli = Rp 40.000 ÷ 0,8 = Rp 50.000."
  },
  {
    id: 5,
    type: "Penalaran Verbal",
    difficulty: "Medium",
    question: "Tidak ada politisi yang jujur. Beberapa pengusaha adalah politisi. Kesimpulan yang tepat adalah?",
    options: [
      { id: "A", text: "Semua pengusaha tidak jujur" },
      { id: "B", text: "Beberapa pengusaha tidak jujur" },
      { id: "C", text: "Tidak ada pengusaha yang jujur" },
      { id: "D", text: "Semua politisi adalah pengusaha" },
      { id: "E", text: "Beberapa orang jujur adalah pengusaha" }
    ],
    correctId: "B",
    explanation: "Dari 'Tidak ada politisi yang jujur' dan 'Beberapa pengusaha adalah politisi', kita dapat menyimpulkan bahwa beberapa pengusaha (yang merupakan politisi) tidak jujur. Ini adalah silogisme dengan premis negatif universal."
  },
  {
    id: 6,
    type: "Deret Angka",
    difficulty: "Easy",
    question: "Tentukan angka berikutnya dalam deret: 5, 10, 15, 20, 25, ?",
    options: [
      { id: "A", text: "28" },
      { id: "B", text: "30" },
      { id: "C", text: "32" },
      { id: "D", text: "35" },
      { id: "E", text: "40" }
    ],
    correctId: "B",
    explanation: "Ini adalah deret aritmatika dengan beda 5. Setiap angka bertambah 5 dari angka sebelumnya. Jadi: 25 + 5 = 30."
  },
  {
    id: 7,
    type: "Logika Aritmatika",
    difficulty: "Hard",
    question: "Dalam sebuah kelas, rasio siswa laki-laki dan perempuan adalah 3:5. Jika ada 12 siswa laki-laki, berapa total siswa di kelas tersebut?",
    options: [
      { id: "A", text: "20 siswa" },
      { id: "B", text: "24 siswa" },
      { id: "C", text: "28 siswa" },
      { id: "D", text: "32 siswa" },
      { id: "E", text: "36 siswa" }
    ],
    correctId: "D",
    explanation: "Rasio 3:5 berarti untuk setiap 3 laki-laki ada 5 perempuan. Jika 3 bagian = 12 siswa, maka 1 bagian = 4 siswa. Total = 3 + 5 = 8 bagian = 8 × 4 = 32 siswa."
  },
  {
    id: 8,
    type: "Penalaran Verbal",
    difficulty: "Hard",
    question: "Semua dokter adalah sarjana. Tidak ada sarjana yang miskin. Sebagian dokter adalah peneliti. Kesimpulan yang PASTI SALAH adalah?",
    options: [
      { id: "A", text: "Semua dokter tidak miskin" },
      { id: "B", text: "Sebagian peneliti tidak miskin" },
      { id: "C", text: "Sebagian peneliti adalah sarjana" },
      { id: "D", text: "Semua peneliti adalah dokter" },
      { id: "E", text: "Tidak ada dokter yang miskin" }
    ],
    correctId: "D",
    explanation: "Dari premis yang diberikan, kita tahu 'Sebagian dokter adalah peneliti', tetapi ini tidak berarti 'Semua peneliti adalah dokter'. Pernyataan D pasti salah karena membalik hubungan sebagian menjadi semua."
  },
  {
    id: 9,
    type: "Deret Angka",
    difficulty: "Medium",
    question: "Tentukan angka berikutnya dalam deret: 1, 4, 9, 16, 25, ?",
    options: [
      { id: "A", text: "30" },
      { id: "B", text: "32" },
      { id: "C", text: "34" },
      { id: "D", text: "36" },
      { id: "E", text: "40" }
    ],
    correctId: "D",
    explanation: "Ini adalah deret kuadrat sempurna: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36. Angka berikutnya adalah 36."
  },
  {
    id: 10,
    type: "Logika Aritmatika",
    difficulty: "Medium",
    question: "Sebuah mobil menempuh jarak 180 km dalam waktu 3 jam. Jika kecepatan ditingkatkan 20 km/jam, berapa waktu yang dibutuhkan untuk menempuh jarak yang sama?",
    options: [
      { id: "A", text: "2 jam" },
      { id: "B", text: "2,25 jam" },
      { id: "C", text: "2,5 jam" },
      { id: "D", text: "2,75 jam" },
      { id: "E", text: "3 jam" }
    ],
    correctId: "B",
    explanation: "Kecepatan awal = 180 km ÷ 3 jam = 60 km/jam. Kecepatan baru = 60 + 20 = 80 km/jam. Waktu baru = 180 km ÷ 80 km/jam = 2,25 jam."
  }
];

/**
 * Get a single mock question by ID
 */
export const getMockQuestionById = (id: number): QuestionData | undefined => {
  return mockQuestions.find(q => q.id === id);
};

/**
 * Get a random mock question
 */
export const getRandomMockQuestion = (): QuestionData => {
  const randomIndex = Math.floor(Math.random() * mockQuestions.length);
  return mockQuestions[randomIndex];
};
