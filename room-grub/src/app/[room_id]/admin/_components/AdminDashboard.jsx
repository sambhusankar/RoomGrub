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