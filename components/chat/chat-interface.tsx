'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Search, 
  Plus, 
  Users, 
  MessageSquare,
  Clock,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string
  timestamp: string
  isRead: boolean
  isDelivered: boolean
  type: 'text' | 'image' | 'file' | 'system'
  attachments?: {
    name: string
    url: string
    type: string
    size: number
  }[]
}

interface Chat {
  id: string
  name: string
  type: 'direct' | 'group'
  participants: {
    id: string
    name: string
    avatar?: string
    isOnline: boolean
    lastSeen?: string
  }[]
  lastMessage?: Message
  unreadCount: number
  isActive: boolean
}

interface ChatInterfaceProps {
  clientId?: string
}

export function ChatInterface({ clientId = 'default' }: ChatInterfaceProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chats and messages
  useEffect(() => {
    loadChats()
  }, [clientId])

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat)
    }
  }, [selectedChat])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chat/chats?clientId=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setChats(data.chats)
        if (data.chats.length > 0 && !selectedChat) {
          setSelectedChat(data.chats[0].id)
        }
      } else {
        // Mock data for development
        setChats([
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
        ])
      }
    } catch (error) {
      console.error('Error loading chats:', error)
      toast.error('שגיאה בטעינת הצ\'אטים')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?chatId=${chatId}&clientId=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      } else {
        // Mock data for development
        setMessages([
          {
            id: '1',
            content: 'היי כולם! איך הולך הפרויקט?',
            senderId: '1',
            senderName: 'יוסי כהן',
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
            timestamp: new Date(Date.now() - 1200000).toISOString(),
            isRead: true,
            isDelivered: true,
            type: 'text'
          }
        ])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('שגיאה בטעינת ההודעות')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: 'current-user', // This would be the actual user ID
      senderName: 'אני',
      timestamp: new Date().toISOString(),
      isRead: false,
      isDelivered: false,
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat,
          content: newMessage,
          clientId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, ...data.message, isDelivered: true } : msg
        ))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('שגיאה בשליחת הודעה')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'עכשיו'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} דקות`
    if (diff < 86400000) return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString('he-IL')
  }

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentChat = chats.find(chat => chat.id === selectedChat)

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">צ'אטים</h2>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="חיפוש צ'אטים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[520px]">
          <div className="p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  chat.id === selectedChat 
                    ? 'bg-blue-100 border-blue-200' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {chat.type === 'group' ? (
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={chat.participants[0]?.avatar} />
                        <AvatarFallback>
                          {chat.participants[0]?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {chat.participants.some(p => p.isOnline) && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{chat.name}</h3>
                      {chat.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-xs text-gray-500 truncate">
                        {chat.lastMessage.senderName}: {chat.lastMessage.content}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">
                        {chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : ''}
                      </span>
                      <div className="flex items-center space-x-1">
                        {chat.lastMessage?.isDelivered && (
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {currentChat.type === 'group' ? (
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={currentChat.participants[0]?.avatar} />
                      <AvatarFallback>
                        {currentChat.participants[0]?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <h3 className="font-semibold">{currentChat.name}</h3>
                    <p className="text-sm text-gray-500">
                      {currentChat.participants.length} משתתפים
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${message.senderId === 'current-user' ? 'order-2' : 'order-1'}`}>
                      {message.senderId !== 'current-user' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={message.senderAvatar} />
                            <AvatarFallback className="text-xs">
                              {message.senderName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{message.senderName}</span>
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-lg ${
                          message.senderId === 'current-user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.senderId === 'current-user' && (
                            <div className="flex items-center space-x-1">
                              {message.isDelivered ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="כתוב הודעה..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="pr-10"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">בחר צ'אט</h3>
              <p className="text-gray-500">בחר צ'אט מהרשימה כדי להתחיל לשוחח</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
