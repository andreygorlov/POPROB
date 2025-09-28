import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardOverview } from '@/components/dashboard/overview'

export default async function DashboardPage() {
  // Skip authentication for now
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  )
}


