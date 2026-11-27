import { timingSafeEqual } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { getImportKey, getSheetsConfig } from '@/lib/env'
import { fetchNormalizedRoutes } from '@/lib/line-haul/sheets'
import {
  countLineHaulRoutes,
  upsertLineHaulRoutes,
} from '@/lib/line-haul/queries'

export const dynamic = 'force-dynamic'

function keyMatches(provided: string | null): boolean {
  const expected = getImportKey()
  if (!expected || !provided) return false
  const given = Buffer.from(provided)
  const stored = Buffer.from(expected)
  if (given.length !== stored.length) return false
  return timingSafeEqual(given, stored)
}

/** GET: diagnosis kesiapan konfigurasi untuk environment Preview/Production. */
export async function GET() {
  const sheets = getSheetsConfig()
  const routeCount = await countLineHaulRoutes()
  return NextResponse.json({
    configured: {
      importKey: Boolean(getImportKey()),
      sheets: sheets.ready,
      database: routeCount !== null,
    },
    missing: sheets.missing,
    routeCount,
  })
}

/**
 * POST: tarik ulang jadwal dari Google Sheets dan upsert ke tabel line_haul_routes.
 * Wajib header: x-line-haul-import-key: <LINE_HAUL_IMPORT_KEY>
 */
export async function POST(request: Request) {
  if (!getImportKey()) {
    return NextResponse.json(
      { ok: false, error: 'LINE_HAUL_IMPORT_KEY belum di-set di environment.' },
      { status: 503 },
    )
  }
  if (!keyMatches(request.headers.get('x-line-haul-import-key'))) {
    return NextResponse.json(
      { ok: false, error: 'Kunci import tidak valid.' },
      { status: 401 },
    )
  }

  const sheets = getSheetsConfig()
  if (!sheets.ready) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Kredensial Google Sheets belum lengkap.',
        missing: sheets.missing,
      },
      { status: 501 },
    )
  }

  try {
    const routes = await fetchNormalizedRoutes()
    const imported = await upsertLineHaulRoutes(routes)
    revalidatePath('/line-haul')
    revalidatePath('/')
    return NextResponse.json({ ok: true, imported, total: routes.length })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gagal mengimpor rute Line Haul.'
    console.error('[importLineHaul]', error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
