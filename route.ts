import { timingSafeEqual } from 'node:crypto'
import { pool } from '@/lib/linehaul/db'
import { findColumn, recordsFromCsv } from '@/lib/linehaul/csv'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const priorities: Record<string, number> = { MENUNGGU: 1, HANDOVER: 2, ENDED: 3 }
const files = [
  { field: 'menunggu', type: 'MENUNGGU' },
  { field: 'handover', type: 'HANDOVER' },
  { field: 'ended', type: 'ENDED' },
] as const

function authorized(request: Request): boolean {
  const expected = process.env.LINE_HAUL_IMPORT_KEY
  const supplied = request.headers.get('x-linehaul-import-key') ?? ''
  if (!expected || !supplied) return false
  const left = Buffer.from(expected)
  const right = Buffer.from(supplied)
  return left.length === right.length && timingSafeEqual(left, right)
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: 'Kunci import tidak valid atau belum dikonfigurasi.' }, { status: 401 })
  }

  const form = await request.formData()
  const selected = files.flatMap((item) => {
    const file = form.get(item.field)
    return file instanceof File && file.size > 0 ? [{ ...item, file }] : []
  })
  if (selected.length === 0) {
    return Response.json({ error: 'Pilih minimal satu file CSV FMS.' }, { status: 400 })
  }

  const client = await pool.connect()
  const summary = { files: 0, received: 0, processed: 0, rejected: 0, batches: [] as string[] }

  try {
    await client.query('begin')
    for (const item of selected) {
      const input = await item.file.text()
      const rows = recordsFromCsv(input)
      const valid = rows.filter((row) => {
        const tripKey = findColumn(row, 'LH Trip Number')
        const stationKey = findColumn(row, 'Station Number')
        return Boolean(tripKey && row[tripKey]?.trim()) &&
          Boolean(stationKey && /^\d+$/.test(row[stationKey] ?? ''))
      })
      const rejected = rows.length - valid.length
      summary.files += 1
      summary.received += rows.length
      summary.rejected += rejected

      const batch = await client.query(
        `insert into fms_import_batches
          (source_type, source_file, rows_received, rows_processed, rows_rejected, batch_status, error_details)
         values ($1,$2,$3,0,$4,'PROCESSING','[]'::jsonb) returning id`,
        [item.type, item.file.name, rows.length, rejected],
      )
      const batchId = String(batch.rows[0].id)
      summary.batches.push(batchId)

      for (const row of valid) {
        const tripKey = findColumn(row, 'LH Trip Number')!
        const stationKey = findColumn(row, 'Station Number')!
        const cleanData = Object.fromEntries(Object.entries(row).filter(([, value]) => value.trim() !== ''))
        await client.query(
          `insert into line_haul_station_records
            (lh_trip_number, station_number, data, fms_status, source_file, imported_batch_id)
           values ($1,$2,$3::jsonb,$4,$5,$6)
           on conflict (lh_trip_number, station_number) do update set
             data = line_haul_station_records.data || excluded.data,
             fms_status = excluded.fms_status,
             source_file = excluded.source_file,
             imported_batch_id = excluded.imported_batch_id,
             updated_at = now()
           where case line_haul_station_records.fms_status
             when 'ENDED' then 3 when 'HANDOVER' then 2 else 1 end
             <= case excluded.fms_status when 'ENDED' then 3 when 'HANDOVER' then 2 else 1 end`,
          [row[tripKey].trim(), Number(row[stationKey]), JSON.stringify(cleanData),
            item.type, item.file.name, batchId],
        )
        summary.processed += 1
      }

      await client.query(
        `update fms_import_batches set rows_processed=$1, batch_status='COMPLETED', completed_at=now()
         where id=$2`,
        [valid.length, batchId],
      )
      await client.query(
        `insert into line_haul_audit_logs
          (entity_type, entity_key, action, new_data, source, import_batch_id)
         values ('FMS_IMPORT',$1::text,'IMPORT',$2::jsonb,'FMS',$3::bigint)`,
        [batchId, JSON.stringify({ sourceType: item.type, file: item.file.name, rows: valid.length }), batchId],
      )
    }

    await client.query('commit')
    return Response.json({ ...summary, message: 'Import FMS berhasil disimpan.' })
  } catch (error) {
    await client.query('rollback')
    console.error('FMS import failed:', error)
    return Response.json({ error: 'Import gagal. Transaksi dibatalkan; data tidak disimpan sebagian.' }, { status: 500 })
  } finally {
    client.release()
  }
}
