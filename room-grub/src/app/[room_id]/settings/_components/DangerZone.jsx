'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/joy';
import { useRouter } from 'next/navigation';
import useUserRole from '@/hooks/useUserRole';
import { deleteRoom } from '../actions';

export default function DangerZone({ roomId }) {
    const router = useRouter();
    const { role, loadings } = useUserRole();
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [pendingExists, setPendingExists] = useState(false);

    if (loadings || role !== 'Admin') return null;

    async function handleDeleteRoom() {
        if (!confirm('Are you absolutely sure? This will permanently delete the room and all its data. This action cannot be undone.')) return;

        setDeleting(true);
        setError(null);
        setPendingExists(false);

        try {
            const result = await deleteRoom(roomId);
            if (result.success) {
                router.push('/create_room');
            } else {
                setError(result.error);
                if (result.pendingExists) setPendingExists(true);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Box
            sx={{
                border: '1px solid',
                borderColor: 'danger.300',
                borderRadius: 'md',
                p: 3,
            }}
        >
            <Typography level="title-lg" color="danger" sx={{ mb: 1 }}>
                Danger Zone
            </Typography>
            <Typography level="body-sm" sx={{ mb: 2, color: 'text.secondary' }}>
                Permanently delete this room and all its data. This action cannot be undone.
            </Typography>

            {error && (
                <Alert color="danger" sx={{ mb: 2 }}>
                    {error}
                    {pendingExists && (
                        <Button
                            variant="plain"
                            color="danger"
                            size="sm"
                            onClick={() => router.push(`/${roomId}/splits`)}
                            sx={{ ml: 1, p: 0, minHeight: 'unset', textDecoration: 'underline' }}
                        >
                            Go to Splits
                        </Button>
                    )}
                </Alert>
            )}

            <Button
                variant="outlined"
                color="danger"
                loading={deleting}
                onClick={handleDeleteRoom}
            >
                Delete Room
            </Button>
        </Box>
    );
}
