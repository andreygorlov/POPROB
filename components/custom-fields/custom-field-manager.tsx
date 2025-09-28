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
import { Plus, Edit, Trash2, Save, X, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface CustomField {
  id: string
  name: string
  label: string
  type: string
  entityType: string
  options?: string[] // Will be parsed from JSON string
  required: boolean
  order: number
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CustomFieldManagerProps {
  entityType: 'USER' | 'CONTACT' | 'COMPANY' | 'SUPPLIER' | 'EMPLOYEE' | 'PROJECT' | 'TASK'
  clientId?: string
}

// Sortable Field Card Component
function SortableFieldCard({
  field, 
  editingField, 
  editingFieldData, 
  setEditingFieldData, 
  startEditing, 
  cancelEditing, 
  updateCustomField, 
  deleteCustomField, 
  fieldTypes, 
  isLoading,
  addEditingOption,
  updateEditingOption,
  removeEditingOption,
  isSystemField = false
}: {
  field: CustomField
  editingField: string | null
  editingFieldData: Partial<CustomField>
  setEditingFieldData: (data: Partial<CustomField>) => void
  startEditing: (field: CustomField) => void
  cancelEditing: () => void
  updateCustomField: () => void
  deleteCustomField: (id: string) => void
  fieldTypes: Array<{ value: string; label: string }>
  isLoading: boolean
  addEditingOption: () => void
  updateEditingOption: (index: number, value: string) => void
  removeEditingOption: (index: number) => void
  isSystemField?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id, disabled: isSystemField })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  if (editingField === field.id) {
    return (
      <Card className="col-span-full">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">עריכת שדה</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">שם השדה (פנימי)</label>
                <Input
                  placeholder="customer_priority"
                  value={editingFieldData.name || ''}
                  onChange={(e) => setEditingFieldData({ ...editingFieldData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">תווית (תצוגה)</label>
                <Input
                  placeholder="עדיפות לקוח"
                  value={editingFieldData.label || ''}
                  onChange={(e) => setEditingFieldData({ ...editingFieldData, label: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">סוג השדה</label>
                <Select 
                  value={editingFieldData.type || 'TEXT'} 
                  onValueChange={(value) => setEditingFieldData({ ...editingFieldData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="editing-required"
                  checked={editingFieldData.required || false}
                  onCheckedChange={(checked) => setEditingFieldData({ ...editingFieldData, required: !!checked })}
                />
                <label htmlFor="editing-required" className="text-sm font-medium">שדה חובה</label>
              </div>
            </div>

            {editingFieldData.type === 'SELECT' && (
              <div>
                <label className="text-sm font-medium">אפשרויות</label>
                <div className="space-y-2">
                  {Array.isArray(editingFieldData.options) ? editingFieldData.options.map((option, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder={`אפשרות ${index + 1}`}
                        value={option}
                        onChange={(e) => updateEditingOption(index, e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEditingOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )) : null}
                  <Button variant="outline" size="sm" onClick={addEditingOption}>
                    <Plus className="h-4 w-4 ml-2" />
                    הוסף אפשרות
                  </Button>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">תיאור (אופציונלי)</label>
              <Textarea
                placeholder="תיאור השדה..."
                value={editingFieldData.description || ''}
                onChange={(e) => setEditingFieldData({ ...editingFieldData, description: e.target.value })}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={updateCustomField} disabled={isLoading}>
                <Save className="h-4 w-4 ml-2" />
                שמור שינויים
              </Button>
              <Button variant="outline" onClick={cancelEditing}>
                <X className="h-4 w-4 ml-2" />
                ביטול
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`${isSystemField ? "bg-gray-50 border-gray-300" : "hover:shadow-md"} transition-all duration-200`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {!isSystemField && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing p-1"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-sm">
                {field.name}
                {isSystemField && <Badge variant="outline" className="mr-2 text-xs">חובה</Badge>}
              </h3>
              <p className="text-sm text-gray-600">{field.label}</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEditing(field)}
              disabled={isSystemField}
              title={isSystemField ? "שדה חובה - לא ניתן לערוך" : "ערוך שדה"}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteCustomField(field.id)}
              disabled={isSystemField}
              title={isSystemField ? "שדה חובה - לא ניתן למחוק" : "מחק שדה"}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">סוג:</span>
            <Badge variant="outline" className="text-xs">
              {fieldTypes.find(t => t.value === field.type)?.label || field.type}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">חובה:</span>
            {field.required ? (
              <Badge variant="destructive" className="text-xs">חובה</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">אופציונלי</Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">סטטוס:</span>
            <Badge variant={field.isActive ? "default" : "secondary"} className="text-xs">
              {field.isActive ? 'פעיל' : 'לא פעיל'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Sortable Row Component (kept for backward compatibility)
function SortableRow({ 
  field, 
  editingField, 
  editingFieldData, 
  setEditingFieldData, 
  startEditing, 
  cancelEditing, 
  updateCustomField, 
  deleteCustomField, 
  fieldTypes, 
  isLoading,
  addEditingOption,
  updateEditingOption,
  removeEditingOption,
  isSystemField = false
}: {
  field: CustomField
  editingField: string | null
  editingFieldData: Partial<CustomField>
  setEditingFieldData: (data: Partial<CustomField>) => void
  startEditing: (field: CustomField) => void
  cancelEditing: () => void
  updateCustomField: () => void
  deleteCustomField: (id: string) => void
  fieldTypes: Array<{ value: string; label: string }>
  isLoading: boolean
  addEditingOption: () => void
  updateEditingOption: (index: number, value: string) => void
  removeEditingOption: (index: number) => void
  isSystemField?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id, disabled: isSystemField })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style}
      className={isSystemField ? "bg-gray-50" : ""}
    >
      {editingField === field.id ? (
        <>
          <TableCell colSpan={6}>
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">עריכת שדה</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">שם השדה (פנימי)</label>
                    <Input
                      placeholder="customer_priority"
                      value={editingFieldData.name || ''}
                      onChange={(e) => setEditingFieldData({ ...editingFieldData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">תווית (תצוגה)</label>
                    <Input
                      placeholder="עדיפות לקוח"
                      value={editingFieldData.label || ''}
                      onChange={(e) => setEditingFieldData({ ...editingFieldData, label: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">סוג השדה</label>
                    <Select 
                      value={editingFieldData.type || 'TEXT'} 
                      onValueChange={(value) => setEditingFieldData({ ...editingFieldData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="editing-required"
                      checked={editingFieldData.required || false}
                      onCheckedChange={(checked) => setEditingFieldData({ ...editingFieldData, required: !!checked })}
                    />
                    <label htmlFor="editing-required" className="text-sm font-medium">שדה חובה</label>
                  </div>
                </div>

                {editingFieldData.type === 'SELECT' && (
                  <div>
                    <label className="text-sm font-medium">אפשרויות</label>
                    <div className="space-y-2">
                      {Array.isArray(editingFieldData.options) ? editingFieldData.options.map((option, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            placeholder={`אפשרות ${index + 1}`}
                            value={option}
                            onChange={(e) => updateEditingOption(index, e.target.value)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeEditingOption(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )) : null}
                      <Button variant="outline" size="sm" onClick={addEditingOption}>
                        <Plus className="h-4 w-4 ml-2" />
                        הוסף אפשרות
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">תיאור (אופציונלי)</label>
                  <Textarea
                    placeholder="תיאור השדה..."
                    value={editingFieldData.description || ''}
                    onChange={(e) => setEditingFieldData({ ...editingFieldData, description: e.target.value })}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={updateCustomField} disabled={isLoading}>
                    <Save className="h-4 w-4 ml-2" />
                    שמור שינויים
                  </Button>
                  <Button variant="outline" onClick={cancelEditing}>
                    <X className="h-4 w-4 ml-2" />
                    ביטול
                  </Button>
                </div>
              </div>
            </Card>
          </TableCell>
        </>
      ) : (
        <>
          <TableCell className="font-medium">
            <div className="flex items-center space-x-2">
              {!isSystemField && (
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab hover:cursor-grabbing p-1"
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
              )}
              <span>
                {field.name}
                {isSystemField && <Badge variant="outline" className="mr-2">חובה</Badge>}
              </span>
            </div>
          </TableCell>
          <TableCell>{field.label}</TableCell>
          <TableCell>
            <Badge variant="outline">
              {fieldTypes.find(t => t.value === field.type)?.label || field.type}
            </Badge>
          </TableCell>
          <TableCell>
            {field.required ? (
              <Badge variant="destructive">חובה</Badge>
            ) : (
              <Badge variant="secondary">אופציונלי</Badge>
            )}
          </TableCell>
          <TableCell>
            <Badge variant={field.isActive ? "default" : "secondary"}>
              {field.isActive ? 'פעיל' : 'לא פעיל'}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex space-x-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => startEditing(field)}
                disabled={isSystemField}
                title={isSystemField ? "שדה חובה - לא ניתן לערוך" : "ערוך שדה"}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteCustomField(field.id)}
                disabled={isSystemField}
                title={isSystemField ? "שדה חובה - לא ניתן למחוק" : "מחק שדה"}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </>
      )}
    </TableRow>
  )
}

export function CustomFieldManager({ entityType, clientId = 'default' }: CustomFieldManagerProps) {
  const [fields, setFields] = useState<CustomField[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editingFieldData, setEditingFieldData] = useState<Partial<CustomField>>({})
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'TEXT',
    options: [] as string[],
    required: false,
    description: ''
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fieldTypes = [
    { value: 'TEXT', label: 'טקסט' },
    { value: 'NUMBER', label: 'מספר' },
    { value: 'DATE', label: 'תאריך' },
    { value: 'SELECT', label: 'רשימה נפתחת' },
    { value: 'BOOLEAN', label: 'כן/לא' },
    { value: 'EMAIL', label: 'אימייל' },
    { value: 'PHONE', label: 'טלפון' },
    { value: 'URL', label: 'קישור' },
    { value: 'TEXTAREA', label: 'טקסט ארוך' }
  ]

  const entityTypeLabels = {
    USER: 'משתמשים',
    CONTACT: 'אנשי קשר',
    COMPANY: 'חברות',
    SUPPLIER: 'ספקים',
    EMPLOYEE: 'עובדים',
    PROJECT: 'פרויקטים',
    TASK: 'משימות'
  }

  // Required system fields for all entity types
  const getRequiredFields = () => {
    const systemFields: Record<string, any[]> = {
      USER: [
        {
          id: 'core_name',
          name: 'full_name',
          label: 'שם מלא',
          type: 'TEXT',
          entityType: 'USER',
          required: true,
          order: 1,
          isActive: true,
          description: 'שם מלא של המשתמש',
          isSystem: true
        },
        {
          id: 'core_email',
          name: 'email',
          label: 'אימייל',
          type: 'EMAIL',
          entityType: 'USER',
          required: true,
          order: 2,
          isActive: true,
          description: 'כתובת אימייל של המשתמש',
          isSystem: true
        },
        {
          id: 'core_role',
          name: 'role',
          label: 'תפקיד',
          type: 'SELECT',
          entityType: 'USER',
          required: true,
          order: 3,
          isActive: true,
          description: 'תפקיד המשתמש במערכת',
          isSystem: true,
          options: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT']
        },
        {
          id: 'core_phone',
          name: 'phone',
          label: 'טלפון',
          type: 'PHONE',
          entityType: 'USER',
          required: false,
          order: 4,
          isActive: true,
          description: 'מספר טלפון של המשתמש',
          isSystem: true
        },
        {
          id: 'core_department',
          name: 'department',
          label: 'מחלקה',
          type: 'TEXT',
          entityType: 'USER',
          required: false,
          order: 5,
          isActive: true,
          description: 'מחלקה של המשתמש',
          isSystem: true
        },
        {
          id: 'core_position',
          name: 'position',
          label: 'תפקיד מקצועי',
          type: 'TEXT',
          entityType: 'USER',
          required: false,
          order: 6,
          isActive: true,
          description: 'תפקיד מקצועי של המשתמש',
          isSystem: true
        }
      ],
      CONTACT: [
        {
          id: 'core_firstName',
          name: 'firstName',
          label: 'שם פרטי',
          type: 'TEXT',
          entityType: 'CONTACT',
          required: true,
          order: 1,
          isActive: true,
          description: 'שם פרטי של איש הקשר',
          isSystem: true
        },
        {
          id: 'core_lastName',
          name: 'lastName',
          label: 'שם משפחה',
          type: 'TEXT',
          entityType: 'CONTACT',
          required: true,
          order: 2,
          isActive: true,
          description: 'שם משפחה של איש הקשר',
          isSystem: true
        },
        {
          id: 'core_email',
          name: 'email',
          label: 'אימייל',
          type: 'EMAIL',
          entityType: 'CONTACT',
          required: false,
          order: 3,
          isActive: true,
          description: 'כתובת אימייל של איש הקשר',
          isSystem: true
        },
        {
          id: 'core_phone',
          name: 'phone',
          label: 'טלפון',
          type: 'PHONE',
          entityType: 'CONTACT',
          required: false,
          order: 4,
          isActive: true,
          description: 'מספר טלפון של איש הקשר',
          isSystem: true
        },
        {
          id: 'core_company',
          name: 'company',
          label: 'חברה',
          type: 'TEXT',
          entityType: 'CONTACT',
          required: false,
          order: 5,
          isActive: true,
          description: 'שם החברה של איש הקשר',
          isSystem: true
        }
      ],
      COMPANY: [
        {
          id: 'core_name',
          name: 'name',
          label: 'שם החברה',
          type: 'TEXT',
          entityType: 'COMPANY',
          required: true,
          order: 1,
          isActive: true,
          description: 'שם החברה',
          isSystem: true
        },
        {
          id: 'core_taxId',
          name: 'taxId',
          label: 'ח.פ/ע.מ',
          type: 'TEXT',
          entityType: 'COMPANY',
          required: true,
          order: 2,
          isActive: true,
          description: 'חברת פרטית/עסק מורשה',
          isSystem: true
        },
        {
          id: 'core_address',
          name: 'address',
          label: 'כתובת',
          type: 'TEXT',
          entityType: 'COMPANY',
          required: false,
          order: 3,
          isActive: true,
          description: 'כתובת החברה',
          isSystem: true
        },
        {
          id: 'core_phone',
          name: 'phone',
          label: 'טלפון',
          type: 'PHONE',
          entityType: 'COMPANY',
          required: false,
          order: 4,
          isActive: true,
          description: 'מספר טלפון החברה',
          isSystem: true
        },
        {
          id: 'core_email',
          name: 'email',
          label: 'אימייל',
          type: 'EMAIL',
          entityType: 'COMPANY',
          required: false,
          order: 5,
          isActive: true,
          description: 'כתובת אימייל החברה',
          isSystem: true
        }
      ],
      SUPPLIER: [
        {
          id: 'core_name',
          name: 'name',
          label: 'שם הספק',
          type: 'TEXT',
          entityType: 'SUPPLIER',
          required: true,
          order: 1,
          isActive: true,
          description: 'שם הספק',
          isSystem: true
        },
        {
          id: 'core_contactPerson',
          name: 'contactPerson',
          label: 'איש קשר',
          type: 'TEXT',
          entityType: 'SUPPLIER',
          required: true,
          order: 2,
          isActive: true,
          description: 'שם איש הקשר אצל הספק',
          isSystem: true
        },
        {
          id: 'core_phone',
          name: 'phone',
          label: 'טלפון',
          type: 'PHONE',
          entityType: 'SUPPLIER',
          required: false,
          order: 3,
          isActive: true,
          description: 'מספר טלפון הספק',
          isSystem: true
        },
        {
          id: 'core_email',
          name: 'email',
          label: 'אימייל',
          type: 'EMAIL',
          entityType: 'SUPPLIER',
          required: false,
          order: 4,
          isActive: true,
          description: 'כתובת אימייל הספק',
          isSystem: true
        }
      ],
      EMPLOYEE: [
        {
          id: 'core_firstName',
          name: 'firstName',
          label: 'שם פרטי',
          type: 'TEXT',
          entityType: 'EMPLOYEE',
          required: true,
          order: 1,
          isActive: true,
          description: 'שם פרטי של העובד',
          isSystem: true
        },
        {
          id: 'core_lastName',
          name: 'lastName',
          label: 'שם משפחה',
          type: 'TEXT',
          entityType: 'EMPLOYEE',
          required: true,
          order: 2,
          isActive: true,
          description: 'שם משפחה של העובד',
          isSystem: true
        },
        {
          id: 'core_email',
          name: 'email',
          label: 'אימייל',
          type: 'EMAIL',
          entityType: 'EMPLOYEE',
          required: true,
          order: 3,
          isActive: true,
          description: 'כתובת אימייל של העובד',
          isSystem: true
        },
        {
          id: 'core_position',
          name: 'position',
          label: 'תפקיד',
          type: 'TEXT',
          entityType: 'EMPLOYEE',
          required: true,
          order: 4,
          isActive: true,
          description: 'תפקיד העובד',
          isSystem: true
        },
        {
          id: 'core_hireDate',
          name: 'hireDate',
          label: 'תאריך העסקה',
          type: 'DATE',
          entityType: 'EMPLOYEE',
          required: true,
          order: 5,
          isActive: true,
          description: 'תאריך תחילת העסקה',
          isSystem: true
        },
        {
          id: 'core_status',
          name: 'status',
          label: 'סטטוס',
          type: 'SELECT',
          entityType: 'EMPLOYEE',
          required: true,
          order: 6,
          isActive: true,
          description: 'סטטוס העובד',
          isSystem: true,
          options: ['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE']
        }
      ],
      PROJECT: [
        {
          id: 'core_name',
          name: 'name',
          label: 'שם הפרויקט',
          type: 'TEXT',
          entityType: 'PROJECT',
          required: true,
          order: 1,
          isActive: true,
          description: 'שם הפרויקט',
          isSystem: true
        },
        {
          id: 'core_status',
          name: 'status',
          label: 'סטטוס',
          type: 'SELECT',
          entityType: 'PROJECT',
          required: true,
          order: 2,
          isActive: true,
          description: 'סטטוס הפרויקט',
          isSystem: true,
          options: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']
        },
        {
          id: 'core_startDate',
          name: 'startDate',
          label: 'תאריך התחלה',
          type: 'DATE',
          entityType: 'PROJECT',
          required: false,
          order: 3,
          isActive: true,
          description: 'תאריך התחלת הפרויקט',
          isSystem: true
        },
        {
          id: 'core_endDate',
          name: 'endDate',
          label: 'תאריך סיום',
          type: 'DATE',
          entityType: 'PROJECT',
          required: false,
          order: 4,
          isActive: true,
          description: 'תאריך סיום מתוכנן',
          isSystem: true
        }
      ],
      TASK: [
        {
          id: 'core_title',
          name: 'title',
          label: 'כותרת המשימה',
          type: 'TEXT',
          entityType: 'TASK',
          required: true,
          order: 1,
          isActive: true,
          description: 'כותרת המשימה',
          isSystem: true
        },
        {
          id: 'core_status',
          name: 'status',
          label: 'סטטוס',
          type: 'SELECT',
          entityType: 'TASK',
          required: true,
          order: 2,
          isActive: true,
          description: 'סטטוס המשימה',
          isSystem: true,
          options: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']
        },
        {
          id: 'core_priority',
          name: 'priority',
          label: 'עדיפות',
          type: 'SELECT',
          entityType: 'TASK',
          required: true,
          order: 3,
          isActive: true,
          description: 'עדיפות המשימה',
          isSystem: true,
          options: ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
        },
        {
          id: 'core_dueDate',
          name: 'dueDate',
          label: 'תאריך יעד',
          type: 'DATE',
          entityType: 'TASK',
          required: false,
          order: 4,
          isActive: true,
          description: 'תאריך יעד לסיום המשימה',
          isSystem: true
        }
      ]
    }
    
    return systemFields[entityType] || []
  }

  // Load custom fields
  useEffect(() => {
    loadCustomFields()
  }, [entityType, clientId])

  const loadCustomFields = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/custom-fields?entityType=${entityType}&clientId=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        // Parse options from JSON strings
        const parsedFields = data.customFields.map((field: any) => ({
          ...field,
          options: field.options ? JSON.parse(field.options) : undefined
        }))
        setFields(parsedFields)
      } else {
        console.error('Error loading custom fields')
      }
    } catch (error) {
      console.error('Error loading custom fields:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createCustomField = async () => {
    if (!newField.name || !newField.label) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newField,
          entityType,
          clientId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFields(prev => [...prev, data.customField])
        setNewField({ name: '', label: '', type: 'TEXT', options: [], required: false, description: '' })
        setIsCreating(false)
      } else {
        const error = await response.json()
        alert(`שגיאה ביצירת השדה: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating custom field:', error)
      alert('שגיאה ביצירת השדה')
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (field: CustomField) => {
    setEditingField(field.id)
    setEditingFieldData({
      ...field,
      options: field.options || []
    })
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditingFieldData({})
  }

  const updateCustomField = async () => {
    if (!editingField || !editingFieldData.name || !editingFieldData.label) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/custom-fields', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: editingField, 
          ...editingFieldData,
          options: editingFieldData.options ? JSON.stringify(editingFieldData.options) : null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFields(prev => prev.map(field => field.id === editingField ? data.customField : field))
        setEditingField(null)
        setEditingFieldData({})
      } else {
        const error = await response.json()
        alert(`שגיאה בעדכון השדה: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating custom field:', error)
      alert('שגיאה בעדכון השדה')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCustomField = async (fieldId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק שדה זה?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/custom-fields?id=${fieldId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFields(prev => prev.filter(field => field.id !== fieldId))
      } else {
        const error = await response.json()
        alert(`שגיאה במחיקת השדה: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting custom field:', error)
      alert('שגיאה במחיקת השדה')
    } finally {
      setIsLoading(false)
    }
  }

  const addOption = () => {
    setNewField(prev => ({ ...prev, options: [...prev.options, ''] }))
  }

  const updateOption = (index: number, value: string) => {
    setNewField(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }))
  }

  const removeOption = (index: number) => {
    setNewField(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const addEditingOption = () => {
    setEditingFieldData(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }))
  }

  const updateEditingOption = (index: number, value: string) => {
    setEditingFieldData(prev => ({
      ...prev,
      options: (prev.options || []).map((option, i) => i === index ? value : option)
    }))
  }

  const removeEditingOption = (index: number) => {
    setEditingFieldData(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index)
    }))
  }

  const addSystemFields = async () => {
    if (!confirm(`האם ברצונך להוסיף שדות חובה מערכת עבור ${entityTypeLabels[entityType]}?`)) {
      return
    }

    setIsLoading(true)
    try {
      const systemFields = getRequiredFields()
      const response = await fetch('/api/custom-fields/system-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          clientId,
          systemFields
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFields(prev => [...prev, ...data.customFields])
        alert(`נוספו ${data.customFields.length} שדות חובה מערכת בהצלחה!`)
      } else {
        const error = await response.json()
        alert(`שגיאה בהוספת שדות חובה מערכת: ${error.error}`)
      }
    } catch (error) {
      console.error('Error adding system fields:', error)
      alert('שגיאה בהוספת שדות חובה מערכת')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex(field => field.id === active.id)
      const newIndex = fields.findIndex(field => field.id === over?.id)

      const newFields = arrayMove(fields, oldIndex, newIndex)
      setFields(newFields)

      // Update order in database
      try {
        await Promise.all(
          newFields.map((field, index) => 
            fetch('/api/custom-fields', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: field.id,
                order: index
              })
            })
          )
        )
      } catch (error) {
        console.error('Error updating field order:', error)
        // Revert on error
        setFields(fields)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>שדות מותאמים אישית - {entityTypeLabels[entityType]}</CardTitle>
          <CardDescription>
            נהל שדות מותאמים אישית עבור {entityTypeLabels[entityType]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isCreating ? (
            <div className="flex space-x-3">
              <Button onClick={() => setIsCreating(true)} disabled={isLoading}>
                <Plus className="h-4 w-4 ml-2" />
                הוסף שדה מותאם אישית
              </Button>
              <Button 
                variant="outline" 
                onClick={() => addSystemFields()} 
                disabled={isLoading}
                title="הוסף שדות חובה מערכת עבור ישות זו"
              >
                <Plus className="h-4 w-4 ml-2" />
                הוסף שדות חובה מערכת*
              </Button>
            </div>
          ) : (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">יצירת שדה חדש</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">שם השדה (פנימי)</label>
                    <Input
                      placeholder="customer_priority"
                      value={newField.name}
                      onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">תווית (תצוגה)</label>
                    <Input
                      placeholder="עדיפות לקוח"
                      value={newField.label}
                      onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">סוג השדה</label>
                    <Select value={newField.type} onValueChange={(value) => setNewField(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="required"
                      checked={newField.required}
                      onCheckedChange={(checked) => setNewField(prev => ({ ...prev, required: !!checked }))}
                    />
                    <label htmlFor="required" className="text-sm font-medium">שדה חובה</label>
                  </div>
                </div>

                {newField.type === 'SELECT' && (
                  <div>
                    <label className="text-sm font-medium">אפשרויות</label>
                    <div className="space-y-2">
                      {newField.options.map((option, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            placeholder={`אפשרות ${index + 1}`}
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addOption}>
                        <Plus className="h-4 w-4 ml-2" />
                        הוסף אפשרות
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">תיאור (אופציונלי)</label>
                  <Textarea
                    placeholder="תיאור השדה..."
                    value={newField.description}
                    onChange={(e) => setNewField(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={createCustomField} disabled={isLoading}>
                    <Save className="h-4 w-4 ml-2" />
                    שמור שדה
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
          <CardTitle>שדות קיימים</CardTitle>
          <CardDescription>רשימת כל השדות המותאמים אישית</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">טוען...</div>
          ) : fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">אין שדות מותאמים אישית</div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={[...getRequiredFields().map(f => f.id), ...fields.map(f => f.id)]} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Required fields first */}
                  {getRequiredFields().map((field) => (
                    <SortableFieldCard
                      key={field.id}
                      field={field}
                      editingField={editingField}
                      editingFieldData={editingFieldData}
                      setEditingFieldData={setEditingFieldData}
                      startEditing={startEditing}
                      cancelEditing={cancelEditing}
                      updateCustomField={updateCustomField}
                      deleteCustomField={deleteCustomField}
                      fieldTypes={fieldTypes}
                      isLoading={isLoading}
                      addEditingOption={addEditingOption}
                      updateEditingOption={updateEditingOption}
                      removeEditingOption={removeEditingOption}
                      isSystemField={true}
                    />
                  ))}
                  
                  {/* Custom fields */}
                  {fields.map((field) => (
                    <SortableFieldCard
                      key={field.id}
                      field={field}
                      editingField={editingField}
                      editingFieldData={editingFieldData}
                      setEditingFieldData={setEditingFieldData}
                      startEditing={startEditing}
                      cancelEditing={cancelEditing}
                      updateCustomField={updateCustomField}
                      deleteCustomField={deleteCustomField}
                      fieldTypes={fieldTypes}
                      isLoading={isLoading}
                      addEditingOption={addEditingOption}
                      updateEditingOption={updateEditingOption}
                      removeEditingOption={removeEditingOption}
                      isSystemField={false}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
