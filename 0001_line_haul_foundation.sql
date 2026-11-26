-- Additive Line Haul schema. This was already applied to Neon main on 2026-11-26.
-- This migration intentionally preserves the legacy shipment tables.
create table if not exists app_schema_migrations (
  migration_name text primary key,
  checksum text not null,
  applied_at timestamptz not null default now()
);
create table if not exists master_schedule_versions (
  id bigserial primary key,
  source_spreadsheet_id text not null,
  source_sheet_name text not null,
  version_hash text not null,
  row_count integer not null default 0,
  imported_at timestamptz not null default now(),
  imported_by text,
  is_active boolean not null default false
);
create table if not exists master_schedule_rows (
  id bigserial primary key,
  version_id bigint not null references master_schedule_versions(id) on delete cascade,
  source_row_number integer not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  unique(version_id, source_row_number)
);
create table if not exists fms_import_batches (
  id bigserial primary key,
  source_type text not null,
  source_file text not null,
  rows_received integer not null default 0,
  rows_processed integer not null default 0,
  rows_rejected integer not null default 0,
  batch_status text not null default 'PROCESSING',
  error_details jsonb not null default '[]'::jsonb,
  imported_by text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create table if not exists line_haul_station_records (
  id bigserial primary key,
  lh_trip_number text not null,
  station_number integer not null,
  data jsonb not null,
  fms_status text not null,
  source_file text,
  imported_batch_id bigint references fms_import_batches(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(lh_trip_number, station_number)
);
create table if not exists line_haul_audit_logs (
  id bigserial primary key,
  entity_type text not null,
  entity_key text not null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  source text,
  actor text,
  import_batch_id bigint references fms_import_batches(id),
  created_at timestamptz not null default now()
);
create index if not exists master_schedule_versions_active_idx on master_schedule_versions(is_active);
create index if not exists master_schedule_rows_version_idx on master_schedule_rows(version_id);
create index if not exists line_haul_station_records_trip_station_idx on line_haul_station_records(lh_trip_number, station_number);
create index if not exists line_haul_station_records_fms_status_idx on line_haul_station_records(fms_status);
create index if not exists line_haul_station_records_updated_at_idx on line_haul_station_records(updated_at desc);
