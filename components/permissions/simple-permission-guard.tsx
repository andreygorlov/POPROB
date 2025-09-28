'use client'

import { useState, useEffect, ReactNode } from 'react'
import { AlertTriangle, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SimplePermissionGuardProps {
  permission: string
  userId?: string
  clientId?: string
  children: ReactNode
  fallback?: ReactNode
  requireAll?: boolean
  permissions?: string[]
}

export function SimplePermissionGuard({
  permission,
  userId,
  clientId = 'default',
  children,
  fallback,
  requireAll = false,
  permissions = []
}: SimplePermissionGuardProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkPermissions()
  }, [permission, permissions, userId, clientId])

  const checkPermissions = async () => {
    if (!userId) {
      setHasPermission(false)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      if (permissions.length > 0) {
        // Check multiple permissions
        const results = await Promise.all(
          permissions.map(p => checkSinglePermission(p))
        )
        
        if (requireAll) {
          setHasPermission(results.every(result => result))
        } else {
          setHasPermission(results.some(result => result))
        }
      } else {
        // Check single permission
        const result = await checkSinglePermission(permission)
        setHasPermission(result)
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
      setHasPermission(false)
    } finally {
      setIsLoading(false)
    }
  }

  const checkSinglePermission = async (perm: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/permissions/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          permission: perm,
          clientId
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.hasPermission
      }
      return false
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show fallback if no permission
  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <Shield className="h-5 w-5" />
            <span>אין הרשאה</span>
          </CardTitle>
          <CardDescription className="text-red-600">
            אין לך הרשאה לגשת לתוכן זה
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>
              נדרשת הרשאה: {permission}
              {permissions.length > 0 && ` (${permissions.join(', ')})`}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show children if has permission
  return <>{children}</>
}

// Hook for checking permissions
export function useSimplePermissions(userId?: string, clientId = 'default') {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)

  const checkPermission = async (permission: string): Promise<boolean> => {
    if (!userId) return false

    try {
      const response = await fetch('/api/permissions/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          permission,
          clientId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPermissions(prev => ({
          ...prev,
          [permission]: data.hasPermission
        }))
        return data.hasPermission
      }
    } catch (error) {
      console.error('Error checking permission:', error)
    }
    return false
  }

  const checkMultiplePermissions = async (permissionsList: string[]) => {
    if (!userId) return {}

    setIsLoading(true)
    try {
      const results = await Promise.all(
        permissionsList.map(p => checkPermission(p))
      )
      
      const permissionMap: Record<string, boolean> = {}
      permissionsList.forEach((p, index) => {
        permissionMap[p] = results[index]
      })
      
      setPermissions(permissionMap)
      return permissionMap
    } catch (error) {
      console.error('Error checking permissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const hasPermission = (permission: string) => {
    return permissions[permission] || false
  }

  const hasAnyPermission = (permissionsList: string[]) => {
    return permissionsList.some(p => permissions[p])
  }

  const hasAllPermissions = (permissionsList: string[]) => {
    return permissionsList.every(p => permissions[p])
  }

  return {
    permissions,
    isLoading,
    checkPermission,
    checkMultiplePermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
}
