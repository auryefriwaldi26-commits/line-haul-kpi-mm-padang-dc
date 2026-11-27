# Line Haul KPI — Padang DC (SPX Express)

Dashboard operasional Next.js (App Router) untuk memantau pengiriman dan jadwal
rute **Line Haul** dari Padang DC ke hub tujuan. Data rute diimpor dari Google
Sheets ke Neon PostgreSQL melalui endpoint berautentikasi kunci.

## Stack

- Next.js 15 (App Router) + React 19, Primer React (GitHub design system)
- Drizzle ORM + `pg` untuk Neon PostgreSQL
- `googleapis` untuk membaca Google Sheets (Service Account)
- Package manager: **pnpm** (lockfile `pnpm-lock.yaml`)

## Struktur folder

```
app/
  actions/shipments.ts        Server Action: buat pengiriman, ubah status
  api/line-haul/import/       GET diagnosis config, POST import Sheets → DB
  line-haul/page.tsx          Halaman daftar rute Line Haul
  page.tsx                    Halaman utama (dashboard pengiriman + ringkasan rute)
  shipments/[id]/page.tsx     Detail pengiriman
components/                   Komponen Primer (dashboard, detail, line-haul)
lib/
  db/                         Koneksi pg + schema Drizzle
  env.ts                      Pembaca env aman (tidak crash saat var kosong)
  line-haul/queries.ts        Query rute (aman: error → pesan, bukan crash)
  line-haul/sheets.ts        Loader Google Sheets + normalisasi baris
migrations/0001_line_haul_routes.sql
```

## Setup lokal

1. `pnpm install`
2. `cp .env.example .env.local` lalu isi nilai sebenarnya (lihat di bawah).
3. Jalankan migrasi database di Neon SQL Editor:
   `migrations/0001_line_haul_routes.sql`
4. `pnpm dev` → buka http://localhost:3000

Perintah verifikasi: `pnpm build` (type-check + build produksi).

## Environment variables

| Variabel | Wajib untuk | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Semua | Connection string Neon (sslmode=require) |
| `LINE_HAUL_IMPORT_KEY` | Import | Kunci rahasia; dikirim via header `x-line-haul-import-key` |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Import | Email Service Account Google Cloud |
| `GOOGLE_SHEETS_PRIVATE_KEY` | Import | Private key PEM, satu baris dengan `\n` |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Import | ID dari URL Google Sheets |
| `GOOGLE_SHEETS_TAB_NAME` | Import | Nama tab jadwal, mis. `Padang DC` |

### Google Sheets (Service Account)

1. Google Cloud Console → **IAM & Admin → Service Accounts** → buat akun →
   buat JSON key.
2. Buka spreadsheet jadwal → **Share** → tambahkan email Service Account sebagai
   **Viewer**.
3. Isi empat variabel `GOOGLE_SHEETS_*` di environment.

## Endpoint import

- `GET /api/line-haul/import` — tanpa kunci; mengembalikan diagnosis:
  `configured.importKey`, `configured.sheets`, `configured.database`, daftar
  variabel yang hilang, dan jumlah rute saat ini.
- `POST /api/line-haul/import` — wajib header kunci:

```bash
curl -X POST "$VERCEL_URL/api/line-haul/import" \
  -H "x-line-haul-import-key: $LINE_HAUL_IMPORT_KEY"
```

Respons sukses: `{ "ok": true, "imported": <n>, "total": <n> }`.

## Deploy ke Vercel (Preview)

1. Project Settings → **Environment Variables**: tambahkan semua variabel di
   atas dengan scope **Preview** dicentang (Production menyusul saat siap).
   `GOOGLE_SHEETS_PRIVATE_KEY` jangan dipisah baris — simpan sebagai satu nilai.
2. Pastikan **Root Directory** kosong (root repo) — Next.js berada di root.
3. Setelah variabel disimpan, **Redeploy** deployment preview terakhir; env
   baru hanya berlaku untuk deployment yang dibuat setelah penyimpanan.
4. Jalankan `GET /api/line-haul/import` untuk memastikan ketiga konfigurasi
   `true`, lalu `POST` dengan kunci untuk menarik rute.

## Blocker GitHub 403 “Resource not accessible by integration”

Aplikasi GitHub yang dipakai agent otomatis belum punya izin tulis, sehingga
commit ke `feat/line-haul-dashboard` ditolak (403). Perbaikan satu kali:

1. Buka repo → **Settings → Integrations → GitHub Apps** → pilih aplikasi
   ChatGPT/integrasi yang dipakai → **Configure**.
2. **Permissions → Contents → Read and write** → **Save**.
   Untuk repo di bawah organisasi, minta owner menyetujui perubahan permission
   di **Organization Settings → GitHub Apps**.
3. Pastikan repo ini termasuk dalam daftar repository yang dipasang aplikasi.
4. Push ulang branch; Vercel otomatis membuat Preview dari branch tersebut.

Branch kerja: `feat/line-haul-dashboard`. Deployment Production tidak diubah
sampai Preview lulus verifikasi.
