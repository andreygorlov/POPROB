'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Save, X, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CustomFieldForm } from '@/components/custom-fields/custom-field-form'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  profile?: {
    firstName: string
    lastName: string
    phone: string
    department: string
    position: string
    employeeId: string
  }
}

interface EditUserFormProps {
  userId: string
  clientId?: string
}

export function EditUserForm({ userId, clientId = 'default' }: EditUserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [editedUser, setEditedUser] = useState<Partial<User>>({})
  const [customFieldSave, setCustomFieldSave] = useState<(() => Promise<void>) | null>(null)

  const handleCustomFieldSaveRef = useCallback((saveFunction: () => Promise<void>) => {
    setCustomFieldSave(() => saveFunction)
  }, [])

  const roles = [
    { value: 'ADMIN', label: 'מנהל מערכת', color: 'destructive' },
    { value: 'MANAGER', label: 'מנהל', color: 'default' },
    { value: 'EMPLOYEE', label: 'עובד', color: 'secondary' },
    { value: 'CLIENT', label: 'לקוח', color: 'outline' }
  ]

  useEffect(() => {
    loadUser()
  }, [userId])

  const loadUser = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users?id=${userId}&clientId=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
          setEditedUser({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            isActive: data.user.isActive,
            profile: data.user.profile || {
              firstName: '',
              lastName: '',
              phone: '',
              department: '',
              position: '',
              employeeId: ''
            }
          })
        } else {
          toast.error('משתמש לא נמצא')
          router.push('/users')
        }
      } else {
        toast.error('שגיאה בטעינת פרטי המשתמש')
        router.push('/users')
      }
    } catch (error) {
      // Error loading user
      toast.error('שגיאה בטעינת פרטי המשתמש')
      router.push('/users')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async () => {
    if (!editedUser.name || !editedUser.email) {
      toast.error('יש למלא שם ואימייל')
      return
    }

    setIsLoading(true)
    try {
      // Save custom fields first
      if (customFieldSave) {
        await customFieldSave()
      }

      // Then save user data
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: userId, 
          ...editedUser,
          clientId 
        })
      })

      if (response.ok) {
        toast.success('משתמש עודכן בהצלחה!')
        router.push('/users')
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

  const handleCancel = () => {
    router.push('/users')
  }

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">טוען פרטי משתמש...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">משתמש לא נמצא</p>
        <Button variant="outline" onClick={handleCancel} className="mt-4">
          <ArrowLeft className="h-4 w-4 ml-2" />
          חזור לרשימה
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            עריכת משתמש
          </CardTitle>
          <CardDescription>
            ערוך את פרטי המשתמש
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomFieldForm 
            entityType="USER" 
            entityId={userId} 
            clientId={clientId}
            onSaveRef={handleCustomFieldSaveRef}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
          <ArrowLeft className="h-4 w-4 ml-2" />
          חזור לרשימה
        </Button>
        <Button onClick={updateUser} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <Save className="h-4 w-4 ml-2" />
          )}
          שמור שינויים
        </Button>
      </div>
    </div>
  )
}
