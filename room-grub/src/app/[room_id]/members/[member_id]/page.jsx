'use server'
import { Box, Typography, Stack } from '@mui/joy';
import { LoginRequired } from '@/policies/LoginRequired'
import { getMember, getPurchases, getPayments } from './action';
import MembersSummary from './_components/MembersSummary';
import PurchaseHistory from './_components/PurchaseHistory';
import MonthlyContributionModal from './_components/MonthlyContributionModal';
import BackButton from './_components/BackButton';

import { formatCurrency } from '@/utils/format';

export default async function MemberDetailPage({ params }) {
    await LoginRequired();
    const param = await params;

    // Fetch all data on the server
    const member = await getMember({ member_id: param.member_id, room_id: param.room_id });
    if (!member) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Member not found</Typography>
                <BackButton />
            </Box>
        );
    }
    const purchases = await getPurchases({ email: member.email, room_id: param.room_id });
    const payments = await getPayments({ email: member.email, room_id: param.room_id });

    // Prepare summary data
    const summary = (() => {
        const totalPurchases = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.money), 0);
        const purchaseSettlements = payments.filter(p => p.status === 'debit');
        const monthlyContributions = payments.filter(p => p.status === 'credit');
        const totalReceived = purchaseSettlements.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
        const totalContributed = monthlyContributions.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
        const pendingAmount = totalPurchases - totalReceived;
        const lastPayment = payments.length > 0 ? payments[0] : null;
        return {
            totalPurchases,
            totalReceived,
            totalContributed,
            pendingAmount,
            lastPayment
        };
    })();

    return (
        <Box sx={{ p: 4, bgcolor: 'background.body', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BackButton />
                <Typography level="h3" sx={{ fontWeight: 'bold', ml: 2 }}>
                    {member.name}'s Account
                </Typography>
            </Box>

            {/* Member Summary (client component) */}
            <MembersSummary
                summary={summary}
                member={member}
                roomId={param.room_id}
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* Purchase History (client component) */}
                <PurchaseHistory purchases={purchases} />
                {/* Payment History (client component) */}
                {/* You can create a PaymentHistory component similar to PurchaseHistory if needed */}
            </Stack>

            {/* Monthly Contribution Modal (client component, can be controlled from MembersSummary) */}
            {/* <MonthlyContributionModal member={member} roomId={param.room_id} /> */}
        </Box>
    );
}
