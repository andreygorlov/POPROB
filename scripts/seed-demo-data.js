const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 יצירת נתוני דמה...')

  // יצירת משתמשים
  const adminUser = await prisma.user.create({
    data: {
      name: 'מנהל מערכת',
      email: 'admin@erp.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
      isActive: true,
      clientId: 'default'
    }
  })

  await prisma.userProfile.create({
    data: {
      userId: adminUser.id,
      firstName: 'מנהל',
      lastName: 'מערכת',
      phone: '050-1234567',
      department: 'IT',
      position: 'מנהל מערכת',
      employeeId: 'EMP001',
      clientId: 'default'
    }
  })

  const davidUser = await prisma.user.create({
    data: {
      name: 'דוד כהן',
      email: 'david@erp.com',
      password: await bcrypt.hash('david123', 12),
      role: 'MANAGER',
      isActive: true,
      clientId: 'default'
    }
  })

  await prisma.userProfile.create({
    data: {
      userId: davidUser.id,
      firstName: 'דוד',
      lastName: 'כהן',
      phone: '050-2345678',
      department: 'מכירות',
      position: 'מנהל מכירות',
      employeeId: 'EMP002',
      clientId: 'default'
    }
  })

  const saraUser = await prisma.user.create({
    data: {
      name: 'שרה לוי',
      email: 'sara@erp.com',
      password: await bcrypt.hash('sara123', 12),
      role: 'EMPLOYEE',
      isActive: true,
      clientId: 'default'
    }
  })

  await prisma.userProfile.create({
    data: {
      userId: saraUser.id,
      firstName: 'שרה',
      lastName: 'לוי',
      phone: '050-3456789',
      department: 'משאבי אנוש',
      position: 'מנהלת משאבי אנוש',
      employeeId: 'EMP003',
      clientId: 'default'
    }
  })

  const yossiUser = await prisma.user.create({
    data: {
      name: 'יוסי ישראלי',
      email: 'yossi@erp.com',
      password: await bcrypt.hash('yossi123', 12),
      role: 'CLIENT',
      isActive: true,
      clientId: 'default'
    }
  })

  await prisma.userProfile.create({
    data: {
      userId: yossiUser.id,
      firstName: 'יוסי',
      lastName: 'ישראלי',
      phone: '050-4567890',
      department: 'לקוחות',
      position: 'לקוח VIP',
      employeeId: 'CLI001',
      clientId: 'default'
    }
  })

  const users = [adminUser, davidUser, saraUser, yossiUser]

  console.log(`✅ נוצרו ${users.length} משתמשים`)

  // יצירת שדות מותאמים
  const customFields = await Promise.all([
    prisma.customField.create({
      data: {
        name: 'phone_number',
        label: 'מספר טלפון',
        type: 'PHONE',
        entityType: 'CONTACT',
        required: true,
        order: 1,
        isActive: true,
        description: 'מספר טלפון ליצירת קשר',
        clientId: 'default'
      }
    }),
    prisma.customField.create({
      data: {
        name: 'company_size',
        label: 'גודל החברה',
        type: 'SELECT',
        entityType: 'COMPANY',
        options: JSON.stringify(['1-10', '11-50', '51-200', '200+']),
        required: false,
        order: 2,
        isActive: true,
        description: 'גודל החברה במספר עובדים',
        clientId: 'default'
      }
    }),
    prisma.customField.create({
      data: {
        name: 'priority_level',
        label: 'רמת עדיפות',
        type: 'SELECT',
        entityType: 'TASK',
        options: JSON.stringify(['נמוכה', 'בינונית', 'גבוהה', 'דחופה']),
        required: true,
        order: 1,
        isActive: true,
        description: 'רמת עדיפות המשימה',
        clientId: 'default'
      }
    })
  ])

  console.log(`✅ נוצרו ${customFields.length} שדות מותאמים`)

  // יצירת צ'אט
  const chat = await prisma.chat.create({
    data: {
      name: 'צ\'אט כללי',
      description: 'צ\'אט כללי לצוות',
      type: 'GROUP',
      isActive: true,
      clientId: 'default',
      participants: {
        create: [
          { userId: users[0].id, role: 'ADMIN' },
          { userId: users[1].id, role: 'MEMBER' },
          { userId: users[2].id, role: 'MEMBER' }
        ]
      }
    }
  })

  // יצירת הודעות
  await Promise.all([
    prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: users[0].id,
        content: 'שלום לכולם! ברוכים הבאים למערכת ה-ERP',
        type: 'TEXT',
        clientId: 'default'
      }
    }),
    prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: users[1].id,
        content: 'תודה! המערכת נראית מעולה',
        type: 'TEXT',
        clientId: 'default'
      }
    }),
    prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: users[2].id,
        content: 'אני מוכנה להתחיל לעבוד!',
        type: 'TEXT',
        clientId: 'default'
      }
    })
  ])

  console.log('✅ נוצר צ\'אט עם הודעות')

  console.log('🎉 נתוני הדמה נוצרו בהצלחה!')
}

main()
  .catch((e) => {
    console.error('❌ שגיאה ביצירת נתוני הדמה:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
