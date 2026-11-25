'use client'

import { PageHeader, PageLayout, Stack } from '@primer/react'
import { AppHeader } from '@/components/app-header'
import { CreateShipmentDialog } from '@/components/dashboard/create-shipment-dialog'
import { ShipmentsTable } from '@/components/dashboard/shipments-table'
import { StatsCards } from '@/components/dashboard/stats-cards'
import type { ShipmentRow } from '@/lib/shipments'

export function DashboardView({ shipments }: { shipments: ShipmentRow[] }) {
  return (
    <>
      <AppHeader />
      <PageLayout containerWidth="xlarge">
        <PageLayout.Header>
          <PageHeader role="banner" aria-label="Dashboard pengiriman">
            <PageHeader.TitleArea>
              <PageHeader.Title as="h1">Dashboard Pengiriman</PageHeader.Title>
            </PageHeader.TitleArea>
            <PageHeader.Description>
              Pantau status paket, kurir, dan estimasi tiba secara real-time.
            </PageHeader.Description>
            <PageHeader.Actions>
              <CreateShipmentDialog />
            </PageHeader.Actions>
          </PageHeader>
        </PageLayout.Header>
        <PageLayout.Content as="main">
          <Stack direction="vertical" gap="spacious">
            <StatsCards shipments={shipments} />
            <ShipmentsTable shipments={shipments} />
          </Stack>
        </PageLayout.Content>
      </PageLayout>
    </>
  )
}
