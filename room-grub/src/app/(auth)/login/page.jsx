import React from 'react';
import Box from '@mui/material/Box';

import Image from 'next/image'
import LoginBtn from './components/login_btn'


export default async function Login(){
    return (
        <div className="min-w-screen flex justify-center items-center bg-gray-50">
            <Box
                sx={{
                    width: { xs: '90vw', sm: '400px', md: '400px' },
                    maxWidth: '95vw',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    p: { xs: 2, sm: 4 },
                    borderRadius: 2,
                    boxShadow: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Image
                    src="/logo.png"
                    width={300}
                    height={150}
                    className="w-full max-w-xs h-auto mb-6"
                    alt="Logo"
                    priority
                />
                <LoginBtn />
            </Box>
        </div>
    );
}