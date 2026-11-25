'use client'

import { Stack, Text } from '@primer/react'
import {
  CheckCircleIcon,
  ClockIcon,
  PackageIcon,
  RocketIcon,
  XCircleIcon,
  type Icon,
} from '@primer/octicons-react'
import type { ShipmentRow } from '@/lib/shipments'

type Stat = {
  label: string
  value: number
  icon: Icon
  fg: string
  bg: string
}

export function StatsCards({ shipments }: { shipments: ShipmentRow[] }) {
  const count = (statuses: string[]) =>
    shipments.filter((s) => statuses.includes(s.status)).length

  const stats: Stat[] = [
    {
      label: 'Total pengiriman',
      value: shipments.length,
      icon: PackageIcon,
      fg: 'var(--fgColor-accent)',
      bg: 'var(--bgColor-accent-muted)',
    },
    {
      label: 'Menunggu pickup',
      value: count(['pending']),
      icon: ClockIcon,
      fg: 'var(--fgColor-muted)',
      bg: 'var(--bgColor-neutral-muted)',
    },
    {
      label: 'Dalam proses',
      value: count(['picked_up', 'in_transit', 'out_for_delivery']),
      icon: RocketIcon,
      fg: 'var(--fgColor-attention)',
      bg: 'var(--bgColor-attention-muted)',
    },
    {
      label: 'Terkirim',
      value: count(['delivered']),
      icon: CheckCircleIcon,
      fg: 'var(--fgColor-success)',
      bg: 'var(--bgColor-success-muted)',
    },
    {
      label: 'Gagal kirim',
      value: count(['failed']),
      icon: XCircleIcon,
      fg: 'var(--fgColor-danger)',
      bg: 'var(--bgColor-danger-muted)',
    },
  ]

  return (
    <section aria-label="Ringkasan pengiriman">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--base-size-16)',
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: 'var(--bgColor-default)',
              border:
                'var(--borderWidth-thin) solid var(--borderColor-default)',
              borderRadius: 'var(--borderRadius-large)',
              boxShadow: 'var(--shadow-resting-small)',
            }}
          >
            <Stack direction="vertical" gap="condensed" padding="normal">
              <Stack
                direction="horizontal"
                align="center"
                justify="space-between"
              >
                <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                  {stat.label}
                </Text>
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-flex',
                    padding: 'var(--base-size-6)',
                    borderRadius: 'var(--borderRadius-full)',
                    backgroundColor: stat.bg,
                    color: stat.fg,
                  }}
                >
                  <stat.icon size={16} />
                </span>
              </Stack>
              <Text
                style={{
                  fontSize: 'var(--text-title-size-large)',
                  fontWeight: 'var(--base-text-weight-semibold)',
                  lineHeight: 'var(--text-title-lineHeight-large)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {stat.value}
              </Text>
            </Stack>
          </div>
        ))}
      </div>
    </section>
  )
}
