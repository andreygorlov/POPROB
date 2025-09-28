import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/permissions/role-permissions - Get role permissions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get('roleId')
    const clientId = searchParams.get('clientId') || 'default'

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 })
    }

    // Get role permissions from database
    try {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { roleId, clientId },
        include: {
          permission: true
        }
      })

      return NextResponse.json({
        rolePermissions: rolePermissions.map(rp => ({
          id: rp.id,
          roleId: rp.roleId,
          permissionId: rp.permissionId,
          granted: rp.granted,
          permission: rp.permission
        }))
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Return empty array if database error
      return NextResponse.json({
        rolePermissions: []
      })
    }
  } catch (error) {
    console.error('Error fetching role permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/permissions/role-permissions - Add permission to role
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roleId, permissionId, granted = true, clientId = 'default' } = body

    if (!roleId || !permissionId) {
      return NextResponse.json({ error: 'Role ID and Permission ID are required' }, { status: 400 })
    }

    // Check if permission already exists for this role
    const existingPermission = await prisma.rolePermission.findFirst({
      where: { roleId, permissionId, clientId }
    })

    if (existingPermission) {
      // Update existing permission
      const updatedPermission = await prisma.rolePermission.update({
        where: { id: existingPermission.id },
        data: { granted },
        include: { permission: true }
      })

      return NextResponse.json({
        rolePermission: {
          id: updatedPermission.id,
          roleId: updatedPermission.roleId,
          permissionId: updatedPermission.permissionId,
          granted: updatedPermission.granted,
          permission: updatedPermission.permission
        }
      })
    } else {
      // Create new permission
      const newPermission = await prisma.rolePermission.create({
        data: { roleId, permissionId, granted, clientId },
        include: { permission: true }
      })

      return NextResponse.json({
        rolePermission: {
          id: newPermission.id,
          roleId: newPermission.roleId,
          permissionId: newPermission.permissionId,
          granted: newPermission.granted,
          permission: newPermission.permission
        }
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error adding role permission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/permissions/role-permissions - Update role permission
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { roleId, permissionId, granted, clientId = 'default' } = body

    if (!roleId || !permissionId) {
      return NextResponse.json({ error: 'Role ID and Permission ID are required' }, { status: 400 })
    }

    // Find and update the permission
    const existingPermission = await prisma.rolePermission.findFirst({
      where: { roleId, permissionId, clientId }
    })

    if (!existingPermission) {
      return NextResponse.json({ error: 'Permission not found for this role' }, { status: 404 })
    }

    const updatedPermission = await prisma.rolePermission.update({
      where: { id: existingPermission.id },
      data: { granted },
      include: { permission: true }
    })

    return NextResponse.json({
      rolePermission: {
        id: updatedPermission.id,
        roleId: updatedPermission.roleId,
        permissionId: updatedPermission.permissionId,
        granted: updatedPermission.granted,
        permission: updatedPermission.permission
      }
    })
  } catch (error) {
    console.error('Error updating role permission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/permissions/role-permissions - Remove permission from role
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get('roleId')
    const permissionId = searchParams.get('permissionId')
    const clientId = searchParams.get('clientId') || 'default'

    if (!roleId || !permissionId) {
      return NextResponse.json({ error: 'Role ID and Permission ID are required' }, { status: 400 })
    }

    // Find and delete the permission
    const existingPermission = await prisma.rolePermission.findFirst({
      where: { roleId, permissionId, clientId }
    })

    if (!existingPermission) {
      return NextResponse.json({ error: 'Permission not found for this role' }, { status: 404 })
    }

    await prisma.rolePermission.delete({
      where: { id: existingPermission.id }
    })

    return NextResponse.json({ message: 'Permission removed from role successfully' })
  } catch (error) {
    console.error('Error removing role permission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
