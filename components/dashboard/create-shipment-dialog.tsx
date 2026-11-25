'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Flash,
  FormControl,
  Select,
  Stack,
  TextInput,
} from '@primer/react'
import { Dialog } from '@primer/react/experimental'
import { PlusIcon } from '@primer/octicons-react'
import {
  createShipment,
  type CreateShipmentInput,
} from '@/app/actions/shipments'
import { SERVICE_LABEL, SERVICES } from '@/lib/shipments'

const EMPTY_FORM: CreateShipmentInput = {
  senderName: '',
  recipientName: '',
  recipientPhone: '',
  originCity: '',
  destinationCity: '',
  service: 'standard',
  weightKg: '1',
}

export function CreateShipmentDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const update =
    (field: keyof CreateShipmentInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const close = () => {
    setOpen(false)
    setError(null)
    setForm(EMPTY_FORM)
  }

  const submit = () => {
    setError(null)
    startTransition(async () => {
      const result = await createShipment(form)
      if (!result.ok) {
        setError(result.error)
        return
      }
      close()
      if (result.id) router.push(`/shipments/${result.id}`)
    })
  }

  return (
    <>
      <Button
        variant="primary"
        leadingVisual={PlusIcon}
        onClick={() => setOpen(true)}
      >
        Buat pengiriman
      </Button>
      {open && (
        <Dialog
          title="Buat pengiriman baru"
          subtitle="Nomor resi dibuat otomatis setelah disimpan."
          width="large"
          onClose={close}
          footerButtons={[
            { buttonType: 'default', content: 'Batal', onClick: close },
            {
              buttonType: 'primary',
              content: 'Simpan pengiriman',
              onClick: submit,
              loading: isPending,
            },
          ]}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <Stack direction="vertical" gap="normal">
              {error && <Flash variant="danger">{error}</Flash>}
              <FormControl required>
                <FormControl.Label>Nama pengirim / toko</FormControl.Label>
                <TextInput
                  block
                  value={form.senderName}
                  onChange={update('senderName')}
                  placeholder="Toko Batik Sari"
                />
              </FormControl>
              <Stack
                direction={{ narrow: 'vertical', regular: 'horizontal' }}
                gap="normal"
              >
                <div style={{ flex: 1 }}>
                  <FormControl required>
                    <FormControl.Label>Nama penerima</FormControl.Label>
                    <TextInput
                      block
                      value={form.recipientName}
                      onChange={update('recipientName')}
                      placeholder="Rina Wulandari"
                    />
                  </FormControl>
                </div>
                <div style={{ flex: 1 }}>
                  <FormControl required>
                    <FormControl.Label>No. HP penerima</FormControl.Label>
                    <TextInput
                      block
                      type="tel"
                      inputMode="tel"
                      value={form.recipientPhone}
                      onChange={update('recipientPhone')}
                      placeholder="081234567890"
                    />
                  </FormControl>
                </div>
              </Stack>
              <Stack
                direction={{ narrow: 'vertical', regular: 'horizontal' }}
                gap="normal"
              >
                <div style={{ flex: 1 }}>
                  <FormControl required>
                    <FormControl.Label>Kota asal</FormControl.Label>
                    <TextInput
                      block
                      value={form.originCity}
                      onChange={update('originCity')}
                      placeholder="Jakarta"
                    />
                  </FormControl>
                </div>
                <div style={{ flex: 1 }}>
                  <FormControl required>
                    <FormControl.Label>Kota tujuan</FormControl.Label>
                    <TextInput
                      block
                      value={form.destinationCity}
                      onChange={update('destinationCity')}
                      placeholder="Bandung"
                    />
                  </FormControl>
                </div>
              </Stack>
              <Stack
                direction={{ narrow: 'vertical', regular: 'horizontal' }}
                gap="normal"
              >
                <div style={{ flex: 1 }}>
                  <FormControl required>
                    <FormControl.Label>Layanan</FormControl.Label>
                    <Select
                      block
                      value={form.service}
                      onChange={update('service')}
                    >
                      {SERVICES.map((service) => (
                        <Select.Option key={service} value={service}>
                          {SERVICE_LABEL[service]}
                        </Select.Option>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div style={{ flex: 1 }}>
                  <FormControl required>
                    <FormControl.Label>Berat (kg)</FormControl.Label>
                    <TextInput
                      block
                      type="number"
                      min={0.1}
                      max={100}
                      step={0.1}
                      value={form.weightKg}
                      onChange={update('weightKg')}
                    />
                  </FormControl>
                </div>
              </Stack>
              <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
            </Stack>
          </form>
        </Dialog>
      )}
    </>
  )
}
