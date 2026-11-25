import 'server-only'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { shipmentEvents, shipments } from '@/lib/db/schema'
import type { ShipmentEventRow, ShipmentRow } from '@/lib/shipments'

type ShipmentRecord = typeof shipments.$inferSelect

function toRow(record: ShipmentRecord): ShipmentRow {
  return {
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}

export async function listShipments(): Promise<ShipmentRow[]> {
  const records = await db
    .select()
    .from(shipments)
    .orderBy(desc(shipments.createdAt))
  return records.map(toRow)
}

export async function getShipment(id: number) {
  const [record] = await db
    .select()
    .from(shipments)
    .where(eq(shipments.id, id))
    .limit(1)
  if (!record) return null

  const events = await db
    .select({
      id: shipmentEvents.id,
      status: shipmentEvents.status,
      location: shipmentEvents.location,
      note: shipmentEvents.note,
      createdAt: shipmentEvents.createdAt,
    })
    .from(shipmentEvents)
    .where(eq(shipmentEvents.shipmentId, id))
    .orderBy(desc(shipmentEvents.createdAt), desc(shipmentEvents.id))

  return {
    shipment: toRow(record),
    events: events.map<ShipmentEventRow>((event) => ({
      ...event,
      createdAt: event.createdAt.toISOString(),
    })),
  }
}
