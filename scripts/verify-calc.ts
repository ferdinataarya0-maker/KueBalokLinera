// Uji kesesuaian perhitungan dengan spk.xlsx (sheet SAW).
// Jalankan: npx tsx scripts/verify-calc.ts
import {
  mockAlternatives, mockCriteria, mockAssessments,
  calculateSAW, calculateWASPAS, normalizedWeight, totalBobot,
} from '../src/lib/dss-data';

const EXCEL_SAW: Record<string, number> = {
  'Coklat Crunchy': 0.953125, 'Original': 0.80625, 'Keju': 0.684375, 'Tiramisu Glaz': 0.678125,
  'Almond': 0.621875, 'Greentea Glaz': 0.61875, 'Oreo': 0.575, 'Red Velvet Crunchy': 0.5125,
  'Taro Glaz': 0.475, 'Strawberry Glaz': 0.46875,
};
const EXCEL_ORDER = Object.keys(EXCEL_SAW);
const EXCEL_WEIGHTS = [0.3125, 0.25, 0.25, 0.1875];
const EPS = 1e-9;
let fail = 0;
const check = (ok: boolean, msg: string) => { if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); };

check(mockAlternatives.length === 10, '10 alternatif');
check(mockCriteria.length === 4, '4 kriteria');
check(totalBobot(mockCriteria) === 16, 'total bobot = 16');
mockCriteria.forEach((c, i) => check(Math.abs(normalizedWeight(c, mockCriteria) - EXCEL_WEIGHTS[i]) < EPS, `bobot normalisasi ${c.kode} = ${EXCEL_WEIGHTS[i]}`));

const saw = calculateSAW(mockAlternatives, mockCriteria, mockAssessments);
saw.forEach((r) => check(Math.abs(r.nilaiSAW - EXCEL_SAW[r.nama]) < EPS, `SAW ${r.nama}: ${r.nilaiSAW} vs Excel ${EXCEL_SAW[r.nama]}`));
check(saw.map((r) => r.nama).join('|') === EXCEL_ORDER.join('|'), 'urutan ranking SAW sama dengan Excel');

const wp = calculateWASPAS(mockAlternatives, mockCriteria, mockAssessments, 0.5);
// WSM harus identik dengan SAW; WPM = Π r^w; Q = 0.5·WSM + 0.5·WPM (dihitung ulang mandiri di sini)
wp.forEach((r) => {
  const s = saw.find((x) => x.alternativeId === r.alternativeId)!;
  let prod = 1;
  mockCriteria.forEach((c) => { prod *= Math.pow(s.normalizedValues[c.id], normalizedWeight(c, mockCriteria)); });
  check(Math.abs(r.wsm - s.nilaiSAW) < EPS, `WSM = SAW untuk ${r.nama}`);
  check(Math.abs(r.wpm - prod) < EPS, `WPM ${r.nama}`);
  check(Math.abs(r.nilaiQ - (0.5 * r.wsm + 0.5 * r.wpm)) < EPS, `Q ${r.nama}`);
});
// Tanpa TRUNC (rumus murni x/max) urutan SAW harus tetap sama dengan Excel
const exact = calculateSAW(mockAlternatives, mockCriteria.map((c) => ({ ...c, truncateDecimals: undefined })), mockAssessments);
check(exact.map((r) => r.nama).join('|') === EXCEL_ORDER.join('|'), 'tanpa TRUNC: urutan ranking SAW tetap sama dengan Excel');
console.log('\nRanking WASPAS (λ = 0,5):');
wp.forEach((r) => console.log(`${r.ranking}. ${r.nama.padEnd(20)} WSM ${r.wsm.toFixed(6)}  WPM ${r.wpm.toFixed(6)}  Q ${r.nilaiQ.toFixed(6)}`));
const w1 = calculateWASPAS(mockAlternatives, mockCriteria, mockAssessments, 1);
check(w1.every((r, i) => r.nama === saw[i].nama), 'λ = 1 → urutan WASPAS = SAW');

// ── Skenario perubahan data admin: hasil harus ikut berubah otomatis ─────────
const byName = (n: string) => mockAlternatives.find((a) => a.nama === n)!;
const sales = mockCriteria.find((c) => c.kode === 'C1')!;

// 1) Oreo menjadi 500 penjualan → menjadi max baru, Coklat Crunchy dinormalisasi ulang (400/500 = 0,8)
const a1 = mockAssessments.map((x) => (x.alternativeId === byName('Oreo').id && x.criteriaId === sales.id ? { ...x, nilai: 500 } : x));
const s1 = calculateSAW(mockAlternatives, mockCriteria, a1);
check(Math.abs(s1.find((r) => r.nama === 'Coklat Crunchy')!.normalizedValues[sales.id] - 0.8) < EPS, 'ubah penjualan Oreo=500 → normalisasi Coklat Crunchy C1 = 0,8');
check(s1.find((r) => r.nama === 'Oreo')!.nilaiSAW > 0.5765625, 'nilai SAW Oreo naik setelah penjualan diubah');

// 2) Hapus varian termurah (Original, harga min 15000) → min Harga Jual berubah jadi 18000
const alts2 = mockAlternatives.filter((a) => a.nama !== 'Original');
const s2 = calculateSAW(alts2, mockCriteria, mockAssessments);
const price = mockCriteria.find((c) => c.kode === 'C4')!;
check(s2.length === 9 && Math.abs(s2.find((r) => r.nama === 'Taro Glaz')!.normalizedValues[price.id] - 1) < EPS, 'hapus varian Original → 9 varian, normalisasi Harga Jual dihitung ulang (min=18000)');

// 3) Ubah bobot C1 dari 5 menjadi 1 → total 12, Wj C1 = 1/12
const crit3 = mockCriteria.map((c) => (c.kode === 'C1' ? { ...c, bobot: 1 } : c));
check(Math.abs(normalizedWeight(crit3[0], crit3) - 1 / 12) < EPS && Math.abs(crit3.reduce((t, c) => t + normalizedWeight(c, crit3), 0) - 1) < EPS, 'ubah bobot C1=1 → Wj = 1/12 dan ΣWj tetap 1');

// 4) Lambda berbeda → Q berubah sesuai rumus; λ=0 → Q = WPM
const w0 = calculateWASPAS(mockAlternatives, mockCriteria, mockAssessments, 0);
check(w0.every((r) => Math.abs(r.nilaiQ - r.wpm) < EPS), 'λ = 0 → Q = WPM');
const w1b = calculateWASPAS(mockAlternatives, mockCriteria, mockAssessments, 1);
check(w1b.every((r) => Math.abs(r.nilaiQ - r.wsm) < EPS), 'λ = 1 → Q = WSM');

// 5) Pemenang selalu = nilai tertinggi (tidak ditetapkan manual)
check(wp[0].nilaiQ === Math.max(...wp.map((r) => r.nilaiQ)) && saw[0].nilaiSAW === Math.max(...saw.map((r) => r.nilaiSAW)), 'peringkat 1 = nilai preferensi tertinggi pada kedua metode');
console.log(fail ? `\n${fail} pengujian GAGAL` : '\nSemua pengujian LULUS');
process.exit(fail ? 1 : 0);
