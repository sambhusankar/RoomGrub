'use client'
import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import CircularProgress from '@mui/joy/CircularProgress'
import { apiCall } from '@/utils/api'

export default function LoginBtn({ inviteToken }) {
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSuccess = async (credentialResponse) => {
        try {
            setError(null)
            setLoading(true)
            await apiCall('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ provider: 'google', token: credentialResponse.credential }),
            })

            if (inviteToken) {
                try {
                    const invite = await apiCall(`/api/invites/${inviteToken}/accept`, { method: 'POST' })
                    if (invite?.room_id) {
                        window.location.href = `/${invite.room_id}`
                        return
                    }
                } catch {
                    // invite failed, just go home
                }
            }

            window.location.href = '/rooms'
        } catch {
            setLoading(false)
            setError('Login failed. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center gap-3">
                <CircularProgress size="md" />
                <p className="text-sm text-gray-500">Signing you in…</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError('Google login failed. Please try again.')}
                useOneTap
                use_fedcm_for_prompt
                use_fedcm_for_button
                itp_support
                auto_select={false}
                cancel_on_tap_outside={false}
                theme="outline"
                shape="pill"
                size="large"
                text="signin_with"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    )
}
