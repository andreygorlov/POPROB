# מערכת הרשאות פשוטה - מדריך מפורט

## 🎯 **סקירה כללית**

מערכת ההרשאות הפשוטה שלנו מספקת בקרת גישה מבוססת תפקידים לכל מודול במערכת ERP. המערכת תומכת ב:
- **הרשאות מבוססות תפקידים** - כל תפקיד מקבל הרשאות מוגדרות מראש
- **בדיקות פשוטות** - API קל לשימוש
- **רכיבי UI** - PermissionGuard ו-Hook מובנים
- **תמיכה ב-multi-tenant** לעתיד

## 🏗️ **מבנה התפקידים**

### **תפקידים זמינים**
```typescript
interface Role {
  ADMIN:    // מנהל מערכת - גישה מלאה (רמה 100)
  MANAGER:  // מנהל - ניהול צוותים (רמה 75)
  EMPLOYEE: // עובד - גישה סטנדרטית (רמה 50)
  CLIENT:   // לקוח - גישה מוגבלת (רמה 25)
}
```

### **מודולים זמינים**
- **contacts** - אנשי קשר
- **production** - ייצור
- **products** - מוצרים
- **sales** - מכירות
- **purchasing** - רכש
- **accounting** - הנהלת חשבונות
- **hr** - משאבי אנוש
- **reports** - דוחות
- **settings** - הגדרות

### **פעולות זמינות**
- **create** - יצירה
- **read** - צפייה
- **update** - עריכה
- **delete** - מחיקה
- **export** - ייצוא
- **import** - ייבוא
- **approve** - אישור

## 🔧 **שימוש במערכת**

### **1. SimplePermissionGuard Component**

```tsx
import { SimplePermissionGuard } from '@/components/permissions/simple-permission-guard'

// הרשאה בסיסית
<SimplePermissionGuard permission="contacts.create" userId={userId}>
  <Button>הוסף איש קשר</Button>
</SimplePermissionGuard>

// הרשאות מרובות (אחת מהן)
<SimplePermissionGuard 
  permissions={['contacts.create', 'contacts.update']}
  requireAll={false}
  userId={userId}
>
  <Button>ערוך או צור</Button>
</SimplePermissionGuard>

// הרשאות מרובות (כולן נדרשות)
<SimplePermissionGuard 
  permissions={['contacts.create', 'contacts.update', 'contacts.delete']}
  requireAll={true}
  userId={userId}
>
  <Button>ניהול מלא</Button>
</SimplePermissionGuard>

// Fallback מותאם
<SimplePermissionGuard 
  permission="contacts.delete" 
  userId={userId}
  fallback={<div>אין הרשאה</div>}
>
  <Button>מחק</Button>
</SimplePermissionGuard>
```

### **2. useSimplePermissions Hook**

```tsx
import { useSimplePermissions } from '@/components/permissions/simple-permission-guard'

function MyComponent({ userId }) {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    checkPermission,
    checkMultiplePermissions 
  } = useSimplePermissions(userId)

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
// POST /api/permissions/simple
const response = await fetch('/api/permissions/simple', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    permission: 'contacts.create',
    clientId: 'default'
  })
})

const { hasPermission, role, source } = await response.json()
```

#### **קבלת הרשאות לפי תפקיד**
```typescript
// GET /api/permissions/simple?role=ADMIN
const response = await fetch('/api/permissions/simple?role=ADMIN')
const { role, permissions, count } = await response.json()
```

## 📋 **הרשאות לפי תפקיד**

### **ADMIN (מנהל מערכת)**
- **גישה מלאה** לכל המודולים
- **כל הפעולות** זמינות
- **ניהול משתמשים** והרשאות
- **הגדרות מערכת**

### **MANAGER (מנהל)**
- **ניהול צוותים** ומחלקות
- **יצירה, עריכה, מחיקה** בכל המודולים
- **אישור** פעולות חשובות
- **ייצוא** דוחות

### **EMPLOYEE (עובד)**
- **יצירה ועריכה** של רשומות
- **צפייה** בכל הנתונים
- **לא יכול למחוק** רשומות חשובות
- **גישה מוגבלת** להגדרות

### **CLIENT (לקוח)**
- **צפייה בלבד** בנתונים רלוונטיים
- **לא יכול ליצור** או לערוך
- **גישה מוגבלת** למודולים

## 🚀 **התקנה ושימוש**

### **1. הוספה לעמוד**
```tsx
import { SimplePermissionGuard } from '@/components/permissions/simple-permission-guard'

function ContactsPage({ userId }) {
  return (
    <div>
      <SimplePermissionGuard permission="contacts.read" userId={userId}>
        <ContactsList />
      </SimplePermissionGuard>
      
      <SimplePermissionGuard permission="contacts.create" userId={userId}>
        <Button>הוסף איש קשר</Button>
      </SimplePermissionGuard>
    </div>
  )
}
```

### **2. שימוש ב-Hook**
```tsx
import { useSimplePermissions } from '@/components/permissions/simple-permission-guard'

function NavigationMenu({ userId }) {
  const { hasPermission } = useSimplePermissions(userId)
  
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

### **3. בדיקת הרשאות בצד השרת**
```typescript
// app/api/contacts/route.ts
export async function POST(request: Request) {
  const { userId } = await request.json()
  
  // בדוק הרשאה
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/permissions/simple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      permission: 'contacts.create',
      clientId: 'default'
    })
  })
  
  const { hasPermission } = await response.json()
  
  if (!hasPermission) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  
  // המשך עם הפעולה
}
```

## 🎯 **דוגמאות מעשיות**

### **1. עמוד אנשי קשר**
```tsx
function ContactsPage({ userId }) {
  return (
    <div>
      <SimplePermissionGuard permission="contacts.read" userId={userId}>
        <ContactsList />
      </SimplePermissionGuard>
      
      <div className="flex space-x-2">
        <SimplePermissionGuard permission="contacts.create" userId={userId}>
          <Button>הוסף איש קשר</Button>
        </SimplePermissionGuard>
        
        <SimplePermissionGuard permission="contacts.export" userId={userId}>
          <Button variant="outline">ייצא</Button>
        </SimplePermissionGuard>
      </div>
    </div>
  )
}
```

### **2. טופס עריכה**
```tsx
function EditContactForm({ contactId, userId }) {
  const { hasPermission } = useSimplePermissions(userId)
  
  if (!hasPermission('contacts.update')) {
    return <div>אין הרשאה לעריכה</div>
  }
  
  return <ContactForm contactId={contactId} />
}
```

### **3. תפריט דינמי**
```tsx
function NavigationMenu({ userId }) {
  const { hasPermission } = useSimplePermissions(userId)
  
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

### **4. כפתורי פעולה**
```tsx
function ContactActions({ contactId, userId }) {
  const { hasPermission } = useSimplePermissions(userId)
  
  return (
    <div className="flex space-x-2">
      {hasPermission('contacts.update') && (
        <Button variant="outline">ערוך</Button>
      )}
      {hasPermission('contacts.delete') && (
        <Button variant="destructive">מחק</Button>
      )}
      {hasPermission('contacts.export') && (
        <Button variant="secondary">ייצא</Button>
      )}
    </div>
  )
}
```

## 🔒 **אבטחה**

### **עקרונות אבטחה**
1. **בדיקה בצד השרת** - תמיד בדוק הרשאות ב-API
2. **ברירת מחדל שלילית** - משתמשים מתחילים ללא הרשאות
3. **תפקידים היררכיים** - תפקידים גבוהים יותר מקבלים יותר הרשאות
4. **הרשאות מפורשות** - כל הרשאה מוגדרת במפורש

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

### **בדיקת הרשאות משתמש**
```typescript
// GET /api/permissions/simple?role=ADMIN
const response = await fetch('/api/permissions/simple?role=ADMIN')
const { role, permissions, count } = await response.json()

console.log(`תפקיד: ${role}`)
console.log(`הרשאות: ${count}`)
console.log(`רשימה: ${permissions.join(', ')}`)
```

### **בדיקת הרשאה ספציפית**
```typescript
// POST /api/permissions/simple
const response = await fetch('/api/permissions/simple', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    permission: 'contacts.create'
  })
})

const { hasPermission, role, source } = await response.json()
console.log(`הרשאה: ${hasPermission}`)
console.log(`תפקיד: ${role}`)
console.log(`מקור: ${source}`)
```

## 🚨 **טיפים חשובים**

1. **תמיד בדוק הרשאות בצד השרת** - לא רק בצד הלקוח
2. **השתמש ב-SimplePermissionGuard** לקומפוננטים שלמים
3. **השתמש ב-useSimplePermissions** לבדיקות דינמיות
4. **תעד את כל ההרשאות** במסמכי המערכת
5. **בדוק הרשאות באופן קבוע** עם דוחות אבטחה
6. **השתמש בהרשאות מפורשות** לכל פעולה חשובה
7. **נקה הרשאות לא בשימוש** באופן קבוע

## 🔄 **תחזוקה**

### **הוספת הרשאה חדשה**
```typescript
// הוסף הרשאה חדשה ל-API
const newPermission = 'contacts.approve'

// הוסף לתפקיד המתאים
const managerPermissions = [
  // ... הרשאות קיימות
  'contacts.approve'
]
```

### **הוספת מודול חדש**
```typescript
// הוסף מודול חדש
const newModule = 'inventory'

// הוסף הרשאות לכל התפקידים
const adminPermissions = [
  // ... הרשאות קיימות
  'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete'
]
```

---

**מערכת ההרשאות הפשוטה שלנו מספקת בקרת גישה מבוססת תפקידים לכל מודול במערכת ERP!** 🎉
