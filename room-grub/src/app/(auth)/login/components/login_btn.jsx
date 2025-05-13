'use client'
import { useSession, signIn } from 'next-auth/react'
import Button from '@mui/material/Button'
import { FcGoogle } from 'react-icons/fc';

export default function LoginBtn() {
    const { data: session } = useSession();

    return (
        <Button
            sx={{
                color: 'black',
                background: 'white',
                padding: 0.5,
                borderRadius: 2,
                fontSize: '18px'
            }}
            onClick={() => signIn('google', { callbackUrl: '/create_room' })}
        >
            <FcGoogle style={{ marginRight: '8px' }} />
            Login with Google
        </Button>
    );
}
