const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 מוסיף שדה מותאם עבור משתמשים...')

  try {
    // Create a custom field for users
    const customField = await prisma.customField.create({
      data: {
        name: 'user_skills',
        label: 'כישורים',
        type: 'TEXTAREA',
        entityType: 'USER',
        required: false,
        order: 1,
        isActive: true,
        description: 'כישורים מקצועיים של המשתמש',
        clientId: 'default',
      },
    })

    console.log('✅ שדה מותאם נוצר בהצלחה!')
    console.log('📋 פרטי השדה:', {
      id: customField.id,
      name: customField.name,
      label: customField.label,
      type: customField.type,
      entityType: customField.entityType,
    })
  } catch (error) {
    console.error('❌ שגיאה ביצירת שדה מותאם:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
