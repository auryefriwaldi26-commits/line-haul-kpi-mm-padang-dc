/**
 * Helpers baca environment variable. Semua fungsi aman dipanggil saat build:
 * tidak melempar error saat variabel kosong, hanya mengembalikan undefined
 * sehingga halaman/API bisa memberi pesan konfigurasi yang jelas di Preview.
 */

export function envText(name: string): string | undefined {
  const value = process.env[name]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/** Kunci rahasia untuk endpoint import Line Haul (header x-line-haul-import-key). */
export function getImportKey(): string | undefined {
  return envText('LINE_HAUL_IMPORT_KEY')
}

export type SheetsConfig = {
  clientEmail?: string
  privateKey?: string
  spreadsheetId?: string
  tabName?: string
  /** true bila kredensial wajib sudah lengkap dan bisa dipakai membaca sheet. */
  ready: boolean
  missing: string[]
}

/** Kredensial Google Sheets (Service Account) untuk sumber data jadwal Line Haul. */
export function getSheetsConfig(): SheetsConfig {
  const clientEmail = envText('GOOGLE_SHEETS_CLIENT_EMAIL')
  const privateKeyRaw = envText('GOOGLE_SHEETS_PRIVATE_KEY')
  const spreadsheetId = envText('GOOGLE_SHEETS_SPREADSHEET_ID')
  const tabName = envText('GOOGLE_SHEETS_TAB_NAME')

  // Private key PEM biasanya disimpan satu baris dengan literal \n; ubah ke newline asli.
  const privateKey = privateKeyRaw ? privateKeyRaw.replaceAll('\\n', '\n') : undefined

  const missing: string[] = []
  if (!clientEmail) missing.push('GOOGLE_SHEETS_CLIENT_EMAIL')
  if (!privateKey) missing.push('GOOGLE_SHEETS_PRIVATE_KEY')
  if (!spreadsheetId) missing.push('GOOGLE_SHEETS_SPREADSHEET_ID')

  return {
    clientEmail,
    privateKey,
    spreadsheetId,
    tabName,
    ready: missing.length === 0,
    missing,
  }
}
