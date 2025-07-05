'use client'
import React from 'react';
import { Box, Typography, Button, Card, CardContent, Stack } from '@mui/joy';
import { useRouter } from 'next/navigation';

export default function ListMembers({ members, roomId }) {
    const router = useRouter();
    console.log(members)
    const handleAddFriend = () => {
        router.push(`/${roomId}/members/add`);
    };

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 4 },
                bgcolor: 'background.body',
                minHeight: '100vh',
                width: '100%',
                boxSizing: 'border-box',
            }}
        >
            <Typography
                level="h3"
                sx={{
                    mb: 3,
                    fontWeight: 'bold',
                    textAlign: { xs: 'center', sm: 'left' },
                }}
            >
                Room Members
            </Typography>
            {(!members || members.length === 0) ? (
                <Typography textAlign="center">No friends added in your room.</Typography>
            ) : (
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    flexWrap="wrap"
                    sx={{
                        mb: 3,
                        alignItems: { xs: 'center', sm: 'flex-start' },
                        justifyContent: { xs: 'center', sm: 'flex-start' },
                        width: '100%',
                    }}
                >
                    {members.map((member) => (
                        <Card
                            key={member.id}
                            sx={{
                                width: { xs: '100%', sm: 240 },
                                mb: { xs: 1, sm: 2 },
                                bgcolor: 'background.level1',
                                cursor: 'pointer',
                                boxShadow: 'sm',
                                borderRadius: 2,
                                '&:hover': {
                                    boxShadow: 'md',
                                    transform: 'translateY(-2px)',
                                    transition: 'all 0.2s',
                                },
                            }}
                            onClick={() => router.push(`/${roomId}/members/${member.id}`)}
                        >
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        component="img"
                                        src={member.profile || '/default-profile.png'}
                                        alt={member.name}
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            bgcolor: 'background.level2',
                                            border: '1px solid #eee',
                                        }}
                                        onError={e => {
                                            e.target.onerror = null;
                                            e.target.src = '/default-profile.png';
                                        }}
                                    />
                                    <Box>
                                        <Typography level="title-md">{member.name}</Typography>
                                        <Typography level="body-sm">{member.email}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
            <Button
                variant="solid"
                color="primary"
                onClick={handleAddFriend}
                sx={{
                    mt: 2,
                    width: { xs: '100%', sm: 'auto' },
                    display: 'block',
                    mx: { xs: 'auto', sm: 0 },
                }}
            >
                Add Friend
            </Button>
        </Box>
    );
}