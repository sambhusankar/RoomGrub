'use client';

import { Typography, Box, Stack, Chip, Table } from '@mui/joy';
import { CheckCircleRounded, AccessTimeRounded } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';

export default function MembersList({ memberStats }) {
    const router = useRouter();
    const params = useParams();

    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
    };

    return (
        <Box>
                <Typography level="title-lg" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Member Summary
                </Typography>
                <Box sx={{ width: '100%' }}>
                    {/* Mobile View */}
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                        <Stack spacing={2}>
                            {memberStats.map((stat) => (
                                <Box
                                    key={stat.member.id}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: stat.pendingAmount > 0 ? 'danger.300' : 'success.300',
                                        borderRadius: 'xl',
                                        p: 2,
                                        bgcolor: 'background.level1',
                                        cursor: 'pointer',
                                        transition: 'box-shadow 0.2s',
                                        boxShadow: 'sm',
                                        '&:hover': {
                                            boxShadow: 'md',
                                            bgcolor: 'background.level2',
                                        },
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                    onClick={() => router.push(`/${params.room_id}/members/${stat.member.id}`)}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ position: 'relative', flexShrink: 0 }}>
                                            {stat.member.profile ? (
                                                <Box
                                                    component="img"
                                                    src={stat.member.profile}
                                                    alt={stat.member.name}
                                                    sx={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <Box sx={{
                                                    width: 48, height: 48, borderRadius: '50%',
                                                    bgcolor: 'primary.100', border: '2px solid', borderColor: 'primary.200',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Typography level="body-sm" sx={{ color: 'primary.600', fontWeight: 700 }}>
                                                        {stat.member.name?.[0]?.toUpperCase()}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {stat.status === 'settled' ? (
                                                <CheckCircleRounded sx={{
                                                    position: 'absolute', bottom: -2, right: -2,
                                                    fontSize: 18, color: '#22c55e',
                                                    bgcolor: 'white', borderRadius: '50%',
                                                }} />
                                            ) : (
                                                <AccessTimeRounded sx={{
                                                    position: 'absolute', bottom: -2, right: -2,
                                                    fontSize: 18, color: '#f59e0b',
                                                    bgcolor: 'white', borderRadius: '50%',
                                                }} />
                                            )}
                                        </Box>
                                        <Box>
                                            <Typography level="title-sm" sx={{ fontSize: '1rem' }}>
                                                {stat.member.name}
                                            </Typography>
                                            <Chip
                                                size="sm"
                                                color={stat.status === 'settled' ? 'success' : 'warning'}
                                                sx={{ mt: 0.5 }}
                                            >
                                                {stat.status === 'settled' ? 'Settled' : 'Pending'}
                                            </Chip>
                                        </Box>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{
                                            color: stat.pendingAmount > 0 ? 'danger.500' : 'success.500',
                                            fontWeight: 'bold',
                                            fontSize: '1.4rem'
                                        }}>
                                            {formatCurrency(stat.pendingAmount)}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                    
                    {/* Desktop View */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' }, overflowX: 'auto' }}>
                        <Table hoverRow sx={{ minWidth: 650 }}>
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Total Purchases</th>
                                    <th>Amount Received</th>
                                    <th>Monthly Contributions</th>
                                    <th>Pending Amount</th>
                                    <th>Last Payment</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memberStats.map((stat) => (
                                    <tr
                                        key={stat.member.id}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => router.push(`/${params.room_id}/members/${stat.member.id}`)}
                                    >
                                        <td>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                {stat.member.profile ? (
                                                    <Box
                                                        component="img"
                                                        src={stat.member.profile}
                                                        alt={stat.member.name}
                                                        sx={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                                    />
                                                ) : (
                                                    <Box sx={{
                                                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                                        bgcolor: 'primary.100', border: '2px solid', borderColor: 'primary.200',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <Typography level="body-xs" sx={{ color: 'primary.600', fontWeight: 700 }}>
                                                            {stat.member.name?.[0]?.toUpperCase()}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                <Typography level="title-sm" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                                    {stat.member.name}
                                                </Typography>
                                            </Box>
                                        </td>
                                        <td>
                                            <Typography sx={{ color: 'success.500', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                                {formatCurrency(stat.totalPurchases)}
                                            </Typography>
                                        </td>
                                        <td>
                                            <Typography sx={{ color: 'primary.500', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                                {formatCurrency(stat.totalReceived)}
                                            </Typography>
                                        </td>
                                        <td>
                                            <Typography sx={{ color: 'warning.500', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                                {formatCurrency(stat.totalContributed)}
                                            </Typography>
                                        </td>
                                        <td>
                                            <Typography sx={{ 
                                                color: stat.pendingAmount > 0 ? 'danger.500' : 'success.500', 
                                                fontSize: { xs: '0.95rem', sm: '1rem' } 
                                            }}>
                                                {formatCurrency(stat.pendingAmount)}
                                            </Typography>
                                        </td>
                                        <td>
                                            <Typography level="body-sm" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                                                {stat.lastPayment}
                                            </Typography>
                                        </td>
                                        <td>
                                            <Chip
                                                size="sm"
                                                color={stat.status === 'settled' ? 'success' : 'warning'}
                                            >
                                                {stat.status === 'settled' ? 'Settled' : 'Pending'}
                                            </Chip>
                                        </td>
                                        <td>
                                            {/* No View Details button, row is clickable */}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Box>
                </Box>
        </Box>
    );
}