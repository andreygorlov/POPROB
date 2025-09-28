'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { 
  Database, 
  Code, 
  Monitor, 
  Upload, 
  Archive,
  CheckCircle,
  AlertTriangle,
  Clock,
  HardDrive,
  Download,
  Trash2,
  RotateCcw,
  Settings
} from 'lucide-react'

interface BackupConfig {
  includeFrontend: boolean
  includeBackend: boolean
  includeDatabase: boolean
  includeUploads: boolean
  compression: boolean
}

interface BackupItem {
  name: string
  path: string
  size: number
  timestamp: string
  isCompressed: boolean
  metadata?: {
    results: {
      frontend: any
      backend: any
      database: any
      uploads: any
      totalSize: number
      errors: string[]
    }
  }
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    includeFrontend: true,
    includeBackend: true,
    includeDatabase: true,
    includeUploads: true,
    compression: true
  })
  const [newBackupName, setNewBackupName] = useState('')

  // טעינת רשימת גיבויים
  useEffect(() => {
    loadBackups()
  }, [])

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/backup')
      if (response.ok) {
        const data = await response.json()
        setBackups(data.backups)
      }
    } catch (error) {
      console.error('שגיאה בטעינת גיבויים:', error)
    }
  }

  const createBackup = async () => {
    if (!newBackupName.trim()) {
      alert('נא להכניס שם לגיבוי')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newBackupName,
          config: backupConfig
        })
      })

      if (response.ok) {
        const result = await response.json()
        setBackups(prev => [result.backup, ...prev])
        setNewBackupName('')
        alert('גיבוי נוצר בהצלחה!')
      } else {
        throw new Error('שגיאה ביצירת גיבוי')
      }
    } catch (error) {
      console.error('שגיאה ביצירת גיבוי:', error)
      alert('שגיאה ביצירת גיבוי')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteBackup = async (backupName: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק גיבוי זה?')) return
    
    try {
      // כאן יהיה קריאה ל-API למחיקת גיבוי
      setBackups(prev => prev.filter(b => b.name !== backupName))
      alert('גיבוי נמחק בהצלחה')
    } catch (error) {
      console.error('שגיאה במחיקת גיבוי:', error)
      alert('שגיאה במחיקת גיבוי')
    }
  }

  const restoreBackup = async (backupName: string) => {
    if (!confirm('האם אתה בטוח שברצונך לשחזר מגיבוי זה? זה יחליף את כל הקבצים הנוכחיים!')) return
    
    try {
      // כאן יהיה קריאה ל-API לשחזור מגיבוי
      alert('שחזור מגיבוי הושלם')
    } catch (error) {
      console.error('שגיאה בשחזור מגיבוי:', error)
      alert('שגיאה בשחזור מגיבוי')
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL')
  }

  const getBackupStatus = (backup: BackupItem) => {
    const daysSinceBackup = Math.floor(
      (Date.now() - new Date(backup.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceBackup === 0) return { status: 'fresh', text: 'עדכני' }
    if (daysSinceBackup <= 3) return { status: 'good', text: 'טרי' }
    if (daysSinceBackup <= 7) return { status: 'warning', text: 'ישן' }
    return { status: 'danger', text: 'ישן מאוד' }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ניהול גיבויים</h1>
          <p className="text-gray-600">גיבוי ושחזור מלא של המערכת</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadBackups}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            רענן
          </Button>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            יצירת גיבוי
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            רשימת גיבויים
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            הגדרות
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          {/* יצירת גיבוי חדש */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                יצירת גיבוי מלא
              </CardTitle>
              <CardDescription>
                בחר מה לכלול בגיבוי וצור גיבוי מקיף של המערכת
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* שם הגיבוי */}
              <div className="space-y-2">
                <label className="text-sm font-medium">שם הגיבוי</label>
                <input
                  type="text"
                  placeholder="הכנס שם לגיבוי..."
                  value={newBackupName}
                  onChange={(e) => setNewBackupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* הגדרות גיבוי */}
              <div className="space-y-4">
                <h4 className="font-medium">מה לכלול בגיבוי:</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="frontend"
                      checked={backupConfig.includeFrontend}
                      onCheckedChange={(checked) => 
                        setBackupConfig(prev => ({ ...prev, includeFrontend: !!checked }))
                      }
                    />
                    <label htmlFor="frontend" className="flex items-center gap-2 text-sm">
                      <Monitor className="h-4 w-4" />
                      Frontend (React/Next.js)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="backend"
                      checked={backupConfig.includeBackend}
                      onCheckedChange={(checked) => 
                        setBackupConfig(prev => ({ ...prev, includeBackend: !!checked }))
                      }
                    />
                    <label htmlFor="backend" className="flex items-center gap-2 text-sm">
                      <Code className="h-4 w-4" />
                      Backend (API/Server)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="database"
                      checked={backupConfig.includeDatabase}
                      onCheckedChange={(checked) => 
                        setBackupConfig(prev => ({ ...prev, includeDatabase: !!checked }))
                      }
                    />
                    <label htmlFor="database" className="flex items-center gap-2 text-sm">
                      <Database className="h-4 w-4" />
                      Database (SQLite/PostgreSQL)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uploads"
                      checked={backupConfig.includeUploads}
                      onCheckedChange={(checked) => 
                        setBackupConfig(prev => ({ ...prev, includeUploads: !!checked }))
                      }
                    />
                    <label htmlFor="uploads" className="flex items-center gap-2 text-sm">
                      <Upload className="h-4 w-4" />
                      Uploads (קבצים שהועלו)
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compression"
                    checked={backupConfig.compression}
                    onCheckedChange={(checked) => 
                      setBackupConfig(prev => ({ ...prev, compression: !!checked }))
                    }
                  />
                  <label htmlFor="compression" className="text-sm">
                    דחיסה (חוסך מקום בדיסק)
                  </label>
                </div>
              </div>

              {/* כפתור יצירת גיבוי */}
              <Button
                onClick={createBackup}
                disabled={isLoading || !newBackupName.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    יוצר גיבוי מלא...
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    צור גיבוי מלא
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {/* רשימת גיבויים */}
          <div className="grid gap-4">
            {backups.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Archive className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">אין גיבויים</h3>
                  <p className="text-gray-600">עדיין לא נוצרו גיבויים במערכת</p>
                </CardContent>
              </Card>
            ) : (
              backups.map((backup, index) => {
                const status = getBackupStatus(backup)
                return (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{backup.name}</h3>
                            <Badge className={
                              status.status === 'fresh' ? 'bg-green-100 text-green-800' :
                              status.status === 'good' ? 'bg-blue-100 text-blue-800' :
                              status.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {status.text}
                            </Badge>
                            {backup.isCompressed && (
                              <Badge variant="outline">דחוס</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(backup.timestamp)}
                            </span>
                            <span>{formatFileSize(backup.size)}</span>
                            {backup.metadata?.results.errors.length > 0 && (
                              <span className="flex items-center gap-1 text-yellow-600">
                                <AlertTriangle className="h-3 w-3" />
                                {backup.metadata.results.errors.length} שגיאות
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreBackup(backup.name)}
                            className="flex items-center gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            שחזר
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteBackup(backup.name)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                            מחק
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>הגדרות גיבוי</CardTitle>
              <CardDescription>
                הגדר את התנהגות מערכת הגיבויים
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">גיבויים אוטומטיים</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md" title="בחר תדירות גיבויים אוטומטיים">
                    <option>כל יום בשעה 02:00</option>
                    <option>כל שבוע ביום ראשון</option>
                    <option>כל חודש ב-1</option>
                    <option>מושבת</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">שמירת גיבויים</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md" title="בחר כמה זמן לשמור גיבויים">
                    <option>30 יום</option>
                    <option>60 יום</option>
                    <option>90 יום</option>
                    <option>לעולם</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">גיבוי לפני שינויים</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md" title="בחר מתי ליצור גיבוי לפני שינויים">
                    <option>תמיד</option>
                    <option>רק שינויים גדולים</option>
                    <option>מושבת</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">התראות</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md" title="בחר סוג התראות">
                    <option>כל הפעולות</option>
                    <option>רק שגיאות</option>
                    <option>מושבת</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button>שמור הגדרות</Button>
                <Button variant="outline">איפוס לברירת מחדל</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  )
}
