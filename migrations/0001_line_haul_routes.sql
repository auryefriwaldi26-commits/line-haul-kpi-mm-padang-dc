-- Migrasi 0001: tabel rute Line Haul (sumber Google Sheets jadwal)
-- Jalankan di Neon SQL Editor untuk semua environment (Production & Preview database).
-- Idempoten: aman dijalankan lebih dari sekali.

CREATE TABLE IF NOT EXISTS line_haul_routes (
  id SERIAL PRIMARY KEY,
  origin TEXT NOT NULL,
  route_label TEXT NOT NULL,
  stops TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  scheme TEXT,
  schedule_indicator TEXT NOT NULL DEFAULT 'off',
  cot_label TEXT,
  source_sheet TEXT,
  source_row INTEGER,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT line_haul_routes_origin_route_key UNIQUE (origin, route_label)
);

CREATE INDEX IF NOT EXISTS line_haul_routes_origin_idx
  ON line_haul_routes (origin);
