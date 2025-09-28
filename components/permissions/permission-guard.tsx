'use client'

import { useState, useEffect, ReactNode } from 'react'
import { AlertTriangle, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PermissionGuardProps {
  permission: string
  resource?: string
  userId?: string
  clientId?: string
  children: ReactNode
  fallback?: ReactNode
  requireAll?: boolean // If true, requires ALL permissions
  permissions?: string[] // Multiple permissions to check
}

export function PermissionGuard({
  permission,
  resource,
  userId,
  clientId = 'default',
  children,
  fallback,
  requireAll = false,
  permissions = []
}: PermissionGuardProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [permissionDetails, setPermissionDetails] = useState<any>(null)

  useEffect(() => {
    checkPermissions()
  }, [permission, permissions, userId, clientId, resource])

  const checkPermissions = async () => {
    if (!userId) {
      setHasPermission(false)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      // If multiple permissions provided, check all
      if (permissions.length > 0) {
        const response = await fetch('/api/permissions/check', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            permissions: requireAll ? permissions : [permission, ...permissions],
            clientId
          })
        })

        if (response.ok) {
          const data = await response.json()
          
          if (requireAll) {
            // User must have ALL permissions
            setHasPermission(data.permissions.every((p: any) => p.hasPermission))
          } else {
            // User needs at least ONE permission
            setHasPermission(data.permissions.some((p: any) => p.hasPermission))
          }
        } else {
          setHasPermission(false)
        }
      } else {
        // Single permission check
        const response = await fetch('/api/permissions/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            permission,
            resource,
            clientId
          })
        })

        if (response.ok) {
          const data = await response.json()
          setHasPermission(data.hasPermission)
          setPermissionDetails(data)
        } else {
          setHasPermission(false)
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
      setHasPermission(false)
    } finally {
      setIsLoading(false)
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
              {resource && ` עבור ${resource}`}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show children if has permission
  return <>{children}</>
}

// Hook for checking permissions in components
export function usePermissions(userId?: string, clientId = 'default') {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)

  const checkPermission = async (permission: string, resource?: string) => {
    if (!userId) return false

    try {
      const response = await fetch('/api/permissions/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          permission,
          resource,
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
      const response = await fetch('/api/permissions/check', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          permissions: permissionsList,
          clientId
        })
      })

      if (response.ok) {
        const data = await response.json()
        const permissionMap: Record<string, boolean> = {}
        
        data.permissions.forEach((p: any) => {
          permissionMap[p.permission] = p.hasPermission
        })
        
        setPermissions(permissionMap)
        return permissionMap
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
    } finally {
      setIsLoading(false)
    }
    return {}
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
