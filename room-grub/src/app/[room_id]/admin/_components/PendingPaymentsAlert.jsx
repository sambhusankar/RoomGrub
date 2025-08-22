'use client';

import { useState } from 'react';
import { Alert, Box, Typography, Button } from '@mui/joy';
import { createClient } from '@/utils/supabase/client';
import { useParams } from 'next/navigation';

export default function PendingPaymentsAlert({ totalRoomStats, memberStats, onDataRefresh }) {
    const [isSettling, setIsSettling] = useState(false);
    const params = useParams();
    const supabase = createClient();

    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
    };

    const handleSettleAll = async () => {
        const pendingMembers = memberStats.filter(stat => stat.pendingAmount > 0);
        
        if (pendingMembers.length === 0) {
            alert('No pending payments to settle');
            return;
        }

        setIsSettling(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Create settlement entries for all pending members
            const settlements = pendingMembers.map(stat => ({
                room: params.room_id,
                user: stat.member.email,
                amount: stat.pendingAmount * -1,
                status: 'debit'
            }));

            const { error } = await supabase
                .from('balance')
                .insert(settlements);

            if (error) throw error;
            
            alert(`Successfully settled payments for ${pendingMembers.length} members`);
            onDataRefresh(); // Refresh data
        } catch (error) {
            console.error('Error settling all payments:', error);
            alert('Error settling payments');
        } finally {
            setIsSettling(false);
        }
    };

    if (totalRoomStats.pendingPayments <= 0) {
        return null;
    }

    return (
        <Alert color="warning" sx={{ mb: 3 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 1,
                }}
            >
                <Typography>
                    There are pending payments totaling {formatCurrency(totalRoomStats.pendingPayments)}
                </Typography>
                <Button
                    variant="solid"
                    color="success"
                    onClick={handleSettleAll}
                    loading={isSettling}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    Settle All Pending
                </Button>
            </Box>
        </Alert>
    );
}