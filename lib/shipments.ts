export const SHIPMENT_STATUSES = [
  'pending',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'failed',
] as const

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number]

export const SERVICES = ['standard', 'express', 'same_day'] as const
export type ServiceType = (typeof SERVICES)[number]

type LabelVariant =
  | 'secondary'
  | 'accent'
  | 'attention'
  | 'done'
  | 'success'
  | 'danger'

export const STATUS_META: Record<
  ShipmentStatus,
  { label: string; labelVariant: LabelVariant }
> = {
  pending: { label: 'Menunggu Pickup', labelVariant: 'secondary' },
  picked_up: { label: 'Sudah Di-pickup', labelVariant: 'accent' },
  in_transit: { label: 'Dalam Perjalanan', labelVariant: 'attention' },
  out_for_delivery: { label: 'Sedang Diantar', labelVariant: 'done' },
  delivered: { label: 'Terkirim', labelVariant: 'success' },
  failed: { label: 'Gagal Kirim', labelVariant: 'danger' },
}

export const SERVICE_LABEL: Record<ServiceType, string> = {
  standard: 'Standard',
  express: 'Express',
  same_day: 'Same Day',
}

export function isShipmentStatus(value: string): value is ShipmentStatus {
  return (SHIPMENT_STATUSES as readonly string[]).includes(value)
}

export function isServiceType(value: string): value is ServiceType {
  return (SERVICES as readonly string[]).includes(value)
}

export function statusLabel(status: string) {
  return isShipmentStatus(status) ? STATUS_META[status].label : status
}

export function serviceLabel(service: string) {
  return isServiceType(service) ? SERVICE_LABEL[service] : service
}

export type ShipmentRow = {
  id: number
  trackingNumber: string
  senderName: string
  recipientName: string
  recipientPhone: string
  originCity: string
  destinationCity: string
  service: string
  weightKg: string
  status: string
  courierName: string | null
  estimatedDelivery: string | null
  createdAt: string
  updatedAt: string
}

export type ShipmentEventRow = {
  id: number
  status: string
  location: string
  note: string | null
  createdAt: string
}

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta',
})

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeZone: 'Asia/Jakarta',
})

export function formatDateTime(iso: string) {
  return dateTimeFormatter.format(new Date(iso))
}

export function formatDate(isoDate: string | null) {
  if (!isoDate) return '-'
  return dateFormatter.format(new Date(`${isoDate}T00:00:00+07:00`))
}
