import { RolesManager } from '@/components/roles/roles-manager'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function RolesPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">ניהול תפקידים</h1>
          <p className="text-gray-600 mt-2">
            נהל תפקידים במערכת והגדר הרשאות לכל תפקיד
          </p>
        </div>
        
        <RolesManager />
      </div>
    </DashboardLayout>
  )
}
