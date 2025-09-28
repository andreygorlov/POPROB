const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'מנהל מערכת',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        clientId: 'default',
        profile: {
          create: {
            firstName: 'מנהל',
            lastName: 'מערכת',
            phone: '050-1234567',
            department: 'IT',
            position: 'מנהל מערכת',
            employeeId: 'ADMIN001',
            clientId: 'default'
          }
        }
      },
      include: {
        profile: true
      }
    })

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role
    })

    // Create a few more users for testing
    const users = [
      {
        name: 'יוסי כהן',
        email: 'yossi@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'MANAGER',
        profile: {
          firstName: 'יוסי',
          lastName: 'כהן',
          phone: '050-1111111',
          department: 'מכירות',
          position: 'מנהל מכירות',
          employeeId: 'MGR001'
        }
      },
      {
        name: 'שרה לוי',
        email: 'sara@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'EMPLOYEE',
        profile: {
          firstName: 'שרה',
          lastName: 'לוי',
          phone: '050-2222222',
          department: 'פיתוח',
          position: 'מפתחת',
          employeeId: 'EMP001'
        }
      },
      {
        name: 'דוד ישראלי',
        email: 'david@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'EMPLOYEE',
        profile: {
          firstName: 'דוד',
          lastName: 'ישראלי',
          phone: '050-3333333',
          department: 'פיתוח',
          position: 'מפתח',
          employeeId: 'EMP002'
        }
      }
    ]

    for (const userData of users) {
      const existingUser = await prisma.user.findFirst({
        where: { email: userData.email }
      })

      if (!existingUser) {
        const user = await prisma.user.create({
          data: {
            ...userData,
            clientId: 'default',
            profile: {
              create: {
                ...userData.profile,
                clientId: 'default'
              }
            }
          }
        })
        console.log(`User created: ${user.name} (${user.email})`)
      }
    }

  } catch (error) {
    console.error('Error creating users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()