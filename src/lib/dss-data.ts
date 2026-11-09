// Backend integration point: Replace all mock data with Supabase queries
// import { createClient } from '@supabase/supabase-js';

export interface Alternative {
  id: string;
  kode: string;
  nama: string;
  harga: number;
  deskripsi: string;
}

export interface Criteria {
  id: string;
  kode: string;
  nama: string;
  jenis: 'BENEFIT' | 'COST';
  bobot: number; // bobot kepentingan mentah (mis. 5, 4, 4, 3); dinormalisasi = bobot / Σ bobot
  // Opsional: jumlah desimal untuk memotong (TRUNC, bukan pembulatan) hasil normalisasi kriteria ini.
  // Excel penelitian memakai TRUNC(x/max, 2) hanya pada Jumlah Penjualan. Kosong = tanpa pemotongan.
  truncateDecimals?: number;
}

export interface SubCriteria {
  id: string;
  criteriaId: string;
  label: string;
  nilai: number; // skala nilai (mis. 1–5)
  keterangan: string;
}

export interface Assessment {
  id: string;
  alternativeId: string;
  criteriaId: string;
  nilai: number;
}

export interface SAWResult {
  alternativeId: string;
  kode: string;
  nama: string;
  normalizedValues: Record<string, number>;
  weightedValues: Record<string, number>;
  nilaiSAW: number;
  ranking: number;
}

export interface WASPASResult {
  alternativeId: string;
  kode: string;
  nama: string;
  normalizedValues: Record<string, number>;
  wsm: number;
  wpm: number;
  nilaiQ: number;
  ranking: number;
}

export interface ComparisonResult {
  alternativeId: string;
  kode: string;
  nama: string;
  nilaiSAW: number;
  rankingSAW: number;
  nilaiWASPAS: number;
  rankingWASPAS: number;
}

// ── DATA PENELITIAN ───────────────────────────────────────────────────────────
// Sumber: spk.xlsx (sheet SAW) — SPK Pemilihan Varian Kue Balok Terlaris, Usaha Kue Balok Linera.
// Backend integration point: fetch from Supabase table 'alternatives'
export const mockAlternatives: Alternative[] = [
  { id: 'alt-001', kode: 'A1', nama: 'Original', harga: 15000, deskripsi: '' },
  { id: 'alt-002', kode: 'A2', nama: 'Oreo', harga: 20000, deskripsi: '' },
  { id: 'alt-003', kode: 'A3', nama: 'Red Velvet Crunchy', harga: 20000, deskripsi: '' },
  { id: 'alt-004', kode: 'A4', nama: 'Almond', harga: 20000, deskripsi: '' },
  { id: 'alt-005', kode: 'A5', nama: 'Coklat Crunchy', harga: 20000, deskripsi: '' },
  { id: 'alt-006', kode: 'A6', nama: 'Keju', harga: 20000, deskripsi: '' },
  { id: 'alt-007', kode: 'A7', nama: 'Taro Glaz', harga: 18000, deskripsi: '' },
  { id: 'alt-008', kode: 'A8', nama: 'Tiramisu Glaz', harga: 18000, deskripsi: '' },
  { id: 'alt-009', kode: 'A9', nama: 'Greentea Glaz', harga: 18000, deskripsi: '' },
  { id: 'alt-010', kode: 'A10', nama: 'Strawberry Glaz', harga: 18000, deskripsi: '' },
];

// Bobot mentah sesuai Excel (total 16) → normalisasi: 5/16 = 0,3125 · 4/16 = 0,25 · 4/16 = 0,25 · 3/16 = 0,1875
// Backend integration point: fetch from Supabase table 'criteria'
export const mockCriteria: Criteria[] = [
  { id: 'crit-001', kode: 'C1', nama: 'Jumlah Penjualan', jenis: 'BENEFIT', bobot: 5, truncateDecimals: 2 }, // sesuai Excel: =TRUNC(x/max;2)
  { id: 'crit-002', kode: 'C2', nama: 'Minat Pembeli', jenis: 'BENEFIT', bobot: 4 },
  { id: 'crit-003', kode: 'C3', nama: 'Kualitas Rasa', jenis: 'BENEFIT', bobot: 4 },
  { id: 'crit-004', kode: 'C4', nama: 'Harga Jual', jenis: 'COST', bobot: 3 },
];

// Sub kriteria hanya untuk kriteria berskala 1–5 (Minat Pembeli, Kualitas Rasa).
// Label sengaja netral ('Skala N') karena Excel tidak memuat arti tiap skala; admin dapat mengubahnya.
// Jumlah Penjualan dan Harga Jual memakai angka asli sehingga tidak punya sub kriteria.
// Backend integration point: fetch from Supabase table 'sub_criteria'
export const mockSubCriteria: SubCriteria[] = [
  { id: 'sub-001', criteriaId: 'crit-002', label: 'Skala 5', nilai: 5, keterangan: '' },
  { id: 'sub-002', criteriaId: 'crit-002', label: 'Skala 4', nilai: 4, keterangan: '' },
  { id: 'sub-003', criteriaId: 'crit-002', label: 'Skala 3', nilai: 3, keterangan: '' },
  { id: 'sub-004', criteriaId: 'crit-002', label: 'Skala 2', nilai: 2, keterangan: '' },
  { id: 'sub-005', criteriaId: 'crit-002', label: 'Skala 1', nilai: 1, keterangan: '' },
  { id: 'sub-006', criteriaId: 'crit-003', label: 'Skala 5', nilai: 5, keterangan: '' },
  { id: 'sub-007', criteriaId: 'crit-003', label: 'Skala 4', nilai: 4, keterangan: '' },
  { id: 'sub-008', criteriaId: 'crit-003', label: 'Skala 3', nilai: 3, keterangan: '' },
  { id: 'sub-009', criteriaId: 'crit-003', label: 'Skala 2', nilai: 2, keterangan: '' },
  { id: 'sub-010', criteriaId: 'crit-003', label: 'Skala 1', nilai: 1, keterangan: '' },
];

// Backend integration point: fetch from Supabase table 'assessments'
export const mockAssessments: Assessment[] = [
  // A1 Original
  { id: 'ass-001', alternativeId: 'alt-001', criteriaId: 'crit-001', nilai: 280 },
  { id: 'ass-002', alternativeId: 'alt-001', criteriaId: 'crit-002', nilai: 4 },
  { id: 'ass-003', alternativeId: 'alt-001', criteriaId: 'crit-003', nilai: 4 },
  { id: 'ass-004', alternativeId: 'alt-001', criteriaId: 'crit-004', nilai: 15000 },
  // A2 Oreo
  { id: 'ass-005', alternativeId: 'alt-002', criteriaId: 'crit-001', nilai: 110 },
  { id: 'ass-006', alternativeId: 'alt-002', criteriaId: 'crit-002', nilai: 3 },
  { id: 'ass-007', alternativeId: 'alt-002', criteriaId: 'crit-003', nilai: 4 },
  { id: 'ass-008', alternativeId: 'alt-002', criteriaId: 'crit-004', nilai: 20000 },
  // A3 Red Velvet Crunchy
  { id: 'ass-009', alternativeId: 'alt-003', criteriaId: 'crit-001', nilai: 95 },
  { id: 'ass-010', alternativeId: 'alt-003', criteriaId: 'crit-002', nilai: 2 },
  { id: 'ass-011', alternativeId: 'alt-003', criteriaId: 'crit-003', nilai: 4 },
  { id: 'ass-012', alternativeId: 'alt-003', criteriaId: 'crit-004', nilai: 20000 },
  // A4 Almond
  { id: 'ass-013', alternativeId: 'alt-004', criteriaId: 'crit-001', nilai: 105 },
  { id: 'ass-014', alternativeId: 'alt-004', criteriaId: 'crit-002', nilai: 4 },
  { id: 'ass-015', alternativeId: 'alt-004', criteriaId: 'crit-003', nilai: 4 },
  { id: 'ass-016', alternativeId: 'alt-004', criteriaId: 'crit-004', nilai: 20000 },
  // A5 Coklat Crunchy
  { id: 'ass-017', alternativeId: 'alt-005', criteriaId: 'crit-001', nilai: 400 },
  { id: 'ass-018', alternativeId: 'alt-005', criteriaId: 'crit-002', nilai: 5 },
  { id: 'ass-019', alternativeId: 'alt-005', criteriaId: 'crit-003', nilai: 5 },
  { id: 'ass-020', alternativeId: 'alt-005', criteriaId: 'crit-004', nilai: 20000 },
  // A6 Keju
  { id: 'ass-021', alternativeId: 'alt-006', criteriaId: 'crit-001', nilai: 250 },
  { id: 'ass-022', alternativeId: 'alt-006', criteriaId: 'crit-002', nilai: 3 },
  { id: 'ass-023', alternativeId: 'alt-006', criteriaId: 'crit-003', nilai: 4 },
  { id: 'ass-024', alternativeId: 'alt-006', criteriaId: 'crit-004', nilai: 20000 },
  // A7 Taro Glaz
  { id: 'ass-025', alternativeId: 'alt-007', criteriaId: 'crit-001', nilai: 90 },
  { id: 'ass-026', alternativeId: 'alt-007', criteriaId: 'crit-002', nilai: 2 },
  { id: 'ass-027', alternativeId: 'alt-007', criteriaId: 'crit-003', nilai: 3 },
  { id: 'ass-028', alternativeId: 'alt-007', criteriaId: 'crit-004', nilai: 18000 },
  // A8 Tiramisu Glaz
  { id: 'ass-029', alternativeId: 'alt-008', criteriaId: 'crit-001', nilai: 220 },
  { id: 'ass-030', alternativeId: 'alt-008', criteriaId: 'crit-002', nilai: 3 },
  { id: 'ass-031', alternativeId: 'alt-008', criteriaId: 'crit-003', nilai: 4 },
  { id: 'ass-032', alternativeId: 'alt-008', criteriaId: 'crit-004', nilai: 18000 },
  // A9 Greentea Glaz
  { id: 'ass-033', alternativeId: 'alt-009', criteriaId: 'crit-001', nilai: 210 },
  { id: 'ass-034', alternativeId: 'alt-009', criteriaId: 'crit-002', nilai: 3 },
  { id: 'ass-035', alternativeId: 'alt-009', criteriaId: 'crit-003', nilai: 3 },
  { id: 'ass-036', alternativeId: 'alt-009', criteriaId: 'crit-004', nilai: 18000 },
  // A10 Strawberry Glaz
  { id: 'ass-037', alternativeId: 'alt-010', criteriaId: 'crit-001', nilai: 80 },
  { id: 'ass-038', alternativeId: 'alt-010', criteriaId: 'crit-002', nilai: 2 },
  { id: 'ass-039', alternativeId: 'alt-010', criteriaId: 'crit-003', nilai: 3 },
  { id: 'ass-040', alternativeId: 'alt-010', criteriaId: 'crit-004', nilai: 18000 },
];

// ── CALCULATION FUNCTIONS ─────────────────────────────────────────────────────

/** Total bobot mentah seluruh kriteria (Excel: 5 + 4 + 4 + 3 = 16). */
export function totalBobot(criteria: Criteria[]): number {
  return criteria.reduce((s, c) => s + (Number.isFinite(c.bobot) ? c.bobot : 0), 0);
}

/** Bobot ternormalisasi Wj = bobot / Σ bobot (Excel: 0,3125 · 0,25 · 0,25 · 0,1875). */
export function normalizedWeight(crit: Criteria, criteria: Criteria[]): number {
  const total = totalBobot(criteria);
  return total > 0 ? crit.bobot / total : 0;
}

/** Kriteria harga ditampilkan dalam Rupiah (dikenali dari namanya, bukan dari kode). */
export function isPriceCriteria(crit: { nama: string }): boolean {
  return /harga/i.test(crit.nama);
}

export function getAssessmentMatrix(
  alternatives: Alternative[],
  criteria: Criteria[],
  assessments: Assessment[]
): Record<string, Record<string, number>> {
  const matrix: Record<string, Record<string, number>> = {};
  for (const alt of alternatives) {
    matrix[alt.id] = {};
    for (const crit of criteria) {
      const ass = assessments.find(
        (a) => a.alternativeId === alt.id && a.criteriaId === crit.id
      );
      matrix[alt.id][crit.id] = ass ? ass.nilai : 0;
    }
  }
  return matrix;
}

/** Memotong (bukan membulatkan) ke d desimal, seperti TRUNC() di Excel. d kosong/tidak valid = tanpa pemotongan. */
export function truncateTo(value: number, d?: number): number {
  if (d === undefined || !Number.isInteger(d) || d < 0 || d > 10) return value;
  const f = Math.pow(10, d);
  return Math.trunc(value * f + 1e-9) / f;
}

export function normalizeSAW(
  alternatives: Alternative[],
  criteria: Criteria[],
  matrix: Record<string, Record<string, number>>
): Record<string, Record<string, number>> {
  const normalized: Record<string, Record<string, number>> = {};

  for (const alt of alternatives) {
    normalized[alt.id] = {};
  }

  for (const crit of criteria) {
    const values = alternatives.map((alt) => matrix[alt.id][crit.id]);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);

    for (const alt of alternatives) {
      const xij = matrix[alt.id][crit.id];
      let r: number;
      if (crit.jenis === 'BENEFIT') {
        r = maxVal !== 0 ? xij / maxVal : 0;
      } else {
        // COST
        r = xij !== 0 ? minVal / xij : 0;
      }
      normalized[alt.id][crit.id] = truncateTo(r, crit.truncateDecimals);
    }
  }

  return normalized;
}

export function calculateSAW(
  alternatives: Alternative[],
  criteria: Criteria[],
  assessments: Assessment[]
): SAWResult[] {
  const matrix = getAssessmentMatrix(alternatives, criteria, assessments);
  const normalized = normalizeSAW(alternatives, criteria, matrix);

  const results: SAWResult[] = alternatives.map((alt) => {
    const weightedValues: Record<string, number> = {};
    let nilaiSAW = 0;

    for (const crit of criteria) {
      const w = normalizedWeight(crit, criteria); // Wj = bobot / Σ bobot
      const r = normalized[alt.id][crit.id];
      weightedValues[crit.id] = w * r;
      nilaiSAW += w * r;
    }

    return {
      alternativeId: alt.id,
      kode: alt.kode,
      nama: alt.nama,
      normalizedValues: normalized[alt.id],
      weightedValues,
      nilaiSAW,
      ranking: 0,
    };
  });

  // Sort descending dan assign ranking
  results.sort((a, b) => b.nilaiSAW - a.nilaiSAW);
  results.forEach((r, i) => { r.ranking = i + 1; });

  return results;
}

export function calculateWSM(
  alternatives: Alternative[],
  criteria: Criteria[],
  normalized: Record<string, Record<string, number>>
): Record<string, number> {
  const wsm: Record<string, number> = {};
  for (const alt of alternatives) {
    let sum = 0;
    for (const crit of criteria) {
      const w = normalizedWeight(crit, criteria);
      sum += w * normalized[alt.id][crit.id];
    }
    wsm[alt.id] = sum;
  }
  return wsm;
}

export function calculateWPM(
  alternatives: Alternative[],
  criteria: Criteria[],
  normalized: Record<string, Record<string, number>>
): Record<string, number> {
  const wpm: Record<string, number> = {};
  for (const alt of alternatives) {
    let product = 1;
    for (const crit of criteria) {
      const w = normalizedWeight(crit, criteria);
      const r = normalized[alt.id][crit.id];
      product *= Math.pow(r, w); // WPM murni: Π (rij ^ Wj), tanpa nilai pengganti
    }
    wpm[alt.id] = product;
  }
  return wpm;
}

export function calculateWASPAS(
  alternatives: Alternative[],
  criteria: Criteria[],
  assessments: Assessment[],
  lambda: number = 0.5
): WASPASResult[] {
  const matrix = getAssessmentMatrix(alternatives, criteria, assessments);
  const normalized = normalizeSAW(alternatives, criteria, matrix);
  const wsm = calculateWSM(alternatives, criteria, normalized);
  const wpm = calculateWPM(alternatives, criteria, normalized);

  const results: WASPASResult[] = alternatives.map((alt) => {
    const Q = lambda * wsm[alt.id] + (1 - lambda) * wpm[alt.id];
    return {
      alternativeId: alt.id,
      kode: alt.kode,
      nama: alt.nama,
      normalizedValues: normalized[alt.id],
      wsm: wsm[alt.id],
      wpm: wpm[alt.id],
      nilaiQ: Q,
      ranking: 0,
    };
  });

  results.sort((a, b) => b.nilaiQ - a.nilaiQ);
  results.forEach((r, i) => { r.ranking = i + 1; });

  return results;
}

export function generateComparison(
  sawResults: SAWResult[],
  waspasResults: WASPASResult[]
): ComparisonResult[] {
  return sawResults.map((saw) => {
    const wasp = waspasResults.find((w) => w.alternativeId === saw.alternativeId);
    return {
      alternativeId: saw.alternativeId,
      kode: saw.kode,
      nama: saw.nama,
      nilaiSAW: saw.nilaiSAW,
      rankingSAW: saw.ranking,
      nilaiWASPAS: wasp ? wasp.nilaiQ : 0,
      rankingWASPAS: wasp ? wasp.ranking : 0,
    };
  });
}

export function formatNumber(n: number, decimals: number = 4): string {
  return n.toFixed(decimals);
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);
}