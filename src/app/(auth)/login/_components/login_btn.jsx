'use client'
import { GoogleLogin } from '@react-oauth/google'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { apiCall } from '@/utils/api'

export default function LoginBtn({ inviteToken }) {
    const router = useRouter()
    const [error, setError] = useState(null)

    const handleSuccess = async (credentialResponse) => {
        try {
            setError(null)
            await apiCall('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ provider: 'google', token: credentialResponse.credential }),
            })

            if (inviteToken) {
                try {
                    const invite = await apiCall(`/api/invites/${inviteToken}/accept`, { method: 'POST' })
                    if (invite?.room_id) {
                        router.refresh()
                        router.push(`/${invite.room_id}`)
                        return
                    }
                } catch {
                    // invite failed, just go home
                }
            }

            router.refresh()
            router.push('/')
        } catch {
            setError('Login failed. Please try again.')
        }
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError('Google login failed. Please try again.')}
                theme="outline"
                shape="pill"
                size="large"
                text="signin_with"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    )
}
