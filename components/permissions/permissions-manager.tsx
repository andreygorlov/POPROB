'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Save, X, Shield, Settings, Users } from 'lucide-react'
import { toast } from 'sonner'

interface Permission {
  id: string
  name: string
  label: string
  description?: string
  module: string
  action: string
  resource?: string
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

interface Role {
  id: string
  name: string
  label: string
  level: number
}

interface PermissionsManagerProps {
  clientId?: string
}

export function PermissionsManager({ clientId = 'default' }: PermissionsManagerProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingPermission, setEditingPermission] = useState<string | null>(null)
  const [selectedModule, setSelectedModule] = useState('all')
  const [newPermission, setNewPermission] = useState({
    name: '',
    label: '',
    description: '',
    module: '',
    action: '',
    resource: '',
    isSystem: false
  })

  const modules = [
    'contacts', 'companies', 'suppliers', 'employees', 'projects', 'tasks',
    'sales', 'purchasing', 'production', 'accounting', 'hr', 'reports',
    'settings', 'users', 'permissions', 'backup'
  ]

  const actions = [
    'create', 'read', 'update', 'delete', 'export', 'import', 'manage', 'view'
  ]

  // Load permissions and roles
  useEffect(() => {
    loadPermissions()
    loadRoles()
  }, [clientId])

  const loadPermissions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/permissions?clientId=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions)
      } else {
        console.error('Error loading permissions')
        toast.error('שגיאה בטעינת הרשאות')
      }
    } catch (error) {
      console.error('Error loading permissions:', error)
      toast.error('שגיאה בטעינת הרשאות')
    } finally {
      setIsLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await fetch(`/api/permissions/roles?clientId=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles)
      }
    } catch (error) {
      console.error('Error loading roles:', error)
    }
  }

  const createPermission = async () => {
    if (!newPermission.name || !newPermission.label || !newPermission.module || !newPermission.action) {
      toast.error('נא למלא את כל השדות הנדרשים')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPermission,
          clientId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPermissions(prev => [data.permission, ...prev])
        setNewPermission({
          name: '',
          label: '',
          description: '',
          module: '',
          action: '',
          resource: '',
          isSystem: false
        })
        setIsCreating(false)
        toast.success('הרשאה נוצרה בהצלחה!')
      } else {
        const error = await response.json()
        toast.error(`שגיאה ביצירת הרשאה: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating permission:', error)
      toast.error('שגיאה ביצירת הרשאה')
    } finally {
      setIsLoading(false)
    }
  }

  const updatePermission = async (permissionId: string, updates: Partial<Permission>) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: permissionId, ...updates })
      })

      if (response.ok) {
        const data = await response.json()
        setPermissions(prev => prev.map(permission => permission.id === permissionId ? data.permission : permission))
        setEditingPermission(null)
        toast.success('הרשאה עודכנה בהצלחה!')
      } else {
        const error = await response.json()
        toast.error(`שגיאה בעדכון הרשאה: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating permission:', error)
      toast.error('שגיאה בעדכון הרשאה')
    } finally {
      setIsLoading(false)
    }
  }

  const deletePermission = async (permissionId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק הרשאה זו?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/permissions?id=${permissionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPermissions(prev => prev.filter(permission => permission.id !== permissionId))
        toast.success('הרשאה נמחקה בהצלחה!')
      } else {
        const error = await response.json()
        toast.error(`שגיאה במחיקת הרשאה: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting permission:', error)
      toast.error('שגיאה במחיקת הרשאה')
    } finally {
      setIsLoading(false)
    }
  }

  const getModuleColor = (module: string) => {
    const colors: Record<string, string> = {
      contacts: 'blue',
      companies: 'green',
      suppliers: 'orange',
      employees: 'purple',
      projects: 'cyan',
      tasks: 'pink',
      sales: 'red',
      purchasing: 'yellow',
      production: 'indigo',
      accounting: 'teal',
      hr: 'violet',
      reports: 'gray',
      settings: 'slate',
      users: 'rose',
      permissions: 'amber',
      backup: 'emerald'
    }
    return colors[module] || 'gray'
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'green',
      read: 'blue',
      update: 'yellow',
      delete: 'red',
      export: 'purple',
      import: 'orange',
      manage: 'indigo',
      view: 'gray'
    }
    return colors[action] || 'gray'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL')
  }

  const filteredPermissions = permissions.filter(permission => 
    selectedModule === 'all' || permission.module === selectedModule
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            ניהול הרשאות
          </CardTitle>
          <CardDescription>
            נהל הרשאות במערכת והגדר הרשאות לכל תפקיד
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="בחר מודול" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל המודולים</SelectItem>
                {modules.map(module => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isCreating ? (
            <Button onClick={() => setIsCreating(true)} disabled={isLoading}>
              <Plus className="h-4 w-4 ml-2" />
              הוסף הרשאה חדשה
            </Button>
          ) : (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">יצירת הרשאה חדשה</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">שם הרשאה</Label>
                    <Input
                      id="name"
                      placeholder="contacts.create"
                      value={newPermission.name}
                      onChange={(e) => setNewPermission(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="label">תווית תצוגה</Label>
                    <Input
                      id="label"
                      placeholder="הוסף איש קשר"
                      value={newPermission.label}
                      onChange={(e) => setNewPermission(prev => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">תיאור</Label>
                  <Textarea
                    id="description"
                    placeholder="תיאור ההרשאה..."
                    value={newPermission.description}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="module">מודול</Label>
                    <Select value={newPermission.module} onValueChange={(value) => setNewPermission(prev => ({ ...prev, module: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר מודול" />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map(module => (
                          <SelectItem key={module} value={module}>
                            {module}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="action">פעולה</Label>
                    <Select value={newPermission.action} onValueChange={(value) => setNewPermission(prev => ({ ...prev, action: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר פעולה" />
                      </SelectTrigger>
                      <SelectContent>
                        {actions.map(action => (
                          <SelectItem key={action} value={action}>
                            {action}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="resource">משאב (אופציונלי)</Label>
                    <Input
                      id="resource"
                      placeholder="contacts, orders"
                      value={newPermission.resource}
                      onChange={(e) => setNewPermission(prev => ({ ...prev, resource: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isSystem"
                    checked={newPermission.isSystem}
                    onCheckedChange={(checked) => setNewPermission(prev => ({ ...prev, isSystem: !!checked }))}
                  />
                  <Label htmlFor="isSystem">הרשאה של מערכת</Label>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={createPermission} disabled={isLoading}>
                    <Save className="h-4 w-4 ml-2" />
                    שמור הרשאה
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    <X className="h-4 w-4 ml-2" />
                    ביטול
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>רשימת הרשאות</CardTitle>
          <CardDescription>כל ההרשאות במערכת</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">טוען...</div>
          ) : filteredPermissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">אין הרשאות</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>הרשאה</TableHead>
                  <TableHead>מודול</TableHead>
                  <TableHead>פעולה</TableHead>
                  <TableHead>משאב</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>תאריך יצירה</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Shield className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{permission.label}</div>
                          <div className="text-sm text-gray-500">{permission.name}</div>
                          {permission.description && (
                            <div className="text-xs text-gray-400">{permission.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`bg-${getModuleColor(permission.module)}-100 text-${getModuleColor(permission.module)}-800`}>
                        {permission.module}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`bg-${getActionColor(permission.action)}-100 text-${getActionColor(permission.action)}-800`}>
                        {permission.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {permission.resource ? (
                        <Badge variant="secondary">{permission.resource}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {permission.isSystem && (
                          <Badge variant="outline">מערכת</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(permission.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex space-x-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPermission(permission.id)}
                          title="עריכה"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/roles`, '_blank')}
                          title="הגדר הרשאות לתפקידים"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        {!permission.isSystem && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletePermission(permission.id)}
                            title="מחיקה"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}