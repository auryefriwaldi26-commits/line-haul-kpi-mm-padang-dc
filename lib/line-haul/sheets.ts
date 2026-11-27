import 'server-only'
import { google } from 'googleapis'
import { getSheetsConfig } from '@/lib/env'

export type NormalizedRoute = {
  origin: string
  routeLabel: string
  stops: string[]
  scheme: string | null
  scheduleIndicator: 'on' | 'off'
  cotLabel: string | null
  sourceSheet: string
  sourceRow: number
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const MAX_ROWS = 2000

type RawRow = (string | number | boolean | undefined | null)[]

function cleanCell(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  if (!text || text === '#REF!' || text.startsWith('=#REF')) return null
  return text
}

/** Petakan label header menjadi kolom terstruktur; toleran terhadap pergeseran kolom. */
function buildHeaderMap(headerRow: RawRow): Record<string, number> {
  const map: Record<string, number> = {}
  headerRow.forEach((cell, index) => {
    const label = cleanCell(cell)?.toLowerCase().replace(/\s+/g, ' ')
    if (!label) return
    if (label === 'origin') map.origin = index
    else if (label === 'route') map.route = index
    else if (label === 'lh scheme') map.scheme = index
    else if (label === 'sch indicator') map.indicator = index
    else if (label === 'cot') map.cot = index
    else {
      const destMatch = label.match(/^dest\.?\s*(\d+)$/)
      if (destMatch) {
        const n = Number(destMatch[1])
        map[`dest${n}`] = index
      }
    }
  })
  return map
}

function findHeaderIndex(rows: RawRow[]): number {
  for (let i = 0; i < Math.min(rows.length, 20); i += 1) {
    const map = buildHeaderMap(rows[i] ?? [])
    if (map.origin !== undefined && map.route !== undefined) return i
  }
  return -1
}

function readBy(row: RawRow, index: number | undefined): string | null {
  if (index === undefined) return null
  return cleanCell(row[index])
}

export async function fetchNormalizedRoutes(): Promise<NormalizedRoute[]> {
  const config = getSheetsConfig()
  if (!config.ready) {
    throw new Error(
      `Konfigurasi Google Sheets belum lengkap: ${config.missing.join(', ')}`,
    )
  }

  const auth = new google.auth.JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: SCOPES,
  })
  await auth.authorize()

  const sheets = google.sheets({ version: 'v4', auth })
  const sheetName = config.tabName ?? 'Padang DC'
  const range = `'${sheetName.replace(/'/g, "''")}'!A1:Z${MAX_ROWS}`

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range,
    majorDimension: 'ROWS',
    valueRenderOption: 'FORMATTED_VALUE',
  })

  const rows = (response.data.values ?? []) as RawRow[]
  const headerIndex = findHeaderIndex(rows)
  if (headerIndex < 0) {
    throw new Error('Header jadwal (kolom Origin & Route) tidak ditemukan pada sheet.')
  }

  const header = buildHeaderMap(rows[headerIndex] ?? [])
  const routes: NormalizedRoute[] = []

  for (let i = headerIndex + 1; i < rows.length; i += 1) {
    const row = rows[i] ?? []
    const origin = readBy(row, header.origin)
    const routeLabel = readBy(row, header.route)
    if (!origin && !routeLabel) continue

    const stops: string[] = []
    for (let n = 1; n <= 5; n += 1) {
      const stop = readBy(row, header[`dest${n}`])
      if (stop) stops.push(stop)
    }

    const indicator = readBy(row, header.indicator)?.toLowerCase()
    routes.push({
      origin: origin ?? 'Tidak diketahui',
      routeLabel: routeLabel ?? '(rute tanpa label)',
      stops,
      scheme: readBy(row, header.scheme),
      scheduleIndicator: indicator === 'on' ? 'on' : 'off',
      cotLabel: readBy(row, header.cot),
      sourceSheet: sheetName,
      sourceRow: i + 1,
    })
  }

  return routes
}
