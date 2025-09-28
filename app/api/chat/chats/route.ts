import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/chat/chats - Get all chats for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') || 'default'
    const userId = searchParams.get('userId') || 'current-user'

    // In a real implementation, you would fetch chats from the database
    // For now, we'll return mock data
    const mockChats = [
      {
        id: '1',
        name: 'צוות פיתוח',
        type: 'group',
        participants: [
          { id: '1', name: 'יוסי כהן', avatar: '', isOnline: true },
          { id: '2', name: 'שרה לוי', avatar: '', isOnline: false, lastSeen: '2 דקות' },
          { id: '3', name: 'דוד ישראלי', avatar: '', isOnline: true }
        ],
        lastMessage: {
          id: '1',
          content: 'היי, איך הולך הפרויקט?',
          senderId: '1',
          senderName: 'יוסי כהן',
          timestamp: new Date().toISOString(),
          isRead: true,
          isDelivered: true,
          type: 'text'
        },
        unreadCount: 0,
        isActive: true
      },
      {
        id: '2',
        name: 'מנהלי מחלקות',
        type: 'group',
        participants: [
          { id: '4', name: 'רחל אברהם', avatar: '', isOnline: true },
          { id: '5', name: 'משה גולד', avatar: '', isOnline: true }
        ],
        lastMessage: {
          id: '2',
          content: 'יש פגישה מחר ב-10:00',
          senderId: '4',
          senderName: 'רחל אברהם',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          isRead: false,
          isDelivered: true,
          type: 'text'
        },
        unreadCount: 1,
        isActive: false
      },
      {
        id: '3',
        name: 'שרה לוי',
        type: 'direct',
        participants: [
          { id: '2', name: 'שרה לוי', avatar: '', isOnline: false, lastSeen: '5 דקות' }
        ],
        lastMessage: {
          id: '3',
          content: 'תודה על העזרה!',
          senderId: '2',
          senderName: 'שרה לוי',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          isRead: true,
          isDelivered: true,
          type: 'text'
        },
        unreadCount: 0,
        isActive: false
      }
    ]

    return NextResponse.json({ chats: mockChats })
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/chat/chats - Create a new chat
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, participants, clientId = 'default' } = body

    if (!type || !participants || participants.length === 0) {
      return NextResponse.json({ error: 'Type and participants are required' }, { status: 400 })
    }

    // Create chat in database
    const chat = await prisma.chat.create({
      data: {
        name: type === 'group' ? name : null,
        isGroup: type === 'group',
        clientId,
        participants: {
          create: participants.map((participantId: string) => ({
            userId: participantId,
            clientId
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    })

    // Format response
    const formattedChat = {
      id: chat.id,
      name: chat.name || (type === 'direct' ? participants[0] : 'צ\'אט חדש'),
      type,
      participants: chat.participants.map(p => ({
        id: p.user.id,
        name: p.user.name || p.user.email,
        avatar: p.user.image,
        isOnline: Math.random() > 0.5, // Mock online status
        lastSeen: Math.random() > 0.5 ? '2 דקות' : undefined
      })),
      lastMessage: null,
      unreadCount: 0,
      isActive: true
    }

    return NextResponse.json({ chat: formattedChat }, { status: 201 })
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
