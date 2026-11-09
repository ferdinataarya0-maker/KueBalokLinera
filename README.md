# LineraDSS — Sistem Pendukung Keputusan Kue Balok Linera

Aplikasi web untuk membantu memilih **varian kue balok terbaik** pada Usaha Kue Balok Linera menggunakan dua metode Sistem Pendukung Keputusan (SPK):

- **SAW** (Simple Additive Weighting)
- **WASPAS** (Weighted Aggregated Sum Product Assessment)

## Fitur

### Panel Admin
- **Dashboard** — ringkasan data, grafik perbandingan, dan peringatan kelengkapan data
- **Varian Kue** — tambah, ubah, hapus alternatif
- **Kriteria & Bobot** — kelola kriteria (Benefit/Cost) dengan bobot mentah (mis. 5, 4, 4, 3); bobot ternormalisasi Wj = bobot ÷ total bobot dihitung otomatis
- **Sub Kriteria (Skala Penilaian)** — skala nilai per kriteria, untuk Minat Pembeli dan Kualitas Rasa (skala 1–5)
- **Penilaian & Matriks Keputusan** — input nilai tiap varian terhadap tiap kriteria
- **Hitung SAW** — normalisasi dan nilai preferensi
- **Hitung WASPAS** — WSM, WPM, dan nilai Q dengan parameter λ
- **Ranking & Perbandingan** — hasil akhir SAW vs WASPAS
- **Import / Export Excel** dan **Pengaturan**

### Panel Owner (hanya melihat)
- Dashboard dengan rekomendasi varian unggulan
- Rekomendasi Varian beserta alasannya
- Ranking Akhir, Perbandingan SAW vs WASPAS, dan Analisis Sensitivitas (λ)
- Data referensi: varian, kriteria, sub kriteria, matriks keputusan
- Laporan hasil (cetak / simpan PDF / export Excel) dan riwayat aktivitas

Tampilan responsif dan dapat dibuka di HP maupun desktop.

## Teknologi

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Recharts (grafik), React Hook Form, Lucide Icons
- SheetJS / xlsx (import & export Excel)

## Menjalankan di Komputer

Prasyarat: **Node.js 18.18 atau lebih baru**.

```bash
# 1. Install dependensi
npm install

# 2. Jalankan mode pengembangan
npm run dev
```

Buka [http://localhost:4028](http://localhost:4028) di browser.

Untuk membuka dari HP dalam satu jaringan Wi-Fi:

```bash
npx next dev -p 4028 -H 0.0.0.0
```

lalu buka `http://IP-KOMPUTER:4028` di browser HP.

## Data Penelitian

Data bawaan berasal dari `spk.xlsx`: 10 varian (Original … Strawberry Glaz), 4 kriteria (C1 Jumlah Penjualan 5 benefit, C2 Minat Pembeli 4 benefit, C3 Kualitas Rasa 4 benefit, C4 Harga Jual 3 cost; total bobot 16). Excel menormalisasi Jumlah Penjualan dengan `TRUNC(x/max, 2)`; opsi ini tersedia per kriteria di Data Kriteria (kosongkan untuk normalisasi penuh).

Uji kesesuaian perhitungan dengan Excel: `npx tsx scripts/verify-calc.ts`

## Catatan Data

Saat ini data (varian, kriteria, penilaian) dan sesi login masih disimpan di **localStorage** browser (kunci data `lineradss:data:v2`; kunci lama `v1` dihapus otomatis), belum memakai database. Akun login didefinisikan di `src/app/login/components/LoginPageContent.tsx`. Integrasi database dan autentikasi (mis. Supabase) dapat dilakukan lewat `src/lib/dss-store.ts` dan `src/lib/auth.ts`.

## Struktur Singkat

```
src/
├─ app/                  # Halaman (login, admin, owner, ranking)
├─ components/           # Layout, komponen UI, dan komponen data (dss/)
└─ lib/                  # Perhitungan SAW/WASPAS, penyimpanan data, autentikasi
```
