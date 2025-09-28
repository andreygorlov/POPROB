import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/chat/messages - Get messages for a chat
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    const clientId = searchParams.get('clientId') || 'default'

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    // In a real implementation, you would fetch messages from the database
    // For now, we'll return mock data
    const mockMessages = [
      {
        id: '1',
        content: 'היי כולם! איך הולך הפרויקט?',
        senderId: '1',
        senderName: 'יוסי כהן',
        senderAvatar: '',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
        isDelivered: true,
        type: 'text'
      },
      {
        id: '2',
        content: 'הולך מצוין! סיימנו את המודול החדש',
        senderId: '2',
        senderName: 'שרה לוי',
        senderAvatar: '',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        isRead: true,
        isDelivered: true,
        type: 'text'
      },
      {
        id: '3',
        content: 'מעולה! איך נראה הקוד?',
        senderId: '1',
        senderName: 'יוסי כהן',
        senderAvatar: '',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        isRead: true,
        isDelivered: true,
        type: 'text'
      },
      {
        id: '4',
        content: 'הקוד נקי ומסודר, השתמשנו ב-TypeScript',
        senderId: '3',
        senderName: 'דוד ישראלי',
        senderAvatar: '',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isRead: true,
        isDelivered: true,
        type: 'text'
      },
      {
        id: '5',
        content: 'אני אבדוק את הקוד מחר',
        senderId: '1',
        senderName: 'יוסי כהן',
        senderAvatar: '',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        isRead: true,
        isDelivered: true,
        type: 'text'
      }
    ]

    return NextResponse.json({ messages: mockMessages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/chat/messages - Send a new message
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { chatId, content, senderId, clientId = 'default' } = body

    if (!chatId || !content) {
      return NextResponse.json({ error: 'Chat ID and content are required' }, { status: 400 })
    }

    // Create message in database
    const message = await prisma.chatMessage.create({
      data: {
        chatId,
        senderId: senderId || 'current-user',
        content,
        type: 'text',
        clientId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    // Format response
    const formattedMessage = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name || message.sender.email,
      senderAvatar: message.sender.image,
      timestamp: message.createdAt.toISOString(),
      isRead: false,
      isDelivered: true,
      type: message.type
    }

    return NextResponse.json({ message: formattedMessage }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
