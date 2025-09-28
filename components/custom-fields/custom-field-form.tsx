'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Save, Loader2 } from 'lucide-react'

interface CustomField {
  id: string
  name: string
  label: string
  type: string
  options?: string[]
  required: boolean
  description?: string
}

interface CustomFieldFormProps {
  entityId: string
  entityType: 'USER' | 'CONTACT' | 'COMPANY' | 'SUPPLIER' | 'EMPLOYEE' | 'PROJECT' | 'TASK'
  clientId?: string
  onSave?: () => void
  onSaveRef?: (saveFunction: () => Promise<void>) => void
}

export function CustomFieldForm({ entityId, entityType, clientId = 'default', onSave, onSaveRef }: CustomFieldFormProps) {
  const [fields, setFields] = useState<CustomField[]>([])
  const [values, setValues] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const loadFieldsAndValues = async () => {
    setIsLoading(true)
    try {
      // Load custom fields
      const fieldsResponse = await fetch(`/api/custom-fields?entityType=${entityType}&clientId=${clientId}`)
      if (fieldsResponse.ok) {
        const fieldsData = await fieldsResponse.json()
        // Parse options from JSON strings
        const parsedFields = fieldsData.customFields.map((field: any) => ({
          ...field,
          options: field.options ? JSON.parse(field.options) : undefined
        }))
        setFields(parsedFields)
      }

      // Load existing values
      const valuesResponse = await fetch(`/api/custom-field-values?entityId=${entityId}&entityType=${entityType}&clientId=${clientId}`)
      if (valuesResponse.ok) {
        const valuesData = await valuesResponse.json()
        const valuesMap: Record<string, any> = {}
        valuesData.fieldValues.forEach((fv: any) => {
          valuesMap[fv.customFieldId] = fv.value
        })
        setValues(valuesMap)
      }
    } catch (error) {
      console.error('Error loading fields and values:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValueChange = (fieldId: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }))
  }

  const saveValues = useCallback(async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/custom-field-values', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId,
          entityType,
          clientId,
          values: Object.entries(values).map(([customFieldId, value]) => ({
            customFieldId,
            value
          }))
        })
      })

      if (response.ok) {
        alert('השדות נשמרו בהצלחה!')
        onSave?.()
      } else {
        const error = await response.json()
        alert(`שגיאה בשמירה: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving values:', error)
      alert('שגיאה בשמירת השדות')
    } finally {
      setIsSaving(false)
    }
  }, [entityId, entityType, clientId, values, onSave])

  // Load custom fields and their values
  useEffect(() => {
    loadFieldsAndValues()
  }, [entityId, entityType, clientId])

  // Pass save function to parent
  useEffect(() => {
    if (onSaveRef) {
      onSaveRef(saveValues)
    }
  }, [onSaveRef, saveValues])

  const renderFieldInput = (field: CustomField) => {
    const value = values[field.id] || ''

    switch (field.type) {
      case 'TEXT':
      case 'EMAIL':
      case 'PHONE':
      case 'URL':
        return (
          <Input
            type={field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : 'text'}
            placeholder={field.description || `הזן ${field.label.toLowerCase()}`}
            value={value}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            required={field.required}
          />
        )

      case 'TEXTAREA':
        return (
          <Textarea
            placeholder={field.description || `הזן ${field.label.toLowerCase()}`}
            value={value}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            required={field.required}
          />
        )

      case 'NUMBER':
        return (
          <Input
            type="number"
            placeholder={field.description || `הזן ${field.label.toLowerCase()}`}
            value={value}
            onChange={(e) => handleValueChange(field.id, Number(e.target.value))}
            required={field.required}
          />
        )

      case 'DATE':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            required={field.required}
          />
        )

      case 'BOOLEAN':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value}
              onCheckedChange={(checked) => handleValueChange(field.id, checked)}
            />
            <label htmlFor={field.id} className="text-sm">
              {field.label}
            </label>
          </div>
        )

      case 'SELECT':
        return (
          <Select value={value} onValueChange={(newValue) => handleValueChange(field.id, newValue)}>
            <SelectTrigger>
              <SelectValue placeholder={field.description || `בחר ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return (
          <Input
            placeholder={field.description || `הזן ${field.label.toLowerCase()}`}
            value={value}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            required={field.required}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>טוען שדות מותאמים אישית...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (fields.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>אין שדות מותאמים אישית עבור {entityType}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render core fields for USER entity
  const renderCoreFields = () => {
    if (entityType !== 'USER') return null

    return (
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold">שדות בסיסיים</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              שם מלא <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="שם מלא"
              value={values['core_name'] || ''}
              onChange={(e) => handleValueChange('core_name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              אימייל <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="example@company.com"
              value={values['core_email'] || ''}
              onChange={(e) => handleValueChange('core_email', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              סיסמה {entityId === 'new' && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="password"
              placeholder={entityId === 'new' ? 'סיסמה חזקה' : 'השאר ריק אם לא רוצה לשנות'}
              value={values['core_password'] || ''}
              onChange={(e) => handleValueChange('core_password', e.target.value)}
              required={entityId === 'new'}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              תפקיד <span className="text-red-500">*</span>
            </label>
            <Select 
              value={values['core_role'] || 'EMPLOYEE'} 
              onValueChange={(value) => handleValueChange('core_role', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">מנהל מערכת</SelectItem>
                <SelectItem value="MANAGER">מנהל</SelectItem>
                <SelectItem value="EMPLOYEE">עובד</SelectItem>
                <SelectItem value="CLIENT">לקוח</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">טלפון</label>
            <Input
              type="tel"
              placeholder="050-1234567"
              value={values['core_phone'] || ''}
              onChange={(e) => handleValueChange('core_phone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">מחלקה</label>
            <Input
              placeholder="מחלקה"
              value={values['core_department'] || ''}
              onChange={(e) => handleValueChange('core_department', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">תפקיד מקצועי</label>
            <Input
              placeholder="תפקיד מקצועי"
              value={values['core_position'] || ''}
              onChange={(e) => handleValueChange('core_position', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">מזהה עובד</label>
            <Input
              placeholder="מזהה עובד"
              value={values['core_employeeId'] || ''}
              onChange={(e) => handleValueChange('core_employeeId', e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="core_isActive"
            checked={values['core_isActive'] || false}
            onCheckedChange={(checked) => handleValueChange('core_isActive', checked)}
          />
          <label htmlFor="core_isActive" className="text-sm font-medium">משתמש פעיל</label>
        </div>
      </div>
    )
  }

  // Combine core fields and custom fields in the correct order
  const getAllFieldsInOrder = () => {
    const coreFields = [
      { id: 'core_name', name: 'full_name', label: 'שם מלא', type: 'TEXT', required: true, isCore: true },
      { id: 'core_email', name: 'email', label: 'אימייל', type: 'EMAIL', required: true, isCore: true },
      { id: 'core_password', name: 'password', label: 'סיסמה', type: 'TEXT', required: entityId === 'new', isCore: true },
      { id: 'core_role', name: 'role', label: 'תפקיד', type: 'SELECT', required: true, isCore: true, options: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT'] },
      { id: 'core_phone', name: 'phone', label: 'טלפון', type: 'PHONE', required: false, isCore: true },
      { id: 'core_department', name: 'department', label: 'מחלקה', type: 'TEXT', required: false, isCore: true },
      { id: 'core_position', name: 'position', label: 'תפקיד מקצועי', type: 'TEXT', required: false, isCore: true },
      { id: 'core_employeeId', name: 'employeeId', label: 'מזהה עובד', type: 'TEXT', required: false, isCore: true },
      { id: 'core_isActive', name: 'isActive', label: 'משתמש פעיל', type: 'BOOLEAN', required: false, isCore: true }
    ]

    // Create a map of all fields (core + custom) with their order
    const allFields = [...coreFields, ...fields]
    
    // Sort by the order from the database (custom fields) or by predefined order (core fields)
    return allFields.sort((a, b) => {
      if (a.isCore && b.isCore) {
        // Core fields maintain their predefined order
        return coreFields.indexOf(a) - coreFields.indexOf(b)
      } else if (a.isCore) {
        // Core fields come first
        return -1
      } else if (b.isCore) {
        // Custom fields come after core fields
        return 1
      } else {
        // Custom fields are sorted by their order from the database
        return (a as any).order - (b as any).order
      }
    })
  }

  const allFieldsInOrder = getAllFieldsInOrder()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allFieldsInOrder.map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && (
            <p className="text-xs text-gray-500">{field.description}</p>
          )}
          {field.isCore ? (
            // Render core field input
            (() => {
              const value = values[field.id] || ''
              switch (field.type) {
                case 'TEXT':
                case 'EMAIL':
                case 'PHONE':
                  return (
                    <Input
                      type={field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : 'text'}
                      placeholder={field.description || `הזן ${field.label.toLowerCase()}`}
                      value={value}
                      onChange={(e) => handleValueChange(field.id, e.target.value)}
                      required={field.required}
                    />
                  )
                case 'SELECT':
                  return (
                    <Select 
                      value={value || 'EMPLOYEE'} 
                      onValueChange={(newValue) => handleValueChange(field.id, newValue)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">מנהל מערכת</SelectItem>
                        <SelectItem value="MANAGER">מנהל</SelectItem>
                        <SelectItem value="EMPLOYEE">עובד</SelectItem>
                        <SelectItem value="CLIENT">לקוח</SelectItem>
                      </SelectContent>
                    </Select>
                  )
                case 'BOOLEAN':
                  return (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={field.id}
                        checked={value}
                        onCheckedChange={(checked) => handleValueChange(field.id, checked)}
                      />
                      <label htmlFor={field.id} className="text-sm">
                        {field.label}
                      </label>
                    </div>
                  )
                default:
                  return (
                    <Input
                      placeholder={field.description || `הזן ${field.label.toLowerCase()}`}
                      value={value}
                      onChange={(e) => handleValueChange(field.id, e.target.value)}
                      required={field.required}
                    />
                  )
              }
            })()
          ) : (
            // Render custom field input
            renderFieldInput(field as CustomField)
          )}
        </div>
      ))}
    </div>
  )
}
