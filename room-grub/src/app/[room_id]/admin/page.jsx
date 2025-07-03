'use client'
import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Stack, Chip, Button, Table, Alert } from '@mui/joy';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import useUserRole from '@/hooks/useUserRole'

export default function AdminDashboard() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const { role, loadings } = useUserRole();
    if(!loadings && role != 'Admin'){
        router.push(`/${params.room_id}`)
    };
    const [members, setMembers] = useState([]);
    const [memberStats, setMemberStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRoomStats, setTotalRoomStats] = useState({
        totalPurchases: 0,
        totalPaid: 0,
        totalContributions: 0,
        pendingPayments: 0
    });
    


    useEffect(() => {
        fetchDashboardData();
    }, [params.room_id]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Get all members in the room
            const { data: membersData, error: membersError } = await supabase
                .from('Users')
                .select('*')
                .eq('room', params.room_id);

            if (membersError) throw membersError;
            setMembers(membersData);

            // Calculate stats for each member
            const stats = await Promise.all(membersData.map(async (member) => {
                // Get member's purchases
                const { data: purchases } = await supabase
                    .from('Spendings')
                    .select('*')
                    .eq('user', member.email)
                    .eq('room', params.room_id);

                // Get member's payments
                const { data: payments } = await supabase
                    .from('balance')
                    .select('*')
                    .eq('user', member.email)
                    .eq('room', params.room_id);

                const totalPurchases = (purchases || []).reduce((sum, p) => sum + parseFloat(p.money), 0);
                
                const purchaseSettlements = (payments || []).filter(p => 
                    p.status === 'debit'
                );
                const monthlyContributions = (payments || []).filter(p => 
                    p.status === 'credit'
                );
                
                const totalReceived = purchaseSettlements.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                const totalContributed = monthlyContributions.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                const pendingAmount = totalPurchases + totalReceived;

                // Get last payment date
                const lastPayment = (payments || []).length > 0 ? 
                    new Date(Math.max(...(payments || []).map(p => new Date(p.created_at)))).toLocaleDateString('en-IN') : 
                    'Never';

                return {
                    member,
                    totalPurchases,
                    totalReceived,
                    totalContributed,
                    pendingAmount,
                    lastPayment,
                    status: pendingAmount > 0 ? 'pending' : 'settled'
                };
            }));

            setMemberStats(stats);

            // Calculate room totals
            const roomTotals = stats.reduce((acc, stat) => ({
                totalPurchases: acc.totalPurchases + stat.totalPurchases,
                totalPaid: acc.totalPaid + stat.totalReceived,
                totalContributions: acc.totalContributions + stat.totalContributed,
                pendingPayments: acc.pendingPayments + (stat.pendingAmount > 0 ? stat.pendingAmount : 0)
            }), { totalPurchases: 0, totalPaid: 0, totalContributions: 0, pendingPayments: 0 });

            setTotalRoomStats(roomTotals);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
    };

    const handleSettleAll = async () => {
        const pendingMembers = memberStats.filter(stat => stat.pendingAmount > 0);
        
        if (pendingMembers.length === 0) {
            alert('No pending payments to settle');
            return;
        }

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
            fetchDashboardData(); // Refresh data
        } catch (error) {
            console.error('Error settling all payments:', error);
            alert('Error settling payments');
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Typography>Loading admin dashboard...</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: { xs: 1, sm: 2, md: 4 },
                bgcolor: 'background.body',
                minHeight: '100vh',
                width: '100vw',
                boxSizing: 'border-box',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    mb: 3,
                    gap: 1,
                }}
            >
                <Typography level="h3" sx={{ fontWeight: 'bold', fontSize: { xs: '1.3rem', sm: '2rem' } }}>
                    Admin Dashboard
                </Typography>
            </Box>

            {/* Room Overview */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography level="title-lg" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Room Overview</Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                            gap: 2,
                            width: '100%',
                        }}
                    >
                        <Box sx={{ minWidth: 0, p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Purchases</Typography>
                            <Typography level="title-lg" sx={{ color: 'success.500', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                                {formatCurrency(totalRoomStats.totalPurchases)}
                            </Typography>
                        </Box>
                        <Box sx={{ minWidth: 0, p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Paid Out</Typography>
                            <Typography level="title-lg" sx={{ color: 'primary.500', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                                {formatCurrency(totalRoomStats.totalPaid)}
                            </Typography>
                        </Box>
                        <Box sx={{ minWidth: 0, p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Contributions</Typography>
                            <Typography level="title-lg" sx={{ color: 'warning.500', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                                {formatCurrency(totalRoomStats.totalContributions)}
                            </Typography>
                        </Box>
                        <Box sx={{ minWidth: 0, p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Pending Payments</Typography>
                            <Typography level="title-lg" sx={{ color: 'danger.500', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                                {formatCurrency(totalRoomStats.pendingPayments)}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            {totalRoomStats.pendingPayments > 0 && (
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
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            Settle All Pending
                        </Button>
                    </Box>
                </Alert>
            )}

            {/* Members List/Table */}
            <Card>
                <CardContent>
                    <Typography level="title-lg" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Member Summary</Typography>
                    {/* Mobile: Card List, Desktop: Table */}
                    <Box sx={{ width: '100%' }}>
                        {/* Mobile View */}
                        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                            <Stack spacing={2}>
                                {memberStats.map((stat) => (
                                    <Box
                                        key={stat.member.id}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: stat.pendingAmount > 0 ? 'danger.300' : 'success.300',
                                            borderRadius: 2,
                                            p: 2,
                                            bgcolor: 'background.level1',
                                            cursor: 'pointer',
                                            transition: 'box-shadow 0.2s',
                                            boxShadow: 'sm',
                                            '&:hover': {
                                                boxShadow: 'md',
                                                bgcolor: 'background.level2',
                                            },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                        onClick={() => router.push(`/${params.room_id}/members/${stat.member.id}`)}
                                    >
                                        <Box>
                                            <Typography level="title-sm" sx={{ fontSize: '1rem' }}>{stat.member.name}</Typography>
                                            <Typography level="body-xs" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                                {stat.member.email}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography sx={{ color: stat.pendingAmount > 0 ? 'danger.500' : 'success.500', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                {formatCurrency(stat.pendingAmount)}
                                            </Typography>
                                            <Chip
                                                size="sm"
                                                color={stat.status === 'settled' ? 'success' : 'warning'}
                                                sx={{ mt: 0.5 }}
                                            >
                                                {stat.status === 'settled' ? 'Settled' : 'Pending'}
                                            </Chip>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                        {/* Desktop View */}
                        <Box sx={{ display: { xs: 'none', sm: 'block' }, overflowX: 'auto' }}>
                            <Table hoverRow sx={{ minWidth: 650 }}>
                                <thead>
                                    <tr>
                                        <th>Member</th>
                                        <th>Total Purchases</th>
                                        <th>Amount Received</th>
                                        <th>Monthly Contributions</th>
                                        <th>Pending Amount</th>
                                        <th>Last Payment</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {memberStats.map((stat) => (
                                        <tr
                                            key={stat.member.id}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => router.push(`/${params.room_id}/members/${stat.member.id}`)}
                                        >
                                            <td>
                                                <Box>
                                                    <Typography level="title-sm" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>{stat.member.name}</Typography>
                                                    <Typography level="body-xs" sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                                        {stat.member.email}
                                                    </Typography>
                                                </Box>
                                            </td>
                                            <td>
                                                <Typography sx={{ color: 'success.500', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                                    {formatCurrency(stat.totalPurchases)}
                                                </Typography>
                                            </td>
                                            <td>
                                                <Typography sx={{ color: 'primary.500', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                                    {formatCurrency(stat.totalReceived)}
                                                </Typography>
                                            </td>
                                            <td>
                                                <Typography sx={{ color: 'warning.500', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                                    {formatCurrency(stat.totalContributed)}
                                                </Typography>
                                            </td>
                                            <td>
                                                <Typography sx={{ color: stat.pendingAmount > 0 ? 'danger.500' : 'success.500', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                                    {formatCurrency(stat.pendingAmount)}
                                                </Typography>
                                            </td>
                                            <td>
                                                <Typography level="body-sm" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>{stat.lastPayment}</Typography>
                                            </td>
                                            <td>
                                                <Chip
                                                    size="sm"
                                                    color={stat.status === 'settled' ? 'success' : 'warning'}
                                                >
                                                    {stat.status === 'settled' ? 'Settled' : 'Pending'}
                                                </Chip>
                                            </td>
                                            <td>
                                                {/* No View Details button, row is clickable */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
