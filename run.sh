#!/bin/bash

echo "========================================"
echo "   מערכת ERP - הפעלה מהירה"
echo "========================================"
echo

# בדיקה אם Node.js מותקן
if ! command -v node &> /dev/null; then
    echo "שגיאה: Node.js לא מותקן במערכת"
    echo "אנא התקן Node.js מ: https://nodejs.org"
    exit 1
fi

echo "✓ Node.js מותקן"
echo

# התקנת תלויות
echo "התקנת תלויות..."
npm install
if [ $? -ne 0 ]; then
    echo "שגיאה: התקנת התלויות נכשלה"
    exit 1
fi

echo "✓ תלויות הותקנו בהצלחה"
echo

# יצירת .env.local אם לא קיים
if [ ! -f ".env.local" ]; then
    echo "יצירת קובץ .env.local..."
    cp "env.example" ".env.local"
    echo "✓ קובץ .env.local נוצר"
    echo
    echo "⚠️  חשוב: ערוך את קובץ .env.local עם הפרטים שלך"
    echo "   - DATABASE_URL"
    echo "   - NEXTAUTH_SECRET"
    echo "   - NEXTAUTH_URL"
    echo
    read -p "לחץ Enter להמשך..."
fi

echo "✓ קובץ .env.local קיים"
echo

# הגדרת מסד נתונים
echo "הגדרת מסד נתונים..."
npx prisma db push
if [ $? -ne 0 ]; then
    echo "שגיאה: הגדרת מסד הנתונים נכשלה"
    echo "וודא שה-DATABASE_URL נכון ב-.env.local"
    exit 1
fi

echo "✓ מסד נתונים הוגדר בהצלחה"
echo

# הרצת seed
echo "הרצת נתונים ראשוניים..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo "שגיאה: הרצת seed נכשלה"
    exit 1
fi

echo "✓ נתונים ראשוניים הוטענו"
echo

echo "========================================"
echo "   המערכת מוכנה להפעלה!"
echo "========================================"
echo
echo "משתמש ברירת מחדל:"
echo "  אימייל: admin@company.com"
echo "  סיסמה: (כל סיסמה - רק לבדיקה)"
echo
echo "מודולים זמינים:"
echo "  - לוח בקרה: http://localhost:3000/dashboard"
echo "  - אנשי קשר: http://localhost:3000/contacts"
echo "  - משאבי אנוש: http://localhost:3000/hr"
echo "  - ייצור: http://localhost:3000/production"
echo
read -p "לחץ Enter להפעלת השרת..."

# הפעלת השרת
echo "הפעלת שרת פיתוח..."
npm run dev


