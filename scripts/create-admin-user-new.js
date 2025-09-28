const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Delete existing admin user if exists
    await prisma.user.deleteMany({
      where: { email: 'admin@erp.com' }
    })
    
    console.log('✅ משתמש admin קיים נמחק')
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin', 12)
    
    // Create new admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'מנהל מערכת',
        email: 'admin@erp.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        clientId: 'default'
      }
    })
    
    console.log('✅ משתמש admin נוצר בהצלחה:')
    console.log(`📧 אימייל: ${adminUser.email}`)
    console.log(`🔑 סיסמה: admin`)
    console.log(`👤 שם: ${adminUser.name}`)
    console.log(`🎭 תפקיד: ${adminUser.role}`)
    
  } catch (error) {
    console.error('❌ שגיאה ביצירת משתמש:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
