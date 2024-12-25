'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function addNewAdmin(email: string) {
  try {
    // Use service role client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get user by email using the admin API
    const { data, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('User lookup error:', userError)
      return { error: 'Failed to lookup users' }
    }

    // Find user with matching email
    const user = data.users.find(u => u.email === email)
    
    if (!user) {
      return { error: 'User not found. They must sign up first.' }
    }

    // Check if already an admin
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingAdmin) {
      return { error: 'User is already an admin' }
    }

    // Add to admin_users
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert([
        {
          id: user.id,
          email: user.email || '',
          username: user.user_metadata?.username || user.email?.split('@')[0] || '',
        }
      ])

    if (adminError) {
      console.error('Admin creation error:', adminError)
      return { error: 'Failed to add admin user' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error:', error)
    return { error: 'An unexpected error occurred' }
  }
} 