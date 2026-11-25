'use client'

import { Label } from '@primer/react'
import { isShipmentStatus, STATUS_META } from '@/lib/shipments'

export function StatusLabel({
  status,
  size = 'small',
}: {
  status: string
  size?: 'small' | 'large'
}) {
  if (!isShipmentStatus(status)) return <Label size={size}>{status}</Label>
  const meta = STATUS_META[status]
  return (
    <Label variant={meta.labelVariant} size={size}>
      {meta.label}
    </Label>
  )
}
