# Line Haul Dashboard — paket perubahan GitHub

Paket ini ditujukan untuk repository `auryefriwaldi26-commits/line-haul-kpi-mm-padang-dc` pada branch `feat/line-haul-dashboard`.

## Isi tahap ini
- Mengganti halaman utama menjadi dashboard Line Haul Padang DC.
- Membaca ringkasan trip, station record, dan riwayat import dari PostgreSQL/Neon.
- Import tiga file FMS (MENUNGGU, HANDOVER, ENDED) dalam satu transaksi.
- Mempertahankan prioritas status ENDED > HANDOVER > MENUNGGU.
- Sinkronisasi snapshot Master Schedule dari Google Spreadsheet ke tabel versi PostgreSQL. Spreadsheet hanya dibaca; sumber tidak ditulis atau diubah.
- Menyimpan riwayat sinkronisasi dan audit.

## Cara memasukkan ke GitHub
1. Buka branch `feat/line-haul-dashboard`.
2. Ekstrak ZIP ini di perangkat.
3. Unggah file/folder sesuai path di dalam ZIP ke repository menggunakan **Add file → Upload files**.
4. Commit ke branch `feat/line-haul-dashboard`, bukan `main`.
5. Setelah file masuk, Vercel dapat membangun Preview dari branch tersebut jika Git integration pada project aktif.

File `app/page.tsx` dan `app/globals.css` adalah penggantian file yang sudah ada. File lain adalah file baru.

## Environment Variables di Vercel
Pastikan Production/Preview memiliki:
- `DATABASE_URL` (Neon pooled connection string; gunakan secret value dari project Vercel yang sudah ada)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SHEETS_SPREADSHEET_ID=1Vn5JMloGxYVf1t6Iw2CGBD9Bhl7PnmcayoV2OMkORws`
- `GOOGLE_SHEETS_TAB_NAME=Padang DC`
- `LINE_HAUL_IMPORT_KEY` (buat secret acak panjang; masukkan secret yang sama pada kolom kunci di dashboard)

Service account Google harus memiliki akses **Viewer** ke spreadsheet sumber.

## Database
Migrasi `db/migrations/0001_line_haul_foundation.sql` sudah pernah diterapkan langsung pada Neon project `muddy-mud-42129929`, branch `main`, database `neondb`. Jangan jalankan ulang secara manual dan jangan hapus tabel lama `shipments` atau `shipment_events`.

## Batasan tahap ini
OTD, OTA, OTT outbound/return dan D5 Trip Utilization belum ditampilkan sebagai angka karena pemetaan kolom Master Schedule terhadap kolom aktual FMS harus divalidasi terlebih dahulu. Dashboard menandainya sebagai belum dihitung agar tidak menampilkan KPI yang keliru. Import FMS dan snapshot jadwal merupakan fondasi data, bukan pernyataan bahwa seluruh KPI telah selesai.

## Catatan keamanan
Endpoint import dan sinkronisasi memerlukan `LINE_HAUL_IMPORT_KEY`. Ringkasan dashboard bersifat read-only. Jangan mengaktifkan import sebelum secret tersebut tersedia di Vercel.
