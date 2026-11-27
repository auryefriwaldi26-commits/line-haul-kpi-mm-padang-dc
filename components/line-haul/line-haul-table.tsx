'use client'

import { Label, Stack, Text } from '@primer/react'
import { Blankslate, DataTable, Table } from '@primer/react/experimental'
import { MilestoneIcon } from '@primer/octicons-react'
import { formatDateTime } from '@/lib/shipments'
import type { LineHaulRouteRow } from '@/lib/line-haul/queries'

export function LineHaulTable({ rows }: { rows: LineHaulRouteRow[] }) {
  return (
    <Table.Container>
      <Table.Title as="h2" id="linehaul-title">
        Rute jadwal Line Haul
      </Table.Title>
      <Table.Subtitle as="p" id="linehaul-subtitle">
        {rows.length} rute terdaftar
      </Table.Subtitle>
      {rows.length === 0 ? (
        <div style={{ gridColumn: '1 / -1' }}>
          <Blankslate border>
            <Blankslate.Visual>
              <MilestoneIcon size={24} />
            </Blankslate.Visual>
            <Blankslate.Heading>Belum ada rute</Blankslate.Heading>
            <Blankslate.Description>
              Jalankan endpoint import dengan kunci yang valid setelah kredensial
              Google Sheets diisi di environment.
            </Blankslate.Description>
          </Blankslate>
        </div>
      ) : (
        <DataTable
          aria-labelledby="linehaul-title"
          aria-describedby="linehaul-subtitle"
          data={rows}
          columns={[
            {
              header: 'Rute',
              field: 'routeLabel',
              rowHeader: true,
              renderCell: (row) => (
                <Stack direction="vertical" gap="none">
                  <Text weight="medium">{row.routeLabel}</Text>
                  {row.stops.length > 0 && (
                    <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                      {row.stops.join(' → ')}
                    </Text>
                  )}
                </Stack>
              ),
            },
            {
              header: 'Asal',
              field: 'origin',
              renderCell: (row) => row.origin,
            },
            {
              header: 'Skema',
              field: 'scheme',
              renderCell: (row) =>
                row.scheme ?? (
                  <Text style={{ color: 'var(--fgColor-muted)' }}>-</Text>
                ),
            },
            {
              header: 'Indikator',
              field: 'scheduleIndicator',
              renderCell: (row) =>
                row.scheduleIndicator === 'on' ? (
                  <Label variant="success">Aktif</Label>
                ) : (
                  <Label variant="secondary">Nonaktif</Label>
                ),
            },
            {
              header: 'COT',
              field: 'cotLabel',
              renderCell: (row) =>
                row.cotLabel ?? (
                  <Text style={{ color: 'var(--fgColor-muted)' }}>-</Text>
                ),
            },
            {
              header: 'Terakhir impor',
              field: 'importedAt',
              renderCell: (row) => formatDateTime(row.importedAt),
            },
          ]}
        />
      )}
    </Table.Container>
  )
}
