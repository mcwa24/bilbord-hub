import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    if (!url || !key) {
      // Return a mock client that won't crash
      return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
    }

    return createBrowserClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error: any) {
    // Return a mock client that won't crash
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }
}

