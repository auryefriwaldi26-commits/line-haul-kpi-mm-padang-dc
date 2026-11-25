'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Flash,
  FormControl,
  Select,
  Stack,
  Textarea,
  TextInput,
} from '@primer/react'
import { SyncIcon } from '@primer/octicons-react'
import { updateShipmentStatus } from '@/app/actions/shipments'
import {
  SHIPMENT_STATUSES,
  STATUS_META,
  type ShipmentRow,
} from '@/lib/shipments'

function nextStatus(current: string) {
  const index = SHIPMENT_STATUSES.indexOf(
    current as (typeof SHIPMENT_STATUSES)[number],
  )
  if (index < 0 || index >= SHIPMENT_STATUSES.indexOf('delivered'))
    return current
  return SHIPMENT_STATUSES[index + 1]
}

export function UpdateStatusForm({ shipment }: { shipment: ShipmentRow }) {
  const router = useRouter()
  const [status, setStatus] = useState(nextStatus(shipment.status))
  const [location, setLocation] = useState(shipment.destinationCity)
  const [courierName, setCourierName] = useState(shipment.courierName ?? '')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState<{
    variant: 'success' | 'danger'
    text: string
  } | null>(null)
  const [isPending, startTransition] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    startTransition(async () => {
      const result = await updateShipmentStatus({
        shipmentId: shipment.id,
        status,
        location,
        courierName,
        note,
      })
      if (!result.ok) {
        setMessage({ variant: 'danger', text: result.error })
        return
      }
      setNote('')
      setMessage({ variant: 'success', text: 'Status berhasil diperbarui.' })
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit}>
      <Stack direction="vertical" gap="normal">
        {message && <Flash variant={message.variant}>{message.text}</Flash>}
        <FormControl required>
          <FormControl.Label>Status baru</FormControl.Label>
          <Select block value={status} onChange={(e) => setStatus(e.target.value)}>
            {SHIPMENT_STATUSES.map((value) => (
              <Select.Option key={value} value={value}>
                {STATUS_META[value].label}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
        <FormControl required>
          <FormControl.Label>Lokasi</FormControl.Label>
          <TextInput
            block
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Hub Jakarta"
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>Kurir</FormControl.Label>
          <TextInput
            block
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            placeholder="Nama kurir"
          />
          <FormControl.Caption>Kosongkan untuk tetap.</FormControl.Caption>
        </FormControl>
        <FormControl>
          <FormControl.Label>Catatan</FormControl.Label>
          <Textarea
            block
            rows={3}
            resize="vertical"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Paket diterima satpam"
          />
        </FormControl>
        <Button
          type="submit"
          variant="primary"
          block
          leadingVisual={SyncIcon}
          loading={isPending}
        >
          Perbarui status
        </Button>
      </Stack>
    </form>
  )
}
