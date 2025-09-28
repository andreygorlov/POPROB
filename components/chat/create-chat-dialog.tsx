'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, User, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  lastSeen?: string
  isActive: boolean
}

interface CreateChatDialogProps {
  onChatCreated: (chat: any) => void
  clientId?: string
}

export function CreateChatDialog({ onChatCreated, clientId = 'default' }: CreateChatDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [chatName, setChatName] = useState('')
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen, clientId])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chat/users?clientId=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        toast.error('שגיאה בטעינת משתמשים')
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('שגיאה בטעינת משתמשים')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleCreateChat = async () => {
    if (chatType === 'direct' && selectedUsers.length !== 1) {
      toast.error('יש לבחור משתמש אחד לצ\'אט פרטי')
      return
    }

    if (chatType === 'group' && selectedUsers.length < 2) {
      toast.error('יש לבחור לפחות 2 משתמשים לצ\'אט קבוצתי')
      return
    }

    if (chatType === 'group' && !chatName.trim()) {
      toast.error('יש להזין שם לצ\'אט קבוצתי')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: chatName,
          type: chatType,
          participants: selectedUsers,
          clientId
        })
      })

      if (response.ok) {
        const data = await response.json()
        onChatCreated(data.chat)
        setIsOpen(false)
        setSelectedUsers([])
        setChatName('')
        setChatType('direct')
        setSearchTerm('')
        toast.success('צ\'אט נוצר בהצלחה!')
      } else {
        const errorData = await response.json()
        toast.error(`שגיאה ביצירת צ&apos;אט: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating chat:', error)
      toast.error('שגיאה ביצירת צ\'אט')
    } finally {
      setIsCreating(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>צור צ&apos;אט חדש</DialogTitle>
          <DialogDescription>
            בחר משתמשים ליצירת צ&apos;אט פרטי או קבוצתי
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chat Type Selection */}
          <div className="space-y-2">
            <Label>סוג צ&apos;אט</Label>
            <Select value={chatType} onValueChange={(value: 'direct' | 'group') => setChatType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    צ&apos;אט פרטי
                  </div>
                </SelectItem>
                <SelectItem value="group">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    צ&apos;אט קבוצתי
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Group Chat Name */}
          {chatType === 'group' && (
            <div className="space-y-2">
              <Label>שם הצ&apos;אט</Label>
              <Input
                placeholder="הזן שם לצ&apos;אט הקבוצתי"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              />
            </div>
          )}

          {/* User Search */}
          <div className="space-y-2">
            <Label>חיפוש משתמשים</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="חיפוש משתמשים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-2">
            <Label>משתמשים</Label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">טוען משתמשים...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  לא נמצאו משתמשים
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserToggle(user.id)}
                    />
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.isOnline && (
                        <Badge variant="secondary" className="text-xs">
                          מקוון
                        </Badge>
                      )}
                      {!user.isActive && (
                        <Badge variant="outline" className="text-xs">
                          לא פעיל
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected Users Count */}
          {selectedUsers.length > 0 && (
            <div className="text-sm text-gray-600">
              נבחרו {selectedUsers.length} משתמשים
            </div>
          )}

          {/* Create Button */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              ביטול
            </Button>
            <Button
              onClick={handleCreateChat}
              disabled={isCreating || selectedUsers.length === 0}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  יוצר...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 ml-2" />
                  צור צ&apos;אט
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
