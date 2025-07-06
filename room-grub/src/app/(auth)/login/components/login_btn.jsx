'use client'
import Button from '@mui/material/Button'
import { FcGoogle } from 'react-icons/fc';
import { createClient } from '@/utils/supabase/client';
export default function LoginBtn() {
    const site_url = process.env.NEXT_PUBLIC_SITE_URL;
    const supabase = createClient()
    const signInWithGoogle = async () => {
        console.log(site_url);
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${site_url}/callback`
            }
        });
    };
    return (
        <Button
            sx={{
                color: 'black',
                background: 'white',
                px: 4,
                py: 0.8,
                borderRadius: 3.5,
                fontSize: '18px',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                fontWeight: 900,
                textTransform: 'none'
            }}
            onClick={signInWithGoogle}
        >
            <FcGoogle style={{ marginRight: '8px' }} />
            Login with Google
        </Button>
    );
}
