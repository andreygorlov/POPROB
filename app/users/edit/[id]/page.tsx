import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { EditUserForm } from '@/components/users/edit-user-form'
import { Toaster } from 'sonner'

interface EditUserPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">עריכת משתמש</h1>
          <p className="text-gray-600 mt-2">
            ערוך פרטי משתמש במערכת
          </p>
        </div>
        <EditUserForm userId={id} />
        <Toaster />
      </div>
    </DashboardLayout>
  )
}
