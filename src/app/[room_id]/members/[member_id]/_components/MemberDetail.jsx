'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/joy';
import { useParams, useRouter } from 'next/navigation';
import useUserRole from '@/hooks/useUserRole';
import { getMemberData, settleMember } from '../actions';
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

    useEffect(() => {
        fetchMemberData();
    }, [params.member_id, params.room_id]);

    const fetchMemberData = async () => {
        setLoading(true);
        const data = await getMemberData(params.room_id, params.member_id);
        setMember(data.member);
        setPurchases(data.purchases);
        setSummary(data.summary);
        setLoading(false);
    };

    const handleSettlePayment = async () => {
        if (summary.pendingAmount <= 0 || (!loadings && role !== 'Admin')) return;
        setIsSettling(true);
        const result = await settleMember(params.room_id, params.member_id);
        if (result.success) {
            alert('Payment settled successfully!');
            fetchMemberData();
        } else {
            alert('Error settling payment');
        }
        setIsSettling(false);
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

            <AccountOverview summary={summary} member={member} />
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
