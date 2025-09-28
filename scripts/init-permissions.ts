import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Default modules for ERP system
const defaultModules = [
  {
    name: 'contacts',
    label: 'אנשי קשר',
    description: 'ניהול אנשי קשר, חברות וספקים',
    icon: '👥',
    order: 1
  },
  {
    name: 'production',
    label: 'ייצור',
    description: 'ניהול ייצור, פרויקטים ומשימות',
    icon: '🏭',
    order: 2
  },
  {
    name: 'products',
    label: 'מוצרים',
    description: 'ניהול מוצרים, חומרי גלם ומלאי',
    icon: '📦',
    order: 3
  },
  {
    name: 'sales',
    label: 'מכירות',
    description: 'ניהול מכירות, הצעות מחיר והזמנות',
    icon: '💰',
    order: 4
  },
  {
    name: 'purchasing',
    label: 'רכש',
    description: 'ניהול רכש, הזמנות רכש וספקים',
    icon: '🛒',
    order: 5
  },
  {
    name: 'accounting',
    label: 'הנהלת חשבונות',
    description: 'ניהול חשבוניות, תשלומים והוצאות',
    icon: '📊',
    order: 6
  },
  {
    name: 'hr',
    label: 'משאבי אנוש',
    description: 'ניהול עובדים, שכר ונוכחות',
    icon: '👨‍💼',
    order: 7
  },
  {
    name: 'reports',
    label: 'דוחות',
    description: 'דוחות וניתוח נתונים',
    icon: '📈',
    order: 8
  },
  {
    name: 'settings',
    label: 'הגדרות',
    description: 'הגדרות מערכת וקונפיגורציה',
    icon: '⚙️',
    order: 9
  }
]

// Default permissions for each module
const defaultPermissions = [
  // Contacts module
  { module: 'contacts', action: 'CREATE', resource: 'contacts', label: 'יצירת אנשי קשר' },
  { module: 'contacts', action: 'READ', resource: 'contacts', label: 'צפייה באנשי קשר' },
  { module: 'contacts', action: 'UPDATE', resource: 'contacts', label: 'עריכת אנשי קשר' },
  { module: 'contacts', action: 'DELETE', resource: 'contacts', label: 'מחיקת אנשי קשר' },
  { module: 'contacts', action: 'EXPORT', resource: 'contacts', label: 'ייצוא אנשי קשר' },
  { module: 'contacts', action: 'IMPORT', resource: 'contacts', label: 'ייבוא אנשי קשר' },

  // Production module
  { module: 'production', action: 'CREATE', resource: 'projects', label: 'יצירת פרויקטים' },
  { module: 'production', action: 'READ', resource: 'projects', label: 'צפייה בפרויקטים' },
  { module: 'production', action: 'UPDATE', resource: 'projects', label: 'עריכת פרויקטים' },
  { module: 'production', action: 'DELETE', resource: 'projects', label: 'מחיקת פרויקטים' },
  { module: 'production', action: 'CREATE', resource: 'tasks', label: 'יצירת משימות' },
  { module: 'production', action: 'READ', resource: 'tasks', label: 'צפייה במשימות' },
  { module: 'production', action: 'UPDATE', resource: 'tasks', label: 'עריכת משימות' },
  { module: 'production', action: 'DELETE', resource: 'tasks', label: 'מחיקת משימות' },
  { module: 'production', action: 'APPROVE', resource: 'tasks', label: 'אישור משימות' },

  // Products module
  { module: 'products', action: 'CREATE', resource: 'products', label: 'יצירת מוצרים' },
  { module: 'products', action: 'READ', resource: 'products', label: 'צפייה במוצרים' },
  { module: 'products', action: 'UPDATE', resource: 'products', label: 'עריכת מוצרים' },
  { module: 'products', action: 'DELETE', resource: 'products', label: 'מחיקת מוצרים' },
  { module: 'products', action: 'CREATE', resource: 'inventory', label: 'ניהול מלאי' },
  { module: 'products', action: 'READ', resource: 'inventory', label: 'צפייה במלאי' },
  { module: 'products', action: 'UPDATE', resource: 'inventory', label: 'עדכון מלאי' },

  // Sales module
  { module: 'sales', action: 'CREATE', resource: 'quotes', label: 'יצירת הצעות מחיר' },
  { module: 'sales', action: 'READ', resource: 'quotes', label: 'צפייה בהצעות מחיר' },
  { module: 'sales', action: 'UPDATE', resource: 'quotes', label: 'עריכת הצעות מחיר' },
  { module: 'sales', action: 'DELETE', resource: 'quotes', label: 'מחיקת הצעות מחיר' },
  { module: 'sales', action: 'APPROVE', resource: 'quotes', label: 'אישור הצעות מחיר' },
  { module: 'sales', action: 'CREATE', resource: 'orders', label: 'יצירת הזמנות' },
  { module: 'sales', action: 'READ', resource: 'orders', label: 'צפייה בהזמנות' },
  { module: 'sales', action: 'UPDATE', resource: 'orders', label: 'עריכת הזמנות' },
  { module: 'sales', action: 'DELETE', resource: 'orders', label: 'מחיקת הזמנות' },

  // Purchasing module
  { module: 'purchasing', action: 'CREATE', resource: 'purchase_orders', label: 'יצירת הזמנות רכש' },
  { module: 'purchasing', action: 'READ', resource: 'purchase_orders', label: 'צפייה בהזמנות רכש' },
  { module: 'purchasing', action: 'UPDATE', resource: 'purchase_orders', label: 'עריכת הזמנות רכש' },
  { module: 'purchasing', action: 'DELETE', resource: 'purchase_orders', label: 'מחיקת הזמנות רכש' },
  { module: 'purchasing', action: 'APPROVE', resource: 'purchase_orders', label: 'אישור הזמנות רכש' },

  // Accounting module
  { module: 'accounting', action: 'CREATE', resource: 'invoices', label: 'יצירת חשבוניות' },
  { module: 'accounting', action: 'READ', resource: 'invoices', label: 'צפייה בחשבוניות' },
  { module: 'accounting', action: 'UPDATE', resource: 'invoices', label: 'עריכת חשבוניות' },
  { module: 'accounting', action: 'DELETE', resource: 'invoices', label: 'מחיקת חשבוניות' },
  { module: 'accounting', action: 'APPROVE', resource: 'invoices', label: 'אישור חשבוניות' },
  { module: 'accounting', action: 'CREATE', resource: 'payments', label: 'ניהול תשלומים' },
  { module: 'accounting', action: 'READ', resource: 'payments', label: 'צפייה בתשלומים' },
  { module: 'accounting', action: 'UPDATE', resource: 'payments', label: 'עריכת תשלומים' },

  // HR module
  { module: 'hr', action: 'CREATE', resource: 'employees', label: 'יצירת עובדים' },
  { module: 'hr', action: 'READ', resource: 'employees', label: 'צפייה בעובדים' },
  { module: 'hr', action: 'UPDATE', resource: 'employees', label: 'עריכת עובדים' },
  { module: 'hr', action: 'DELETE', resource: 'employees', label: 'מחיקת עובדים' },
  { module: 'hr', action: 'READ', resource: 'payroll', label: 'צפייה בשכר' },
  { module: 'hr', action: 'UPDATE', resource: 'payroll', label: 'עריכת שכר' },
  { module: 'hr', action: 'READ', resource: 'attendance', label: 'צפייה בנוכחות' },
  { module: 'hr', action: 'UPDATE', resource: 'attendance', label: 'עריכת נוכחות' },

  // Reports module
  { module: 'reports', action: 'READ', resource: 'reports', label: 'צפייה בדוחות' },
  { module: 'reports', action: 'EXPORT', resource: 'reports', label: 'ייצוא דוחות' },
  { module: 'reports', action: 'CREATE', resource: 'reports', label: 'יצירת דוחות מותאמים' },

  // Settings module
  { module: 'settings', action: 'READ', resource: 'settings', label: 'צפייה בהגדרות' },
  { module: 'settings', action: 'UPDATE', resource: 'settings', label: 'עריכת הגדרות' },
  { module: 'settings', action: 'READ', resource: 'users', label: 'ניהול משתמשים' },
  { module: 'settings', action: 'CREATE', resource: 'users', label: 'יצירת משתמשים' },
  { module: 'settings', action: 'UPDATE', resource: 'users', label: 'עריכת משתמשים' },
  { module: 'settings', action: 'DELETE', resource: 'users', label: 'מחיקת משתמשים' },
  { module: 'settings', action: 'READ', resource: 'permissions', label: 'ניהול הרשאות' },
  { module: 'settings', action: 'CREATE', resource: 'permissions', label: 'יצירת הרשאות' },
  { module: 'settings', action: 'UPDATE', resource: 'permissions', label: 'עריכת הרשאות' },
  { module: 'settings', action: 'DELETE', resource: 'permissions', label: 'מחיקת הרשאות' }
]

// Default roles
const defaultRoles = [
  {
    name: 'ADMIN',
    label: 'מנהל מערכת',
    description: 'גישה מלאה לכל המערכת',
    level: 100,
    isSystem: true
  },
  {
    name: 'MANAGER',
    label: 'מנהל',
    description: 'ניהול צוותים ומחלקות',
    level: 75,
    isSystem: true
  },
  {
    name: 'EMPLOYEE',
    label: 'עובד',
    description: 'גישה סטנדרטית למערכת',
    level: 50,
    isSystem: true
  },
  {
    name: 'CLIENT',
    label: 'לקוח',
    description: 'גישה מוגבלת לנתונים אישיים',
    level: 25,
    isSystem: true
  }
]

async function initPermissions() {
  console.log('🚀 Initializing permissions system...')

  try {
    // Create modules
    console.log('📦 Creating modules...')
    const createdModules: Record<string, string> = {}
    
    for (const moduleData of defaultModules) {
      const module = await prisma.module.upsert({
        where: { 
          name: moduleData.name,
          clientId: 'default'
        },
        update: moduleData,
        create: {
          ...moduleData,
          clientId: 'default'
        }
      })
      createdModules[moduleData.name] = module.id
      console.log(`✅ Created module: ${moduleData.label}`)
    }

    // Create permissions
    console.log('🔐 Creating permissions...')
    for (const permData of defaultPermissions) {
      const moduleId = createdModules[permData.module]
      if (!moduleId) {
        console.warn(`⚠️ Module not found: ${permData.module}`)
        continue
      }

      const permission = await prisma.permission.upsert({
        where: {
          name: `${permData.module}.${permData.action.toLowerCase()}.${permData.resource}`,
          clientId: 'default'
        },
        update: {
          label: permData.label,
          moduleId,
          action: permData.action,
          resource: permData.resource
        },
        create: {
          name: `${permData.module}.${permData.action.toLowerCase()}.${permData.resource}`,
          label: permData.label,
          moduleId,
          action: permData.action,
          resource: permData.resource,
          clientId: 'default',
          isSystem: true
        }
      })
      console.log(`✅ Created permission: ${permission.label}`)
    }

    // Create roles
    console.log('👥 Creating roles...')
    for (const roleData of defaultRoles) {
      const role = await prisma.role.upsert({
        where: {
          name: roleData.name,
          clientId: 'default'
        },
        update: roleData,
        create: {
          ...roleData,
          clientId: 'default'
        }
      })
      console.log(`✅ Created role: ${role.label}`)
    }

    console.log('🎉 Permissions system initialized successfully!')
    
    // Print summary
    const moduleCount = await prisma.module.count({ where: { clientId: 'default' } })
    const permissionCount = await prisma.permission.count({ where: { clientId: 'default' } })
    const roleCount = await prisma.role.count({ where: { clientId: 'default' } })
    
    console.log(`📊 Summary:`)
    console.log(`   Modules: ${moduleCount}`)
    console.log(`   Permissions: ${permissionCount}`)
    console.log(`   Roles: ${roleCount}`)

  } catch (error) {
    console.error('❌ Error initializing permissions:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  initPermissions()
    .then(() => {
      console.log('✅ Done!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Failed:', error)
      process.exit(1)
    })
}

export { initPermissions }
