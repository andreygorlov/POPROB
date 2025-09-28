import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple permission check based on user role
export async function POST(request: Request) {
  try {
    const { userId, permission, clientId = 'default' } = await request.json()

    if (!userId || !permission) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true }
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ hasPermission: false, reason: 'User not found or inactive' })
    }

    // Simple role-based permission check
    const hasPermission = checkRolePermission(user.role, permission)

    return NextResponse.json({ 
      hasPermission,
      role: user.role,
      permission,
      source: 'role'
    })
  } catch (error) {
    console.error('Error checking permission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Simple role-based permission logic
function checkRolePermission(userRole: string, permission: string): boolean {
  // Admin has all permissions
  if (userRole === 'ADMIN') {
    return true
  }

  // Define permissions by role
  const rolePermissions: Record<string, string[]> = {
    MANAGER: [
      'contacts.create', 'contacts.read', 'contacts.update', 'contacts.delete',
      'production.create', 'production.read', 'production.update', 'production.delete',
      'products.create', 'products.read', 'products.update', 'products.delete',
      'sales.create', 'sales.read', 'sales.update', 'sales.delete',
      'purchasing.create', 'purchasing.read', 'purchasing.update', 'purchasing.delete',
      'accounting.create', 'accounting.read', 'accounting.update', 'accounting.delete',
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

  const permissions = rolePermissions[userRole] || []
  return permissions.includes(permission)
}

// Get all permissions for a role
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }

    const permissions = getRolePermissions(role)
    
    return NextResponse.json({ 
      role,
      permissions,
      count: permissions.length
    })
  } catch (error) {
    console.error('Error getting role permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getRolePermissions(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
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

  return rolePermissions[role] || []
}
