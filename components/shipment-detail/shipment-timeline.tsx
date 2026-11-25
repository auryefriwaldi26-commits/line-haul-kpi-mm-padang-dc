'use client'

import { Stack, Text, Timeline } from '@primer/react'
import {
  CheckCircleIcon,
  ClockIcon,
  LocationIcon,
  PackageIcon,
  RocketIcon,
  XCircleIcon,
  type Icon,
} from '@primer/octicons-react'
import {
  formatDateTime,
  statusLabel,
  type ShipmentEventRow,
} from '@/lib/shipments'

type BadgeVariant = 'accent' | 'success' | 'attention' | 'danger' | 'done'

const EVENT_VISUAL: Record<string, { icon: Icon; variant?: BadgeVariant }> = {
  pending: { icon: ClockIcon },
  picked_up: { icon: PackageIcon, variant: 'accent' },
  in_transit: { icon: RocketIcon, variant: 'attention' },
  out_for_delivery: { icon: LocationIcon, variant: 'done' },
  delivered: { icon: CheckCircleIcon, variant: 'success' },
  failed: { icon: XCircleIcon, variant: 'danger' },
}

export function ShipmentTimeline({ events }: { events: ShipmentEventRow[] }) {
  if (events.length === 0) {
    return (
      <Text style={{ color: 'var(--fgColor-muted)' }}>
        Belum ada riwayat perjalanan.
      </Text>
    )
  }

  return (
    <Timeline clipSidebar>
      {events.map((event, index) => {
        const visual = EVENT_VISUAL[event.status] ?? { icon: ClockIcon }
        const isLatest = index === 0
        return (
          <Timeline.Item key={event.id}>
            <Timeline.Badge variant={isLatest ? visual.variant : undefined}>
              <visual.icon />
            </Timeline.Badge>
            <Timeline.Body>
              <Stack direction="vertical" gap="none">
                <Text
                  weight={isLatest ? 'semibold' : 'normal'}
                  style={{ color: 'var(--fgColor-default)' }}
                >
                  {statusLabel(event.status)}
                  {event.note ? ` — ${event.note}` : ''}
                </Text>
                <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                  {event.location} · {formatDateTime(event.createdAt)}
                </Text>
              </Stack>
            </Timeline.Body>
          </Timeline.Item>
        )
      })}
    </Timeline>
  )
}
