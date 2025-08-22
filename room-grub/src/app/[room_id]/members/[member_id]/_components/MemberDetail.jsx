'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button } from '@mui/joy';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import useUserRole from '@/hooks/useUserRole';
import AccountOverview from './AccountOverview';
import PurchaseHistory from './PurchaseHistory';
import PaymentHistory from './PaymentHistory';
import ContributionModal from './ContributionModal';

export default function MemberDetail() {
    const [member, setMember] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showContributionForm, setShowContributionForm] = useState(false);
    const [isSettling, setIsSettling] = useState(false);
    const [summary, setSummary] = useState({
        totalPurchases: 0,
        totalPaid: 0,
        pendingAmount: 0,
        monthlyContribution: 0,
        lastPayment: null
    });
    
    const { role, loadings } = useUserRole();
    const params = useParams();
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

            // Get member's purchases (spendings)
            const { data: purchaseData, error: purchaseError } = await supabase
                .from('Spendings')
                .select('*')
                .eq('user', memberData.email)
                .eq('room', params.room_id)
                .order('created_at', { ascending: false });

            if (purchaseError) throw purchaseError;
            setPurchases(purchaseData || []);

            // Get member's payments (balance records)
            const { data: paymentData, error: paymentError } = await supabase
                .from('balance')
                .select('*')
                .eq('user', memberData.email)
                .eq('room', params.room_id)
                .order('created_at', { ascending: false });

            if (paymentError) throw paymentError;
            setPayments(paymentData || []);

            // Calculate summary
            calculateSummary(purchaseData || [], paymentData || []);

        } catch (error) {
            console.error('Error fetching member data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (purchaseData, paymentData) => {
        const totalPurchases = purchaseData.reduce((sum, purchase) => sum + parseFloat(purchase.money), 0);
        
        const purchaseSettlements = paymentData.filter(p => p.status === 'debit');
        const monthlyContributions = paymentData.filter(p => p.status === 'credit');
        
        const totalReceived = purchaseSettlements.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
        const totalContributed = monthlyContributions.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
        
        const pendingAmount = totalPurchases + totalReceived;
        const lastPayment = paymentData.length > 0 ? paymentData[0] : null;

        setSummary({
            totalPurchases,
            totalReceived,
            totalContributed,
            pendingAmount,
            lastPayment
        });
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
                onSettlePayment={handleSettlePayment}
                onShowContributionForm={() => setShowContributionForm(true)}
                isSettling={isSettling}
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <PurchaseHistory purchases={purchases} />
                <PaymentHistory payments={payments} />
            </Stack>

            <ContributionModal 
                showContributionForm={showContributionForm}
                setShowContributionForm={setShowContributionForm}
                member={member}
                onDataRefresh={fetchMemberData}
            />
        </Box>
    );
}