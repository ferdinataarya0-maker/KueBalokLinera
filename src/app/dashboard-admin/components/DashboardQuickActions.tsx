import Link from 'next/link';
import {
  Cookie,
  Sliders,
  ClipboardList,
  Calculator,
  BarChart3,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const actions = [
  {
    id: 'qa-varian',
    label: 'Kelola Varian',
    desc: 'Tambah atau ubah varian kue',
    href: '/admin/varian',
    icon: Cookie,
    color: 'var(--primary)',
    bg: 'var(--muted)',
  },
  {
    id: 'qa-kriteria',
    label: 'Atur Kriteria & Bobot',
    desc: 'Kelola kriteria dan bobot penilaian',
    href: '/admin/kriteria',
    icon: Sliders,
    color: 'var(--info)',
    bg: 'var(--info-bg)',
  },
  {
    id: 'qa-penilaian',
    label: 'Input Penilaian',
    desc: 'Masukkan nilai per varian per kriteria',
    href: '/admin/penilaian',
    icon: ClipboardList,
    color: 'var(--success)',
    bg: 'var(--success-bg)',
  },
  {
    id: 'qa-saw',
    label: 'Hitung SAW',
    desc: 'Jalankan perhitungan metode SAW',
    href: '/admin/saw',
    icon: Calculator,
    color: 'var(--warning)',
    bg: 'var(--warning-bg)',
  },
  {
    id: 'qa-ranking',
    label: 'Lihat Ranking',
    desc: 'Tampilkan ranking & perbandingan',
    href: '/halaman-ranking-perbandingan',
    icon: BarChart3,
    color: 'var(--accent)',
    bg: 'var(--peach-100)',
  },
  {
    id: 'qa-excel',
    label: 'Export Excel',
    desc: 'Unduh laporan lengkap 10 sheet',
    href: '/admin/excel',
    icon: FileSpreadsheet,
    color: 'var(--brown-700)',
    bg: 'var(--brown-100)',
  },
];

export default function DashboardQuickActions() {
  return (
    <div className="card-warm p-5 h-full">
      <div className="mb-4">
        <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
          Aksi Cepat
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          Navigasi ke modul utama
        </p>
      </div>

      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150 group"
              style={{ border: '1px solid var(--border)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--muted)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: action.bg }}
              >
                <Icon size={16} style={{ color: action.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  {action.label}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                  {action.desc}
                </p>
              </div>
              <ArrowRight
                size={14}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--primary)' }}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}