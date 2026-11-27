'use client'

import { Flash, PageHeader, PageLayout, Stack } from '@primer/react'
import { AppHeader } from '@/components/app-header'
import { LineHaulTable } from '@/components/line-haul/line-haul-table'
import type { LineHaulRouteRow } from '@/lib/line-haul/queries'

export function LineHaulView({
  rows,
  error,
  sheetsReady,
  missing,
}: {
  rows: LineHaulRouteRow[]
  error: string | null
  sheetsReady: boolean
  missing: string[]
}) {
  return (
    <>
      <AppHeader />
      <PageLayout containerWidth="xlarge">
        <PageLayout.Header>
          <PageHeader role="banner" aria-label="Rute Line Haul Padang DC">
            <PageHeader.TitleArea>
              <PageHeader.Title as="h1">
                Rute Line Haul · Padang DC
              </PageHeader.Title>
            </PageHeader.TitleArea>
            <PageHeader.Description>
              Jadwal rute dari DC ke hub tujuan, hasil impor dari Google Sheets.
            </PageHeader.Description>
          </PageHeader>
        </PageLayout.Header>
        <PageLayout.Content as="main">
          <Stack direction="vertical" gap="normal">
            {error && <Flash variant="warning">{error}</Flash>}
            {!sheetsReady && (
              <Flash variant="warning">
                Kredensial Google Sheets belum lengkap di environment ini (
                {missing.join(', ')}). Isi pada Vercel Environment Variables
                dengan scope Preview, lalu jalankan ulang endpoint import.
              </Flash>
            )}
            <LineHaulTable rows={rows} />
          </Stack>
        </PageLayout.Content>
      </PageLayout>
    </>
  )
}
