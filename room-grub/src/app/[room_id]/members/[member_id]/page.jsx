'use server'
import { Box, Typography, Card, CardContent, Stack, Chip, Button } from '@mui/joy';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import useUserRole from '@/hooks/useUserRole';
import MonthlyContributionModal from './_components/MonthlyContributionModal';
import { LoginRequired } from '@/policies/LoginRequired'
import { getMembers, getPurchases, getPayments } from './action';
import { formatCurrency, formatDate } from '@/utils/formatters';
import MembersSummary from './_components/MembersSummary';

export default async function MemberDetailPage() {
    const session = LoginRequired();
    const member = await getMembers({ member_id: params.member_id, room_id: params.room_id });
    const purchases = await getPurchases({ email: member.email, room_id: params.room_id });
    const payments = await getPayments({ email: member.email, room_id: params.room_id });
    const [loading, setLoading] = useState(true);
    const [showContributionForm, setShowContributionForm] = useState(false);
    const [contributionAmount, setContributionAmount] = useState('');
    const { role, loadings } = useUserRole();
    console.log(role, loadings)
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();

    const summary = (purchaseData, paymentData) => {
        const totalPurchases = purchaseData.reduce((sum, purchase) => sum + parseFloat(purchase.money), 0);
        
        const purchaseSettlements = paymentData.filter(p => p.status === 'debit');
        console.log(paymentData)
        const monthlyContributions = paymentData.filter(p => p.status === 'credit');
        
        const totalReceived = purchaseSettlements.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
        const totalContributed = monthlyContributions.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
        
        const pendingAmount = totalPurchases - totalReceived;
        const lastPayment = paymentData.length > 0 ? paymentData[0] : null;

        return {
            totalPurchases,
            totalReceived,
            totalContributed,
            pendingAmount,
            lastPayment
        };
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
                    amount: summary.pendingAmount,
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
            <MembersSummary summary={summary(purchases, payments)} />

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
            <MonthlyContributionModal 
                member={member} showForm={showContributionForm} />
        </Box>
    );
}
