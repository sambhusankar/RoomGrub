'use client'
import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Stack, Chip, Button, Divider, Input, Modal, ModalDialog, ModalClose, DialogTitle, DialogContent, DialogActions } from '@mui/joy';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import useUserRole from '@/hooks/useUserRole';

export default function MemberDetailPage() {
    const [member, setMember] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showContributionForm, setShowContributionForm] = useState(false);
    const [contributionAmount, setContributionAmount] = useState('');
    const [summary, setSummary] = useState({
        totalPurchases: 0,
        totalPaid: 0,
        pendingAmount: 0,
        monthlyContribution: 0,
        lastPayment: null
    });
    const { role, loadings } = useUserRole();
    console.log(role, loadings)
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
        console.log(paymentData)
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
        }
    };

    const handleMonthlyContribution = async () => {
        if (!contributionAmount || parseFloat(contributionAmount) <= 0) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Record monthly contribution as debit
            const { error } = await supabase
                .from('balance')
                .insert([{
                    room: params.room_id,
                    user: member.email,
                    amount: parseFloat(contributionAmount),
                    status: 'credit'
                }]);

            if (error) throw error;
            
            alert('Monthly contribution recorded successfully!');
            setContributionAmount('');
            setShowContributionForm(false);
            fetchMemberData(); // Refresh data
        } catch (error) {
            console.error('Error recording contribution:', error);
            alert('Error recording contribution');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
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
                <Button 
                    variant="outlined" 
                    onClick={() => router.back()}
                    sx={{ mr: 2 }}
                >
                    ← Back
                </Button>
                <Typography level="h3" sx={{ fontWeight: 'bold' }}>
                    {member.name}'s Account
                </Typography>
            </Box>

            {/* Member Summary */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography level="title-lg" sx={{ mb: 2 }}>Account Summary</Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Box>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Purchases</Typography>
                            <Typography level="title-md" sx={{ color: 'success.500' }}>
                                {formatCurrency(summary.totalPurchases)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Amount Received</Typography>
                            <Typography level="title-md" sx={{ color: 'primary.500' }}>
                                {formatCurrency(summary.totalReceived)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Monthly Contributions</Typography>
                            <Typography level="title-md" sx={{ color: 'warning.500' }}>
                                {formatCurrency(summary.totalContributed)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Pending Amount</Typography>
                            <Typography level="title-md" sx={{ color: summary.pendingAmount > 0 ? 'danger.500' : 'success.500' }}>
                                {formatCurrency(summary.pendingAmount)}
                            </Typography>
                        </Box>
                    </Stack>
                    
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        {summary.pendingAmount > 0 && (!loadings && role == 'Admin') && (
                            <Button 
                                variant="solid" 
                                color="success" 
                                onClick={handleSettlePayment}
                            >
                                Settle Payment ({formatCurrency(summary.pendingAmount)})
                            </Button>
                        )}
                        <Button 
                            variant="outlined" 
                            color="primary" 
                            onClick={() => setShowContributionForm(true)}
                        >
                            Record Monthly Contribution
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* Purchase History */}
                <Box sx={{ flex: 1 }}>
                    <Typography level="title-lg" sx={{ mb: 2 }}>Purchase History</Typography>
                    {purchases.length === 0 ? (
                        <Card>
                            <CardContent>
                                <Typography>No purchases found</Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Stack spacing={2}>
                            {purchases.map((purchase) => (
                                <Card key={purchase.id} variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography level="title-sm">{purchase.material}</Typography>
                                                <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                                                    {formatDate(purchase.created_at)}
                                                </Typography>
                                            </Box>
                                            <Typography level="title-md" sx={{ color: 'success.500' }}>
                                                {formatCurrency(purchase.money)}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Box>

                {/* Payment History */}
                <Box sx={{ flex: 1 }}>
                    <Typography level="title-lg" sx={{ mb: 2 }}>Payment History</Typography>
                    {payments.length === 0 ? (
                        <Card>
                            <CardContent>
                                <Typography>No payments found</Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Stack spacing={2}>
                            {payments.map((payment) => (
                                <Card key={payment.id} variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip 
                                                        size="sm" 
                                                        color={payment.status === 'credit' ? 'success' : 'warning'}
                                                    >
                                                        {payment.transaction_type === 'purchase_settlement' ? 'Settlement' :
                                                         payment.transaction_type === 'monthly_contribution' ? 'Monthly' :
                                                         payment.status === 'credit' ? 'Received' : 'Contributed'}
                                                    </Chip>
                                                </Box>
                                                <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                                    {formatDate(payment.created_at)}
                                                </Typography>
                                                {payment.description && (
                                                    <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
                                                        {payment.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Typography 
                                                level="title-md" 
                                                sx={{ 
                                                    color: payment.status === 'credit' ? 'success.500' : 'warning.600' 
                                                }}
                                            >
                                                {payment.status === 'credit' ? '+' : '-'}{formatCurrency(payment.amount)}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Stack>

            {/* Monthly Contribution Modal */}
            <Modal open={showContributionForm} onClose={() => setShowContributionForm(false)}>
                <ModalDialog>
                    <ModalClose />
                    <DialogTitle>Record Monthly Contribution</DialogTitle>
                    <DialogContent>
                        <Typography level="body-sm" sx={{ mb: 2 }}>
                            Record {member?.name}'s monthly contribution to the room.
                        </Typography>
                        <Input
                            type="number"
                            placeholder="Enter amount"
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                            startDecorator="₹"
                            sx={{ mb: 2 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            variant="solid" 
                            color="primary" 
                            onClick={handleMonthlyContribution}
                            disabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
                        >
                            Record Contribution
                        </Button>
                        <Button 
                            variant="plain" 
                            color="neutral" 
                            onClick={() => setShowContributionForm(false)}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </ModalDialog>
            </Modal>
        </Box>
    );
}
