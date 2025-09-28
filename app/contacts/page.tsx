import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ContactsModule } from '@/components/contacts/contacts-module'

export default async function ContactsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <ContactsModule />
    </DashboardLayout>
  )
}


