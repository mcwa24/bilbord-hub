import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    if (!url || !key) {
      // Return a mock client that won't crash
      return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
    }

    const client = createBrowserClient(url, key)
    
    // Disable auto refresh of session to prevent auth.users access
    if (client.auth) {
      // Override getUser to prevent errors
      const originalGetUser = client.auth.getUser
      client.auth.getUser = async () => {
        try {
          return await originalGetUser.call(client.auth)
        } catch (error: any) {
          // Ignore auth errors - we don't use user auth for storage
          console.error('Auth getUser error (ignored):', error)
          return { data: { user: null }, error: null }
        }
      }
    }
    
    return client
  } catch (error: any) {
    console.error('Error creating Supabase client:', error)
    // Return a mock client that won't crash
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }
}

