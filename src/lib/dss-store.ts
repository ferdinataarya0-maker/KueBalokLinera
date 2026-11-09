'use client';

import { useEffect, useSyncExternalStore } from 'react';
import {
  mockAlternatives,
  mockCriteria,
  mockSubCriteria,
  mockAssessments,
  type Alternative,
  type Criteria,
  type SubCriteria,
  type Assessment,
} from './dss-data';

export interface Activity {
  id: string;
  time: string; // ISO
  by: string;
  text: string;
}

export interface DSSState {
  alternatives: Alternative[];
  criteria: Criteria[];
  subCriteria: SubCriteria[];
  assessments: Assessment[];
  lambda: number;
  activities: Activity[];
}

// Backend integration point: ganti localStorage dengan query/mutation Supabase di hook ini saja.
// v2: data penelitian Kue Balok Linera (10 varian, 4 kriteria, bobot mentah). Kunci lama (v1) berisi data contoh
// dengan bobot persen sehingga tidak kompatibel; dihapus agar data lama tidak muncul lagi.
const KEY = 'lineradss:data:v2';
const LEGACY_KEYS = ['lineradss:data:v1'];

function seed(): DSSState {
  const now = Date.now();
  return {
    alternatives: mockAlternatives.map((a) => ({ ...a })),
    criteria: mockCriteria.map((c) => ({ ...c })),
    subCriteria: mockSubCriteria.map((s) => ({ ...s })),
    assessments: mockAssessments.map((a) => ({ ...a })),
    lambda: 0.5,
    activities: [
      { id: 'act-1', time: new Date(now).toISOString(), by: 'Sistem', text: 'Memuat data penelitian dari spk.xlsx (10 varian, 4 kriteria, 40 penilaian)' },
    ],
  };
}

// Store tunggal yang dibagi semua komponen (useSyncExternalStore) supaya perubahan data admin —
// bobot, penilaian, λ, dsb. — langsung memperbarui seluruh halaman (SAW, WASPAS, ranking, owner)
// tanpa perlu memuat ulang. Sinkron antar-tab lewat event 'storage'.
interface Snapshot { state: DSSState; ready: boolean }

const SERVER_SNAPSHOT: Snapshot = { state: seed(), ready: false };
let snapshot: Snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();
let storageBound = false;

const emit = () => listeners.forEach((l) => l());

function persist(state: DSSState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

function load(): DSSState {
  try {
    LEGACY_KEYS.forEach((k) => window.localStorage.removeItem(k));
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...seed(), ...(JSON.parse(raw) as Partial<DSSState>) };
  } catch {}
  return seed();
}

function ensureHydrated() {
  if (snapshot.ready || typeof window === 'undefined') return;
  snapshot = { state: load(), ready: true };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!storageBound && typeof window !== 'undefined') {
    storageBound = true;
    window.addEventListener('storage', (e) => {
      if (e.key !== KEY) return;
      snapshot = { state: load(), ready: true };
      emit();
    });
  }
  return () => { listeners.delete(listener); };
}

function update(updater: (s: DSSState) => DSSState, log?: string) {
  let next = updater(snapshot.state);
  if (log) {
    next = {
      ...next,
      activities: [
        { id: `act-${Date.now()}`, time: new Date().toISOString(), by: 'Admin Linera', text: log },
        ...next.activities,
      ].slice(0, 50),
    };
  }
  persist(next);
  snapshot = { state: next, ready: true };
  emit();
}

function reset() {
  const fresh = seed();
  persist(fresh);
  snapshot = { state: fresh, ready: true };
  emit();
}

export function useDSSData() {
  const snap = useSyncExternalStore(subscribe, () => snapshot, () => SERVER_SNAPSHOT);
  useEffect(() => { ensureHydrated(); }, []);
  return { ...snap.state, ready: snap.ready, update, reset };
}

export function nextId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}
