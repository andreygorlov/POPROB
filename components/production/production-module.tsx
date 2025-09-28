'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Settings, Search, TrendingUp, CheckCircle, Clock } from 'lucide-react'

export function ProductionModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('projects')

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ייצור ופרויקטים</h1>
        <p className="text-gray-600">ניהול פרויקטים, משימות ותהליכי ייצור</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              פרויקטים
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              משימות
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={activeTab === 'projects' ? 'חיפוש פרויקטים...' : 'חיפוש משימות...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {activeTab === 'projects' ? 'הוסף פרויקט' : 'הוסף משימה'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">פרויקטים פעילים</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">פרויקטים בהתקדמות</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משימות פתוחות</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">משימות שטרם הושלמו</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משימות הושלמו</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">השבוע</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ממוצע התקדמות</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">ממוצע התקדמות פרויקטים</p>
          </CardContent>
        </Card>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'projects' ? (
        <Card>
          <CardHeader>
            <CardTitle>רשימת פרויקטים</CardTitle>
            <CardDescription>כל הפרויקטים במערכת</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>אין פרויקטים במערכת</p>
              <p className="text-sm">התחל על ידי יצירת פרויקט ראשון</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>רשימת משימות</CardTitle>
            <CardDescription>כל המשימות במערכת</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>אין משימות במערכת</p>
              <p className="text-sm">התחל על ידי יצירת משימה ראשונה</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


