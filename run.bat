@echo off
echo ========================================
echo    מערכת ERP - הפעלה מהירה
echo ========================================
echo.

REM בדיקה אם Node.js מותקן
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo שגיאה: Node.js לא מותקן במערכת
    echo אנא התקן Node.js מ: https://nodejs.org
    pause
    exit /b 1
)

echo ✓ Node.js מותקן
echo.

REM התקנת תלויות
echo התקנת תלויות...
call npm install
if %errorlevel% neq 0 (
    echo שגיאה: התקנת התלויות נכשלה
    pause
    exit /b 1
)

echo ✓ תלויות הותקנו בהצלחה
echo.

REM יצירת .env.local אם לא קיים
if not exist ".env.local" (
    echo יצירת קובץ .env.local...
    copy "env.example" ".env.local"
    echo ✓ קובץ .env.local נוצר
    echo.
    echo ⚠️  חשוב: ערוך את קובץ .env.local עם הפרטים שלך
    echo    - DATABASE_URL
    echo    - NEXTAUTH_SECRET
    echo    - NEXTAUTH_URL
    echo.
    pause
)

echo ✓ קובץ .env.local קיים
echo.

REM הגדרת מסד נתונים
echo הגדרת מסד נתונים...
call npx prisma db push
if %errorlevel% neq 0 (
    echo שגיאה: הגדרת מסד הנתונים נכשלה
    echo וודא שה-DATABASE_URL נכון ב-.env.local
    pause
    exit /b 1
)

echo ✓ מסד נתונים הוגדר בהצלחה
echo.

REM הרצת seed
echo הרצת נתונים ראשוניים...
call npm run db:seed
if %errorlevel% neq 0 (
    echo שגיאה: הרצת seed נכשלה
    pause
    exit /b 1
)

echo ✓ נתונים ראשוניים הוטענו
echo.

echo ========================================
echo    המערכת מוכנה להפעלה!
echo ========================================
echo.
echo משתמש ברירת מחדל:
echo   אימייל: admin@company.com
echo   סיסמה: (כל סיסמה - רק לבדיקה)
echo.
echo מודולים זמינים:
echo   - לוח בקרה: http://localhost:3000/dashboard
echo   - אנשי קשר: http://localhost:3000/contacts
echo   - משאבי אנוש: http://localhost:3000/hr
echo   - ייצור: http://localhost:3000/production
echo.
echo לחץ Enter להפעלת השרת...
pause >nul

REM הפעלת השרת
echo הפעלת שרת פיתוח...
call npm run dev


