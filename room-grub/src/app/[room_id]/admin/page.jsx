'use client'
import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Stack, Chip, Button, Table, Alert } from '@mui/joy';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function AdminDashboard() {
    const [members, setMembers] = useState([]);
    const [memberStats, setMemberStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRoomStats, setTotalRoomStats] = useState({
        totalPurchases: 0,
        totalPaid: 0,
        totalContributions: 0,
        pendingPayments: 0
    });
    
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();

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
                    .eq('user', member.id)
                    .eq('room', params.room_id);

                const totalPurchases = (purchases || []).reduce((sum, p) => sum + parseFloat(p.money), 0);
                
                const purchaseSettlements = (payments || []).filter(p => 
                    p.status === 'credit' && (p.transaction_type === 'purchase_settlement' || !p.transaction_type)
                );
                const monthlyContributions = (payments || []).filter(p => 
                    p.status === 'debit' && (p.transaction_type === 'monthly_contribution' || !p.transaction_type)
                );
                
                const totalReceived = purchaseSettlements.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                const totalContributed = monthlyContributions.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                const pendingAmount = totalPurchases - totalReceived;

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
                user: stat.member.id,
                amount: stat.pendingAmount,
                status: 'credit',
                transaction_type: 'purchase_settlement',
                description: `Bulk settlement for purchases totaling ${formatCurrency(stat.pendingAmount)}`
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
        <Box sx={{ p: 4, bgcolor: 'background.body', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography level="h3" sx={{ fontWeight: 'bold' }}>
                    Admin Dashboard
                </Typography>
                <Button 
                    variant="outlined" 
                    onClick={() => router.back()}
                >
                    ← Back
                </Button>
            </Box>

            {/* Room Overview */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography level="title-lg" sx={{ mb: 2 }}>Room Overview</Typography>
                    <Stack direction="row" spacing={4} flexWrap="wrap">
                        <Box>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Purchases</Typography>
                            <Typography level="title-lg" sx={{ color: 'success.500' }}>
                                {formatCurrency(totalRoomStats.totalPurchases)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Paid Out</Typography>
                            <Typography level="title-lg" sx={{ color: 'primary.500' }}>
                                {formatCurrency(totalRoomStats.totalPaid)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Contributions</Typography>
                            <Typography level="title-lg" sx={{ color: 'warning.500' }}>
                                {formatCurrency(totalRoomStats.totalContributions)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Pending Payments</Typography>
                            <Typography level="title-lg" sx={{ color: 'danger.500' }}>
                                {formatCurrency(totalRoomStats.pendingPayments)}
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            {totalRoomStats.pendingPayments > 0 && (
                <Alert color="warning" sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>
                            There are pending payments totaling {formatCurrency(totalRoomStats.pendingPayments)}
                        </Typography>
                        <Button 
                            variant="solid" 
                            color="success" 
                            onClick={handleSettleAll}
                        >
                            Settle All Pending
                        </Button>
                    </Box>
                </Alert>
            )}

            {/* Members Table */}
            <Card>
                <CardContent>
                    <Typography level="title-lg" sx={{ mb: 2 }}>Member Summary</Typography>
                    <Table hoverRow>
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
                                <tr key={stat.member.id}>
                                    <td>
                                        <Box>
                                            <Typography level="title-sm">{stat.member.name}</Typography>
                                            <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                                                {stat.member.email}
                                            </Typography>
                                        </Box>
                                    </td>
                                    <td>
                                        <Typography sx={{ color: 'success.500' }}>
                                            {formatCurrency(stat.totalPurchases)}
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography sx={{ color: 'primary.500' }}>
                                            {formatCurrency(stat.totalReceived)}
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography sx={{ color: 'warning.500' }}>
                                            {formatCurrency(stat.totalContributed)}
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography sx={{ color: stat.pendingAmount > 0 ? 'danger.500' : 'success.500' }}>
                                            {formatCurrency(stat.pendingAmount)}
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography level="body-sm">{stat.lastPayment}</Typography>
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
                                        <Button
                                            size="sm"
                                            variant="soft"
                                            onClick={() => router.push(`/${params.room_id}/members/${stat.member.id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    );
}