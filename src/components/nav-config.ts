import type React from 'react';
import {
  LayoutDashboard, Cookie, Sliders, ClipboardList, Calculator, BarChart3, FileSpreadsheet, Settings,
  Trophy, FileText, History, Scale, TrendingUp, Table2, User, Layers,
} from 'lucide-react';
import type { Role } from '@/lib/auth';

export interface NavChild { id: string; label: string; href: string }
export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: NavChild[];
}
export interface NavGroup { id: string; label: string; items: NavItem[] }

export const adminNav: NavGroup[] = [
  {
    id: 'g-utama', label: 'UTAMA',
    items: [{ id: 'n-dashboard', label: 'Dashboard', href: '/dashboard-admin', icon: LayoutDashboard }],
  },
  {
    id: 'g-data', label: 'MANAJEMEN DATA',
    items: [
      { id: 'n-varian', label: 'Varian Kue', href: '/admin/varian', icon: Cookie },
      {
        id: 'n-kriteria', label: 'Kriteria', icon: Sliders,
        children: [
          { id: 'c-kriteria', label: 'Data Kriteria & Bobot', href: '/admin/kriteria' },
          { id: 'c-sub', label: 'Sub Kriteria (Skala)', href: '/admin/sub-kriteria' },
        ],
      },
      {
        id: 'n-penilaian', label: 'Penilaian', icon: ClipboardList,
        children: [
          { id: 'c-input', label: 'Input Penilaian', href: '/admin/penilaian' },
          { id: 'c-matriks', label: 'Matriks Keputusan', href: '/admin/matriks-keputusan' },
        ],
      },
    ],
  },
  {
    id: 'g-hitung', label: 'PERHITUNGAN',
    items: [
      {
        id: 'n-saw', label: 'Hitung SAW', icon: Calculator,
        children: [
          { id: 'c-saw-norm', label: 'Normalisasi', href: '/admin/saw/normalisasi' },
          { id: 'c-saw-pref', label: 'Nilai Preferensi', href: '/admin/saw/preferensi' },
        ],
      },
      {
        id: 'n-waspas', label: 'Hitung WASPAS', icon: Layers,
        children: [
          { id: 'c-wsm', label: 'WSM & WPM', href: '/admin/waspas/wsm-wpm' },
          { id: 'c-q', label: 'Nilai Q & Ranking', href: '/admin/waspas/nilai-q' },
        ],
      },
      { id: 'n-ranking', label: 'Ranking & Perbandingan', href: '/halaman-ranking-perbandingan', icon: BarChart3 },
    ],
  },
  {
    id: 'g-tools', label: 'ALAT BANTU',
    items: [
      { id: 'n-excel', label: 'Import / Export Excel', href: '/admin/excel', icon: FileSpreadsheet },
      { id: 'n-set', label: 'Pengaturan', href: '/admin/pengaturan', icon: Settings },
    ],
  },
];

export const ownerNav: NavGroup[] = [
  {
    id: 'o-utama', label: 'UTAMA',
    items: [{ id: 'o-dashboard', label: 'Dashboard Owner', href: '/dashboard-owner', icon: LayoutDashboard }],
  },
  {
    id: 'o-keputusan', label: 'RINGKASAN KEPUTUSAN',
    items: [
      { id: 'o-rekom', label: 'Rekomendasi Varian', href: '/owner/rekomendasi', icon: Trophy },
      {
        id: 'o-analisis', label: 'Hasil Analisis', icon: BarChart3,
        children: [
          { id: 'oc-ranking', label: 'Ranking Akhir', href: '/owner/ranking' },
          { id: 'oc-banding', label: 'Perbandingan SAW vs WASPAS', href: '/owner/perbandingan' },
          { id: 'oc-sens', label: 'Analisis Sensitivitas (λ)', href: '/owner/sensitivitas' },
        ],
      },
    ],
  },
  {
    id: 'o-data', label: 'DATA REFERENSI',
    items: [
      { id: 'o-varian', label: 'Varian Kue', href: '/owner/varian', icon: Cookie },
      {
        id: 'o-kriteria', label: 'Kriteria', icon: Sliders,
        children: [
          { id: 'oc-krit', label: 'Data Kriteria & Bobot', href: '/owner/kriteria' },
          { id: 'oc-sub', label: 'Sub Kriteria (Skala)', href: '/owner/sub-kriteria' },
        ],
      },
      { id: 'o-matriks', label: 'Matriks Keputusan', href: '/owner/matriks', icon: Table2 },
    ],
  },
  {
    id: 'o-laporan', label: 'LAPORAN',
    items: [
      { id: 'o-lap', label: 'Laporan Hasil', href: '/owner/laporan', icon: FileText },
      { id: 'o-akt', label: 'Riwayat Aktivitas', href: '/owner/aktivitas', icon: History },
    ],
  },
  {
    id: 'o-akun', label: 'AKUN',
    items: [{ id: 'o-profil', label: 'Profil Owner', href: '/owner/profil', icon: User }],
  },
];

export const navFor = (role: Role) => (role === 'owner' ? ownerNav : adminNav);
export { Scale, TrendingUp };
