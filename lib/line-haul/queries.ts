import 'server-only'
import { asc, count, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { lineHaulRoutes } from '@/lib/db/schema'
import type { NormalizedRoute } from '@/lib/line-haul/sheets'

export type LineHaulRouteRow = {
  id: number
  origin: string
  routeLabel: string
  stops: string[]
  scheme: string | null
  scheduleIndicator: string
  cotLabel: string | null
  sourceSheet: string | null
  sourceRow: number | null
  importedAt: string
}

type RouteRecord = typeof lineHaulRoutes.$inferSelect

function toRow(record: RouteRecord): LineHaulRouteRow {
  return {
    ...record,
    stops: record.stops ?? [],
    importedAt: record.importedAt.toISOString(),
  }
}

/** Daftar rute aman: bila tabel belum dimigrasi, kembalikan error ringan, bukan crash halaman. */
export async function listLineHaulRoutes(): Promise<{
  rows: LineHaulRouteRow[]
  error: string | null
}> {
  try {
    const records = await db
      .select()
      .from(lineHaulRoutes)
      .orderBy(
        asc(lineHaulRoutes.origin),
        asc(lineHaulRoutes.scheme),
        asc(lineHaulRoutes.routeLabel),
      )
    return { rows: records.map(toRow), error: null }
  } catch (error) {
    console.error('[listLineHaulRoutes]', error)
    return {
      rows: [],
      error:
        'Tabel rute Line Haul belum tersedia di database. Jalankan migrasi migrations/0001_line_haul_routes.sql di Neon.',
    }
  }
}

/** Jumlah rute untuk kartu ringkasan di home; null bila koneksi/tabel belum siap. */
export async function countLineHaulRoutes(): Promise<number | null> {
  try {
    const [result] = await db.select({ total: count() }).from(lineHaulRoutes)
    return result?.total ?? 0
  } catch (error) {
    console.error('[countLineHaulRoutes]', error)
    return null
  }
}

export async function upsertLineHaulRoutes(routes: NormalizedRoute[]): Promise<number> {
  if (routes.length === 0) return 0
  await db
    .insert(lineHaulRoutes)
    .values(
      routes.map((route) => ({
        origin: route.origin,
        routeLabel: route.routeLabel,
        stops: route.stops,
        scheme: route.scheme,
        scheduleIndicator: route.scheduleIndicator,
        cotLabel: route.cotLabel,
        sourceSheet: route.sourceSheet,
        sourceRow: route.sourceRow,
      })),
    )
    .onConflictDoUpdate({
      target: [lineHaulRoutes.origin, lineHaulRoutes.routeLabel],
      set: {
        stops: sql`excluded.stops`,
        scheme: sql`excluded.scheme`,
        scheduleIndicator: sql`excluded.schedule_indicator`,
        cotLabel: sql`excluded.cot_label`,
        sourceSheet: sql`excluded.source_sheet`,
        sourceRow: sql`excluded.source_row`,
        importedAt: new Date(),
      },
    })
  return routes.length
}
