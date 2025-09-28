import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PermissionsManager } from '@/components/permissions/permissions-manager'
import { RolePermissionsEditor } from '@/components/permissions/role-permissions-editor'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Shield, Users } from 'lucide-react'

export default function PermissionsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">ניהול הרשאות</h1>
          <p className="text-gray-600 mt-2">
            נהל הרשאות במערכת והגדר הרשאות לכל תפקיד
          </p>
        </div>
        
        <Tabs defaultValue="permissions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              הרשאות
            </TabsTrigger>
            <TabsTrigger value="role-permissions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              הרשאות תפקידים
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="permissions">
            <PermissionsManager />
          </TabsContent>
          
          <TabsContent value="role-permissions">
            <RolePermissionsEditor />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}