'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Database, 
  Code, 
  Monitor, 
  Upload, 
  Archive,
  CheckCircle,
  AlertTriangle,
  Clock,
  HardDrive
} from 'lucide-react'

interface BackupConfig {
  includeFrontend: boolean
  includeBackend: boolean
  includeDatabase: boolean
  includeUploads: boolean
  compression: boolean
}

interface BackupResult {
  name: string
  path: string
  size: number
  timestamp: string
  results: {
    frontend: any
    backend: any
    database: any
    uploads: any
    totalSize: number
    errors: string[]
  }
}

export function FullBackupWidget() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    includeFrontend: true,
    includeBackend: true,
    includeDatabase: true,
    includeUploads: true,
    compression: true
  })
  const [lastBackup, setLastBackup] = useState<BackupResult | null>(null)
  const [backupHistory, setBackupHistory] = useState<BackupResult[]>([])

  const createFullBackup = async () => {
    setIsBackingUp(true)
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `גיבוי מלא - ${new Date().toLocaleDateString('he-IL')}`,
          config: backupConfig
        })
      })

      if (response.ok) {
        const result = await response.json()
        setLastBackup(result.backup)
        setBackupHistory(prev => [result.backup, ...prev])
        alert('גיבוי מלא הושלם בהצלחה!')
      } else {
        throw new Error('שגיאה ביצירת גיבוי')
      }
    } catch (error) {
      console.error('שגיאה ביצירת גיבוי:', error)
      alert('שגיאה ביצירת גיבוי')
    } finally {
      setIsBackingUp(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getBackupStatus = () => {
    if (!lastBackup) return { status: 'none', message: 'אין גיבויים' }
    
    const daysSinceBackup = Math.floor(
      (Date.now() - new Date(lastBackup.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceBackup === 0) return { status: 'fresh', message: 'גיבוי עדכני' }
    if (daysSinceBackup <= 3) return { status: 'good', message: 'גיבוי טרי' }
    if (daysSinceBackup <= 7) return { status: 'warning', message: 'גיבוי ישן' }
    return { status: 'danger', message: 'גיבוי ישן מאוד' }
  }

  const backupStatus = getBackupStatus()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          גיבוי מלא של המערכת
        </CardTitle>
        <CardDescription>
          גיבוי מקיף של Frontend, Backend, Database ו-Uploads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* סטטוס גיבוי אחרון */}
        {lastBackup && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">גיבוי אחרון</span>
              <Badge className={
                backupStatus.status === 'fresh' ? 'bg-green-100 text-green-800' :
                backupStatus.status === 'good' ? 'bg-blue-100 text-blue-800' :
                backupStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }>
                {backupStatus.message}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>שם: {lastBackup.name}</div>
              <div>גודל: {formatFileSize(lastBackup.size)}</div>
              <div>תאריך: {new Date(lastBackup.timestamp).toLocaleString('he-IL')}</div>
            </div>
          </div>
        )}

        {/* הגדרות גיבוי */}
        <div className="space-y-3">
          <h4 className="font-medium">מה לכלול בגיבוי:</h4>
          
          <div className="grid grid-cols-2 gap-3">
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
                Frontend
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
                Backend
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
                Database
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
                Uploads
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
              דחיסה (חוסך מקום)
            </label>
          </div>
        </div>

        {/* כפתור יצירת גיבוי */}
        <Button
          onClick={createFullBackup}
          disabled={isBackingUp}
          className="w-full"
          size="lg"
        >
          {isBackingUp ? (
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

        {/* סטטיסטיקות מהירות */}
        <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t">
          <div className="space-y-1">
            <div className="text-lg font-semibold text-blue-600">
              {backupHistory.length}
            </div>
            <div className="text-xs text-gray-600">גיבויים</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-green-600">
              {lastBackup ? formatFileSize(lastBackup.size) : '0 B'}
            </div>
            <div className="text-xs text-gray-600">גודל אחרון</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-purple-600">
              {backupConfig.includeFrontend && backupConfig.includeBackend && backupConfig.includeDatabase && backupConfig.includeUploads ? 'מלא' : 'חלקי'}
            </div>
            <div className="text-xs text-gray-600">סוג גיבוי</div>
          </div>
        </div>

        {/* היסטוריית גיבויים */}
        {backupHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">היסטוריית גיבויים:</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {backupHistory.slice(0, 5).map((backup, index) => (
                <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                  <div>
                    <div className="font-medium">{backup.name}</div>
                    <div className="text-gray-600">
                      {new Date(backup.timestamp).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatFileSize(backup.size)}</div>
                    <div className="text-gray-600">
                      {backup.results.errors.length > 0 ? (
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
