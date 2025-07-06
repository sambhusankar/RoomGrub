import React from 'react';
import { Typography, Box } from '@mui/material';

import Image from 'next/image'
import LoginBtn from './components/login_btn'


export default async function Login() {
    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
                position: 'relative',
                backgroundColor: 'transparent'
            }}
        >
            <Box
                sx={{
                    color: 'text.primary',
                    p: 4,
                    mt: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3
                }}
            >
                <Box
                    sx={{
                        width: 180,
                        height: 90,
                        mb: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Image
                        src="/logo.png"
                        width={180}
                        height={90}
                        style={{ width: '100%', height: 'auto' }}
                        alt="Broccly Logo"
                        priority
                    />
                </Box>
                <Box
                    sx={{
                        textAlign: 'center',
                        color: 'black',
                        fontSize: 15,
                        mb: 1
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            background: 'linear-gradient(90deg,rgba(191, 55, 126, 1) 0%, rgba(118, 125, 156, 1) 69%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                        }}
                    >
                        Split Bills, Share Easy
                    </Typography>
                    <Typography>
                        Track expenses with your roommates🏠︎
                    </Typography>
                    <span style={{ fontSize: 13, color: '#706e6e' }}>
                        Perfect for bachelors sharing expenses
                    </span>
                </Box>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <LoginBtn />
                </Box>
                <span style={{ fontWeight: 500, fontSize: 15, color: '#706e6e', marginBottom: 4 }}>
                    Smart sharing, stress free living <span role="img" aria-label="money bag">💰</span>
                </span>
            </Box>
            {/* Bottom: Made by Broccly */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    opacity: 0.8,
                    justifyContent: 'center',
                }}
            >
                <span style={{ fontWeight: 500, fontSize: 15, color: 'gray' }}>
                    Made by Broccly
                </span>
                <Image
                    src="/broccly.png"
                    width={32}
                    height={32}
                    alt="Broccly Logo"
                    style={{ borderRadius: '50%' }}
                />
            </Box>
        </Box>
    );
}