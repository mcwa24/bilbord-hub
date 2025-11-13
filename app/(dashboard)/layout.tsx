import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/dashboard/login')
    }
  } catch (error) {
    // If Supabase is not configured, redirect to login
    redirect('/dashboard/login')
  }

  return <>{children}</>
}

