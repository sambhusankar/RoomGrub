'use server';

import { LoginRequired } from '@/policies/LoginRequired';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';

export default async function WelComme() {
    const session = await LoginRequired();

    // Get full name from Google OAuth metadata
    const fullName = session?.user?.user_metadata?.full_name || 'there';
    const firstName = fullName.split(' ')[0];

    return (
        <Box sx={{ py: 5, px: 3, textAlign: 'center' }}>
            <Typography
                level="h3"
                fontWeight="lg"
                mb={1}
                sx={{
                    fontSize: {
                        xs: '1.5rem', // Small phones
                        sm: '2rem',   // Tablets / small desktops
                        md: '2.25rem' // Medium+ screens
                    },
                    wordBreak: 'break-word', // Just in case name is long
                }}
            >
                Welcome back, {firstName}! 👋
            </Typography>

            <Typography level="body-sm" color="neutral">
                Here's what's happening with your room
            </Typography>
        </Box>
    );
}
