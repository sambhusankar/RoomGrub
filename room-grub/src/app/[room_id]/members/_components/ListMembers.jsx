'use client'
import React from 'react';
import { Box, Typography, Button, Card, CardContent, Stack } from '@mui/joy';
import { useRouter } from 'next/navigation';

export default function ListMembers({ members, roomId }) {
    const router = useRouter();

    const handleAddFriend = () => {
        router.push(`/${roomId}/members/add`);
    };

    return (
        <Box sx={{ p: 4, bgcolor: 'background.body', minHeight: '100vh' }}>
            <Typography level="h3" sx={{ mb: 3, fontWeight: 'bold' }}>
                Room Members
            </Typography>
            {(!members || members.length === 0) ? (
                <Typography>No friends added in your room.</Typography>
            ) : (
                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 3 }}>
                    {members.map((member) => (
                        <Card 
                            key={member.id} 
                            sx={{ 
                                minWidth: 200, 
                                mb: 2,
                                cursor: 'pointer',
                                '&:hover': {
                                    boxShadow: 'md',
                                    transform: 'translateY(-2px)',
                                    transition: 'all 0.2s'
                                }
                            }}
                            onClick={() => router.push(`/${roomId}/members/${member.id}`)}
                        >
                            <CardContent>
                                <Typography level="title-md">{member.name}</Typography>
                                <Typography level="body-sm">{member.email}</Typography>
                                <Typography level="body-xs" sx={{ mt: 1, color: 'text.secondary' }}>
                                    Click to view details
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
            <Button
                variant="solid"
                color="primary"
                onClick={handleAddFriend}
                sx={{ mt: 2 }}
            >
                Add Friend
            </Button>
        </Box>
    );
}