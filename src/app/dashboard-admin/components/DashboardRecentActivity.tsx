'use client';

import { Clock, TrendingUp, Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useDSSData } from '@/lib/dss-store';

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// Ikon & warna ditentukan dari jenis aktivitas (kata pertama pada catatan riwayat)
function styleFor(text: string) {
  const t = text.toLowerCase();
  if (t.startsWith('menambah')) return { icon: Plus, color: 'var(--primary)', bg: 'var(--muted)' };
  if (t.startsWith('menghapus')) return { icon: Trash2, color: 'var(--error)', bg: 'var(--error-bg)' };
  if (t.startsWith('mengubah') || t.startsWith('memperbarui')) return { icon: Edit3, color: 'var(--info)', bg: 'var(--info-bg)' };
  if (t.startsWith('mengimpor') || t.startsWith('memuat')) return { icon: RefreshCw, color: 'var(--accent)', bg: 'var(--peach-100)' };
  return { icon: TrendingUp, color: 'var(--success)', bg: 'var(--success-bg)' };
}

export default function DashboardRecentActivity() {
  // Riwayat nyata dari perubahan data (varian, kriteria, penilaian, import) — sama dengan halaman Aktivitas Owner
  const { activities } = useDSSData();
  const recent = activities.slice(0, 5);

  return (
    <div className="card-warm p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
            Aktivitas Terbaru
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Riwayat perubahan data
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <Clock size={12} />
          <span>{recent.length} aktivitas terakhir</span>
        </div>
      </div>

      <div className="space-y-3">
        {recent.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--muted-foreground)' }}>Belum ada aktivitas.</p>
        )}
        {recent.map((act, idx) => {
          const st = styleFor(act.text);
          const Icon = st.icon;
          return (
            <div
              key={act.id}
              className="flex items-start gap-4 p-3 rounded-xl table-row-hover"
              style={{
                backgroundColor: idx % 2 === 0 ? 'var(--muted)' : 'transparent',
                border: '1px solid transparent',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: st.bg }}
              >
                <Icon size={14} style={{ color: st.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {act.text}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  {act.by} · {fmtTime(act.time)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
