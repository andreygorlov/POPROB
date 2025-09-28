import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for updating user profile
const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  employeeId: z.string().optional(),
  managerId: z.string().optional(),
  hireDate: z.string().optional(), // ISO date string
  preferences: z.string().optional(), // JSON string
  avatar: z.string().optional()
})

// GET /api/users/[id]/profile - Get user profile
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const profile = await prisma.userProfile.findUnique({
      where: { userId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/users/[id]/profile - Update user profile
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse hireDate if provided
    const updateData: any = { ...validatedData }
    if (validatedData.hireDate) {
      updateData.hireDate = new Date(validatedData.hireDate)
    }

    // Upsert profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: id },
      update: updateData,
      create: {
        userId: id,
        ...updateData,
        clientId: user.clientId || 'default',
        tenantId: user.tenantId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json({ profile })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/users/[id]/profile - Delete user profile
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const profile = await prisma.userProfile.findUnique({
      where: { userId: id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    await prisma.userProfile.delete({
      where: { userId: id }
    })

    return NextResponse.json({ message: 'Profile deleted successfully' })
  } catch (error) {
    console.error('Error deleting user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
