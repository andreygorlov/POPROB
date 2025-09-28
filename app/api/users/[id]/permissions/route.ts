import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/users/[id]/permissions - Get user permissions
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') || 'default'
    const userId = params.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user with their role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get role-based permissions (mock data for now)
    const rolePermissions = {
      ADMIN: [
        'contacts.create', 'contacts.read', 'contacts.update', 'contacts.delete', 'contacts.export', 'contacts.import',
        'production.create', 'production.read', 'production.update', 'production.delete', 'production.approve',
        'products.create', 'products.read', 'products.update', 'products.delete', 'products.export', 'products.import',
        'sales.create', 'sales.read', 'sales.update', 'sales.delete', 'sales.approve', 'sales.export',
        'purchasing.create', 'purchasing.read', 'purchasing.update', 'purchasing.delete', 'purchasing.approve',
        'accounting.create', 'accounting.read', 'accounting.update', 'accounting.delete', 'accounting.approve',
        'hr.create', 'hr.read', 'hr.update', 'hr.delete',
        'reports.read', 'reports.export', 'reports.create',
        'settings.read', 'settings.update', 'settings.create', 'settings.delete',
        'users.create', 'users.read', 'users.update', 'users.delete',
        'permissions.create', 'permissions.read', 'permissions.update', 'permissions.delete'
      ],
      MANAGER: [
        'contacts.create', 'contacts.read', 'contacts.update', 'contacts.delete', 'contacts.export',
        'production.create', 'production.read', 'production.update', 'production.delete', 'production.approve',
        'products.create', 'products.read', 'products.update', 'products.delete', 'products.export',
        'sales.create', 'sales.read', 'sales.update', 'sales.delete', 'sales.approve', 'sales.export',
        'purchasing.create', 'purchasing.read', 'purchasing.update', 'purchasing.delete', 'purchasing.approve',
        'accounting.create', 'accounting.read', 'accounting.update', 'accounting.delete', 'accounting.approve',
        'hr.create', 'hr.read', 'hr.update', 'hr.delete',
        'reports.read', 'reports.export',
        'settings.read', 'settings.update'
      ],
      EMPLOYEE: [
        'contacts.create', 'contacts.read', 'contacts.update',
        'production.create', 'production.read', 'production.update',
        'products.read', 'products.update',
        'sales.create', 'sales.read', 'sales.update',
        'purchasing.read',
        'accounting.read',
        'hr.read',
        'reports.read'
      ],
      CLIENT: [
        'contacts.read',
        'production.read',
        'products.read',
        'sales.read',
        'accounting.read'
      ]
    }

    const userRole = user.role as keyof typeof rolePermissions
    const roleBasedPermissions = rolePermissions[userRole] || []

    // In a real system, you would also check for custom user permissions
    // For now, we'll return role-based permissions
    const userPermissions = roleBasedPermissions.map(permission => ({
      id: `${userId}-${permission}`,
      userId,
      permission,
      granted: true,
      source: 'role', // 'role' or 'custom'
      permissionDetails: {
        name: permission,
        label: permission.replace('.', ' '),
        module: permission.split('.')[0],
        action: permission.split('.')[1]?.toUpperCase() || 'READ'
      }
    }))

    return NextResponse.json({ 
      user,
      permissions: userPermissions,
      roleBasedPermissions 
    })
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/users/[id]/permissions - Add custom permission to user
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { permission, granted = true, clientId = 'default' } = await request.json()
    const userId = params.id

    if (!userId || !permission) {
      return NextResponse.json({ error: 'User ID and permission are required' }, { status: 400 })
    }

    // In a real system, you would save this to a user_permissions table
    // For now, we'll just return success
    console.log(`Adding custom permission ${permission} to user ${userId}: ${granted}`)

    return NextResponse.json({ 
      message: 'Permission added successfully',
      userPermission: {
        id: `${userId}-${permission}`,
        userId,
        permission,
        granted,
        source: 'custom'
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding user permission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/users/[id]/permissions - Update user permission
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { permission, granted, clientId = 'default' } = await request.json()
    const userId = params.id

    if (!userId || !permission) {
      return NextResponse.json({ error: 'User ID and permission are required' }, { status: 400 })
    }

    // In a real system, you would update this in a user_permissions table
    console.log(`Updating permission ${permission} for user ${userId}: ${granted}`)

    return NextResponse.json({ 
      message: 'Permission updated successfully',
      userPermission: {
        id: `${userId}-${permission}`,
        userId,
        permission,
        granted,
        source: 'custom'
      }
    })
  } catch (error) {
    console.error('Error updating user permission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/users/[id]/permissions - Remove user permission
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const permission = searchParams.get('permission')
    const clientId = searchParams.get('clientId') || 'default'
    const userId = params.id

    if (!userId || !permission) {
      return NextResponse.json({ error: 'User ID and permission are required' }, { status: 400 })
    }

    // In a real system, you would remove this from a user_permissions table
    console.log(`Removing permission ${permission} from user ${userId}`)

    return NextResponse.json({ message: 'Permission removed successfully' })
  } catch (error) {
    console.error('Error removing user permission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
