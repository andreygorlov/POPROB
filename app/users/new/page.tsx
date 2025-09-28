import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { NewUserForm } from '@/components/users/new-user-form'
import { Toaster } from 'sonner'

export default function NewUserPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">הוספת משתמש חדש</h1>
          <p className="text-gray-600 mt-2">
            הוסף משתמש חדש למערכת
          </p>
        </div>
        <NewUserForm />
        <Toaster />
      </div>
    </DashboardLayout>
  )
}
