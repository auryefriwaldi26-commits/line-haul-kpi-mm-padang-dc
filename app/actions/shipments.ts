'use server'

import { randomInt } from 'node:crypto'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { shipmentEvents, shipments } from '@/lib/db/schema'
import { isServiceType, isShipmentStatus, statusLabel } from '@/lib/shipments'

export type ActionResult =
  | { ok: true; id?: number; trackingNumber?: string }
  | { ok: false; error: string }

function requiredText(value: unknown, field: string, max = 120) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) throw new ValidationError(`${field} wajib diisi.`)
  if (text.length > max)
    throw new ValidationError(`${field} maksimal ${max} karakter.`)
  return text
}

function optionalText(value: unknown, max = 240) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (text.length > max)
    throw new ValidationError(`Teks maksimal ${max} karakter.`)
  return text || null
}

class ValidationError extends Error {}

function generateTrackingNumber() {
  const now = new Date()
  const ymd = now.toISOString().slice(2, 10).replaceAll('-', '')
  return `SPXID${ymd}${randomInt(100000, 999999)}`
}

export type CreateShipmentInput = {
  senderName: string
  recipientName: string
  recipientPhone: string
  originCity: string
  destinationCity: string
  service: string
  weightKg: string
}

export async function createShipment(
  input: CreateShipmentInput,
): Promise<ActionResult> {
  try {
    const senderName = requiredText(input.senderName, 'Nama pengirim')
    const recipientName = requiredText(input.recipientName, 'Nama penerima')
    const recipientPhone = requiredText(input.recipientPhone, 'No. HP', 20)
    if (!/^\+?[0-9]{8,15}$/.test(recipientPhone))
      throw new ValidationError('No. HP harus 8–15 digit angka.')
    const originCity = requiredText(input.originCity, 'Kota asal', 60)
    const destinationCity = requiredText(
      input.destinationCity,
      'Kota tujuan',
      60,
    )
    if (!isServiceType(input.service))
      throw new ValidationError('Layanan tidak valid.')
    const weight = Number(input.weightKg)
    if (!Number.isFinite(weight) || weight < 0.1 || weight > 100)
      throw new ValidationError('Berat harus antara 0,1 dan 100 kg.')

    const etaDays =
      input.service === 'same_day' ? 0 : input.service === 'express' ? 1 : 3

    const created = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(shipments)
        .values({
          trackingNumber: generateTrackingNumber(),
          senderName,
          recipientName,
          recipientPhone,
          originCity,
          destinationCity,
          service: input.service,
          weightKg: weight.toFixed(2),
          estimatedDelivery: sql`current_date + ${etaDays}::int`,
        })
        .returning({
          id: shipments.id,
          trackingNumber: shipments.trackingNumber,
        })
      await tx.insert(shipmentEvents).values({
        shipmentId: row.id,
        status: 'pending',
        location: originCity,
        note: 'Pesanan dibuat oleh pengirim',
      })
      return row
    })

    revalidatePath('/')
    return { ok: true, ...created }
  } catch (error) {
    if (error instanceof ValidationError)
      return { ok: false, error: error.message }
    console.error('[createShipment]', error)
    return { ok: false, error: 'Gagal membuat pengiriman. Coba lagi.' }
  }
}

export type UpdateStatusInput = {
  shipmentId: number
  status: string
  location: string
  courierName: string
  note: string
}

export async function updateShipmentStatus(
  input: UpdateStatusInput,
): Promise<ActionResult> {
  try {
    if (!Number.isInteger(input.shipmentId) || input.shipmentId <= 0)
      throw new ValidationError('Pengiriman tidak valid.')
    if (!isShipmentStatus(input.status))
      throw new ValidationError('Status tidak valid.')
    const location = requiredText(input.location, 'Lokasi', 80)
    const courierName = optionalText(input.courierName, 80)
    const note = optionalText(input.note) ?? statusLabel(input.status)
    const status = input.status

    const updated = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(shipments)
        .set({
          status,
          updatedAt: new Date(),
          ...(courierName ? { courierName } : {}),
        })
        .where(eq(shipments.id, input.shipmentId))
        .returning({ id: shipments.id })
      if (!row) return null
      await tx.insert(shipmentEvents).values({
        shipmentId: row.id,
        status,
        location,
        note,
      })
      return row
    })

    if (!updated) return { ok: false, error: 'Pengiriman tidak ditemukan.' }

    revalidatePath('/')
    revalidatePath(`/shipments/${input.shipmentId}`)
    return { ok: true, id: updated.id }
  } catch (error) {
    if (error instanceof ValidationError)
      return { ok: false, error: error.message }
    console.error('[updateShipmentStatus]', error)
    return { ok: false, error: 'Gagal memperbarui status. Coba lagi.' }
  }
}
