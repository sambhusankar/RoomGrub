'use client'
import Button from '@mui/material/Button'
import { FcGoogle } from 'react-icons/fc';
import signInWithGoogle from './action.js';
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
            onClick={signInwithGoogle}
        >
            <FcGoogle style={{ marginRight: '8px' }} />
            Login with Google
        </Button>
    );
}
