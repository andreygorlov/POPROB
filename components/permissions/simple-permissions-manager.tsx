'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Users, 
  Settings, 
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface RolePermissions {
  role: string
  permissions: string[]
  count: number
}

interface SimplePermissionsManagerProps {
  clientId?: string
}

export function SimplePermissionsManager({ clientId = 'default' }: SimplePermissionsManagerProps) {
  const [activeTab, setActiveTab] = useState('roles')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [rolePermissions, setRolePermissions] = useState<RolePermissions | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const roles = [
    { value: 'ADMIN', label: 'מנהל מערכת', description: 'גישה מלאה לכל המערכת', level: 100 },
    { value: 'MANAGER', label: 'מנהל', description: 'ניהול צוותים ומחלקות', level: 75 },
    { value: 'EMPLOYEE', label: 'עובד', description: 'גישה סטנדרטית למערכת', level: 50 },
    { value: 'CLIENT', label: 'לקוח', description: 'גישה מוגבלת לנתונים אישיים', level: 25 }
  ]

  const modules = [
    { name: 'contacts', label: 'אנשי קשר', icon: '👥' },
    { name: 'production', label: 'ייצור', icon: '🏭' },
    { name: 'products', label: 'מוצרים', icon: '📦' },
    { name: 'sales', label: 'מכירות', icon: '💰' },
    { name: 'purchasing', label: 'רכש', icon: '🛒' },
    { name: 'accounting', label: 'הנהלת חשבונות', icon: '📊' },
    { name: 'hr', label: 'משאבי אנוש', icon: '👨‍💼' },
    { name: 'reports', label: 'דוחות', icon: '📈' },
    { name: 'settings', label: 'הגדרות', icon: '⚙️' }
  ]

  const actions = [
    { name: 'create', label: 'יצירה', icon: '➕' },
    { name: 'read', label: 'צפייה', icon: '👁️' },
    { name: 'update', label: 'עריכה', icon: '✏️' },
    { name: 'delete', label: 'מחיקה', icon: '🗑️' },
    { name: 'export', label: 'ייצוא', icon: '📤' },
    { name: 'import', label: 'ייבוא', icon: '📥' },
    { name: 'approve', label: 'אישור', icon: '✅' }
  ]

  const loadRolePermissions = async (role: string) => {
    if (!role) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/permissions/simple?role=${role}`)
      if (response.ok) {
        const data = await response.json()
        setRolePermissions(data)
      }
    } catch (error) {
      // Error loading role permissions
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole)
    }
  }, [selectedRole])

  const getPermissionIcon = (permission: string) => {
    const action = permission.split('.')[1]
    const actionInfo = actions.find(a => a.name === action)
    return actionInfo?.icon || '🔧'
  }

  const getPermissionLabel = (permission: string) => {
    const [module, action] = permission.split('.')
    const moduleInfo = modules.find(m => m.name === module)
    const actionInfo = actions.find(a => a.name === action)
    return `${moduleInfo?.label || module} - ${actionInfo?.label || action}`
  }

  const groupPermissionsByModule = (permissions: string[]) => {
    const grouped: Record<string, string[]> = {}
    permissions.forEach(permission => {
      const [module] = permission.split('.')
      if (!grouped[module]) {
        grouped[module] = []
      }
      grouped[module].push(permission)
    })
    return grouped
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>מערכת הרשאות מבוססת תפקידים</span>
          </CardTitle>
          <CardDescription>
            מערכת פשוטה לניהול הרשאות לפי תפקידים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="roles">הרשאות לפי תפקיד</TabsTrigger>
              <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
            </TabsList>

            <TabsContent value="roles" className="space-y-4">
              <div className="flex space-x-4">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="בחר תפקיד" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center space-x-2">
                          <span>{role.label}</span>
                          <Badge variant="outline">רמה {role.level}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => loadRolePermissions(selectedRole)} disabled={!selectedRole || isLoading}>
                  {isLoading ? 'טוען...' : 'רענן'}
                </Button>
              </div>

              {rolePermissions && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {roles.find(r => r.value === selectedRole)?.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {roles.find(r => r.value === selectedRole)?.description}
                      </p>
                    </div>
                    <Badge variant="default">
                      {rolePermissions.count} הרשאות
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(groupPermissionsByModule(rolePermissions.permissions)).map(([module, permissions]) => {
                      const moduleInfo = modules.find(m => m.name === module)
                      return (
                        <Card key={module}>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <span className="text-lg">{moduleInfo?.icon}</span>
                              <span>{moduleInfo?.label || module}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {permissions.map(permission => (
                                <div key={permission} className="flex items-center space-x-2">
                                  <span className="text-sm">{getPermissionIcon(permission)}</span>
                                  <span className="text-sm">{getPermissionLabel(permission)}</span>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {roles.map(role => (
                  <Card key={role.value} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{role.label}</span>
                        <Badge variant="outline">רמה {role.level}</Badge>
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setSelectedRole(role.value)
                          setActiveTab('roles')
                        }}
                      >
                        <Settings className="h-4 w-4 ml-2" />
                        צפה בהרשאות
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>מידע על המערכת</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">תפקידים זמינים:</h4>
                      <ul className="text-sm space-y-1">
                        {roles.map(role => (
                          <li key={role.value} className="flex items-center space-x-2">
                            <span>{role.label}</span>
                            <Badge variant="outline" className="text-xs">רמה {role.level}</Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">פעולות זמינות:</h4>
                      <ul className="text-sm space-y-1">
                        {actions.map(action => (
                          <li key={action.name} className="flex items-center space-x-2">
                            <span>{action.icon}</span>
                            <span>{action.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">מידע חשוב</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      מערכת ההרשאות מבוססת על תפקידים. כל משתמש מקבל הרשאות לפי התפקיד שלו.
                      מנהלי מערכת יכולים לשנות תפקידים של משתמשים בעמוד ניהול המשתמשים.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
