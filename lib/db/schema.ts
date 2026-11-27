import { sql } from 'drizzle-orm'
import {
  date,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const shipments = pgTable('shipments', {
  id: serial('id').primaryKey(),
  trackingNumber: text('tracking_number').notNull().unique(),
  senderName: text('sender_name').notNull(),
  recipientName: text('recipient_name').notNull(),
  recipientPhone: text('recipient_phone').notNull(),
  originCity: text('origin_city').notNull(),
  destinationCity: text('destination_city').notNull(),
  service: text('service').notNull().default('standard'),
  weightKg: numeric('weight_kg', { precision: 8, scale: 2 })
    .notNull()
    .default('1'),
  status: text('status').notNull().default('pending'),
  courierName: text('courier_name'),
  estimatedDelivery: date('estimated_delivery'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const shipmentEvents = pgTable(
  'shipment_events',
  {
    id: serial('id').primaryKey(),
    shipmentId: integer('shipment_id').notNull(),
    status: text('status').notNull(),
    location: text('location').notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('shipment_events_shipment_id_idx').on(
      table.shipmentId,
      table.createdAt.desc(),
    ),
  ],
)

/**
 * Rute line haul hasil impor dari Google Sheets jadwal (mis. tab "Padang DC").
 * Satu baris = satu rute asal DC menuju deret hub tujuan.
 */
export const lineHaulRoutes = pgTable(
  'line_haul_routes',
  {
    id: serial('id').primaryKey(),
    origin: text('origin').notNull(),
    routeLabel: text('route_label').notNull(),
    stops: text('stops')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    scheme: text('scheme'),
    scheduleIndicator: text('schedule_indicator').notNull().default('off'),
    cotLabel: text('cot_label'),
    sourceSheet: text('source_sheet'),
    sourceRow: integer('source_row'),
    importedAt: timestamp('imported_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('line_haul_routes_origin_route_idx').on(
      table.origin,
      table.routeLabel,
    ),
    index('line_haul_routes_origin_idx').on(table.origin),
  ],
)
