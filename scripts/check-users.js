const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany()
    console.log('משתמשים במערכת:')
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - תפקיד: ${user.role}`)
    })
    
    if (users.length === 0) {
      console.log('❌ אין משתמשים במערכת!')
    }
  } catch (error) {
    console.error('❌ שגיאה:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
