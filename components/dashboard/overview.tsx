'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, Settings, TrendingUp } from 'lucide-react'
import { FullBackupWidget } from '@/components/backup/full-backup-widget'

export function DashboardOverview() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">לוח בקרה</h1>
        <p className="text-gray-600">סקירה כללית של המערכת</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אנשי קשר</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">סה&quot;כ אנשי קשר</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">עובדים</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">סה&quot;כ עובדים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">פרויקטים</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">פרויקטים פעילים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משימות</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">משימות פתוחות</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>פעילות אחרונה</CardTitle>
            <CardDescription>הפעולות האחרונות במערכת</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              אין פעילות אחרונה
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>סטטיסטיקות מהירות</CardTitle>
            <CardDescription>נתונים מהירים על המערכת</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">אנשי קשר חדשים השבוע</span>
                <span className="text-sm font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">עובדים פעילים</span>
                <span className="text-sm font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">פרויקטים בהתקדמות</span>
                <span className="text-sm font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">משימות שהושלמו השבוע</span>
                <span className="text-sm font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <FullBackupWidget />
      </div>
    </div>
  )
}


