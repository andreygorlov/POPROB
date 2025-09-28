'use client'

import { PermissionGuard } from '@/components/permissions/permission-guard'
import { usePermissions } from '@/components/permissions/permission-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

interface PermissionExamplesProps {
  userId?: string
  clientId?: string
}

export function PermissionExamples({ userId, clientId = 'default' }: PermissionExamplesProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions(userId, clientId)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>דוגמאות לשימוש במערכת הרשאות</CardTitle>
          <CardDescription>
            דוגמאות שונות לשימוש ב-PermissionGuard ו-usePermissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Example 1: Basic Permission Guard */}
          <div>
            <h3 className="text-lg font-semibold mb-3">1. הגנה בסיסית על הרשאות</h3>
            <div className="space-y-2">
              <PermissionGuard 
                permission="contacts.create" 
                userId={userId}
                clientId={clientId}
              >
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף איש קשר
                </Button>
              </PermissionGuard>

              <PermissionGuard 
                permission="contacts.read" 
                userId={userId}
                clientId={clientId}
              >
                <Button variant="outline">
                  <Eye className="h-4 w-4 ml-2" />
                  צפה באנשי קשר
                </Button>
              </PermissionGuard>
            </div>
          </div>

          {/* Example 2: Multiple Permissions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">2. הרשאות מרובות</h3>
            <div className="space-y-2">
              <PermissionGuard 
                permissions={['contacts.create', 'contacts.update']}
                requireAll={false}
                userId={userId}
                clientId={clientId}
              >
                <Button variant="secondary">
                  <Edit className="h-4 w-4 ml-2" />
                  ערוך או צור איש קשר
                </Button>
              </PermissionGuard>

              <PermissionGuard 
                permissions={['contacts.create', 'contacts.update', 'contacts.delete']}
                requireAll={true}
                userId={userId}
                clientId={clientId}
              >
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 ml-2" />
                  ניהול מלא של אנשי קשר
                </Button>
              </PermissionGuard>
            </div>
          </div>

          {/* Example 3: Using usePermissions Hook */}
          <div>
            <h3 className="text-lg font-semibold mb-3">3. שימוש ב-Hook</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">הרשאות זמינות:</h4>
                <div className="space-y-1">
                  {hasPermission('contacts.create') && (
                    <Badge variant="default">יצירת אנשי קשר</Badge>
                  )}
                  {hasPermission('contacts.read') && (
                    <Badge variant="default">צפייה באנשי קשר</Badge>
                  )}
                  {hasPermission('contacts.update') && (
                    <Badge variant="default">עריכת אנשי קשר</Badge>
                  )}
                  {hasPermission('contacts.delete') && (
                    <Badge variant="default">מחיקת אנשי קשר</Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">בדיקות מתקדמות:</h4>
                <div className="space-y-1">
                  {hasAnyPermission(['contacts.create', 'contacts.update']) && (
                    <Badge variant="secondary">יש הרשאה לעריכה/יצירה</Badge>
                  )}
                  {hasAllPermissions(['contacts.create', 'contacts.update', 'contacts.delete']) && (
                    <Badge variant="destructive">הרשאות מלאות</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Example 4: Conditional Rendering */}
          <div>
            <h3 className="text-lg font-semibold mb-3">4. עיצוב מותנה</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={hasPermission('contacts.create') ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
                <CardHeader>
                  <CardTitle className="text-sm">יצירת אנשי קשר</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasPermission('contacts.create') ? (
                    <Badge variant="default">זמין</Badge>
                  ) : (
                    <Badge variant="secondary">לא זמין</Badge>
                  )}
                </CardContent>
              </Card>

              <Card className={hasPermission('contacts.update') ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
                <CardHeader>
                  <CardTitle className="text-sm">עריכת אנשי קשר</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasPermission('contacts.update') ? (
                    <Badge variant="default">זמין</Badge>
                  ) : (
                    <Badge variant="secondary">לא זמין</Badge>
                  )}
                </CardContent>
              </Card>

              <Card className={hasPermission('contacts.delete') ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
                <CardHeader>
                  <CardTitle className="text-sm">מחיקת אנשי קשר</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasPermission('contacts.delete') ? (
                    <Badge variant="default">זמין</Badge>
                  ) : (
                    <Badge variant="secondary">לא זמין</Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Example 5: Custom Fallback */}
          <div>
            <h3 className="text-lg font-semibold mb-3">5. Fallback מותאם</h3>
            <PermissionGuard 
              permission="contacts.delete" 
              userId={userId}
              clientId={clientId}
              fallback={
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-yellow-800">הרשאה נדרשת</CardTitle>
                    <CardDescription className="text-yellow-600">
                      נדרשת הרשאה למחיקת אנשי קשר
                    </CardDescription>
                  </CardHeader>
                </Card>
              }
            >
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 ml-2" />
                מחק איש קשר
              </Button>
            </PermissionGuard>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
