'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    Button,
    Avatar,
    Alert
} from '@mui/joy';
import {
    TrendingUp,
    TrendingDown,
    Calculate,
    CheckCircle,
    Payment,
    Receipt,
    NearMe
} from '@mui/icons-material';
import { settleAllPending } from '../actions';
import { useRouter } from 'next/navigation';
import SplitsShareCard from './SplitsShareCard';

export default function SplitCalculator({ expenses, members, settlements, roomId, userRole }) {
    const router = useRouter();
    const shareRef = useRef(null);
    const [isSettling, setIsSettling] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Member balances and the who-pays-whom breakdown are precomputed by the
    // backend (RoomBalanceSummary + greedy debt simplification) — we just
    // shape them for display here, no client-side recalculation.
    const splitCalculation = useMemo(() => {
        const memberBalances = members.map(member => {
            const balance = member.pending_amount ?? 0;
            return {
                member,
                balance,
                status: balance > 0.01 ? 'credit' : balance < -0.01 ? 'debit' : 'even',
            };
        });

        const totalPendingExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.money || 0), 0);
        const pendingSettlements = memberBalances.filter(mb => Math.abs(mb.balance) > 0.01);

        return {
            totalPendingExpenses,
            memberBalances,
            settlements: settlements || [],
            pendingSettlements,
        };
    }, [expenses, members, settlements]);

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(amount));
    };

    const getMemberAvatar = (member) => {
        return member.profile ? (
            <Avatar src={member.profile} size="md" />
        ) : (
            <Avatar size="md">
                {(member.name || member.email).charAt(0).toUpperCase()}
            </Avatar>
        );
    };

    const handleSettleAll = async () => {
        setIsSettling(true);
        setError('');
        setSuccess('');

        try {
            const result = await settleAllPending(roomId, splitCalculation.memberBalances);

            if (!result.success) {
                throw new Error(result.error || 'Failed to settle all balances');
            }

            setSuccess(`Successfully settled ${result.expensesSettled} expense${result.expensesSettled !== 1 ? 's' : ''} across ${result.settledCount} member${result.settledCount !== 1 ? 's' : ''}!`);

            // Refresh the page to show updated data
            setTimeout(() => {
                router.refresh();
            }, 1500);

        } catch (err) {
            setError(err.message || 'Failed to process settlement');
        } finally {
            setIsSettling(false);
        }
    };

    const handleShare = async () => {
        if (!shareRef.current) return;
        setIsSharing(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(shareRef.current, { useCORS: true, backgroundColor: '#faf5ff' });
            canvas.toBlob(async (blob) => {
                try {
                    if (!blob) throw new Error('Canvas toBlob failed');
                    const file = new File([blob], 'splits-summary.png', { type: 'image/png' });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'RoomGrub Splits',
                            text: 'Check out our expense splits!',
                        });
                    } else {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'splits-summary.png';
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                } catch (err) {
                    if (err.name !== 'AbortError') setError('Failed to share. Please try again.');
                } finally {
                    setIsSharing(false);
                }
            }, 'image/png');
        } catch (err) {
            if (err.name !== 'AbortError') setError('Failed to share. Please try again.');
            setIsSharing(false);
        }
    };

    return (
        <Box>
            {/* Summary Cards - Mobile Optimized 2 Column Grid */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1.5,
                mb: 2
            }}>
                {/* Total Pending */}
                <Box sx={{ p: 2, bgcolor: '#fdf3f3', borderRadius: 'xl', boxShadow: 'sm' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Calculate sx={{ fontSize: 18, color: '#dc2626' }} />
                        <Typography level="body-sm" sx={{ color: '#991b1b', fontWeight: 500 }}>
                            Total Pending
                        </Typography>
                    </Box>
                    <Typography level="title-lg" sx={{ fontWeight: 700, color: '#dc2626' }}>
                        {formatAmount(splitCalculation.totalPendingExpenses)}
                    </Typography>
                </Box>

                {/* Transfers Needed */}
                <Box sx={{ p: 2, bgcolor: '#f3fbf6', borderRadius: 'xl', boxShadow: 'sm' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Receipt sx={{ fontSize: 18, color: '#16a34a' }} />
                        <Typography level="body-sm" sx={{ color: '#166534', fontWeight: 500 }}>
                            Transfers Needed
                        </Typography>
                    </Box>
                    <Typography level="title-lg" sx={{ fontWeight: 700, color: '#16a34a' }}>
                        {splitCalculation.settlements.length}
                    </Typography>
                </Box>
            </Box>

            {/* Success Message */}
            {success && (
                <Alert
                    color="success"
                    startDecorator={<CheckCircle />}
                    sx={{ mb: 2, borderRadius: 'md' }}
                >
                    <Typography level="body-sm">{success}</Typography>
                </Alert>
            )}

            {/* Error Message */}
            {error && (
                <Alert color="danger" sx={{ mb: 2, borderRadius: 'md' }}>
                    <Typography level="body-sm">{error}</Typography>
                </Alert>
            )}

            {/* All Settled Message - Show when no pending settlements */}
            {splitCalculation.pendingSettlements.length === 0 ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 8,
                        px: 3,
                        textAlign: 'center'
                    }}
                >
                    <CheckCircle
                        sx={{
                            fontSize: 80,
                            color: 'success.500',
                            mb: 2,
                            opacity: 0.9
                        }}
                    />
                    <Typography
                        level="h3"
                        sx={{
                            fontWeight: 'bold',
                            mb: 1,
                            color: 'success.700'
                        }}
                    >
                        All Clear!
                    </Typography>
                    <Typography
                        level="body-md"
                        sx={{
                            color: 'text.secondary',
                            maxWidth: 300
                        }}
                    >
                        No pending expenses to settle. Everyone is even!
                    </Typography>
                </Box>
            ) : (
                /* Member Balances List - Mobile Card Layout - Show only when there are pending settlements */
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                    {splitCalculation.memberBalances.map((memberBalance) => (
                        <Card
                            key={memberBalance.member.email}
                            sx={{
                                borderRadius: 'xl',
                                p: 2,
                                border: `1px solid ${
                                    memberBalance.status === 'credit' ? '#86efac' :
                                    memberBalance.status === 'debit' ? '#fca5a5' : '#d8b4fe'
                                }`,
                                bgcolor:
                                    memberBalance.status === 'credit' ? '#f0fdf4' :
                                    memberBalance.status === 'debit' ? '#fff5f5' : '#faf5ff',
                                boxShadow: 'sm',
                            }}
                        >
                            {/* Member Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {getMemberAvatar(memberBalance.member)}
                                <Box sx={{ flex: 1 }}>
                                    <Typography level="title-md" sx={{ fontWeight: 600, color: '#1e1b4b' }}>
                                        {memberBalance.member.name || memberBalance.member.email}
                                    </Typography>
                                    <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                                        {memberBalance.status === 'credit' ? 'Gets back'
                                            : memberBalance.status === 'debit' ? 'Owes'
                                            : 'Settled up'}
                                    </Typography>
                                </Box>
                                {/* Balance Amount - Prominent */}
                                <Box sx={{ textAlign: 'right' }}>
                                        <Typography
                                        level="h4"
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: '1.25rem',
                                            color: memberBalance.status === 'credit' ? '#16a34a' :
                                                   memberBalance.status === 'debit' ? '#dc2626' : '#9333ea'
                                        }}
                                    >
                                        {memberBalance.status === 'even' ? '₹0' : formatAmount(memberBalance.balance)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    ))}
                </Box>
            )}

            {/* Who Pays Whom */}
            {splitCalculation.settlements.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography level="body-xs" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
                        Who Pays Whom
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {splitCalculation.settlements.map((s, idx) => (
                            <Card
                                key={`${s.fromEmail}-${s.toEmail}-${idx}`}
                                variant="soft"
                                sx={{ borderRadius: 'lg', p: 1.5, boxShadow: 'none' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                                        {s.fromName}
                                    </Typography>
                                    <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                                        pays
                                    </Typography>
                                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                                        {s.toName}
                                    </Typography>
                                    <Box sx={{ flex: 1 }} />
                                    <Typography level="body-sm" sx={{ fontWeight: 700, color: 'primary.600' }}>
                                        {formatAmount(s.amount)}
                                    </Typography>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Action Buttons Row */}
            {splitCalculation.pendingSettlements.length > 0 && userRole === 'Admin' && (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {/* Share Icon Button */}
                    <Button
                        variant="outlined"
                        color="primary"
                        size="lg"
                        onClick={handleShare}
                        loading={isSharing}
                        sx={{
                            py: 1.5,
                            px: 2,
                            borderRadius: 'md',
                            borderColor: '#7e22ce',
                            color: '#7e22ce',
                            flexShrink: 0,
                            minWidth: 'unset',
                            '&:hover': { bgcolor: '#f3e8ff' },
                        }}
                    >
                        {!isSharing && (
                            <NearMe sx={{ fontSize: 28 }} />
                        )}
                    </Button>

                    {/* Settle All Button - Admin Only */}
                    {userRole === 'Admin' && (
                        <Button
                            fullWidth
                            color="primary"
                            size="lg"
                            onClick={handleSettleAll}
                            loading={isSettling}
                            startDecorator={!isSettling && <Payment />}
                            disabled={isSettling}
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                borderRadius: 'md',
                                textTransform: 'none',
                                bgcolor: '#7e22ce',
                                '&:hover': { bgcolor: '#6b21a8' },
                            }}
                        >
                            {isSettling ? 'Settling...' : `Settle All (${splitCalculation.pendingSettlements.length})`}
                        </Button>
                    )}
                </Box>
            )}

            {/* Hidden share snapshot — rendered off-screen for html2canvas capture */}
            <SplitsShareCard
                shareRef={shareRef}
                splitCalculation={splitCalculation}
            />
        </Box>
    );
}
