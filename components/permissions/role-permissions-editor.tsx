'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield, Users, Save, RotateCcw } from 'lucide-react'
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
}

interface Role {
  id: string
  name: string
  label: string
  level: number
}

interface RolePermission {
  id: string
  roleId: string
  permissionId: string
  granted: boolean
  permission: Permission
}

interface RolePermissionsEditorProps {
  clientId?: string
}

export function RolePermissionsEditor({ clientId = 'default' }: RolePermissionsEditorProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load data
  useEffect(() => {
    loadRoles()
    loadPermissions()
  }, [clientId])

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole)
    }
  }, [selectedRole, clientId])

  const loadRoles = async () => {
    try {
      const response = await fetch(`/api/permissions/roles?clientId=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles)
        if (data.roles.length > 0 && !selectedRole) {
          setSelectedRole(data.roles[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading roles:', error)
      toast.error('שגיאה בטעינת תפקידים')
    }
  }

  const loadPermissions = async () => {
    try {
      const response = await fetch(`/api/permissions?clientId=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions)
      }
    } catch (error) {
      console.error('Error loading permissions:', error)
      toast.error('שגיאה בטעינת הרשאות')
    }
  }

  const loadRolePermissions = async (roleId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/permissions/role-permissions?roleId=${roleId}&clientId=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setRolePermissions(data.rolePermissions)
      }
    } catch (error) {
      console.error('Error loading role permissions:', error)
      toast.error('שגיאה בטעינת הרשאות תפקיד')
    } finally {
      setIsLoading(false)
    }
  }

  const updateRolePermission = async (permissionId: string, granted: boolean) => {
    if (!selectedRole) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/permissions/role-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: selectedRole,
          permissionId,
          granted,
          clientId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setRolePermissions(prev => {
          const existing = prev.find(rp => rp.permissionId === permissionId)
          if (existing) {
            return prev.map(rp => 
              rp.permissionId === permissionId 
                ? { ...rp, granted, id: data.rolePermission.id }
                : rp
            )
          } else {
            return [...prev, { ...data.rolePermission, permission: permissions.find(p => p.id === permissionId)! }]
          }
        })
        toast.success('הרשאה עודכנה בהצלחה!')
      } else {
        const error = await response.json()
        toast.error(`שגיאה בעדכון הרשאה: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating role permission:', error)
      toast.error('שגיאה בעדכון הרשאה')
    } finally {
      setIsSaving(false)
    }
  }

  const getPermissionStatus = (permissionId: string) => {
    const rolePermission = rolePermissions.find(rp => rp.permissionId === permissionId)
    return rolePermission ? rolePermission.granted : false
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

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = []
    }
    acc[permission.module].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const selectedRoleData = roles.find(role => role.id === selectedRole)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            עריכת הרשאות תפקידים
          </CardTitle>
          <CardDescription>
            בחר תפקיד וערוך את ההרשאות שלו
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">תפקיד:</span>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="בחר תפקיד" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.label} (רמה {role.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRoleData && (
              <Badge variant="outline">
                רמה {selectedRoleData.level}
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-8">טוען הרשאות...</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
                <Card key={moduleName}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">{moduleName}</CardTitle>
                    <CardDescription>
                      הרשאות עבור מודול {moduleName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%]">הרשאה</TableHead>
                          <TableHead className="w-[20%]">פעולה</TableHead>
                          <TableHead className="w-[20%]">משאב</TableHead>
                          <TableHead className="w-[20%] text-center">פעיל</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modulePermissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{permission.label}</div>
                                <div className="text-sm text-gray-500">{permission.name}</div>
                                {permission.description && (
                                  <div className="text-xs text-gray-400">{permission.description}</div>
                                )}
                              </div>
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
                            <TableCell className="text-center">
                              <Switch
                                checked={getPermissionStatus(permission.id)}
                                onCheckedChange={(checked) => updateRolePermission(permission.id, checked)}
                                disabled={isSaving}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}