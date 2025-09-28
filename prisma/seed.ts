import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // console.log('🌱 Starting seed...')

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'מנהל מערכת - גישה מלאה',
    },
  })

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'מנהל - גישה למודולים מוקצים',
    },
  })

  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: {
      name: 'employee',
      description: 'עובד - גישה מוגבלת',
    },
  })

  const viewerRole = await prisma.role.upsert({
    where: { name: 'viewer' },
    update: {},
    create: {
      name: 'viewer',
      description: 'צופה - גישה לקריאה בלבד',
    },
  })

  // Create permissions
  const permissions = [
    // Contacts permissions
    { name: 'contacts:create', description: 'יצירת אנשי קשר', module: 'contacts', action: 'create' },
    { name: 'contacts:read', description: 'קריאת אנשי קשר', module: 'contacts', action: 'read' },
    { name: 'contacts:update', description: 'עדכון אנשי קשר', module: 'contacts', action: 'update' },
    { name: 'contacts:delete', description: 'מחיקת אנשי קשר', module: 'contacts', action: 'delete' },
    
    // HR permissions
    { name: 'hr:create', description: 'יצירת עובדים', module: 'hr', action: 'create' },
    { name: 'hr:read', description: 'קריאת עובדים', module: 'hr', action: 'read' },
    { name: 'hr:update', description: 'עדכון עובדים', module: 'hr', action: 'update' },
    { name: 'hr:delete', description: 'מחיקת עובדים', module: 'hr', action: 'delete' },
    
    // Production permissions
    { name: 'production:create', description: 'יצירת פרויקטים', module: 'production', action: 'create' },
    { name: 'production:read', description: 'קריאת פרויקטים', module: 'production', action: 'read' },
    { name: 'production:update', description: 'עדכון פרויקטים', module: 'production', action: 'update' },
    { name: 'production:delete', description: 'מחיקת פרויקטים', module: 'production', action: 'delete' },
  ]

  const createdPermissions = []
  for (const permission of permissions) {
    const created = await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    })
    createdPermissions.push(created)
  }

  // Assign permissions to roles
  // Admin gets all permissions
  for (const permission of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    })
  }

  // Manager gets read/write permissions
  const managerPermissions = createdPermissions.filter(p => 
    p.action === 'read' || p.action === 'update' || p.action === 'create'
  )
  for (const permission of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId: permission.id,
      },
    })
  }

  // Employee gets read permissions for HR and Production
  const employeePermissions = createdPermissions.filter(p => 
    p.module === 'hr' || p.module === 'production'
  ).filter(p => p.action === 'read')
  for (const permission of employeePermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: employeeRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: employeeRole.id,
        permissionId: permission.id,
      },
    })
  }

  // Viewer gets only read permissions
  const viewerPermissions = createdPermissions.filter(p => p.action === 'read')
  for (const permission of viewerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: viewerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: viewerRole.id,
        permissionId: permission.id,
      },
    })
  }

  // Create default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      name: 'מנהל מערכת',
      email: 'admin@company.com',
      image: null,
    },
  })

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  })

  // Create system configuration
  const systemConfigs = [
    { key: 'company_name', value: 'חברת דוגמה', type: 'string', module: 'general' },
    { key: 'default_currency', value: 'ILS', type: 'string', module: 'general' },
    { key: 'timezone', value: 'Asia/Jerusalem', type: 'string', module: 'general' },
    { key: 'max_file_size', value: '10485760', type: 'number', module: 'general' }, // 10MB
    { key: 'allowed_file_types', value: '["jpg", "jpeg", "png", "pdf", "doc", "docx"]', type: 'json', module: 'general' },
  ]

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }

  // console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    // console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


