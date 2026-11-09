import { Trophy, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { SAWResult, WASPASResult } from '@/lib/dss-data';
import { formatNumber } from '@/lib/dss-data';

interface RankingConclusionProps {
  bestSAW: SAWResult | undefined;
  bestWASPAS: WASPASResult | undefined;
  isSameWinner: boolean;
  lambda?: number;
}

function MedalBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return (
    <span
      className="text-sm font-bold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
    >
      #{rank}
    </span>
  );
}

export default function RankingConclusion({
  bestSAW,
  bestWASPAS,
  isSameWinner,
  lambda = 0.5,
}: RankingConclusionProps) {
  return (
    <div className="space-y-4">
      {/* Main Conclusion Card */}
      <div
        className="p-6 rounded-2xl relative overflow-hidden"
        style={{
          background: isSameWinner
            ? 'linear-gradient(135deg, #B5651D 0%, #9B5418 100%)'
            : 'linear-gradient(135deg, #B7791F 0%, #9B5418 100%)',
        }}
      >
        <div
          className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full opacity-15"
          style={{ backgroundColor: 'var(--peach-300)' }}
        />
        <div
          className="absolute bottom-[-30px] left-[-15px] w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--secondary)' }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={20} style={{ color: '#FFD700' }} />
            <span
              className="text-xs font-bold tracking-wider"
              style={{ color: 'rgba(253,246,236,0.8)', letterSpacing: '0.1em' }}
            >
              KESIMPULAN SISTEM
            </span>
          </div>

          {isSameWinner && bestSAW ? (
            <p className="text-base font-semibold leading-relaxed" style={{ color: 'var(--primary-foreground)' }}>
              Berdasarkan hasil perhitungan menggunakan metode SAW dan WASPAS (λ = {lambda.toFixed(2)}),
              varian{' '}
              <span className="font-extrabold text-lg" style={{ color: '#FFD700' }}>
                {bestSAW.nama}
              </span>{' '}
              ({bestSAW.kode}) memperoleh peringkat terbaik pada kedua metode dengan nilai SAW{' '}
              <strong>{formatNumber(bestSAW.nilaiSAW)}</strong> dan nilai WASPAS{' '}
              <strong>{bestWASPAS ? formatNumber(bestWASPAS.nilaiQ) : '—'}</strong>.
              Varian ini direkomendasikan sebagai varian unggulan Kue Balok Linera.
            </p>
          ) : (
            <p className="text-base font-semibold leading-relaxed" style={{ color: 'var(--primary-foreground)' }}>
              Berdasarkan hasil perhitungan, metode SAW merekomendasikan varian{' '}
              <span className="font-extrabold" style={{ color: '#FFD700' }}>
                {bestSAW?.nama || '—'}
              </span>{' '}
              ({bestSAW?.kode}) sedangkan metode WASPAS merekomendasikan varian{' '}
              <span className="font-extrabold" style={{ color: '#FFD700' }}>
                {bestWASPAS?.nama || '—'}
              </span>{' '}
              ({bestWASPAS?.kode}).
            </p>
          )}
        </div>
      </div>

      {/* Same/Different Winner Alert */}
      {isSameWinner ? (
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ backgroundColor: 'var(--success-bg)', border: '1px solid rgba(45,106,79,0.2)' }}
        >
          <CheckCircle2 size={18} className="flex-shrink-0" style={{ color: 'var(--success)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>
            Kedua metode SAW dan WASPAS memberikan rekomendasi yang konsisten — varian terbaik adalah{' '}
            <strong>{bestSAW?.nama}</strong>. Hasil ini menunjukkan reliabilitas tinggi.
          </p>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid rgba(183,121,31,0.2)' }}
        >
          <AlertCircle size={18} className="flex-shrink-0" style={{ color: 'var(--warning)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--warning)' }}>
            Hasil SAW dan WASPAS memberikan rekomendasi berbeda. Pemenang ditentukan dari nilai preferensi
            tertinggi pada masing-masing metode; tinjau tabel perbandingan dan analisis sensitivitas λ sebelum memutuskan.
          </p>
        </div>
      )}
    </div>
  );
}