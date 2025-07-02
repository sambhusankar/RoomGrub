'server-only'
import { createClient } from '@/utils/supabase/server'

export const auth = async () => {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
        console.error("Error fetching session:", error)
        return null
    }
    if (!session) {
        console.log("No session found")
        return null
    }
    
    return session
}

export const signOut = async () => {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error("Error signing out:", error)
        return false
    }
    return true
}