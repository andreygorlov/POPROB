const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 יצירת נתוני דמה פשוטים...')

  // יצירת משתמש אדמין
  const admin = await prisma.user.create({
    data: {
      name: 'מנהל מערכת',
      email: 'admin@test.com',
      password: await bcrypt.hash('admin', 12),
      role: 'ADMIN',
      isActive: true,
      clientId: 'default'
    }
  })

  // יצירת משתמש רגיל
  const user = await prisma.user.create({
    data: {
      name: 'דוד ישראלי',
      email: 'david@test.com',
      password: await bcrypt.hash('david', 12),
      role: 'EMPLOYEE',
      isActive: true,
      clientId: 'default'
    }
  })

  // יצירת פרופילים
  await prisma.userProfile.create({
    data: {
      userId: admin.id,
      firstName: 'מנהל',
      lastName: 'מערכת',
      phone: '050-1111111',
      department: 'IT',
      position: 'מנהל מערכת',
      clientId: 'default'
    }
  })

  await prisma.userProfile.create({
    data: {
      userId: user.id,
      firstName: 'דוד',
      lastName: 'ישראלי',
      phone: '050-2222222',
      department: 'פיתוח',
      position: 'מפתח',
      clientId: 'default'
    }
  })

  // יצירת שדה מותאם
  const customField = await prisma.customField.create({
    data: {
      name: 'phone',
      label: 'טלפון',
      type: 'PHONE',
      entityType: 'CONTACT',
      required: true,
      order: 1,
      isActive: true,
      description: 'מספר טלפון ליצירת קשר',
      clientId: 'default'
    }
  })

  console.log('✅ נוצרו 2 משתמשים')
  console.log('✅ נוצרו 2 פרופילים')
  console.log('✅ נוצר 1 שדה מותאם')
  console.log('🎉 הנתונים נוצרו בהצלחה!')
}

main()
  .catch((e) => {
    console.error('❌ שגיאה:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
