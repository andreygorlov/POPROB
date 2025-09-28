import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for permission check
const checkPermissionSchema = z.object({
  userId: z.string(),
  permission: z.string(), // e.g., "contacts.create", "production.view"
  resource: z.string().optional(), // Specific resource ID
  clientId: z.string().default('default')
})

// POST /api/permissions/check - Check if user has permission
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, permission, resource, clientId } = checkPermissionSchema.parse(body)

    // Get user with roles and direct permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        userPermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has direct permission (overrides role permissions)
    const directPermission = user.userPermissions.find(
      up => up.permission.name === permission && 
            up.granted && 
            (up.expiresAt === null || up.expiresAt > new Date())
    )

    if (directPermission) {
      return NextResponse.json({ 
        hasPermission: true, 
        source: 'direct',
        permission: directPermission.permission
      })
    }

    // Check role permissions
    const rolePermissions = user.roles.flatMap(ur => 
      ur.role.permissions.filter(rp => rp.granted)
    )

    const rolePermission = rolePermissions.find(
      rp => rp.permission.name === permission
    )

    if (rolePermission) {
      return NextResponse.json({ 
        hasPermission: true, 
        source: 'role',
        role: rolePermission.role,
        permission: rolePermission.permission
      })
    }

    // Check if user is admin (has all permissions)
    const isAdmin = user.role === 'ADMIN' || user.roles.some(ur => ur.role.name === 'ADMIN')
    
    if (isAdmin) {
      return NextResponse.json({ 
        hasPermission: true, 
        source: 'admin'
      })
    }

    return NextResponse.json({ 
      hasPermission: false,
      source: 'none'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error checking permission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/permissions/check-multiple - Check multiple permissions at once
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { userId, permissions, clientId = 'default' } = body

    if (!Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Permissions must be an array' }, { status: 400 })
    }

    // Get user with roles and direct permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        userPermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is admin
    const isAdmin = user.role === 'ADMIN' || user.roles.some(ur => ur.role.name === 'ADMIN')
    
    if (isAdmin) {
      const adminResults = permissions.map(permission => ({
        permission,
        hasPermission: true,
        source: 'admin'
      }))
      return NextResponse.json({ permissions: adminResults })
    }

    // Check direct permissions
    const directPermissions = user.userPermissions.filter(
      up => up.granted && 
            (up.expiresAt === null || up.expiresAt > new Date())
    )

    // Check role permissions
    const rolePermissions = user.roles.flatMap(ur => 
      ur.role.permissions.filter(rp => rp.granted)
    )

    const results = permissions.map(permission => {
      // Check direct permission first
      const directPermission = directPermissions.find(
        up => up.permission.name === permission
      )

      if (directPermission) {
        return {
          permission,
          hasPermission: true,
          source: 'direct'
        }
      }

      // Check role permission
      const rolePermission = rolePermissions.find(
        rp => rp.permission.name === permission
      )

      if (rolePermission) {
        return {
          permission,
          hasPermission: true,
          source: 'role'
        }
      }

      return {
        permission,
        hasPermission: false,
        source: 'none'
      }
    })

    return NextResponse.json({ permissions: results })
  } catch (error) {
    console.error('Error checking multiple permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
