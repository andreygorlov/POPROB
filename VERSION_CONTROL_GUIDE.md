# 🔄 מדריך מערכת ניהול גרסאות ERP

## סקירה כללית

מערכת ניהול הגרסאות שלנו מספקת בקרה מלאה על כל שינוי במערכת, עם אפשרויות שחזור מתקדמות וגיבויים אוטומטיים.

## 🚀 התחלה מהירה

### התקנת תלויות
```bash
npm install
```

### הפעלת ממשק המשתמש
```bash
npm run version:ui
```

## 📋 פקודות זמינות

### ניהול גרסאות
```bash
# יצירת נקודת שחזור
npm run version:checkpoint "תיאור השינוי"

# הצגת נקודות שחזור
npm run version:list

# שחזור לגרסה קודמת
npm run version:restore v1.2.3

# השוואת גרסאות
npm run version:compare v1.0.0 v1.1.0

# יצירת גיבוי
npm run version:backup

# יצוא גרסה
npm run version:export v1.2.3 zip

# ניקוי גרסאות ישנות
npm run version:cleanup 30

# הצגת סטטוס
npm run version:status
```

### ניהול גיבויים
```bash
# יצירת גיבוי
npm run backup:create manual

# הצגת גיבויים
npm run backup:list

# שחזור מגיבוי
npm run backup:restore backup-name

# התחלת גיבויים אוטומטיים
npm run backup:start

# עצירת גיבויים אוטומטיים
npm run backup:stop

# הצגת סטטיסטיקות
npm run backup:stats
```

### ניטור שינויים
```bash
# התחלת ניטור
npm run monitor:start

# עצירת ניטור
npm run monitor:stop

# הצגת דוח שינויים
npm run monitor:status

# יצירת נקודת שחזור אוטומטית
npm run monitor:checkpoint "תיאור"
```

## 🎯 תכונות מתקדמות

### 1. ניהול גרסאות אוטומטי
- **תגיות Git**: כל נקודת שחזור מקבלת תגית Git
- **מטא-דאטה**: שמירת מידע מפורט על כל גרסה
- **השוואות**: השוואה ויזואלית בין גרסאות

### 2. גיבויים אוטומטיים
- **תזמון**: גיבויים אוטומטיים לפי לוח זמנים
- **דחיסה**: גיבויים דחוסים לחיסכון במקום
- **ניקוי אוטומטי**: מחיקת גיבויים ישנים

### 3. ניטור שינויים
- **מעקב בזמן אמת**: ניטור כל שינוי בקבצים
- **דוחות מפורטים**: סטטיסטיקות מפורטות על שינויים
- **נקודות שחזור אוטומטיות**: יצירה אוטומטית של נקודות שחזור

## 📊 דוגמאות שימוש

### תרחיש 1: פיתוח תכונה חדשה
```bash
# 1. התחלת ניטור
npm run monitor:start

# 2. פיתוח התכונה
# ... עובד על הקוד ...

# 3. יצירת נקודת שחזור
npm run version:checkpoint "הוספת מודול משתמשים חדש"

# 4. המשך פיתוח
# ... עובד על הקוד ...

# 5. יצירת נקודת שחזור נוספת
npm run version:checkpoint "הוספת אימות משתמשים"
```

### תרחיש 2: תיקון באג
```bash
# 1. זיהוי הבעיה
npm run version:status

# 2. שחזור לגרסה יציבה
npm run version:restore v1.2.3

# 3. תיקון הבעיה
# ... מתקן את הקוד ...

# 4. יצירת נקודת שחזור לתיקון
npm run version:checkpoint "תיקון באג בהתחברות משתמשים"
```

### תרחיש 3: גיבוי ושחזור
```bash
# 1. יצירת גיבוי לפני שינוי גדול
npm run backup:create "לפני שינוי מסד נתונים"

# 2. ביצוע השינוי
# ... משנה את מסד הנתונים ...

# 3. בדיקה שהכל עובד
npm run version:status

# 4. אם יש בעיה - שחזור מגיבוי
npm run backup:restore backup-name
```

## ⚙️ הגדרות מתקדמות

### הגדרות גיבוי
```bash
# עדכון הגדרות גיבוי
node scripts/auto-backup.js config retentionDays 60
node scripts/auto-backup.js config maxBackups 20
node scripts/auto-backup.js config compression true
```

### הגדרות ניטור
```bash
# התחלת ניטור עם הגדרות מותאמות
node scripts/change-monitor.js start
```

## 🔧 פתרון בעיות

### בעיה: שגיאה ב-Git
```bash
# בדיקת סטטוס Git
git status

# תיקון בעיות Git
git add .
git commit -m "Fix: תיקון בעיות Git"
```

### בעיה: גיבוי לא נוצר
```bash
# בדיקת הרשאות
ls -la backups/

# יצירת תיקיית גיבויים
mkdir -p backups
```

### בעיה: ניטור לא עובד
```bash
# בדיקת תהליכים
ps aux | grep node

# עצירת ניטור ישן
npm run monitor:stop
npm run monitor:start
```

## 📈 מומלצות

### 1. שגרת עבודה יומית
- התחלת ניטור בבוקר
- יצירת נקודת שחזור בסוף יום
- גיבוי שבועי

### 2. לפני שינויים גדולים
- יצירת גיבוי מלא
- יצירת נקודת שחזור
- תיעוד השינויים

### 3. אחרי שינויים
- בדיקת סטטוס
- יצירת נקודת שחזור
- עדכון תיעוד

## 🚨 אזהרות חשובות

### ⚠️ לפני שחזור
- תמיד יצור גיבוי לפני שחזור
- בדוק שהגרסה קיימת
- שמור על העבודה הנוכחית

### ⚠️ ניקוי גרסאות
- בדוק שהגרסאות לא נדרשות
- שמור גיבויים חשובים
- עדכן תיעוד

### ⚠️ גיבויים
- בדוק שהגיבויים תקינים
- שמור גיבויים במקום בטוח
- בדוק תקינות באופן קבוע

## 📞 תמיכה

אם נתקלת בבעיות:
1. בדוק את הלוגים
2. הרץ `npm run version:status`
3. בדוק את הגדרות Git
4. פנה לתמיכה טכנית

---

**זכור**: מערכת ניהול הגרסאות היא כלי עזר חשוב, אבל לא תחליף לחשיבה זהירה ולבדיקות מקיפות!
