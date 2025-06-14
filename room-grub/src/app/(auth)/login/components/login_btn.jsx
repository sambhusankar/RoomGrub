'use client'
import Button from '@mui/material/Button'
import { FcGoogle } from 'react-icons/fc';
import { createClient } from '@/utils/supabase/client';
export default function LoginBtn() {
    const site_url = 'https://room-grub.vercel.app' //process.env.NEXT_PUBLIC_SITE_URL;
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
