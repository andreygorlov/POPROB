'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Save, X, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { CustomFieldForm } from '@/components/custom-fields/custom-field-form'

interface NewUserFormProps {
  clientId?: string
}

export function NewUserForm({ clientId = 'default' }: NewUserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [customFieldSave, setCustomFieldSave] = useState<(() => Promise<void>) | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    isActive: true,
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      department: '',
      position: '',
      employeeId: ''
    }
  })

  const roles = [
    { value: 'ADMIN', label: 'מנהל מערכת', color: 'destructive' },
    { value: 'MANAGER', label: 'מנהל', color: 'default' },
    { value: 'EMPLOYEE', label: 'עובד', color: 'secondary' },
    { value: 'CLIENT', label: 'לקוח', color: 'outline' }
  ]

  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('יש למלא שם, אימייל וסיסמה')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          clientId
        })
      })

      if (response.ok) {
        toast.success('משתמש נוצר בהצלחה!')
        router.push('/users')
      } else {
        const error = await response.json()
        toast.error(`שגיאה ביצירת משתמש: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('שגיאה ביצירת משתמש')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/users')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            משתמש חדש
          </CardTitle>
          <CardDescription>
            מלא את פרטי המשתמש החדש
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomFieldForm 
            entityType="USER" 
            entityId="new" 
            clientId={clientId}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
          <ArrowLeft className="h-4 w-4 ml-2" />
          חזור לרשימה
        </Button>
        <Button onClick={createUser} disabled={isLoading}>
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent ml-2" />
          ) : (
            <Save className="h-4 w-4 ml-2" />
          )}
          שמור משתמש
        </Button>
      </div>
    </div>
  )
}
