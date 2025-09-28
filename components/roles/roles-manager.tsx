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
import { Plus, Edit, Trash2, Save, X, Users, Shield, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface Role {
  id: string
  name: string
  label: string
  description?: string
  level: number
  isSystem: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    rolePermissions: number
  }
}

interface RolesManagerProps {
  clientId?: string
}

export function RolesManager({ clientId = 'default' }: RolesManagerProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [newRole, setNewRole] = useState({
    name: '',
    label: '',
    description: '',
    level: 50,
    isSystem: false,
    isActive: true
  })

  // Load roles
  useEffect(() => {
    loadRoles()
  }, [clientId])

  const loadRoles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/permissions/roles?clientId=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles)
      } else {
        console.error('Error loading roles')
        toast.error('שגיאה בטעינת תפקידים')
      }
    } catch (error) {
      console.error('Error loading roles:', error)
      toast.error('שגיאה בטעינת תפקידים')
    } finally {
      setIsLoading(false)
    }
  }

  const createRole = async () => {
    if (!newRole.name || !newRole.label) {
      toast.error('נא למלא את כל השדות הנדרשים')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/permissions/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRole,
          clientId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setRoles(prev => [data.role, ...prev])
        setNewRole({
          name: '',
          label: '',
          description: '',
          level: 50,
          isSystem: false,
          isActive: true
        })
        setIsCreating(false)
        toast.success('תפקיד נוצר בהצלחה!')
      } else {
        const error = await response.json()
        toast.error(`שגיאה ביצירת תפקיד: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error('שגיאה ביצירת תפקיד')
    } finally {
      setIsLoading(false)
    }
  }

  const updateRole = async (roleId: string, updates: Partial<Role>) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/permissions/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: roleId, ...updates })
      })

      if (response.ok) {
        const data = await response.json()
        setRoles(prev => prev.map(role => role.id === roleId ? data.role : role))
        setEditingRole(null)
        toast.success('תפקיד עודכן בהצלחה!')
      } else {
        const error = await response.json()
        toast.error(`שגיאה בעדכון תפקיד: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('שגיאה בעדכון תפקיד')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteRole = async (roleId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק תפקיד זה?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/permissions/roles?id=${roleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setRoles(prev => prev.filter(role => role.id !== roleId))
        toast.success('תפקיד נמחק בהצלחה!')
      } else {
        const error = await response.json()
        toast.error(`שגיאה במחיקת תפקיד: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error('שגיאה במחיקת תפקיד')
    } finally {
      setIsLoading(false)
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 90) return 'destructive'
    if (level >= 70) return 'default'
    if (level >= 50) return 'secondary'
    return 'outline'
  }

  const getLevelLabel = (level: number) => {
    if (level >= 90) return 'מנהל על'
    if (level >= 70) return 'מנהל'
    if (level >= 50) return 'עובד בכיר'
    if (level >= 30) return 'עובד'
    return 'לקוח'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            ניהול תפקידים
          </CardTitle>
          <CardDescription>
            נהל תפקידים במערכת והגדר הרשאות לכל תפקיד
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isCreating ? (
            <Button onClick={() => setIsCreating(true)} disabled={isLoading}>
              <Plus className="h-4 w-4 ml-2" />
              הוסף תפקיד חדש
            </Button>
          ) : (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">יצירת תפקיד חדש</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">שם תפקיד (אנגלית)</Label>
                    <Input
                      id="name"
                      placeholder="admin, manager, employee"
                      value={newRole.name}
                      onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="label">תווית תצוגה</Label>
                    <Input
                      id="label"
                      placeholder="מנהל מערכת"
                      value={newRole.label}
                      onChange={(e) => setNewRole(prev => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">תיאור</Label>
                  <Textarea
                    id="description"
                    placeholder="תיאור התפקיד..."
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level">רמת הרשאה (0-100)</Label>
                    <Input
                      id="level"
                      type="number"
                      min="0"
                      max="100"
                      value={newRole.level}
                      onChange={(e) => setNewRole(prev => ({ ...prev, level: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isSystem"
                        checked={newRole.isSystem}
                        onCheckedChange={(checked) => setNewRole(prev => ({ ...prev, isSystem: !!checked }))}
                      />
                      <Label htmlFor="isSystem">תפקיד מערכת</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={newRole.isActive}
                        onCheckedChange={(checked) => setNewRole(prev => ({ ...prev, isActive: !!checked }))}
                      />
                      <Label htmlFor="isActive">פעיל</Label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={createRole} disabled={isLoading}>
                    <Save className="h-4 w-4 ml-2" />
                    שמור תפקיד
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
          <CardTitle>רשימת תפקידים</CardTitle>
          <CardDescription>כל התפקידים במערכת</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">טוען...</div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">אין תפקידים</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>תפקיד</TableHead>
                  <TableHead>רמה</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>הרשאות</TableHead>
                  <TableHead>תאריך יצירה</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-gray-500">{role.name}</div>
                          {role.description && (
                            <div className="text-xs text-gray-400">{role.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getLevelColor(role.level) as any}>
                        {getLevelLabel(role.level)} ({role.level})
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant={role.isActive ? "default" : "secondary"}>
                          {role.isActive ? 'פעיל' : 'לא פעיל'}
                        </Badge>
                        {role.isSystem && (
                          <Badge variant="outline">מערכת</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {role._count?.rolePermissions || 0} הרשאות
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(role.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex space-x-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingRole(role.id)}
                          title="עריכה"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/permissions?role=${role.id}`, '_blank')}
                          title="הרשאות"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        {!role.isSystem && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteRole(role.id)}
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
