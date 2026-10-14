'server-only'
import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import { backendCall, backendJson } from '@/utils/backend'
import { ACCESS_TOKEN_HEADER, REFRESH_COOKIE, USER_COOKIE } from '@/auth/constants'

function decodeJWT(token) {
    try {
        const payload = token.split('.')[1]
        return JSON.parse(Buffer.from(payload, 'base64url').toString())
    } catch {
        return null
    }
}

export const auth = cache(async () => {
    const token = (await headers()).get(ACCESS_TOKEN_HEADER)
    if (!token) return null

    const payload = decodeJWT(token)
    if (!payload || payload.exp * 1000 < Date.now()) return null

    let userInfo = {}
    try {
        const raw = (await cookies()).get(USER_COOKIE)?.value
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
        const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value
        if (refreshToken) {
            // Revoke the session on the backend; still sign out locally if that fails.
            try {
                await backendCall('/api/v1/auth/logout', {
                    method: 'POST',
                    body: JSON.stringify({ refresh_token: refreshToken }),
                })
            } catch { /* ignore */ }
        }
        cookieStore.delete(REFRESH_COOKIE)
        cookieStore.delete(USER_COOKIE)
        return true
    } catch {
        return false
    }
}
