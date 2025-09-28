'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Settings, 
  Menu,
  X,
  LogOut,
  Building2,
  Package,
  FileText,
  Calculator,
  BarChart3,
  Calendar,
  Info,
  MessageSquare,
  Cog,
  Factory,
  ClipboardList,
  AlertTriangle,
  Clock,
  Wrench,
  Activity,
  ShoppingCart,
  DollarSign,
  Receipt,
  CreditCard,
  Wallet,
  User,
  Coins,
  Clock3,
  CheckSquare,
  ArrowLeft,
  ChevronDown,
  GitBranch,
  Archive,
  Shield
} from 'lucide-react'

const navigation = [
  { name: 'לוח בקרה', href: '/dashboard', icon: LayoutDashboard },
  { 
    name: 'אנשי קשר', 
    icon: Users,
    children: [
      { name: 'אנשי קשר', href: '/contacts/people', icon: Users },
      { name: 'חברות', href: '/contacts/companies', icon: Building2 },
      { name: 'ספקים', href: '/contacts/suppliers', icon: ShoppingCart },
    ]
  },
  { 
    name: 'ייצור', 
    icon: Factory,
    children: [
      { name: 'פרויקטים', href: '/production/projects', icon: ClipboardList },
      { name: 'משימות', href: '/production/tasks', icon: CheckSquare },
      { name: 'תקלות', href: '/production/issues', icon: AlertTriangle },
      { name: 'תכנון זמנים', href: '/production/scheduling', icon: Clock },
      { name: 'תחנות עבודה', href: '/production/workstations', icon: Wrench },
      { name: 'מכונות', href: '/production/machines', icon: Settings },
      { name: 'פעולות', href: '/production/operations', icon: Activity },
    ]
  },
  { 
    name: 'מוצרים', 
    icon: Package,
    children: [
      { name: 'מוצרים', href: '/products/items', icon: Package },
      { name: 'חומרי גלם', href: '/products/materials', icon: ShoppingCart },
      { name: 'מחירונים', href: '/products/price-lists', icon: DollarSign },
      { name: 'מחירוני ספק', href: '/products/supplier-prices', icon: Receipt },
      { name: 'מלאי', href: '/products/inventory', icon: Package },
    ]
  },
  { 
    name: 'מסמכים', 
    icon: FileText,
    children: [
      { name: 'הצעות מחיר', href: '/documents/quotes', icon: FileText },
      { name: 'הזמנות עבודה', href: '/documents/work-orders', icon: ClipboardList },
      { name: 'תעודות משלוח', href: '/documents/delivery-notes', icon: Package },
      { name: 'תעודת החזרה', href: '/documents/returns', icon: ArrowLeft },
      { name: 'חשבוניות מס', href: '/documents/invoices', icon: Receipt },
      { name: 'חשבוניות מס\\קבלות', href: '/documents/invoice-receipts', icon: Receipt },
      { name: 'קבלות', href: '/documents/receipts', icon: CreditCard },
      { name: 'חשבוניות עסקה', href: '/documents/business-invoices', icon: FileText },
      { name: 'חשבוניות מס זיכוי', href: '/documents/credit-invoices', icon: Receipt },
      { name: 'החזר כספים', href: '/documents/refunds', icon: DollarSign },
      { name: 'קופת המחאות ומזומנים', href: '/documents/cash-register', icon: Wallet },
    ]
  },
  { 
    name: 'הנהלת חשבונות', 
    icon: Calculator,
    children: [
      { name: 'הוצאות', href: '/accounting/expenses', icon: DollarSign },
      { name: 'תשלומים', href: '/accounting/payments', icon: CreditCard },
      { name: 'הזמנות רכש', href: '/accounting/purchase-orders', icon: ShoppingCart },
      { name: 'הצעות מחיר ספק', href: '/accounting/supplier-quotes', icon: FileText },
    ]
  },
  { name: 'דוחות', href: '/reports', icon: BarChart3 },
  { 
    name: 'משאבי אנוש', 
    icon: UserCheck,
    children: [
      { name: 'עובדים', href: '/hr/employees', icon: User },
      { name: 'שכר', href: '/hr/payroll', icon: Coins },
      { name: 'שעון נוכחות', href: '/hr/attendance', icon: Clock3 },
    ]
  },
  { name: 'יומנים', href: '/calendars', icon: Calendar },
  { name: 'מרכז מידע', href: '/info-center', icon: Info },
  { name: 'צ\'אט', href: '/chat', icon: MessageSquare },
  { name: 'שדות מותאמים', href: '/custom-fields', icon: Settings },
        { name: 'משתמשים', href: '/users', icon: Users },
        { name: 'תפקידים', href: '/roles', icon: Users },
        { name: 'הרשאות', href: '/permissions', icon: Shield },
        { name: 'גיבויים', href: '/backup', icon: Archive },
        { name: 'הגדרות', href: '/settings', icon: Cog },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const renderNavigationItem = (item: any) => {
    const isActive = pathname === item.href
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)
    
    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              "group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className="ml-3 h-5 w-5 flex-shrink-0" />
            {item.name}
            <ChevronDown className={cn(
              "mr-auto h-4 w-4 transition-transform",
              isExpanded ? "rotate-180" : ""
            )} />
          </button>
          {isExpanded && (
            <div className="mr-4 mt-1 space-y-1">
              {item.children.map((child: any) => {
                const isChildActive = pathname === child.href
                return (
                  <Link
                    key={child.name}
                    href={child.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      isChildActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <child.icon className="ml-3 h-4 w-4 flex-shrink-0" />
                    {child.name}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }
    
    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
          isActive
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <item.icon className="ml-3 h-5 w-5 flex-shrink-0" />
        {item.name}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 right-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">מערכת ERP</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {navigation.map(renderNavigationItem)}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-l border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">מערכת ERP</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {navigation.map(renderNavigationItem)}
          </nav>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="ml-3 h-5 w-5" />
              התנתקות
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pr-64">
        {/* Mobile header */}
        <div className="lg:hidden flex h-16 items-center justify-between px-4 bg-white border-b border-gray-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">מערכת ERP</h1>
          <div className="w-10" />
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
