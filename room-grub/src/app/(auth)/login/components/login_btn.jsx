'use client'
import Button from '@mui/material/Button'
import { FcGoogle } from 'react-icons/fc';
import { createClient } from '@/utils/supabase/client';
export default function LoginBtn() {
    const supabase = createClient()
    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/callback`
            }
        });
    };
    return (
        <Button
            sx={{
                color: 'black',
                background: 'white',
                padding: 0.5,
                borderRadius: 2,
                fontSize: '18px'
            }}
            onClick={signInWithGoogle}
        >
            <FcGoogle style={{ marginRight: '8px' }} />
            Login with Google
        </Button>
    );
}
