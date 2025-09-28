import { ChatInterface } from '@/components/chat/chat-interface'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">צ'אט</h1>
          <p className="text-gray-600 mt-2">
            תקשורת פנימית בין משתמשי המערכת
          </p>
        </div>
        
        <ChatInterface />
      </div>
    </DashboardLayout>
  )
}
