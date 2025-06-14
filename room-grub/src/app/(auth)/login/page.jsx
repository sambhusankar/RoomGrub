import React from 'react';
import Box from '@mui/material/Box';

import Image from 'next/image'
import LoginBtn from './components/login_btn'


export default async function Login(){
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor="linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)"
            sx={{ mt: 12 }} 
        >
            <Box
                sx={{
                    width: { xs: 340, sm: 400 },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    p: 4,
                    borderRadius: 4,
                    boxShadow: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                }}
            >
                <Box
                    sx={{
                        width: 220,
                        height: 110,
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Image
                        src="/logo.png"
                        width={220}
                        height={110}
                        style={{ width: '100%', height: 'auto' }}
                        alt="Logo"
                        priority
                    />
                </Box>
                <LoginBtn />
            </Box>
        </Box>
    );
}