'use client';

import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/joy';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import MembersList from '../admin/_components/MembersList';

export default function HomeDashboard() {
    const params = useParams();
    const supabase = createClient();

    const [memberStats, setMemberStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRoomStats, setTotalRoomStats] = useState({
        totalPurchases: 0,
        totalPaid: 0,
        totalContributions: 0,
        pendingPayments: 0,
    });

    useEffect(() => {
        fetchDashboardData();
    }, [params.room_id]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const { data: membersData, error: membersError } = await supabase
                .from('Users')
                .select('*')
                .eq('room', params.room_id);

            if (membersError) throw membersError;

            const [purchasesResult, paymentsResult] = await Promise.all([
                supabase.from('Spendings').select('*').eq('room', params.room_id),
                supabase.from('balance').select('*').eq('room', params.room_id),
            ]);

            const allPurchases = purchasesResult.data || [];
            const allPayments = paymentsResult.data || [];

            const purchasesByUser = new Map();
            const paymentsByUser = new Map();

            allPurchases.forEach(purchase => {
                const email = purchase.user;
                if (!purchasesByUser.has(email)) purchasesByUser.set(email, []);
                purchasesByUser.get(email).push(purchase);
            });

            allPayments.forEach(payment => {
                const email = payment.user;
                if (!paymentsByUser.has(email)) paymentsByUser.set(email, []);
                paymentsByUser.get(email).push(payment);
            });

            const stats = membersData.map((member) => {
                const purchases = purchasesByUser.get(member.email) || [];
                const payments = paymentsByUser.get(member.email) || [];

                const totalPurchases = purchases.reduce((sum, p) => sum + parseFloat(p.money), 0);
                const purchaseSettlements = payments.filter(p => p.status === 'debit');
                const monthlyContributions = payments.filter(p => p.status === 'credit');
                const totalReceived = purchaseSettlements.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                const totalContributed = monthlyContributions.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                const pendingAmount = totalPurchases + totalReceived;
                const lastPayment = payments.length > 0
                    ? new Date(Math.max(...payments.map(p => new Date(p.created_at)))).toLocaleDateString('en-IN')
                    : 'Never';

                return {
                    member,
                    totalPurchases,
                    totalReceived,
                    totalContributed,
                    pendingAmount,
                    lastPayment,
                    status: pendingAmount > 0 ? 'pending' : 'settled',
                };
            });

            setMemberStats(stats);

            const roomTotals = stats.reduce((acc, stat) => ({
                totalPurchases: acc.totalPurchases + stat.totalPurchases,
                totalPaid: acc.totalPaid + stat.totalReceived,
                totalContributions: acc.totalContributions + stat.totalContributed,
                pendingPayments: acc.pendingPayments + (stat.pendingAmount > 0 ? stat.pendingAmount : 0),
            }), { totalPurchases: 0, totalPaid: 0, totalContributions: 0, pendingPayments: 0 });

            setTotalRoomStats(roomTotals);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

    if (loading) return null;

    return (
        <Box>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography level="title-lg" sx={{ mb: 2 }}>Room Overview</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                        <Box sx={{ p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Purchases</Typography>
                            <Typography level="title-lg" sx={{ color: 'success.500' }}>
                                {formatCurrency(totalRoomStats.totalPurchases)}
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Pending Payments</Typography>
                            <Typography level="title-lg" sx={{ color: 'danger.500' }}>
                                {formatCurrency(totalRoomStats.pendingPayments)}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            <MembersList memberStats={memberStats} />
        </Box>
    );
}
