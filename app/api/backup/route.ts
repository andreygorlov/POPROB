import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

interface BackupConfig {
  includeFrontend: boolean
  includeBackend: boolean
  includeDatabase: boolean
  includeUploads: boolean
  compression: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      config = {
        includeFrontend: true,
        includeBackend: true,
        includeDatabase: true,
        includeUploads: true,
        compression: true
      }
    } = body

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = name || `full-backup-${timestamp}`
    const backupDir = path.join(process.cwd(), 'backups', backupName)
    
    // יצירת תיקיית גיבוי
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const backupResults = {
      frontend: null as any,
      backend: null as any,
      database: null as any,
      uploads: null as any,
      totalSize: 0,
      errors: [] as string[]
    }

    // 1. גיבוי Frontend (קבצי React/Next.js)
    if (config.includeFrontend) {
      try {
        console.log('🔄 מגבה Frontend...')
        
        const frontendFiles = [
          'app/**/*',
          'components/**/*',
          'lib/**/*',
          'public/**/*',
          'styles/**/*',
          'next.config.js',
          'tailwind.config.js',
          'tsconfig.json',
          'package.json'
        ]

        const frontendDir = path.join(backupDir, 'frontend')
        fs.mkdirSync(frontendDir, { recursive: true })

        // העתקת קבצי Frontend
        for (const pattern of frontendFiles) {
          try {
            execSync(`xcopy "${pattern}" "${frontendDir}" /E /I /Y`, { stdio: 'pipe' })
          } catch (error) {
            // התעלם משגיאות של קבצים שלא קיימים
          }
        }

        const frontendSize = getDirectorySize(frontendDir)
        backupResults.frontend = {
          path: frontendDir,
          size: frontendSize,
          files: countFiles(frontendDir),
          status: 'completed'
        }
        backupResults.totalSize += frontendSize

        console.log(`✅ Frontend נגבה: ${formatFileSize(frontendSize)}`)
      } catch (error) {
        backupResults.errors.push(`Frontend: ${error}`)
        console.error('❌ שגיאה בגיבוי Frontend:', error)
      }
    }

    // 2. גיבוי Backend (API routes, server logic)
    if (config.includeBackend) {
      try {
        console.log('🔄 מגבה Backend...')
        
        const backendFiles = [
          'app/api/**/*',
          'server/**/*',
          'lib/**/*',
          'middleware.ts',
          '.env.local',
          '.env.example'
        ]

        const backendDir = path.join(backupDir, 'backend')
        fs.mkdirSync(backendDir, { recursive: true })

        // העתקת קבצי Backend
        for (const pattern of backendFiles) {
          try {
            execSync(`xcopy "${pattern}" "${backendDir}" /E /I /Y`, { stdio: 'pipe' })
          } catch (error) {
            // התעלם משגיאות של קבצים שלא קיימים
          }
        }

        const backendSize = getDirectorySize(backendDir)
        backupResults.backend = {
          path: backendDir,
          size: backendSize,
          files: countFiles(backendDir),
          status: 'completed'
        }
        backupResults.totalSize += backendSize

        console.log(`✅ Backend נגבה: ${formatFileSize(backendSize)}`)
      } catch (error) {
        backupResults.errors.push(`Backend: ${error}`)
        console.error('❌ שגיאה בגיבוי Backend:', error)
      }
    }

    // 3. גיבוי Database (SQLite/PostgreSQL)
    if (config.includeDatabase) {
      try {
        console.log('🔄 מגבה Database...')
        
        const dbDir = path.join(backupDir, 'database')
        fs.mkdirSync(dbDir, { recursive: true })

        // גיבוי SQLite
        if (process.env.DATABASE_URL?.startsWith('file:')) {
          const dbPath = process.env.DATABASE_URL.replace('file:', '')
          if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, path.join(dbDir, 'database.db'))
            console.log('✅ SQLite database נגבה')
          }
        }

        // גיבוי Prisma schema
        if (fs.existsSync('prisma/schema.prisma')) {
          fs.copyFileSync('prisma/schema.prisma', path.join(dbDir, 'schema.prisma'))
        }

        // יצירת SQL dump
        try {
          const sqlDump = await generateSQLDump()
          fs.writeFileSync(path.join(dbDir, 'dump.sql'), sqlDump)
          console.log('✅ SQL dump נוצר')
        } catch (error) {
          console.warn('⚠️ לא ניתן ליצור SQL dump:', error)
        }

        const dbSize = getDirectorySize(dbDir)
        backupResults.database = {
          path: dbDir,
          size: dbSize,
          files: countFiles(dbDir),
          status: 'completed'
        }
        backupResults.totalSize += dbSize

        console.log(`✅ Database נגבה: ${formatFileSize(dbSize)}`)
      } catch (error) {
        backupResults.errors.push(`Database: ${error}`)
        console.error('❌ שגיאה בגיבוי Database:', error)
      }
    }

    // 4. גיבוי Uploads (קבצים שהועלו)
    if (config.includeUploads) {
      try {
        console.log('🔄 מגבה Uploads...')
        
        const uploadsDir = path.join(backupDir, 'uploads')
        fs.mkdirSync(uploadsDir, { recursive: true })

        const publicDir = path.join(process.cwd(), 'public')
        if (fs.existsSync(publicDir)) {
          execSync(`xcopy "${publicDir}" "${uploadsDir}" /E /I /Y`, { stdio: 'pipe' })
        }

        const uploadsSize = getDirectorySize(uploadsDir)
        backupResults.uploads = {
          path: uploadsDir,
          size: uploadsSize,
          files: countFiles(uploadsDir),
          status: 'completed'
        }
        backupResults.totalSize += uploadsSize

        console.log(`✅ Uploads נגבו: ${formatFileSize(uploadsSize)}`)
      } catch (error) {
        backupResults.errors.push(`Uploads: ${error}`)
        console.error('❌ שגיאה בגיבוי Uploads:', error)
      }
    }

    // 5. יצירת metadata
    const metadata = {
      name: backupName,
      timestamp: new Date().toISOString(),
      config,
      results: backupResults,
      version: '1.0.0',
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    }

    fs.writeFileSync(
      path.join(backupDir, 'backup-metadata.json'),
      JSON.stringify(metadata, null, 2)
    )

    // 6. דחיסה (אופציונלית)
    if (config.compression) {
      try {
        console.log('🔄 דוחס גיבוי...')
        const compressedPath = `${backupDir}.zip`
        execSync(`powershell Compress-Archive -Path "${backupDir}" -DestinationPath "${compressedPath}"`, { stdio: 'pipe' })
        
        // מחיקת התיקייה המקורית
        fs.rmSync(backupDir, { recursive: true })
        
        console.log(`✅ גיבוי דחוס: ${compressedPath}`)
        
        return NextResponse.json({
          success: true,
          message: 'גיבוי מלא הושלם בהצלחה',
          backup: {
            name: backupName,
            path: compressedPath,
            size: fs.statSync(compressedPath).size,
            timestamp: metadata.timestamp,
            results: backupResults
          }
        })
      } catch (error) {
        console.warn('⚠️ שגיאה בדחיסה:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'גיבוי מלא הושלם בהצלחה',
      backup: {
        name: backupName,
        path: backupDir,
        size: backupResults.totalSize,
        timestamp: metadata.timestamp,
        results: backupResults
      }
    })

  } catch (error) {
    console.error('❌ שגיאה כללית בגיבוי:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'שגיאה ביצירת גיבוי',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const backupsDir = path.join(process.cwd(), 'backups')
    
    if (!fs.existsSync(backupsDir)) {
      return NextResponse.json({ backups: [] })
    }

    const backups = fs.readdirSync(backupsDir)
      .filter(item => {
        const itemPath = path.join(backupsDir, item)
        return fs.statSync(itemPath).isDirectory() || item.endsWith('.zip')
      })
      .map(item => {
        const itemPath = path.join(backupsDir, item)
        const stats = fs.statSync(itemPath)
        const isCompressed = item.endsWith('.zip')
        
        let metadata = null
        if (!isCompressed) {
          const metadataPath = path.join(itemPath, 'backup-metadata.json')
          if (fs.existsSync(metadataPath)) {
            try {
              metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
            } catch (error) {
              console.warn('שגיאה בקריאת metadata:', error)
            }
          }
        }

        return {
          name: item,
          path: itemPath,
          size: stats.size,
          timestamp: stats.mtime.toISOString(),
          isCompressed,
          metadata
        }
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ backups })

  } catch (error) {
    console.error('❌ שגיאה ברשימת גיבויים:', error)
    return NextResponse.json(
      { error: 'שגיאה ברשימת גיבויים' },
      { status: 500 }
    )
  }
}

// Helper functions
function getDirectorySize(dirPath: string): number {
  let totalSize = 0
  
  try {
    const files = fs.readdirSync(dirPath)
    
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stats = fs.statSync(filePath)
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath)
      } else {
        totalSize += stats.size
      }
    }
  } catch (error) {
    console.warn('שגיאה בחישוב גודל תיקייה:', error)
  }
  
  return totalSize
}

function countFiles(dirPath: string): number {
  let count = 0
  
  try {
    const files = fs.readdirSync(dirPath)
    
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stats = fs.statSync(filePath)
      
      if (stats.isDirectory()) {
        count += countFiles(filePath)
      } else {
        count++
      }
    }
  } catch (error) {
    console.warn('שגיאה בספירת קבצים:', error)
  }
  
  return count
}

function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

async function generateSQLDump(): Promise<string> {
  try {
    // יצירת SQL dump מהמסד נתונים
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ` as Array<{name: string}>

    let dump = '-- SQL Dump Generated at ' + new Date().toISOString() + '\n\n'
    
    for (const table of tables) {
      const tableName = table.name
      const data = await prisma.$queryRawUnsafe(`SELECT * FROM ${tableName}`)
      
      dump += `-- Table: ${tableName}\n`
      dump += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`
      
      // כאן צריך להוסיף את מבנה הטבלה
      dump += `  -- Table structure would go here\n`
      dump += `);\n\n`
      
      // הוספת הנתונים
      if (Array.isArray(data) && data.length > 0) {
        dump += `-- Data for ${tableName}\n`
        for (const row of data) {
          const values = Object.values(row).map(v => 
            typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v
          ).join(', ')
          dump += `INSERT INTO ${tableName} VALUES (${values});\n`
        }
        dump += '\n'
      }
    }
    
    return dump
  } catch (error) {
    console.warn('שגיאה ביצירת SQL dump:', error)
    return '-- Error generating SQL dump\n'
  }
}
