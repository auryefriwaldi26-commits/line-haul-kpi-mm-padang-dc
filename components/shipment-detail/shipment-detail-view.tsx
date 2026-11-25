'use client'

import NextLink from 'next/link'
import {
  Breadcrumbs,
  Heading,
  PageHeader,
  PageLayout,
  Stack,
  Text,
} from '@primer/react'
import { AppHeader } from '@/components/app-header'
import { StatusLabel } from '@/components/status-label'
import { ShipmentTimeline } from '@/components/shipment-detail/shipment-timeline'
import { UpdateStatusForm } from '@/components/shipment-detail/update-status-form'
import {
  formatDate,
  formatDateTime,
  serviceLabel,
  type ShipmentEventRow,
  type ShipmentRow,
} from '@/lib/shipments'

function Panel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      aria-label={title}
      style={{
        backgroundColor: 'var(--bgColor-default)',
        border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
        borderRadius: 'var(--borderRadius-large)',
      }}
    >
      <div
        style={{
          paddingInline: 'var(--base-size-16)',
          paddingBlock: 'var(--base-size-12)',
          borderBottom:
            'var(--borderWidth-thin) solid var(--borderColor-default)',
          backgroundColor: 'var(--bgColor-muted)',
          borderTopLeftRadius: 'var(--borderRadius-large)',
          borderTopRightRadius: 'var(--borderRadius-large)',
        }}
      >
        <Heading as="h2" variant="small">
          {title}
        </Heading>
      </div>
      <Stack direction="vertical" gap="normal" padding="normal">
        {children}
      </Stack>
    </section>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="vertical" gap="none">
      <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
        {label}
      </Text>
      <Text weight="medium">{value}</Text>
    </Stack>
  )
}

export function ShipmentDetailView({
  shipment,
  events,
}: {
  shipment: ShipmentRow
  events: ShipmentEventRow[]
}) {
  return (
    <>
      <AppHeader />
      <PageLayout containerWidth="xlarge">
        <PageLayout.Header>
          <Stack direction="vertical" gap="normal">
            <Breadcrumbs>
              <Breadcrumbs.Item as={NextLink} href="/">
                Dashboard
              </Breadcrumbs.Item>
              <Breadcrumbs.Item selected>
                {shipment.trackingNumber}
              </Breadcrumbs.Item>
            </Breadcrumbs>
            <PageHeader role="banner" aria-label="Detail pengiriman">
              <PageHeader.TitleArea>
                <PageHeader.Title as="h1">
                  <span style={{ fontFamily: 'var(--fontStack-monospace)' }}>
                    {shipment.trackingNumber}
                  </span>
                </PageHeader.Title>
                <PageHeader.TrailingVisual>
                  <StatusLabel status={shipment.status} size="large" />
                </PageHeader.TrailingVisual>
              </PageHeader.TitleArea>
              <PageHeader.Description>
                {shipment.originCity} → {shipment.destinationCity} ·{' '}
                {serviceLabel(shipment.service)} · dibuat{' '}
                {formatDateTime(shipment.createdAt)}
              </PageHeader.Description>
            </PageHeader>
          </Stack>
        </PageLayout.Header>

        <PageLayout.Content as="main">
          <Stack direction="vertical" gap="spacious">
            <Panel title="Informasi paket">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 'var(--base-size-16)',
                }}
              >
                <Field label="Pengirim" value={shipment.senderName} />
                <Field label="Penerima" value={shipment.recipientName} />
                <Field label="No. HP penerima" value={shipment.recipientPhone} />
                <Field label="Berat" value={`${shipment.weightKg} kg`} />
                <Field
                  label="Kurir"
                  value={shipment.courierName ?? 'Belum ditugaskan'}
                />
                <Field
                  label="Estimasi tiba"
                  value={formatDate(shipment.estimatedDelivery)}
                />
              </div>
            </Panel>
            <Panel title="Riwayat perjalanan">
              <ShipmentTimeline events={events} />
            </Panel>
          </Stack>
        </PageLayout.Content>

        <PageLayout.Pane position="end" aria-label="Perbarui status">
          <Panel title="Perbarui status">
            <UpdateStatusForm shipment={shipment} />
          </Panel>
        </PageLayout.Pane>
      </PageLayout>
    </>
  )
}
