# מדריך מערכת הרשאות - עריכה וניהול מודולים

## 🎯 **סקירה כללית**

מערכת ההרשאות שלנו מספקת שלוש רמות של ניהול:

1. **מערכת פשוטה** - מבוססת תפקידים (ADMIN, MANAGER, EMPLOYEE, CLIENT)
2. **מערכת מתקדמת** - עריכה מפורטת של הרשאות לכל תפקיד
3. **ניהול מודולים** - הוספת מודולים חדשים עם הרשאות אוטומטיות

## 🔧 **עריכת הרשאות**

### **1. גישה למערכת:**
- לך ל-`/permissions` בתפריט
- בחר בטאב "עריכת הרשאות"
- בחר תפקיד מהרשימה

### **2. עריכת הרשאות לתפקיד:**
```tsx
// בחר תפקיד
<select value={selectedRole} onChange={setSelectedRole}>
  <option value="ADMIN">מנהל מערכת</option>
  <option value="MANAGER">מנהל</option>
  <option value="EMPLOYEE">עובד</option>
  <option value="CLIENT">לקוח</option>
</select>

// ערוך הרשאות
<Switch
  checked={isPermissionGranted(permission.id)}
  onCheckedChange={(checked) => togglePermission(permission.id, checked)}
/>
```

### **3. פעולות זמינות:**
- **הפעל/השבת הרשאה** - Switch לכל הרשאה
- **צפה בהרשאות** - לפי מודול ומשאב
- **שמור שינויים** - כפתור שמירה
- **בדוק סטטוס** - אייקונים ויזואליים

## 📦 **ניהול מודולים**

### **1. הוספת מודול חדש:**
```typescript
// POST /api/modules
{
  "name": "inventory",
  "label": "מלאי",
  "description": "ניהול מלאי ומוצרים",
  "icon": "📦",
  "order": 10
}
```

### **2. הרשאות אוטומטיות:**
כשאתה יוצר מודול חדש, המערכת יוצרת אוטומטית:

#### **פעולות לכל משאב:**
- `CREATE` - יצירה
- `READ` - צפייה  
- `UPDATE` - עריכה
- `DELETE` - מחיקה
- `EXPORT` - ייצוא
- `IMPORT` - ייבוא
- `APPROVE` - אישור

#### **משאבים אוטומטיים:**
- `{moduleName}` - המשאב הראשי
- `{moduleName}_settings` - הגדרות המודול

#### **דוגמה למודול "מלאי":**
```
inventory.create.inventory
inventory.read.inventory
inventory.update.inventory
inventory.delete.inventory
inventory.export.inventory
inventory.import.inventory
inventory.approve.inventory
inventory.create.inventory_settings
inventory.read.inventory_settings
inventory.update.inventory_settings
inventory.delete.inventory_settings
inventory.export.inventory_settings
inventory.import.inventory_settings
inventory.approve.inventory_settings
```

### **3. עריכת מודול קיים:**
- **שם המודול** - לא ניתן לשנות
- **תווית** - שם בעברית
- **תיאור** - הסבר על המודול
- **אייקון** - אייקון לתצוגה
- **סדר תצוגה** - סדר בתפריט

## 🚀 **הוספת מודול חדש למערכת**

### **שלב 1: יצירת המודול**
```typescript
// 1. לך ל-/permissions
// 2. בחר בטאב "ניהול מודולים"
// 3. לחץ "הוסף מודול"
// 4. מלא את הפרטים:
{
  name: "inventory",           // שם באנגלית
  label: "מלאי",              // שם בעברית
  description: "ניהול מלאי",  // תיאור
  icon: "📦",                  // אייקון
  order: 10                   // סדר תצוגה
}
```

### **שלב 2: הרשאות אוטומטיות**
המערכת יוצרת אוטומטית 14 הרשאות:
- 7 פעולות × 2 משאבים = 14 הרשאות

### **שלב 3: הקצאת הרשאות לתפקידים**
```typescript
// 1. לך לטאב "עריכת הרשאות"
// 2. בחר תפקיד (ADMIN, MANAGER, וכו')
// 3. הפעל/השבת הרשאות לפי הצורך
// 4. שמור שינויים
```

### **שלב 4: שימוש במודול החדש**
```tsx
// בעמוד החדש שלך
import { SimplePermissionGuard } from '@/components/permissions/simple-permission-guard'

function InventoryPage({ userId }) {
  return (
    <div>
      <SimplePermissionGuard permission="inventory.read" userId={userId}>
        <InventoryList />
      </SimplePermissionGuard>
      
      <SimplePermissionGuard permission="inventory.create" userId={userId}>
        <Button>הוסף פריט</Button>
      </SimplePermissionGuard>
    </div>
  )
}
```

## 🔒 **הגדרת הרשאות למודול חדש**

### **תפקיד ADMIN:**
- ✅ **כל ההרשאות** - גישה מלאה
- ✅ **ניהול מערכת** - הגדרות ומודולים
- ✅ **הרשאות משתמשים** - ניהול תפקידים

### **תפקיד MANAGER:**
- ✅ **יצירה, עריכה, צפייה** - ניהול מלא
- ✅ **ייצוא, ייבוא** - דוחות ונתונים
- ✅ **אישור** - פעולות חשובות
- ❌ **מחיקה** - רק במקרים מיוחדים

### **תפקיד EMPLOYEE:**
- ✅ **יצירה, עריכה, צפייה** - עבודה יומיומית
- ❌ **מחיקה** - לא מורשה
- ❌ **אישור** - לא מורשה
- ❌ **ייצוא/ייבוא** - לא מורשה

### **תפקיד CLIENT:**
- ✅ **צפייה בלבד** - נתונים רלוונטיים
- ❌ **כל השאר** - לא מורשה

## 📋 **דוגמה מעשית - מודול "מלאי"**

### **1. יצירת המודול:**
```bash
# POST /api/modules
{
  "name": "inventory",
  "label": "מלאי",
  "description": "ניהול מלאי, מוצרים וחומרי גלם",
  "icon": "📦",
  "order": 10
}
```

### **2. הרשאות שנוצרות אוטומטית:**
```
inventory.create.inventory          - יצירת פריט מלאי
inventory.read.inventory            - צפייה בפריטי מלאי
inventory.update.inventory          - עריכת פריט מלאי
inventory.delete.inventory          - מחיקת פריט מלאי
inventory.export.inventory          - ייצוא מלאי
inventory.import.inventory          - ייבוא מלאי
inventory.approve.inventory         - אישור פריט מלאי
inventory.create.inventory_settings - יצירת הגדרות מלאי
inventory.read.inventory_settings   - צפייה בהגדרות מלאי
inventory.update.inventory_settings - עריכת הגדרות מלאי
inventory.delete.inventory_settings - מחיקת הגדרות מלאי
inventory.export.inventory_settings - ייצוא הגדרות מלאי
inventory.import.inventory_settings - ייבוא הגדרות מלאי
inventory.approve.inventory_settings - אישור הגדרות מלאי
```

### **3. הקצאת הרשאות:**
```typescript
// ADMIN - כל ההרשאות
// MANAGER - כל ההרשאות חוץ ממחיקה
// EMPLOYEE - יצירה, עריכה, צפייה
// CLIENT - צפייה בלבד
```

### **4. שימוש במודול:**
```tsx
// app/inventory/page.tsx
import { SimplePermissionGuard } from '@/components/permissions/simple-permission-guard'

export default function InventoryPage({ userId }) {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1>ניהול מלאי</h1>
        
        <SimplePermissionGuard permission="inventory.read" userId={userId}>
          <InventoryList />
        </SimplePermissionGuard>
        
        <SimplePermissionGuard permission="inventory.create" userId={userId}>
          <Button>הוסף פריט מלאי</Button>
        </SimplePermissionGuard>
        
        <SimplePermissionGuard permission="inventory.export" userId={userId}>
          <Button variant="outline">ייצא מלאי</Button>
        </SimplePermissionGuard>
      </div>
    </DashboardLayout>
  )
}
```

## 🎯 **טיפים חשובים**

### **1. תכנון מודול חדש:**
- **שם באנגלית** - ללא רווחים, קטן
- **תווית בעברית** - ברור ומובן
- **תיאור מפורט** - מה המודול עושה
- **אייקון מתאים** - ייצוג ויזואלי
- **סדר הגיוני** - לפי חשיבות

### **2. הרשאות מומלצות:**
- **ADMIN** - כל ההרשאות
- **MANAGER** - יצירה, עריכה, צפייה, ייצוא, אישור
- **EMPLOYEE** - יצירה, עריכה, צפייה
- **CLIENT** - צפייה בלבד

### **3. בדיקת הרשאות:**
```typescript
// תמיד בדוק בצד השרת
const hasPermission = await checkUserPermission(userId, 'inventory.create')
if (!hasPermission) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

### **4. תחזוקה:**
- **בדוק הרשאות** - באופן קבוע
- **נקה הרשאות** - לא בשימוש
- **תעד שינויים** - לוג אודיט
- **בדוק אבטחה** - בדיקות תקופתיות

---

**מערכת ההרשאות שלנו מספקת ניהול מלא וגמיש לכל מודול במערכת ERP!** 🎉
