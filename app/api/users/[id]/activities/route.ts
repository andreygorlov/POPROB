import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for creating user activity
const createActivitySchema = z.object({
  action: z.string().min(1),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  description: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  url: z.string().optional(),
  method: z.string().optional(),
  metadata: z.string().optional() // JSON string
})

// GET /api/users/[id]/activities - Get user activities
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const entity = searchParams.get('entity')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { userId: id }
    
    if (action) where.action = action
    if (entity) where.entity = entity
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.userActivity.count({ where })
    ])

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching user activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/users/[id]/activities - Create user activity
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = createActivitySchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const activity = await prisma.userActivity.create({
      data: {
        userId: id,
        ...validatedData,
        clientId: user.clientId || 'default',
        tenantId: user.tenantId
      }
    })

    return NextResponse.json({ activity }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating user activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/users/[id]/activities - Delete user activities
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const olderThan = searchParams.get('olderThan') // Days

    const where: any = { userId: id }
    
    if (olderThan) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThan))
      where.createdAt = { lt: cutoffDate }
    }

    const result = await prisma.userActivity.deleteMany({
      where
    })

    return NextResponse.json({ 
      message: `${result.count} activities deleted successfully` 
    })
  } catch (error) {
    console.error('Error deleting user activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
