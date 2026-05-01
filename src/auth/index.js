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

// Returns all room memberships for a user — used by the My Rooms dashboard
export const getUserRooms = cache(async (email) => {
    const supabase = await createClient()
    const { data: userRecord, error: userError } = await supabase
        .from('Users')
        .select('id')
        .eq('email', email)
        .single()
    if (userError || !userRecord) return { data: null, error: userError || 'User not found' }

    const { data, error } = await supabase
        .from('UserRooms')
        .select('room_id, role, joined_at, Rooms(id, admin, members, budget)')
        .eq('user_id', userRecord.id)
    return { data, error }
})

// Returns membership for a specific room — used by validRoom policy
export const getUserRoomForRoom = cache(async (email, roomId) => {
    const supabase = await createClient()
    const { data: userRecord, error: userError } = await supabase
        .from('Users')
        .select('id')
        .eq('email', email)
        .single()
    if (userError || !userRecord) return { data: null, error: userError || 'User not found' }

    const { data, error } = await supabase
        .from('UserRooms')
        .select('room_id, role')
        .eq('user_id', userRecord.id)
        .eq('room_id', parseInt(roomId))
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