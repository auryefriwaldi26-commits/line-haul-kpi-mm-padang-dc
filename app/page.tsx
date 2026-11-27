import { listShipments } from '@/lib/queries'
import { countLineHaulRoutes } from '@/lib/line-haul/queries'
import { DashboardView } from '@/components/dashboard/dashboard-view'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [shipments, routeCount] = await Promise.all([
    listShipments(),
    countLineHaulRoutes(),
  ])
  return <DashboardView shipments={shipments} routeCount={routeCount} />
}
