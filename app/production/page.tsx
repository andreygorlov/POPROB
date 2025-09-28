import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProductionModule } from '@/components/production/production-module'

export default async function ProductionPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <ProductionModule />
    </DashboardLayout>
  )
}


