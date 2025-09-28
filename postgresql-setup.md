# PostgreSQL Setup Guide

## התקנת PostgreSQL

### Windows:
1. הורד PostgreSQL מ: https://www.postgresql.org/download/windows/
2. התקן עם כל ההגדרות ברירת המחדל
3. זכור את הסיסמה שיצרת עבור משתמש postgres

### macOS:
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## יצירת מסד נתונים

```sql
-- התחבר ל-PostgreSQL
psql -U postgres

-- יצירת מסד נתונים
CREATE DATABASE erp_system;

-- יצירת משתמש (אופציונלי)
CREATE USER erp_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE erp_system TO erp_user;
```

## עדכון משתני סביבה

צור קובץ `.env` עם התוכן הבא:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/erp_system"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# App Configuration
NODE_ENV="development"
```

החלף:
- `username` - שם המשתמש שלך
- `password` - הסיסמה שלך
- `erp_system` - שם מסד הנתונים
- `your-secret-key-here` - מפתח סודי (השתמש ב-`openssl rand -base64 32`)

## הפעלת הפרויקט

```bash
# התקנת תלויות
npm install

# יצירת Prisma Client
npx prisma generate

# הרצת migrations
npx prisma db push

# הפעלת השרת
npm run dev
```
