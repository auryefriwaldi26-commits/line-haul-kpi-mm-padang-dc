import type { Metadata } from 'next'
import { LineHaulView } from '@/components/line-haul/line-haul-view'
import { listLineHaulRoutes } from '@/lib/line-haul/queries'
import { getSheetsConfig } from '@/lib/env'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Line Haul · Padang DC · SPX Express',
}

export default async function LineHaulPage() {
  const [{ rows, error }] = await Promise.all([listLineHaulRoutes()])
  const sheets = getSheetsConfig()
  return (
    <LineHaulView
      rows={rows}
      error={error}
      sheetsReady={sheets.ready}
      missing={sheets.missing}
    />
  )
}
