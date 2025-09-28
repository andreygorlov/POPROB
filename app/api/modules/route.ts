import { NextResponse } from 'next/server'

// Simple modules system
const modules = [
  {
    id: 'contacts',
    name: 'contacts',
    label: 'אנשי קשר',
    description: 'ניהול אנשי קשר, חברות וספקים',
    icon: '👥',
    order: 1,
    isActive: true,
    _count: { permissions: 6 }
  },
  {
    id: 'production',
    name: 'production',
    label: 'ייצור',
    description: 'ניהול ייצור, פרויקטים ומשימות',
    icon: '🏭',
    order: 2,
    isActive: true,
    _count: { permissions: 7 }
  },
  {
    id: 'products',
    name: 'products',
    label: 'מוצרים',
    description: 'ניהול מוצרים, חומרי גלם ומלאי',
    icon: '📦',
    order: 3,
    isActive: true,
    _count: { permissions: 6 }
  },
  {
    id: 'sales',
    name: 'sales',
    label: 'מכירות',
    description: 'ניהול מכירות, הצעות מחיר והזמנות',
    icon: '💰',
    order: 4,
    isActive: true,
    _count: { permissions: 6 }
  },
  {
    id: 'purchasing',
    name: 'purchasing',
    label: 'רכש',
    description: 'ניהול רכש, הזמנות רכש וספקים',
    icon: '🛒',
    order: 5,
    isActive: true,
    _count: { permissions: 5 }
  },
  {
    id: 'accounting',
    name: 'accounting',
    label: 'הנהלת חשבונות',
    description: 'ניהול חשבוניות, תשלומים והוצאות',
    icon: '📊',
    order: 6,
    isActive: true,
    _count: { permissions: 6 }
  },
  {
    id: 'hr',
    name: 'hr',
    label: 'משאבי אנוש',
    description: 'ניהול עובדים, שכר ונוכחות',
    icon: '👨‍💼',
    order: 7,
    isActive: true,
    _count: { permissions: 4 }
  },
  {
    id: 'reports',
    name: 'reports',
    label: 'דוחות',
    description: 'דוחות וניתוח נתונים',
    icon: '📈',
    order: 8,
    isActive: true,
    _count: { permissions: 3 }
  },
  {
    id: 'settings',
    name: 'settings',
    label: 'הגדרות',
    description: 'הגדרות מערכת וקונפיגורציה',
    icon: '⚙️',
    order: 9,
    isActive: true,
    _count: { permissions: 8 }
  }
]

// GET /api/modules - Get all modules
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') || 'default'
    const isActive = searchParams.get('isActive')

    let filteredModules = modules

    if (isActive !== null) {
      const active = isActive === 'true'
      filteredModules = modules.filter(m => m.isActive === active)
    }

    return NextResponse.json({ modules: filteredModules })
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/modules - Create a new module
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, label, description, icon, order = 0, isActive = true, clientId = 'default' } = body

    // Check if module already exists
    const existingModule = modules.find(m => m.name === name)
    if (existingModule) {
      return NextResponse.json({ error: 'Module already exists' }, { status: 400 })
    }

    const newModule = {
      id: name,
      name,
      label,
      description,
      icon,
      order,
      isActive,
      _count: { permissions: 0 }
    }

    modules.push(newModule)

    return NextResponse.json({ module: newModule }, { status: 201 })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/modules - Update a module
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    const moduleIndex = modules.findIndex(m => m.id === id)
    if (moduleIndex === -1) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    modules[moduleIndex] = { ...modules[moduleIndex], ...updateData }

    return NextResponse.json({ module: modules[moduleIndex] })
  } catch (error) {
    console.error('Error updating module:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/modules - Delete a module
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    const moduleIndex = modules.findIndex(m => m.id === id)
    if (moduleIndex === -1) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    modules.splice(moduleIndex, 1)

    return NextResponse.json({ message: 'Module deleted successfully' })
  } catch (error) {
    console.error('Error deleting module:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}