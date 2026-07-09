'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { backendJson } from '@/utils/backend'

function decodeJWT(token) {
    try {
        const payload = token.split('.')[1]
        return JSON.parse(Buffer.from(payload, 'base64url').toString())
    } catch {
        return null
    }
}

export const auth = cache(async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get('rg_token')?.value
    if (!token) return null

    const payload = decodeJWT(token)
    if (!payload || payload.exp * 1000 < Date.now()) return null

    let userInfo = {}
    try {
        const raw = cookieStore.get('rg_user')?.value
        if (raw) userInfo = JSON.parse(raw)
    } catch { /* ignore */ }

    return {
        user: {
            id: payload.sub,
            email: payload.email,
            name: userInfo.name || '',
            profile: userInfo.profile || null,
        }
    }
})

export const getUserRoomForRoom = cache(async (email, roomId) => {
    try {
        const members = await backendJson(`/api/v1/rooms/${roomId}/members`)
        const membership = members.find(m => m.email === email)
        if (!membership) return { data: null, error: 'Not a member' }
        return { data: { room_id: parseInt(roomId), role: membership.role }, error: null }
    } catch (err) {
        return { data: null, error: err.detail || 'Failed to fetch membership' }
    }
})

export const signOut = async () => {
    try {
        const cookieStore = await cookies()
        cookieStore.delete('rg_token')
        cookieStore.delete('rg_user')
        return true
    } catch {
        return false
    }
}
