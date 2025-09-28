# מערכת ERP - מערכת ניהול משאבי ארגון

מערכת ERP מתקדמת בנויה עם Next.js, TypeScript, Prisma, ו-tRPC.

## תכונות עיקריות

### 🏢 מודולים עסקיים
- **אנשי קשר** - ניהול אנשי קשר ומעקב אחריהם
- **משאבי אנוש** - ניהול עובדים, משכורות, ותהליכי HR
- **ייצור** - ניהול פרויקטים, משימות, ותהליכי ייצור

### 🔐 אבטחה והרשאות
- מערכת RBAC (Role-Based Access Control) מתקדמת
- תמיכה ב-Multi-tenant
- אימות מאובטח עם NextAuth
- לוגים מפורטים של כל הפעולות

### 🛠 טכנולוגיות
- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: tRPC, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: NextAuth.js
- **Deployment**: Vercel/Railway

## התקנה והפעלה

### דרישות מערכת
- Node.js 18+
- PostgreSQL
- npm או yarn

### שלבי התקנה

1. **שכפול הפרויקט**
```bash
git clone <repository-url>
cd erp-system
```

2. **התקנת תלויות**
```bash
npm install
```

3. **הגדרת משתני סביבה**
```bash
cp env.example .env.local
```

ערוך את קובץ `.env.local` עם הפרטים שלך:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/erp_system"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

4. **הגדרת מסד נתונים**
```bash
# יצירת מסד נתונים
npx prisma db push

# הרצת seed לנתונים ראשוניים
npm run db:seed
```

5. **הפעלת השרת**
```bash
npm run dev
```

המערכת תהיה זמינה בכתובת: http://localhost:3000

## מבנה הפרויקט

```
├── app/                    # Next.js App Router
│   ├── contacts/          # מודול אנשי קשר
│   ├── hr/               # מודול משאבי אנוש
│   ├── production/       # מודול ייצור
│   ├── dashboard/        # לוח בקרה
│   └── auth/             # אימות משתמשים
├── components/            # רכיבי UI
│   ├── contacts/         # רכיבי מודול אנשי קשר
│   ├── hr/              # רכיבי מודול משאבי אנוש
│   ├── production/      # רכיבי מודול ייצור
│   └── ui/              # רכיבי UI בסיסיים
├── lib/                 # לוגיקה עסקית
│   ├── auth.ts          # הגדרות אימות
│   ├── prisma.ts        # חיבור למסד נתונים
│   └── trpc.ts          # הגדרות tRPC
├── server/              # שרת tRPC
│   ├── trpc.ts          # הגדרות tRPC
│   └── routers/         # נתיבי API
├── prisma/              # מסד נתונים
│   ├── schema.prisma    # סכמת מסד נתונים
│   └── seed.ts          # נתונים ראשוניים
└── cursor-guidelines.md # מדריך עבודה עם Cursor
```

## שימוש במערכת

### משתמשים ברירת מחדל
- **מנהל מערכת**: admin@company.com
- **תפקיד**: admin (גישה מלאה)

### מודולים זמינים

#### אנשי קשר
- הוספת אנשי קשר חדשים
- עריכת פרטי אנשי קשר
- חיפוש וסינון
- מעקב אחר פעילות

#### משאבי אנוש
- ניהול עובדים
- מעקב אחר משכורות
- ניהול מחלקות
- מעקב אחר חופשות

#### ייצור
- ניהול פרויקטים
- מעקב אחר משימות
- ניהול משאבים
- דוחות התקדמות

## פיתוח

### כללי קוד
- שמירה על מבנה מודולרי
- שימוש ב-TypeScript
- עיצוב responsive
- תמיכה בעברית

### עבודה עם Git
```bash
# לפני התחלת עבודה
git pull origin main

# אחרי סיום עבודה
git add .
git commit -m "feat: הוספת תכונה חדשה"
git push origin main
```

### בדיקות
```bash
# בדיקת קוד
npm run lint

# בניית הפרויקט
npm run build

# הרצת בדיקות
npm test
```

## פריסה

### Vercel
1. חיבור הפרויקט ל-Vercel
2. הגדרת משתני סביבה
3. פריסה אוטומטית

### Railway
1. חיבור הפרויקט ל-Railway
2. הגדרת PostgreSQL
3. הגדרת משתני סביבה
4. פריסה

## תרומה לפרויקט

1. Fork הפרויקט
2. יצירת branch חדש
3. ביצוע השינויים
4. יצירת Pull Request

## רישיון

MIT License

## תמיכה

לשאלות ותמיכה, פנה אל:
- Email: support@company.com
- GitHub Issues: [Repository Issues]

---

**גרסה**: 1.0.0  
**עדכון אחרון**: 2024


