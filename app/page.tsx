export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full text-center text-white shadow-2xl">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">🏢 מערכת ERP</h1>
          <p className="text-xl mb-2">מערכת ניהול משאבי ארגון מתקדמת</p>
          <p className="text-lg opacity-90">בנויה עם Next.js, TypeScript, ו-Prisma</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-semibold mb-2">אנשי קשר</h3>
            <p className="text-sm opacity-80">ניהול אנשי קשר ומעקב</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl mb-2">🏭</div>
            <h3 className="font-semibold mb-2">ייצור</h3>
            <p className="text-sm opacity-80">ניהול פרויקטים ומשימות</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl mb-2">👨‍💼</div>
            <h3 className="font-semibold mb-2">משאבי אנוש</h3>
            <p className="text-sm opacity-80">ניהול עובדים ומחלקות</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <a 
            href="/dashboard" 
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            התחל לעבוד
          </a>
          <p className="text-sm opacity-70">
            גרסה: 1.0.0 | עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
          </p>
        </div>
      </div>
    </div>
  )
}


