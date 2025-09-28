'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Settings,
  Package
} from 'lucide-react'

interface Module {
  id: string
  name: string
  label: string
  description?: string
  icon?: string
  order: number
  isActive: boolean
  _count: {
    permissions: number
  }
}

interface ModuleManagerProps {
  clientId?: string
}

export function ModuleManager({ clientId = 'default' }: ModuleManagerProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [newModule, setNewModule] = useState({
    name: '',
    label: '',
    description: '',
    icon: '',
    order: 0
  })

  useEffect(() => {
    loadModules()
  }, [clientId])

  const loadModules = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/modules?clientId=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setModules(data.modules)
      }
    } catch (error) {
      console.error('Error loading modules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createModule = async () => {
    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newModule,
          clientId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setModules(prev => [...prev, data.module])
        setNewModule({
          name: '',
          label: '',
          description: '',
          icon: '',
          order: 0
        })
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Error creating module:', error)
    }
  }

  const updateModule = async (module: Module) => {
    try {
      const response = await fetch('/api/modules', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: module.id,
          ...module
        })
      })

      if (response.ok) {
        const data = await response.json()
        setModules(prev => prev.map(m => m.id === module.id ? data.module : m))
        setEditingModule(null)
      }
    } catch (error) {
      console.error('Error updating module:', error)
    }
  }

  const deleteModule = async (moduleId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המודול?')) return

    try {
      const response = await fetch(`/api/modules?id=${moduleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setModules(prev => prev.filter(m => m.id !== moduleId))
      }
    } catch (error) {
      console.error('Error deleting module:', error)
    }
  }

  const getModuleIcon = (icon?: string) => {
    if (icon) return icon
    return '📦'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span>ניהול מודולים</span>
          </CardTitle>
          <CardDescription>
            נהל מודולים חדשים במערכת והגדר הרשאות אוטומטיות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">מודולים קיימים</h3>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 ml-2" />
                הוסף מודול
              </Button>
            </div>

            {isCreating && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800">יצירת מודול חדש</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">שם המודול (אנגלית)</label>
                      <Input
                        value={newModule.name}
                        onChange={(e) => setNewModule(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="inventory"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">תווית (עברית)</label>
                      <Input
                        value={newModule.label}
                        onChange={(e) => setNewModule(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="מלאי"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">תיאור</label>
                      <Input
                        value={newModule.description}
                        onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="ניהול מלאי ומוצרים"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">אייקון</label>
                      <Input
                        value={newModule.icon}
                        onChange={(e) => setNewModule(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="📦"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">סדר תצוגה</label>
                      <Input
                        type="number"
                        value={newModule.order}
                        onChange={(e) => setNewModule(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={createModule}>
                      <Save className="h-4 w-4 ml-2" />
                      צור מודול
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      <X className="h-4 w-4 ml-2" />
                      ביטול
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>מודול</TableHead>
                    <TableHead>תיאור</TableHead>
                    <TableHead>הרשאות</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getModuleIcon(module.icon)}</span>
                          <div>
                            <div className="font-medium">{module.label}</div>
                            <div className="text-sm text-gray-500">{module.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {module.description || 'ללא תיאור'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {module._count.permissions} הרשאות
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={module.isActive ? "default" : "secondary"}>
                          {module.isActive ? 'פעיל' : 'לא פעיל'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingModule(module)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteModule(module.id)}
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

            {editingModule && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800">עריכת מודול</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">תווית (עברית)</label>
                      <Input
                        value={editingModule.label}
                        onChange={(e) => setEditingModule(prev => prev ? { ...prev, label: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">תיאור</label>
                      <Input
                        value={editingModule.description || ''}
                        onChange={(e) => setEditingModule(prev => prev ? { ...prev, description: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">אייקון</label>
                      <Input
                        value={editingModule.icon || ''}
                        onChange={(e) => setEditingModule(prev => prev ? { ...prev, icon: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">סדר תצוגה</label>
                      <Input
                        type="number"
                        value={editingModule.order}
                        onChange={(e) => setEditingModule(prev => prev ? { ...prev, order: parseInt(e.target.value) || 0 } : null)}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => updateModule(editingModule)}>
                      <Save className="h-4 w-4 ml-2" />
                      שמור שינויים
                    </Button>
                    <Button variant="outline" onClick={() => setEditingModule(null)}>
                      <X className="h-4 w-4 ml-2" />
                      ביטול
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
