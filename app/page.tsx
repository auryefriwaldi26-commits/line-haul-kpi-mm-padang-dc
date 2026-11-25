import { listShipments } from '@/lib/queries'
import { DashboardView } from '@/components/dashboard/dashboard-view'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const shipments = await listShipments()
  return <DashboardView shipments={shipments} />
}
