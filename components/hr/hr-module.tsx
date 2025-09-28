'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, UserCheck, Search, TrendingUp } from 'lucide-react'

export function HRModule() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">משאבי אנוש</h1>
        <p className="text-gray-600">ניהול עובדים ומשאבי אנוש</p>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="חיפוש עובדים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          הוסף עובד
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה&quot;כ עובדים</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">עובדים במערכת</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">עובדים פעילים</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">עובדים פעילים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">עובדים חדשים</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">החודש</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ממוצע שכר</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪0</div>
            <p className="text-xs text-muted-foreground">ממוצע שכר</p>
          </CardContent>
        </Card>
      </div>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>רשימת עובדים</CardTitle>
          <CardDescription>כל העובדים במערכת</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>אין עובדים במערכת</p>
            <p className="text-sm">התחל על ידי הוספת עובד ראשון</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


