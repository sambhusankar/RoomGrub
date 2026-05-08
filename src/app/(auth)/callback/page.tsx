'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { upsertUser } from './actions'
import { acceptInvite } from '@/app/invite/[token]/actions'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const inviteToken = params.get('invite_token')

      const result = await upsertUser(code ?? undefined)

      if (!result.success) {
        return router.push('/login?message=Authentication failed')
      }

      if (inviteToken) {
        const invite = await acceptInvite(inviteToken)
        if (invite.success) {
          return router.push(`/${invite.roomId}`)
        }
      }

      return router.push('/')
    }

    handleAuth()
  }, [router])

  return <p>Logging in...</p>
}
