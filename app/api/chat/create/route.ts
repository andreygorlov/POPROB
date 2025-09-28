import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/chat/create - Create a new chat (direct or group)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, 
      type, 
      participants, 
      clientId = 'default',
      currentUserId = 'current-user'
    } = body

    if (!type || !participants || participants.length === 0) {
      return NextResponse.json({ error: 'Type and participants are required' }, { status: 400 })
    }

    // For direct chat, check if chat already exists
    if (type === 'direct' && participants.length === 1) {
      const existingChat = await prisma.chat.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: {
                in: [currentUserId, participants[0]]
              }
            }
          },
          clientId
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

      if (existingChat) {
        return NextResponse.json({ 
          chat: formatChatResponse(existingChat),
          isExisting: true 
        })
      }
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        name: type === 'group' ? name : null,
        isGroup: type === 'group',
        clientId,
        participants: {
          create: [
            { userId: currentUserId, clientId },
            ...participants.map((participantId: string) => ({
              userId: participantId,
              clientId
            }))
          ]
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

    return NextResponse.json({ 
      chat: formatChatResponse(chat),
      isExisting: false 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function formatChatResponse(chat: any) {
  return {
    id: chat.id,
    name: chat.name || (chat.isGroup ? 'צ\'אט קבוצתי' : 'צ\'אט פרטי'),
    type: chat.isGroup ? 'group' : 'direct',
    participants: chat.participants.map((p: any) => ({
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
}
