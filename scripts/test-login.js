const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@erp.com' }
    })
    
    if (!user) {
      console.log('❌ משתמש לא נמצא')
      return
    }
    
    console.log('✅ משתמש נמצא:', user.name)
    console.log('📧 אימייל:', user.email)
    console.log('🔑 סיסמה מוצפנת:', user.password ? 'כן' : 'לא')
    
    // בדיקת סיסמה
    const testPassword = 'admin123'
    const isValid = await bcrypt.compare(testPassword, user.password || '')
    console.log('🔐 בדיקת סיסמה "admin123":', isValid ? '✅ נכון' : '❌ שגוי')
    
  } catch (error) {
    console.error('❌ שגיאה:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
