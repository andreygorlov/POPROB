import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Schema for creating users
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT']).default('EMPLOYEE'),
  isActive: z.boolean().default(true),
  clientId: z.string().default('default'),
  tenantId: z.string().optional(),
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
    employeeId: z.string().optional(),
    managerId: z.string().optional(),
  }).optional()
})

// Schema for updating users
const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
    employeeId: z.string().optional(),
    managerId: z.string().optional(),
  }).optional()
})

// GET /api/users - Get all users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clientId = searchParams.get('clientId') || 'default'
    
    // If ID is provided, return single user
    if (id) {
      const user = await prisma.user.findUnique({
        where: { id, clientId },
        include: {
          profile: true,
          _count: {
            select: {
              sessions: true,
              activities: true
            }
          }
        }
      })
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      return NextResponse.json({ user })
    }
    
    // Otherwise, return all users with pagination
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const where: any = { clientId }
    
    if (role) where.role = role
    if (isActive !== null) where.isActive = isActive === 'true'
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: {
            select: {
              sessions: true,
              activities: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/users - Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        isActive: validatedData.isActive,
        clientId: validatedData.clientId,
        tenantId: validatedData.tenantId,
        profile: validatedData.profile ? {
          create: {
            firstName: validatedData.profile.firstName,
            lastName: validatedData.profile.lastName,
            phone: validatedData.profile.phone,
            department: validatedData.profile.department,
            position: validatedData.profile.position,
            employeeId: validatedData.profile.employeeId,
            managerId: validatedData.profile.managerId,
            clientId: validatedData.clientId,
            tenantId: validatedData.tenantId
          }
        } : undefined
      },
      include: {
        profile: true
      }
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/users - Update a user
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const validatedData = updateUserSchema.parse(updateData)

    // Hash password if provided
    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 12)
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...validatedData,
        profile: validatedData.profile ? {
          upsert: {
            create: {
              firstName: validatedData.profile.firstName,
              lastName: validatedData.profile.lastName,
              phone: validatedData.profile.phone,
              department: validatedData.profile.department,
              position: validatedData.profile.position,
              employeeId: validatedData.profile.employeeId,
              managerId: validatedData.profile.managerId,
              clientId: user.clientId || 'default'
            },
            update: {
              firstName: validatedData.profile.firstName,
              lastName: validatedData.profile.lastName,
              phone: validatedData.profile.phone,
              department: validatedData.profile.department,
              position: validatedData.profile.position,
              employeeId: validatedData.profile.employeeId,
              managerId: validatedData.profile.managerId
            }
          }
        } : undefined
      },
      include: {
        profile: true
      }
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/users - Delete a user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'User deactivated successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
