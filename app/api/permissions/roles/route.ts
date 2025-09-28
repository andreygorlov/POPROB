import { NextResponse } from 'next/server'

// Simple role-based permissions system
const roles = [
  {
    id: 'admin',
    name: 'ADMIN',
    label: 'מנהל מערכת',
    description: 'גישה מלאה לכל המערכת',
    level: 100,
    isSystem: true,
    permissions: [
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
    ]
  },
  {
    id: 'manager',
    name: 'MANAGER',
    label: 'מנהל',
    description: 'ניהול צוותים ומחלקות',
    level: 75,
    isSystem: true,
    permissions: [
      'contacts.create', 'contacts.read', 'contacts.update', 'contacts.delete', 'contacts.export',
      'production.create', 'production.read', 'production.update', 'production.delete', 'production.approve',
      'products.create', 'products.read', 'products.update', 'products.delete', 'products.export',
      'sales.create', 'sales.read', 'sales.update', 'sales.delete', 'sales.approve', 'sales.export',
      'purchasing.create', 'purchasing.read', 'purchasing.update', 'purchasing.delete', 'purchasing.approve',
      'accounting.create', 'accounting.read', 'accounting.update', 'accounting.delete', 'accounting.approve',
      'hr.create', 'hr.read', 'hr.update', 'hr.delete',
      'reports.read', 'reports.export',
      'settings.read', 'settings.update'
    ]
  },
  {
    id: 'employee',
    name: 'EMPLOYEE',
    label: 'עובד',
    description: 'גישה סטנדרטית למערכת',
    level: 50,
    isSystem: true,
    permissions: [
      'contacts.create', 'contacts.read', 'contacts.update',
      'production.create', 'production.read', 'production.update',
      'products.read', 'products.update',
      'sales.create', 'sales.read', 'sales.update',
      'purchasing.read',
      'accounting.read',
      'hr.read',
      'reports.read'
    ]
  },
  {
    id: 'client',
    name: 'CLIENT',
    label: 'לקוח',
    description: 'גישה מוגבלת לנתונים אישיים',
    level: 25,
    isSystem: true,
    permissions: [
      'contacts.read',
      'production.read',
      'products.read',
      'sales.read',
      'accounting.read'
    ]
  }
]

// GET /api/permissions/roles - Get all roles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') || 'default'

    // Add user counts (mock data for now)
    const rolesWithCounts = roles.map(role => ({
      ...role,
      _count: {
        users: Math.floor(Math.random() * 10) + 1,
        permissions: role.permissions.length
      }
    }))

    return NextResponse.json({ roles: rolesWithCounts })
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/permissions/roles - Create a new role
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, label, description, level = 50, isSystem = false, clientId = 'default' } = body

    // Check if role already exists
    const existingRole = roles.find(r => r.name === name)
    if (existingRole) {
      return NextResponse.json({ error: 'Role already exists' }, { status: 400 })
    }

    const newRole = {
      id: name.toLowerCase(),
      name,
      label,
      description,
      level,
      isSystem,
      permissions: [],
      _count: {
        users: 0,
        permissions: 0
      }
    }

    roles.push(newRole)

    return NextResponse.json({ role: newRole }, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/permissions/roles - Update a role
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 })
    }

    const roleIndex = roles.findIndex(r => r.id === id)
    if (roleIndex === -1) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    roles[roleIndex] = { ...roles[roleIndex], ...updateData }

    return NextResponse.json({ role: roles[roleIndex] })
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/permissions/roles - Delete a role
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 })
    }

    const role = roles.find(r => r.id === id)
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    if (role.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system role' }, { status: 400 })
    }

    const roleIndex = roles.findIndex(r => r.id === id)
    roles.splice(roleIndex, 1)

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}