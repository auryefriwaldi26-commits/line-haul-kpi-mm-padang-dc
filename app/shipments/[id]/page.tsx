import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getShipment } from '@/lib/queries'
import { ShipmentDetailView } from '@/components/shipment-detail/shipment-detail-view'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

function parseId(raw: string) {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id)
  const data = id ? await getShipment(id) : null
  return {
    title: data
      ? `${data.shipment.trackingNumber} · SPX Express`
      : 'Pengiriman tidak ditemukan',
  }
}

export default async function ShipmentPage({ params }: Props) {
  const id = parseId((await params).id)
  if (!id) notFound()
  const data = await getShipment(id)
  if (!data) notFound()
  return <ShipmentDetailView shipment={data.shipment} events={data.events} />
}
