'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/joy';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import useUserRole from '@/hooks/useUserRole';
import AccountOverview from './AccountOverview';
import PurchaseHistory from './PurchaseHistory';
import ContributionModal from './ContributionModal';

export default function MemberDetail() {
    const [member, setMember] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showContributionForm, setShowContributionForm] = useState(false);
    const [isSettling, setIsSettling] = useState(false);
    const [summary, setSummary] = useState({ pendingAmount: 0, totalPurchases: 0 });
    
    const params = useParams();
    const { role, loadings } = useUserRole(params.room_id);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        fetchMemberData();
    }, [params.member_id, params.room_id]);

    const fetchMemberData = async () => {
        try {
            setLoading(true);
            
            // Get member details
            const { data: memberData, error: memberError } = await supabase
                .from('Users')
                .select('*')
                .eq('id', params.member_id)
                .eq('room', params.room_id)
                .single();

            if (memberError) throw memberError;
            setMember(memberData);

            // Fetch unsettled (for display + pending) and all (for total) in parallel
            const [pendingResult, allResult] = await Promise.all([
                supabase.from('Spendings').select('*')
                    .eq('user', memberData.email).eq('room', params.room_id)
                    .or('settled.is.null,settled.eq.false')
                    .order('created_at', { ascending: false }),
                supabase.from('Spendings').select('money')
                    .eq('user', memberData.email).eq('room', params.room_id),
            ]);

            if (pendingResult.error) throw pendingResult.error;
            setPurchases(pendingResult.data || []);

            const pendingAmount = (pendingResult.data || []).reduce((sum, p) => sum + parseFloat(p.money), 0);
            const totalPurchases = (allResult.data || []).reduce((sum, p) => sum + parseFloat(p.money), 0);
            setSummary({ pendingAmount, totalPurchases });

        } catch (error) {
            console.error('Error fetching member data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSettlePayment = async () => {
        if (summary.pendingAmount <= 0 || (!loadings && role !== 'Admin')) return;

        setIsSettling(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Create a credit entry to settle the pending amount
            const { error } = await supabase
                .from('balance')
                .insert([{
                    room: params.room_id,
                    user: member.email,
                    amount: summary.pendingAmount * -1,
                    status: 'debit'
                }]);

            if (error) throw error;
            
            alert('Payment settled successfully!');
            fetchMemberData(); // Refresh data
        } catch (error) {
            console.error('Error settling payment:', error);
            alert('Error settling payment');
        } finally {
            setIsSettling(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Typography>Loading member details...</Typography>
            </Box>
        );
    }

    if (!member) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Member not found</Typography>
                <Button onClick={() => router.back()} sx={{ mt: 2 }}>Go Back</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, bgcolor: 'background.body', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography level="h3" sx={{ fontWeight: 'bold' }}>
                    {member.name}'s Account
                </Typography>
            </Box>

            <AccountOverview
                summary={summary}
                member={member}
            />

            <PurchaseHistory purchases={purchases} />

            <ContributionModal 
                showContributionForm={showContributionForm}
                setShowContributionForm={setShowContributionForm}
                member={member}
                onDataRefresh={fetchMemberData}
            />
        </Box>
    );
}