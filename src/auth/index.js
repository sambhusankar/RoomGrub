'server-only'
import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'

// React's cache() ensures this only runs once per request
export const auth = cache(async () => {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
        console.error("Error fetching session:", error)
        return null
    }
    if (!session) {
        return null
    }

    return session
})

// Cache user room data to avoid duplicate DB queries
export const getUserRoom = cache(async (email) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Users')
        .select('room, role')
        .eq('email', email)
        .single()
    return { data, error }
})

export const signOut = async () => {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error("Error signing out:", error)
        return false
    }
    return true
}