import { UserManager } from '@/components/users/user-manager'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Toaster } from 'sonner'

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">ניהול משתמשים</h1>
        <UserManager />
        <Toaster />
      </div>
    </DashboardLayout>
  )
}
