import { redirect } from 'next/navigation'

export default async function HomePage() {
  // Skip authentication for now - go directly to dashboard
  redirect('/dashboard')
}


