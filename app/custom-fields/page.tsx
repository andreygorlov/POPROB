'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustomFieldManager } from '@/components/custom-fields/custom-field-manager'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Settings, Users, Building, Truck, UserCheck, FolderOpen, CheckSquare } from 'lucide-react'

const entityTypes = [
  { value: 'USER', label: 'משתמשים', icon: Users },
  { value: 'CONTACT', label: 'אנשי קשר', icon: UserCheck },
  { value: 'COMPANY', label: 'חברות', icon: Building },
  { value: 'SUPPLIER', label: 'ספקים', icon: Truck },
  { value: 'EMPLOYEE', label: 'עובדים', icon: UserCheck },
  { value: 'PROJECT', label: 'פרויקטים', icon: FolderOpen },
  { value: 'TASK', label: 'משימות', icon: CheckSquare }
] as const

export default function CustomFieldsPage() {
  const [selectedEntityType, setSelectedEntityType] = useState<'USER' | 'CONTACT' | 'COMPANY' | 'SUPPLIER' | 'EMPLOYEE' | 'PROJECT' | 'TASK'>('USER')

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">שדות מותאמים אישית</h1>
          <p className="text-gray-600 mt-2">
            נהל שדות מותאמים אישית עבור ישויות שונות במערכת
          </p>
        </div>

      <Tabs value={selectedEntityType} onValueChange={(value) => setSelectedEntityType(value as any)}>
        <TabsList className="grid w-full grid-cols-7">
          {entityTypes.map((entity) => {
            const Icon = entity.icon
            return (
              <TabsTrigger key={entity.value} value={entity.value} className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{entity.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {entityTypes.map((entity) => {
          const Icon = entity.icon
          return (
            <TabsContent key={entity.value} value={entity.value} className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle>שדות מותאמים אישית - {entity.label}</CardTitle>
                      <CardDescription>
                        נהל שדות מותאמים אישית עבור {entity.label}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CustomFieldManager entityType={entity.value} />
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>מידע על השדות המותאמים אישית ושדות חובה מערכת</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">שדות חובה מערכת*</h3>
            <p className="text-sm text-blue-700">
              שדות חובה מערכת הם שדות בסיסיים שמוגדרים אוטומטית עבור כל ישות במערכת.
              שדות אלה מוצגים עם תווית &quot;חובה&quot; ולא ניתן לערוך או למחוק אותם.
              הם כוללים שדות חיוניים כמו שם, אימייל, סטטוס ועוד לפי סוג הישות.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">סוגי שדות זמינים:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>טקסט:</strong> שדה טקסט פשוט</li>
                <li>• <strong>מספר:</strong> שדה מספרי</li>
                <li>• <strong>תאריך:</strong> בחירת תאריך</li>
                <li>• <strong>רשימה נפתחת:</strong> בחירה מרשימה מוגדרת</li>
                <li>• <strong>כן/לא:</strong> שדה בוליאני</li>
                <li>• <strong>אימייל:</strong> שדה אימייל עם ולידציה</li>
                <li>• <strong>טלפון:</strong> שדה טלפון</li>
                <li>• <strong>קישור:</strong> שדה URL</li>
                <li>• <strong>טקסט ארוך:</strong> שדה טקסט רב-שורות</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">תכונות:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>שדות חובה מערכת:</strong> שדות בסיסיים שמוגדרים אוטומטית</li>
                <li>• <strong>שדות מותאמים אישית:</strong> שדות נוספים שניתן להוסיף</li>
                <li>• <strong>שדות חובה:</strong> הגדר שדות כחובה</li>
                <li>• <strong>תיאורים:</strong> הוסף הסברים למשתמשים</li>
                <li>• <strong>סדר תצוגה:</strong> קבע סדר השדות</li>
                <li>• <strong>פעיל/לא פעיל:</strong> הפעל או השבת שדות</li>
                <li>• <strong>אפשרויות מותאמות:</strong> עבור שדות רשימה</li>
                <li>• <strong>תמיכה ב-multi-tenant:</strong> שדות נפרדים לכל לקוח</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
