'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/joy';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import RoomOverview from './RoomOverview';
import PendingPaymentsAlert from './PendingPaymentsAlert';
import MembersList from './MembersList';

export default function AdminDashboard() {
    const params = useParams();
    const supabase = createClient();
    
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

            // PERFORMANCE FIX: Fetch ALL purchases and payments for the room in 2 queries
            // instead of 2 queries per member (N+1 problem)
            const [purchasesResult, paymentsResult] = await Promise.all([
                supabase
                    .from('Spendings')
                    .select('*')
                    .eq('room', params.room_id),
                supabase
                    .from('balance')
                    .select('*')
                    .eq('room', params.room_id)
            ]);

            const allPurchases = purchasesResult.data || [];
            const allPayments = paymentsResult.data || [];

            // Group data by user email using Maps for O(1) lookups
            const purchasesByUser = new Map();
            const paymentsByUser = new Map();

            allPurchases.forEach(purchase => {
                const email = purchase.user;
                if (!purchasesByUser.has(email)) {
                    purchasesByUser.set(email, []);
                }
                purchasesByUser.get(email).push(purchase);
            });

            allPayments.forEach(payment => {
                const email = payment.user;
                if (!paymentsByUser.has(email)) {
                    paymentsByUser.set(email, []);
                }
                paymentsByUser.get(email).push(payment);
            });

            // Calculate stats for each member using pre-fetched data
            const stats = membersData.map((member) => {
                const purchases = purchasesByUser.get(member.email) || [];
                const payments = paymentsByUser.get(member.email) || [];

                const totalPurchases = purchases.reduce((sum, p) => sum + parseFloat(p.money), 0);

                const purchaseSettlements = payments.filter(p =>
                    p.status === 'debit'
                );
                const monthlyContributions = payments.filter(p =>
                    p.status === 'credit'
                );

                const totalReceived = purchaseSettlements.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                const totalContributed = monthlyContributions.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                const pendingAmount = totalPurchases + totalReceived;

                // Get last payment date
                const lastPayment = payments.length > 0 ?
                    new Date(Math.max(...payments.map(p => new Date(p.created_at)))).toLocaleDateString('en-IN') :
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
            });

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

            <RoomOverview totalRoomStats={totalRoomStats} />
            
            <PendingPaymentsAlert 
                totalRoomStats={totalRoomStats} 
                memberStats={memberStats}
                onDataRefresh={fetchDashboardData}
            />
            
            <MembersList memberStats={memberStats} />
        </Box>
    );
}