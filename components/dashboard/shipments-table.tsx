'use client'

import { useMemo, useState } from 'react'
import NextLink from 'next/link'
import { Link, SegmentedControl, Stack, Text, TextInput } from '@primer/react'
import { Blankslate, DataTable, Table } from '@primer/react/experimental'
import { ArrowRightIcon, SearchIcon } from '@primer/octicons-react'
import { StatusLabel } from '@/components/status-label'
import {
  formatDate,
  serviceLabel,
  SHIPMENT_STATUSES,
  STATUS_META,
  type ShipmentRow,
} from '@/lib/shipments'

const FILTERS = ['all', ...SHIPMENT_STATUSES] as const
const PAGE_SIZE = 8

export function ShipmentsTable({ shipments }: { shipments: ShipmentRow[] }) {
  const [filterIndex, setFilterIndex] = useState(0)
  const [query, setQuery] = useState('')
  const [pageIndex, setPageIndex] = useState(0)

  const activeFilter = FILTERS[filterIndex]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return shipments.filter((s) => {
      if (activeFilter !== 'all' && s.status !== activeFilter) return false
      if (!q) return true
      return [
        s.trackingNumber,
        s.recipientName,
        s.senderName,
        s.originCity,
        s.destinationCity,
        s.courierName ?? '',
      ].some((field) => field.toLowerCase().includes(q))
    })
  }, [shipments, activeFilter, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(pageIndex, pageCount - 1)
  const pageRows = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  )

  const countFor = (filter: (typeof FILTERS)[number]) =>
    filter === 'all'
      ? shipments.length
      : shipments.filter((s) => s.status === filter).length

  return (
    <Stack direction="vertical" gap="normal">
      <Stack
        direction={{ narrow: 'vertical', regular: 'horizontal' }}
        gap="normal"
        align={{ narrow: 'stretch', regular: 'center' }}
        justify="space-between"
        wrap="wrap"
      >
        <SegmentedControl
          aria-label="Filter status pengiriman"
          size="small"
          variant={{ narrow: 'dropdown', regular: 'default' }}
          onChange={(index) => {
            setFilterIndex(index ?? 0)
            setPageIndex(0)
          }}
        >
          {FILTERS.map((filter, index) => (
            <SegmentedControl.Button
              key={filter}
              selected={index === filterIndex}
              count={countFor(filter)}
            >
              {filter === 'all' ? 'Semua' : STATUS_META[filter].label}
            </SegmentedControl.Button>
          ))}
        </SegmentedControl>
        <TextInput
          aria-label="Cari pengiriman"
          leadingVisual={SearchIcon}
          placeholder="Cari resi, penerima, kota…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPageIndex(0)
          }}
          style={{ minWidth: 260 }}
        />
      </Stack>

      <Table.Container>
        <Table.Title as="h2" id="shipments-title">
          Daftar pengiriman
        </Table.Title>
        <Table.Subtitle as="p" id="shipments-subtitle">
          {filtered.length} pengiriman ditemukan
        </Table.Subtitle>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <Blankslate border>
              <Blankslate.Visual>
                <SearchIcon size={24} />
              </Blankslate.Visual>
              <Blankslate.Heading>Tidak ada pengiriman</Blankslate.Heading>
              <Blankslate.Description>
                Coba ubah kata kunci atau filter status.
              </Blankslate.Description>
            </Blankslate>
          </div>
        ) : (
          <>
            <DataTable
              aria-labelledby="shipments-title"
              aria-describedby="shipments-subtitle"
              data={pageRows}
              columns={[
                {
                  header: 'No. Resi',
                  field: 'trackingNumber',
                  rowHeader: true,
                  renderCell: (row) => (
                    <Link
                      as={NextLink}
                      href={`/shipments/${row.id}`}
                      style={{
                        fontFamily: 'var(--fontStack-monospace)',
                        fontWeight: 'var(--base-text-weight-semibold)',
                      }}
                    >
                      {row.trackingNumber}
                    </Link>
                  ),
                },
                {
                  header: 'Penerima',
                  field: 'recipientName',
                  renderCell: (row) => (
                    <Stack direction="vertical" gap="none">
                      <Text weight="medium">{row.recipientName}</Text>
                      <Text
                        size="small"
                        style={{ color: 'var(--fgColor-muted)' }}
                      >
                        dari {row.senderName}
                      </Text>
                    </Stack>
                  ),
                },
                {
                  header: 'Rute',
                  field: 'originCity',
                  renderCell: (row) => (
                    <Stack
                      direction="horizontal"
                      gap="condensed"
                      align="center"
                    >
                      <Text>{row.originCity}</Text>
                      <ArrowRightIcon
                        size={12}
                        aria-label="ke"
                        fill="var(--fgColor-muted)"
                      />
                      <Text>{row.destinationCity}</Text>
                    </Stack>
                  ),
                },
                {
                  header: 'Layanan',
                  field: 'service',
                  renderCell: (row) => serviceLabel(row.service),
                },
                {
                  header: 'Status',
                  field: 'status',
                  renderCell: (row) => <StatusLabel status={row.status} />,
                },
                {
                  header: 'Kurir',
                  field: 'courierName',
                  renderCell: (row) =>
                    row.courierName ?? (
                      <Text style={{ color: 'var(--fgColor-muted)' }}>
                        Belum ditugaskan
                      </Text>
                    ),
                },
                {
                  header: 'Estimasi tiba',
                  field: 'estimatedDelivery',
                  renderCell: (row) => formatDate(row.estimatedDelivery),
                },
              ]}
            />
            {filtered.length > PAGE_SIZE && (
              <Table.Pagination
                key={`${activeFilter}-${query}`}
                aria-label="Paginasi daftar pengiriman"
                pageSize={PAGE_SIZE}
                totalCount={filtered.length}
                onChange={({ pageIndex: next }) => setPageIndex(next)}
              />
            )}
          </>
        )}
      </Table.Container>
    </Stack>
  )
}
