export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">לוח בקרה</h1>
          <p className="text-gray-600">סקירה כללית של המערכת ופעילויות אחרונות</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">אנשי קשר</h3>
                <p className="text-gray-600">ניהול אנשי קשר ומעקב</p>
              </div>
            </div>
            <div className="mt-4">
              <a href="/contacts" className="text-blue-600 hover:text-blue-800 font-medium">
                לניהול אנשי קשר →
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🏭</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">ייצור</h3>
                <p className="text-gray-600">ניהול פרויקטים ומשימות</p>
              </div>
            </div>
            <div className="mt-4">
              <a href="/production" className="text-green-600 hover:text-green-800 font-medium">
                לניהול ייצור →
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👨‍💼</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">משאבי אנוש</h3>
                <p className="text-gray-600">ניהול עובדים ומחלקות</p>
              </div>
            </div>
            <div className="mt-4">
              <a href="/hr" className="text-purple-600 hover:text-purple-800 font-medium">
                לניהול משאבי אנוש →
              </a>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">מידע על המערכת</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">טכנולוגיות</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Next.js 14 עם App Router</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Prisma ORM</li>
                <li>• NextAuth</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">תכונות</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• מערכת הרשאות מתקדמת</li>
                <li>• ניהול משתמשים</li>
                <li>• מודולים עסקיים</li>
                <li>• ממשק משתמש מודרני</li>
                <li>• תמיכה בעברית</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-500">
          <p>גרסה: 1.0.0 | מערכת ERP מתקדמת</p>
        </div>
      </div>
    </div>
  )
}


