import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo users with different roles
  const demoUsers = [
    {
      name: 'מנהל מערכת',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'ADMIN',
      isActive: true
    },
    {
      name: 'שרה כהן',
      email: 'sarah@company.com',
      password: 'manager123',
      role: 'MANAGER',
      isActive: true
    },
    {
      name: 'דוד לוי',
      email: 'david@company.com',
      password: 'employee123',
      role: 'EMPLOYEE',
      isActive: true
    },
    {
      name: 'מיכל אברהם',
      email: 'michal@company.com',
      password: 'employee123',
      role: 'EMPLOYEE',
      isActive: true
    },
    {
      name: 'יוסי גולדברג',
      email: 'yossi@company.com',
      password: 'employee123',
      role: 'EMPLOYEE',
      isActive: true
    },
    {
      name: 'רחל שרון',
      email: 'rachel@company.com',
      password: 'manager123',
      role: 'MANAGER',
      isActive: true
    },
    {
      name: 'אמיר חסיד',
      email: 'amir@company.com',
      password: 'employee123',
      role: 'EMPLOYEE',
      isActive: false
    },
    {
      name: 'נטלי רוזן',
      email: 'natalie@company.com',
      password: 'client123',
      role: 'CLIENT',
      isActive: true
    }
  ]

  console.log('👥 Creating demo users...')
  for (const userData of demoUsers) {
    const hashedPassword = await hash(userData.password, 12)
    
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isActive: userData.isActive,
        clientId: 'default'
      },
    })
    console.log(`✅ Created user: ${userData.name} (${userData.email})`)
  }

  // Create user profiles for demo users
  const userProfiles = [
    {
      email: 'admin@company.com',
      firstName: 'מנהל',
      lastName: 'מערכת',
      phone: '050-1234567',
      department: 'IT',
      position: 'מנהל מערכת',
      employeeId: 'EMP001'
    },
    {
      email: 'sarah@company.com',
      firstName: 'שרה',
      lastName: 'כהן',
      phone: '050-2345678',
      department: 'מכירות',
      position: 'מנהלת מכירות',
      employeeId: 'EMP002'
    },
    {
      email: 'david@company.com',
      firstName: 'דוד',
      lastName: 'לוי',
      phone: '050-3456789',
      department: 'פיתוח',
      position: 'מפתח תוכנה',
      employeeId: 'EMP003'
    },
    {
      email: 'michal@company.com',
      firstName: 'מיכל',
      lastName: 'אברהם',
      phone: '050-4567890',
      department: 'שיווק',
      position: 'מנהלת שיווק',
      employeeId: 'EMP004'
    },
    {
      email: 'yossi@company.com',
      firstName: 'יוסי',
      lastName: 'גולדברג',
      phone: '050-5678901',
      department: 'כספים',
      position: 'רואה חשבון',
      employeeId: 'EMP005'
    },
    {
      email: 'rachel@company.com',
      firstName: 'רחל',
      lastName: 'שרון',
      phone: '050-6789012',
      department: 'משאבי אנוש',
      position: 'מנהלת משאבי אנוש',
      employeeId: 'EMP006'
    },
    {
      email: 'amir@company.com',
      firstName: 'אמיר',
      lastName: 'חסיד',
      phone: '050-7890123',
      department: 'תפעול',
      position: 'מנהל תפעול',
      employeeId: 'EMP007'
    },
    {
      email: 'natalie@company.com',
      firstName: 'נטלי',
      lastName: 'רוזן',
      phone: '050-8901234',
      department: 'לקוחות',
      position: 'נציגת לקוחות',
      employeeId: 'CLI001'
    }
  ]

  console.log('👤 Creating user profiles...')
  for (const profileData of userProfiles) {
    const user = await prisma.user.findUnique({
      where: { email: profileData.email }
    })
    
    if (user) {
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          department: profileData.department,
          position: profileData.position,
          employeeId: profileData.employeeId,
          clientId: 'default'
        },
      })
      console.log(`✅ Created profile for: ${profileData.firstName} ${profileData.lastName}`)
    }
  }

  // Create demo contacts
  console.log('📞 Creating demo contacts...')
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@company.com' }
  })

  if (adminUser) {
    const demoContacts = [
      {
        firstName: 'יונתן',
        lastName: 'כהן',
        email: 'yonatan@example.com',
        phone: '052-1111111',
        company: 'חברת טכנולוגיות',
        position: 'מנהל פרויקטים'
      },
      {
        firstName: 'ליאור',
        lastName: 'לוי',
        email: 'lior@example.com',
        phone: '052-2222222',
        company: 'חברת שירותים',
        position: 'מנהל מכירות'
      },
      {
        firstName: 'מיכל',
        lastName: 'אברהם',
        email: 'michal@example.com',
        phone: '052-3333333',
        company: 'חברת ייעוץ',
        position: 'יועצת עסקית'
      },
      {
        firstName: 'דניאל',
        lastName: 'גולדברג',
        email: 'daniel@example.com',
        phone: '052-4444444',
        company: 'חברת פיתוח',
        position: 'מפתח ראשי'
      }
    ]

    for (const contactData of demoContacts) {
      await prisma.contact.create({
        data: {
          ...contactData,
          userId: adminUser.id,
          clientId: 'default'
        },
      })
      console.log(`✅ Created contact: ${contactData.firstName} ${contactData.lastName}`)
    }
  }

  // Create demo employees
  console.log('👨‍💼 Creating demo employees...')
  if (adminUser) {
    const demoEmployees = [
      {
        firstName: 'אלון',
        lastName: 'שרון',
        email: 'alon@company.com',
        phone: '050-9999999',
        position: 'מנהל פיתוח',
        department: 'פיתוח',
        salary: 25000,
        hireDate: new Date('2023-01-15'),
        status: 'ACTIVE'
      },
      {
        firstName: 'טל',
        lastName: 'דוד',
        email: 'tal@company.com',
        phone: '050-8888888',
        position: 'מעצב UX/UI',
        department: 'עיצוב',
        salary: 18000,
        hireDate: new Date('2023-03-20'),
        status: 'ACTIVE'
      },
      {
        firstName: 'נועה',
        lastName: 'מור',
        email: 'noa@company.com',
        phone: '050-7777777',
        position: 'מנהלת מוצר',
        department: 'מוצר',
        salary: 22000,
        hireDate: new Date('2022-11-10'),
        status: 'ACTIVE'
      }
    ]

    for (const employeeData of demoEmployees) {
      await prisma.employee.create({
        data: {
          ...employeeData,
          userId: adminUser.id,
          clientId: 'default'
        },
      })
      console.log(`✅ Created employee: ${employeeData.firstName} ${employeeData.lastName}`)
    }
  }

  // Create demo projects
  console.log('📋 Creating demo projects...')
  if (adminUser) {
    const demoProjects = [
      {
        name: 'פרויקט מערכת ERP',
        description: 'פיתוח מערכת ERP מתקדמת',
        status: 'IN_PROGRESS',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 500000,
        progress: 65
      },
      {
        name: 'פרויקט אפליקציה ניידת',
        description: 'פיתוח אפליקציה לניהול לקוחות',
        status: 'PLANNING',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-08-31'),
        budget: 200000,
        progress: 10
      },
      {
        name: 'פרויקט אתר חברה',
        description: 'עיצוב ופיתוח אתר החברה החדש',
        status: 'COMPLETED',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2023-12-31'),
        budget: 80000,
        progress: 100
      }
    ]

    for (const projectData of demoProjects) {
      await prisma.project.create({
        data: {
          ...projectData,
          userId: adminUser.id,
          clientId: 'default'
        },
      })
      console.log(`✅ Created project: ${projectData.name}`)
    }
  }

  // Create system configuration
  console.log('⚙️ Creating system configuration...')
  const systemConfigs = [
    { key: 'company_name', value: 'חברת דוגמה בע"מ', type: 'string', module: 'general' },
    { key: 'default_currency', value: 'ILS', type: 'string', module: 'general' },
    { key: 'timezone', value: 'Asia/Jerusalem', type: 'string', module: 'general' },
    { key: 'max_file_size', value: '10485760', type: 'number', module: 'general' }, // 10MB
    { key: 'allowed_file_types', value: '["jpg", "jpeg", "png", "pdf", "doc", "docx"]', type: 'json', module: 'general' },
    { key: 'backup_frequency', value: 'daily', type: 'string', module: 'backup' },
    { key: 'auto_backup_enabled', value: 'true', type: 'boolean', module: 'backup' },
  ]

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }
  console.log(`✅ Created ${systemConfigs.length} system configurations`)

  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('🔑 Demo Users Created:')
  console.log('   Admin: admin@company.com / admin123')
  console.log('   Manager: sarah@company.com / manager123')
  console.log('   Employee: david@company.com / employee123')
  console.log('   Client: natalie@company.com / client123')
  console.log('')
  console.log('📊 Demo Data Created:')
  console.log('   - 8 users with profiles')
  console.log('   - 4 contacts')
  console.log('   - 3 employees')
  console.log('   - 3 projects')
  console.log('   - System configurations')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })