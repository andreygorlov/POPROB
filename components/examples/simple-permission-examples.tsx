'use client'

import { SimplePermissionGuard } from '@/components/permissions/simple-permission-guard'
import { useSimplePermissions } from '@/components/permissions/simple-permission-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye, Download, Upload } from 'lucide-react'

interface SimplePermissionExamplesProps {
  userId?: string
  clientId?: string
}

export function SimplePermissionExamples({ userId, clientId = 'default' }: SimplePermissionExamplesProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useSimplePermissions(userId, clientId)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>דוגמאות לשימוש במערכת הרשאות פשוטה</CardTitle>
          <CardDescription>
            דוגמאות שונות לשימוש ב-SimplePermissionGuard ו-useSimplePermissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Example 1: Basic Permission Guard */}
          <div>
            <h3 className="text-lg font-semibold mb-3">1. הגנה בסיסית על הרשאות</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SimplePermissionGuard permission="contacts.create" userId={userId} clientId={clientId}>
                <Button className="w-full">
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף איש קשר
                </Button>
              </SimplePermissionGuard>

              <SimplePermissionGuard permission="contacts.read" userId={userId} clientId={clientId}>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 ml-2" />
                  צפה באנשי קשר
                </Button>
              </SimplePermissionGuard>

              <SimplePermissionGuard permission="contacts.update" userId={userId} clientId={clientId}>
                <Button variant="secondary" className="w-full">
                  <Edit className="h-4 w-4 ml-2" />
                  ערוך אנשי קשר
                </Button>
              </SimplePermissionGuard>

              <SimplePermissionGuard permission="contacts.delete" userId={userId} clientId={clientId}>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 ml-2" />
                  מחק אנשי קשר
                </Button>
              </SimplePermissionGuard>
            </div>
          </div>

          {/* Example 2: Multiple Permissions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">2. הרשאות מרובות</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SimplePermissionGuard 
                permissions={['contacts.create', 'contacts.update']}
                requireAll={false}
                userId={userId}
                clientId={clientId}
              >
                <Button variant="secondary" className="w-full">
                  <Edit className="h-4 w-4 ml-2" />
                  ערוך או צור איש קשר
                </Button>
              </SimplePermissionGuard>

              <SimplePermissionGuard 
                permissions={['contacts.create', 'contacts.update', 'contacts.delete']}
                requireAll={true}
                userId={userId}
                clientId={clientId}
              >
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 ml-2" />
                  ניהול מלא של אנשי קשר
                </Button>
              </SimplePermissionGuard>
            </div>
          </div>

          {/* Example 3: Using useSimplePermissions Hook */}
          <div>
            <h3 className="text-lg font-semibold mb-3">3. שימוש ב-Hook</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">הרשאות זמינות:</h4>
                <div className="space-y-2">
                  {hasPermission('contacts.create') && (
                    <Badge variant="default" className="flex items-center space-x-2 w-fit">
                      <Plus className="h-3 w-3" />
                      <span>יצירת אנשי קשר</span>
                    </Badge>
                  )}
                  {hasPermission('contacts.read') && (
                    <Badge variant="default" className="flex items-center space-x-2 w-fit">
                      <Eye className="h-3 w-3" />
                      <span>צפייה באנשי קשר</span>
                    </Badge>
                  )}
                  {hasPermission('contacts.update') && (
                    <Badge variant="default" className="flex items-center space-x-2 w-fit">
                      <Edit className="h-3 w-3" />
                      <span>עריכת אנשי קשר</span>
                    </Badge>
                  )}
                  {hasPermission('contacts.delete') && (
                    <Badge variant="default" className="flex items-center space-x-2 w-fit">
                      <Trash2 className="h-3 w-3" />
                      <span>מחיקת אנשי קשר</span>
                    </Badge>
                  )}
                  {hasPermission('contacts.export') && (
                    <Badge variant="default" className="flex items-center space-x-2 w-fit">
                      <Download className="h-3 w-3" />
                      <span>ייצוא אנשי קשר</span>
                    </Badge>
                  )}
                  {hasPermission('contacts.import') && (
                    <Badge variant="default" className="flex items-center space-x-2 w-fit">
                      <Upload className="h-3 w-3" />
                      <span>ייבוא אנשי קשר</span>
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">בדיקות מתקדמות:</h4>
                <div className="space-y-2">
                  {hasAnyPermission(['contacts.create', 'contacts.update']) && (
                    <Badge variant="secondary" className="flex items-center space-x-2 w-fit">
                      <Edit className="h-3 w-3" />
                      <span>יש הרשאה לעריכה/יצירה</span>
                    </Badge>
                  )}
                  {hasAllPermissions(['contacts.create', 'contacts.update', 'contacts.delete']) && (
                    <Badge variant="destructive" className="flex items-center space-x-2 w-fit">
                      <Trash2 className="h-3 w-3" />
                      <span>הרשאות מלאות</span>
                    </Badge>
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
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>יצירת אנשי קשר</span>
                  </CardTitle>
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
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Edit className="h-4 w-4" />
                    <span>עריכת אנשי קשר</span>
                  </CardTitle>
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
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>מחיקת אנשי קשר</span>
                  </CardTitle>
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
            <SimplePermissionGuard 
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
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 ml-2" />
                מחק איש קשר
              </Button>
            </SimplePermissionGuard>
          </div>

          {/* Example 6: Module-based permissions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">6. הרשאות לפי מודול</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['contacts', 'production', 'products', 'sales', 'purchasing', 'accounting', 'hr', 'reports', 'settings'].map(module => (
                <Card key={module} className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-sm capitalize">{module}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {hasPermission(`${module}.create`) && (
                        <Badge variant="outline" className="text-xs">יצירה</Badge>
                      )}
                      {hasPermission(`${module}.read`) && (
                        <Badge variant="outline" className="text-xs">צפייה</Badge>
                      )}
                      {hasPermission(`${module}.update`) && (
                        <Badge variant="outline" className="text-xs">עריכה</Badge>
                      )}
                      {hasPermission(`${module}.delete`) && (
                        <Badge variant="outline" className="text-xs">מחיקה</Badge>
                      )}
                      {hasPermission(`${module}.export`) && (
                        <Badge variant="outline" className="text-xs">ייצוא</Badge>
                      )}
                      {hasPermission(`${module}.approve`) && (
                        <Badge variant="outline" className="text-xs">אישור</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
