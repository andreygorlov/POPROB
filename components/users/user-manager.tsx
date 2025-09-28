'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2, Save, X, Eye, User, Mail, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
// Removed UserPermissionsDialog import

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    department?: string
    position?: string
    employeeId?: string
  }
  _count?: {
    sessions: number
    activities: number
  }
}

interface UserManagerProps {
  clientId?: string
}

export function UserManager({ clientId = 'default' }: UserManagerProps) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewingUser, setViewingUser] = useState<string | null>(null)
  // Removed permissionsUser state
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const roles = [
    { value: 'ADMIN', label: 'מנהל מערכת', color: 'destructive' },
    { value: 'MANAGER', label: 'מנהל', color: 'default' },
    { value: 'EMPLOYEE', label: 'עובד', color: 'secondary' },
    { value: 'CLIENT', label: 'לקוח', color: 'outline' }
  ]

  // Load users
  useEffect(() => {
    loadUsers()
  }, [clientId, searchTerm, roleFilter, statusFilter])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        clientId,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter && statusFilter !== 'all' && { isActive: statusFilter })
      })

      const response = await fetch(`/api/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        // Error loading users
      }
    } catch (error) {
      // Error loading users
    } finally {
      setIsLoading(false)
    }
  }


  const updateUser = async (userId: string, updates: Partial<User>) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, ...updates })
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(prev => prev.map(user => user.id === userId ? data.user : user))
        toast.success('משתמש עודכן בהצלחה!')
      } else {
        const error = await response.json()
        toast.error(`שגיאה בעדכון משתמש: ${error.error}`)
      }
    } catch (error) {
      // Error updating user
      toast.error('שגיאה בעדכון משתמש')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== userId))
        toast.success('משתמש נמחק בהצלחה!')
      } else {
        const error = await response.json()
        toast.error(`שגיאה במחיקת משתמש: ${error.error}`)
      }
    } catch (error) {
      // Error deleting user
      toast.error('שגיאה במחיקת משתמש')
    } finally {
      setIsLoading(false)
    }
  }

  const startViewing = (user: User) => {
    setViewingUser(user.id)
  }

  const navigateToEdit = (userId: string) => {
    router.push(`/users/edit/${userId}`)
  }

  const navigateToNew = () => {
    router.push('/users/new')
  }

  const getRoleInfo = (role: string) => {
    return roles.find(r => r.value === role) || { label: role, color: 'secondary' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">רשימת משתמשים</h2>
          <p className="text-gray-600">נהל את משתמשי המערכת</p>
        </div>
        <Button onClick={navigateToNew}>
          <Plus className="h-4 w-4 ml-2" />
          הוסף משתמש חדש
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>משתמשים</CardTitle>
          <CardDescription>
            רשימת כל המשתמשים במערכת
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex space-x-4 mb-4">
            <Input
              placeholder="חיפוש משתמשים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="תפקיד" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל התפקידים</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="true">פעיל</SelectItem>
                <SelectItem value="false">לא פעיל</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>רשימת משתמשים</CardTitle>
          <CardDescription>כל המשתמשים במערכת</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">טוען...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">אין משתמשים</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>משתמש</TableHead>
                  <TableHead>תפקיד</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>פעילות</TableHead>
                  <TableHead>תאריך יצירה</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 ml-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleInfo(user.role).color as any}>
                        {getRoleInfo(user.role).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? 'פעיל' : 'לא פעיל'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>סשנים: {user._count?.sessions || 0}</div>
                        <div>פעילויות: {user._count?.activities || 0}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm flex items-center">
                        <Calendar className="h-3 w-3 ml-1" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex space-x-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startViewing(user)}
                          title="צפייה"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateToEdit(user.id)}
                          title="עריכה"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                          title="מחיקה"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User View Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>פרטי משתמש</DialogTitle>
            <DialogDescription>
              צפייה בפרטים המלאים של המשתמש
            </DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              {(() => {
                const user = users.find(u => u.id === viewingUser)
                if (!user) return null
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">שם מלא</label>
                        <p className="text-lg font-semibold">{user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">אימייל</label>
                        <p className="text-lg">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">תפקיד</label>
                        <Badge variant={getRoleInfo(user.role).color as any}>
                          {getRoleInfo(user.role).label}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">סטטוס</label>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? 'פעיל' : 'לא פעיל'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">תאריך יצירה</label>
                        <p className="text-sm">{formatDate(user.createdAt)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">סשנים פעילים</label>
                        <p className="text-sm">{user._count?.sessions || 0}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">פעילויות</label>
                        <p className="text-sm">{user._count?.activities || 0}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">התחברות אחרונה</label>
                        <p className="text-sm">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'לא התחבר'}</p>
                      </div>
                    </div>
                    
                    {user.profile && (
                      <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold mb-3">פרטי פרופיל</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">שם פרטי</label>
                            <p className="text-sm">{user.profile.firstName || '-'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">שם משפחה</label>
                            <p className="text-sm">{user.profile.lastName || '-'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">טלפון</label>
                            <p className="text-sm">{user.profile.phone || '-'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">מחלקה</label>
                            <p className="text-sm">{user.profile.department || '-'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">תפקיד</label>
                            <p className="text-sm">{user.profile.position || '-'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">מזהה עובד</label>
                            <p className="text-sm">{user.profile.employeeId || '-'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

             {/* Removed User Permissions Dialog */}
    </div>
  )
}
