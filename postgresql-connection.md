# PostgreSQL Connection Setup

## פרטי החיבור

PostgreSQL הותקן בהצלחה! עכשיו צריך להגדיר את החיבור.

### ברירת מחדל:
- **משתמש**: postgres
- **סיסמה**: (הסיסמה שהגדרת בהתקנה)
- **פורט**: 5432
- **מסד נתונים**: erp_system

### צור קובץ .env:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/erp_system"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

החלף `YOUR_PASSWORD` בסיסמה שיצרת בהתקנת PostgreSQL.

### יצירת מסד נתונים:

אם לא יצרת את מסד הנתונים, תוכל ליצור אותו דרך pgAdmin או:

1. פתח Command Prompt כמנהל
2. הרץ:
```
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres
```
3. בתוך psql, הרץ:
```sql
CREATE DATABASE erp_system;
\q
```

### הפעלת הפרויקט:

```bash
npx prisma generate
npx prisma db push
npm run dev
```
