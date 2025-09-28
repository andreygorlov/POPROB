const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 מוסיף שדות חובה למערכת...');
  
  try {
    // שדות חובה בסיסיים
    const requiredFields = [
      {
        name: 'full_name',
        label: 'שם מלא',
        type: 'TEXT',
        entityType: 'USER',
        required: true,
        order: 1,
        isActive: true,
        description: 'שם מלא של המשתמש',
        clientId: 'default'
      },
      {
        name: 'email',
        label: 'אימייל',
        type: 'EMAIL',
        entityType: 'USER',
        required: true,
        order: 2,
        isActive: true,
        description: 'כתובת אימייל של המשתמש',
        clientId: 'default'
      },
      {
        name: 'role',
        label: 'תפקיד',
        type: 'SELECT',
        entityType: 'USER',
        required: true,
        order: 3,
        isActive: true,
        description: 'תפקיד המשתמש במערכת',
        clientId: 'default',
        options: JSON.stringify(['ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT'])
      },
      {
        name: 'phone',
        label: 'טלפון',
        type: 'PHONE',
        entityType: 'USER',
        required: false,
        order: 4,
        isActive: true,
        description: 'מספר טלפון של המשתמש',
        clientId: 'default'
      },
      {
        name: 'department',
        label: 'מחלקה',
        type: 'TEXT',
        entityType: 'USER',
        required: false,
        order: 5,
        isActive: true,
        description: 'מחלקה של המשתמש',
        clientId: 'default'
      },
      {
        name: 'position',
        label: 'תפקיד מקצועי',
        type: 'TEXT',
        entityType: 'USER',
        required: false,
        order: 6,
        isActive: true,
        description: 'תפקיד מקצועי של המשתמש',
        clientId: 'default'
      }
    ];

    for (const field of requiredFields) {
      // בדיקה אם השדה כבר קיים
      const existingField = await prisma.customField.findFirst({
        where: {
          name: field.name,
          entityType: field.entityType,
          clientId: field.clientId
        }
      });

      if (!existingField) {
        const customField = await prisma.customField.create({
          data: field
        });
        console.log(`✅ שדה חובה נוצר: ${field.label} (${field.name})`);
      } else {
        console.log(`⚠️ שדה כבר קיים: ${field.label} (${field.name})`);
      }
    }

    console.log('✅ כל השדות החובה נוספו בהצלחה!');
    
  } catch (err) {
    console.error('❌ שגיאה:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
