import { NextResponse } from 'next/server'

// Mock permissions data - in a real system this would come from database
const permissions = [
  // Contacts module
  { id: 'contacts.create', name: 'contacts.create', label: 'הוסף איש קשר', module: 'contacts', action: 'CREATE', resource: 'contacts' },
  { id: 'contacts.read', name: 'contacts.read', label: 'הצג איש קשר', module: 'contacts', action: 'READ', resource: 'contacts' },
  { id: 'contacts.update', name: 'contacts.update', label: 'ערוך איש קשר', module: 'contacts', action: 'UPDATE', resource: 'contacts' },
  { id: 'contacts.delete', name: 'contacts.delete', label: 'מחק איש קשר', module: 'contacts', action: 'DELETE', resource: 'contacts' },
  { id: 'contacts.export', name: 'contacts.export', label: 'ייצא אנשי קשר', module: 'contacts', action: 'EXPORT', resource: 'contacts' },
  { id: 'contacts.import', name: 'contacts.import', label: 'ייבא אנשי קשר', module: 'contacts', action: 'IMPORT', resource: 'contacts' },

  // Production module
  { id: 'production.create', name: 'production.create', label: 'צור פריט ייצור', module: 'production', action: 'CREATE', resource: 'production' },
  { id: 'production.read', name: 'production.read', label: 'הצג פריט ייצור', module: 'production', action: 'READ', resource: 'production' },
  { id: 'production.update', name: 'production.update', label: 'ערוך פריט ייצור', module: 'production', action: 'UPDATE', resource: 'production' },
  { id: 'production.delete', name: 'production.delete', label: 'מחק פריט ייצור', module: 'production', action: 'DELETE', resource: 'production' },
  { id: 'production.approve', name: 'production.approve', label: 'אשר פריט ייצור', module: 'production', action: 'APPROVE', resource: 'production' },

  // Products module
  { id: 'products.create', name: 'products.create', label: 'הוסף מוצר', module: 'products', action: 'CREATE', resource: 'products' },
  { id: 'products.read', name: 'products.read', label: 'הצג מוצר', module: 'products', action: 'READ', resource: 'products' },
  { id: 'products.update', name: 'products.update', label: 'ערוך מוצר', module: 'products', action: 'UPDATE', resource: 'products' },
  { id: 'products.delete', name: 'products.delete', label: 'מחק מוצר', module: 'products', action: 'DELETE', resource: 'products' },
  { id: 'products.export', name: 'products.export', label: 'ייצא מוצרים', module: 'products', action: 'EXPORT', resource: 'products' },
  { id: 'products.import', name: 'products.import', label: 'ייבא מוצרים', module: 'products', action: 'IMPORT', resource: 'products' },

  // Sales module
  { id: 'sales.create', name: 'sales.create', label: 'צור הזמנת מכירה', module: 'sales', action: 'CREATE', resource: 'sales' },
  { id: 'sales.read', name: 'sales.read', label: 'הצג הזמנת מכירה', module: 'sales', action: 'READ', resource: 'sales' },
  { id: 'sales.update', name: 'sales.update', label: 'ערוך הזמנת מכירה', module: 'sales', action: 'UPDATE', resource: 'sales' },
  { id: 'sales.delete', name: 'sales.delete', label: 'מחק הזמנת מכירה', module: 'sales', action: 'DELETE', resource: 'sales' },
  { id: 'sales.approve', name: 'sales.approve', label: 'אשר הזמנת מכירה', module: 'sales', action: 'APPROVE', resource: 'sales' },
  { id: 'sales.export', name: 'sales.export', label: 'ייצא הזמנות מכירה', module: 'sales', action: 'EXPORT', resource: 'sales' },

  // Purchasing module
  { id: 'purchasing.create', name: 'purchasing.create', label: 'צור הזמנת רכש', module: 'purchasing', action: 'CREATE', resource: 'purchasing' },
  { id: 'purchasing.read', name: 'purchasing.read', label: 'הצג הזמנת רכש', module: 'purchasing', action: 'READ', resource: 'purchasing' },
  { id: 'purchasing.update', name: 'purchasing.update', label: 'ערוך הזמנת רכש', module: 'purchasing', action: 'UPDATE', resource: 'purchasing' },
  { id: 'purchasing.delete', name: 'purchasing.delete', label: 'מחק הזמנת רכש', module: 'purchasing', action: 'DELETE', resource: 'purchasing' },
  { id: 'purchasing.approve', name: 'purchasing.approve', label: 'אשר הזמנת רכש', module: 'purchasing', action: 'APPROVE', resource: 'purchasing' },

  // Accounting module
  { id: 'accounting.create', name: 'accounting.create', label: 'צור חשבונית', module: 'accounting', action: 'CREATE', resource: 'accounting' },
  { id: 'accounting.read', name: 'accounting.read', label: 'הצג חשבונית', module: 'accounting', action: 'READ', resource: 'accounting' },
  { id: 'accounting.update', name: 'accounting.update', label: 'ערוך חשבונית', module: 'accounting', action: 'UPDATE', resource: 'accounting' },
  { id: 'accounting.delete', name: 'accounting.delete', label: 'מחק חשבונית', module: 'accounting', action: 'DELETE', resource: 'accounting' },
  { id: 'accounting.approve', name: 'accounting.approve', label: 'אשר חשבונית', module: 'accounting', action: 'APPROVE', resource: 'accounting' },

  // HR module
  { id: 'hr.create', name: 'hr.create', label: 'הוסף עובד', module: 'hr', action: 'CREATE', resource: 'hr' },
  { id: 'hr.read', name: 'hr.read', label: 'הצג עובד', module: 'hr', action: 'READ', resource: 'hr' },
  { id: 'hr.update', name: 'hr.update', label: 'ערוך עובד', module: 'hr', action: 'UPDATE', resource: 'hr' },
  { id: 'hr.delete', name: 'hr.delete', label: 'מחק עובד', module: 'hr', action: 'DELETE', resource: 'hr' },

  // Reports module
  { id: 'reports.read', name: 'reports.read', label: 'הצג דוחות', module: 'reports', action: 'READ', resource: 'reports' },
  { id: 'reports.export', name: 'reports.export', label: 'ייצא דוחות', module: 'reports', action: 'EXPORT', resource: 'reports' },
  { id: 'reports.create', name: 'reports.create', label: 'צור דוח', module: 'reports', action: 'CREATE', resource: 'reports' },

  // Settings module
  { id: 'settings.read', name: 'settings.read', label: 'הצג הגדרות', module: 'settings', action: 'READ', resource: 'settings' },
  { id: 'settings.update', name: 'settings.update', label: 'ערוך הגדרות', module: 'settings', action: 'UPDATE', resource: 'settings' },
  { id: 'settings.create', name: 'settings.create', label: 'צור הגדרות', module: 'settings', action: 'CREATE', resource: 'settings' },
  { id: 'settings.delete', name: 'settings.delete', label: 'מחק הגדרות', module: 'settings', action: 'DELETE', resource: 'settings' },

  // Users module
  { id: 'users.create', name: 'users.create', label: 'הוסף משתמש', module: 'users', action: 'CREATE', resource: 'users' },
  { id: 'users.read', name: 'users.read', label: 'הצג משתמש', module: 'users', action: 'READ', resource: 'users' },
  { id: 'users.update', name: 'users.update', label: 'ערוך משתמש', module: 'users', action: 'UPDATE', resource: 'users' },
  { id: 'users.delete', name: 'users.delete', label: 'מחק משתמש', module: 'users', action: 'DELETE', resource: 'users' },

  // Permissions module
  { id: 'permissions.create', name: 'permissions.create', label: 'הוסף הרשאה', module: 'permissions', action: 'CREATE', resource: 'permissions' },
  { id: 'permissions.read', name: 'permissions.read', label: 'הצג הרשאה', module: 'permissions', action: 'READ', resource: 'permissions' },
  { id: 'permissions.update', name: 'permissions.update', label: 'ערוך הרשאה', module: 'permissions', action: 'UPDATE', resource: 'permissions' },
  { id: 'permissions.delete', name: 'permissions.delete', label: 'מחק הרשאה', module: 'permissions', action: 'DELETE', resource: 'permissions' }
]

// GET /api/permissions - Get all permissions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') || 'default'
    const module = searchParams.get('module')

    let filteredPermissions = permissions

    if (module) {
      filteredPermissions = permissions.filter(p => p.module === module)
    }

    return NextResponse.json({ permissions: filteredPermissions })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}