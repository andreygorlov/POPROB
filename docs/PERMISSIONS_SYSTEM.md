# מערכת הרשאות מתקדמת - מדריך מפורט

## 🎯 **סקירה כללית**

מערכת ההרשאות שלנו מספקת בקרת גישה מפורטת לכל מודול במערכת ERP. המערכת תומכת ב:
- **הרשאות מפורטות** לכל פעולה ומשאב
- **תפקידים היררכיים** עם רמות שונות
- **הרשאות ישירות למשתמשים** (עוקפות תפקידים)
- **לוג אודיט** של כל שינוי הרשאה
- **תמיכה ב-multi-tenant** לעתיד

## 🏗️ **מבנה הנתונים**

### **מודולים (Modules)**
```typescript
interface Module {
  id: string
  name: string        // e.g., "contacts", "production"
  label: string        // "אנשי קשר", "ייצור"
  description?: string
  icon?: string        // "👥", "🏭"
  order: number       // סדר תצוגה
  isActive: boolean
}
```

### **הרשאות (Permissions)**
```typescript
interface Permission {
  id: string
  name: string        // "contacts.create", "production.view"
  label: string       // "יצירת אנשי קשר"
  action: string      // CREATE, READ, UPDATE, DELETE, EXPORT, IMPORT, APPROVE, REJECT
  resource: string    // "contacts", "orders", "invoices"
  moduleId: string
  isSystem: boolean   // הרשאות מערכת לא ניתן למחוק
}
```

### **תפקידים (Roles)**
```typescript
interface Role {
  id: string
  name: string        // "ADMIN", "MANAGER", "EMPLOYEE"
  label: string       // "מנהל מערכת", "מנהל", "עובד"
  level: number       // 0-100 (היררכיה)
  isSystem: boolean   // תפקידי מערכת
}
```

## 🔧 **שימוש במערכת**

### **1. PermissionGuard Component**

```tsx
import { PermissionGuard } from '@/components/permissions/permission-guard'

// הרשאה בסיסית
<PermissionGuard permission="contacts.create" userId={userId}>
  <Button>הוסף איש קשר</Button>
</PermissionGuard>

// הרשאות מרובות (אחת מהן)
<PermissionGuard 
  permissions={['contacts.create', 'contacts.update']}
  requireAll={false}
  userId={userId}
>
  <Button>ערוך או צור</Button>
</PermissionGuard>

// הרשאות מרובות (כולן נדרשות)
<PermissionGuard 
  permissions={['contacts.create', 'contacts.update', 'contacts.delete']}
  requireAll={true}
  userId={userId}
>
  <Button>ניהול מלא</Button>
</PermissionGuard>

// Fallback מותאם
<PermissionGuard 
  permission="contacts.delete" 
  userId={userId}
  fallback={<div>אין הרשאה</div>}
>
  <Button>מחק</Button>
</PermissionGuard>
```

### **2. usePermissions Hook**

```tsx
import { usePermissions } from '@/components/permissions/permission-guard'

function MyComponent({ userId }) {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    checkPermission,
    checkMultiplePermissions 
  } = usePermissions(userId)

  // בדיקות בסיסיות
  const canCreate = hasPermission('contacts.create')
  const canEdit = hasPermission('contacts.update')
  
  // בדיקות מתקדמות
  const canManage = hasAllPermissions(['contacts.create', 'contacts.update', 'contacts.delete'])
  const canViewOrEdit = hasAnyPermission(['contacts.read', 'contacts.update'])

  // בדיקות דינמיות
  const checkUserPermission = async () => {
    const hasAccess = await checkPermission('contacts.create')
    if (hasAccess) {
      // המשך עם הפעולה
    }
  }

  return (
    <div>
      {canCreate && <Button>צור</Button>}
      {canEdit && <Button>ערוך</Button>}
      {canManage && <Button>נהל</Button>}
    </div>
  )
}
```

### **3. API Routes**

#### **בדיקת הרשאה**
```typescript
// POST /api/permissions/check
const response = await fetch('/api/permissions/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    permission: 'contacts.create',
    resource: 'specific-resource-id', // אופציונלי
    clientId: 'default'
  })
})

const { hasPermission, source } = await response.json()
```

#### **בדיקת הרשאות מרובות**
```typescript
// PUT /api/permissions/check
const response = await fetch('/api/permissions/check', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    permissions: ['contacts.create', 'contacts.update'],
    clientId: 'default'
  })
})

const { permissions } = await response.json()
// permissions: [{ permission: 'contacts.create', hasPermission: true, source: 'role' }]
```

## 📋 **הרשאות מוגדרות מראש**

### **מודולים**
- **אנשי קשר** (contacts) - ניהול אנשי קשר, חברות וספקים
- **ייצור** (production) - פרויקטים, משימות ותחנות עבודה
- **מוצרים** (products) - מוצרים, חומרי גלם ומלאי
- **מכירות** (sales) - הצעות מחיר והזמנות
- **רכש** (purchasing) - הזמנות רכש וספקים
- **הנהלת חשבונות** (accounting) - חשבוניות ותשלומים
- **משאבי אנוש** (hr) - עובדים, שכר ונוכחות
- **דוחות** (reports) - דוחות וניתוח נתונים
- **הגדרות** (settings) - הגדרות מערכת

### **פעולות**
- **CREATE** - יצירה
- **READ** - צפייה
- **UPDATE** - עריכה
- **DELETE** - מחיקה
- **EXPORT** - ייצוא
- **IMPORT** - ייבוא
- **APPROVE** - אישור
- **REJECT** - דחייה

### **תפקידים**
- **ADMIN** (רמה 100) - מנהל מערכת - גישה מלאה
- **MANAGER** (רמה 75) - מנהל - ניהול צוותים
- **EMPLOYEE** (רמה 50) - עובד - גישה סטנדרטית
- **CLIENT** (רמה 25) - לקוח - גישה מוגבלת

## 🚀 **התקנה ואתחול**

### **1. הרצת אתחול**
```bash
# Windows
scripts/init-permissions.bat

# Linux/Mac
chmod +x scripts/init-permissions.sh
./scripts/init-permissions.sh
```

### **2. בדיקת התקנה**
```bash
# בדיקה שהמודולים נוצרו
curl "http://localhost:3000/api/modules"

# בדיקה שההרשאות נוצרו
curl "http://localhost:3000/api/permissions"

# בדיקה שהתפקידים נוצרו
curl "http://localhost:3000/api/roles"
```

## 🔒 **אבטחה**

### **עקרונות אבטחה**
1. **הרשאות ברירת מחדל** - משתמשים מתחילים ללא הרשאות
2. **עקרון הפחות הרשאות** - רק מה שנדרש
3. **לוג אודיט** - כל שינוי הרשאה נרשם
4. **הרשאות זמניות** - אפשרות להגדיר תאריך תפוגה
5. **הרשאות מפורשות** - משתמש יכול לקבל הרשאה ישירה

### **בדיקות אבטחה**
```typescript
// תמיד בדוק הרשאות בצד השרת
export async function POST(request: Request) {
  const { userId, permission } = await request.json()
  
  // בדוק הרשאה
  const hasPermission = await checkUserPermission(userId, permission)
  if (!hasPermission) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  
  // המשך עם הפעולה
}
```

## 📊 **ניטור ודיווח**

### **לוג אודיט**
```typescript
// כל שינוי הרשאה נרשם ב-PermissionAudit
interface PermissionAudit {
  id: string
  userId: string
  permissionId: string
  action: 'GRANTED' | 'DENIED' | 'REVOKED'
  resource?: string
  resourceId?: string
  reason?: string
  ipAddress?: string
  userAgent?: string
  createdAt: DateTime
}
```

### **דוחות הרשאות**
- רשימת הרשאות למשתמש
- הרשאות לפי תפקיד
- הרשאות לפי מודול
- היסטוריית שינויים

## 🔄 **תחזוקה**

### **ניקוי הרשאות**
```typescript
// מחיקת הרשאות לא בשימוש
await prisma.permission.deleteMany({
  where: {
    _count: {
      rolePermissions: 0,
      userPermissions: 0
    }
  }
})
```

### **עדכון הרשאות**
```typescript
// הוספת הרשאה חדשה למודול
await prisma.permission.create({
  data: {
    name: 'contacts.export',
    label: 'ייצוא אנשי קשר',
    moduleId: contactsModuleId,
    action: 'EXPORT',
    resource: 'contacts',
    clientId: 'default'
  }
})
```

## 🎯 **דוגמאות מעשיות**

### **1. עמוד אנשי קשר**
```tsx
function ContactsPage() {
  return (
    <div>
      <PermissionGuard permission="contacts.read" userId={userId}>
        <ContactsList />
      </PermissionGuard>
      
      <PermissionGuard permission="contacts.create" userId={userId}>
        <Button>הוסף איש קשר</Button>
      </PermissionGuard>
    </div>
  )
}
```

### **2. טופס עריכה**
```tsx
function EditContactForm({ contactId }) {
  const { hasPermission } = usePermissions(userId)
  
  if (!hasPermission('contacts.update')) {
    return <div>אין הרשאה לעריכה</div>
  }
  
  return <ContactForm contactId={contactId} />
}
```

### **3. תפריט דינמי**
```tsx
function NavigationMenu() {
  const { hasPermission } = usePermissions(userId)
  
  return (
    <nav>
      {hasPermission('contacts.read') && (
        <Link href="/contacts">אנשי קשר</Link>
      )}
      {hasPermission('production.read') && (
        <Link href="/production">ייצור</Link>
      )}
      {hasPermission('settings.read') && (
        <Link href="/settings">הגדרות</Link>
      )}
    </nav>
  )
}
```

## 🚨 **טיפים חשובים**

1. **תמיד בדוק הרשאות בצד השרת** - לא רק בצד הלקוח
2. **השתמש ב-PermissionGuard** לקומפוננטים שלמים
3. **השתמש ב-usePermissions** לבדיקות דינמיות
4. **תעד את כל ההרשאות** במסמכי המערכת
5. **בדוק הרשאות באופן קבוע** עם דוחות אבטחה
6. **השתמש בהרשאות זמניות** לפרויקטים קצרי טווח
7. **נקה הרשאות לא בשימוש** באופן קבוע

---

**מערכת ההרשאות שלנו מספקת בקרת גישה מפורטת ובטוחה לכל מודול במערכת ERP!** 🎉
