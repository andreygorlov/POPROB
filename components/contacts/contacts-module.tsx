'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, Search } from 'lucide-react'

export function ContactsModule() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">אנשי קשר</h1>
        <p className="text-gray-600">ניהול אנשי קשר ומעקב אחריהם</p>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="חיפוש אנשי קשר..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          הוסף איש קשר
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה&quot;כ אנשי קשר</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">אנשי קשר במערכת</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אנשי קשר חדשים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">השבוע</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">עדכונים אחרונים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">היום</p>
          </CardContent>
        </Card>
      </div>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>רשימת אנשי קשר</CardTitle>
          <CardDescription>כל אנשי הקשר במערכת</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>אין אנשי קשר במערכת</p>
            <p className="text-sm">התחל על ידי הוספת איש קשר ראשון</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


