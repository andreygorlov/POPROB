import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/chat/users - Get all users for chat creation
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') || 'default'
    const currentUserId = searchParams.get('currentUserId') || 'current-user'

    // Get all users except current user
    const users = await prisma.user.findMany({
      where: {
        clientId,
        id: {
          not: currentUserId
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Format response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      avatar: user.image,
      isOnline: Math.random() > 0.5, // Mock online status
      lastSeen: Math.random() > 0.5 ? '2 דקות' : undefined,
      isActive: user.isActive
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
