'use client';
import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Grid from '@mui/joy/Grid';
import Card from '@mui/joy/Card';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';

// Accept props or fetch data here
const BalanceView = ({ balanceData }) => {
    const {
        totalCredit = 0,
        totalDebit = 0,
        currentBalance = 0,
        transactions = [],
    } = balanceData || {};

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    return (
        <Box>
            <Grid container spacing={2} alignItems="center">
                <Grid xs={12} md={6}>
                    <Card variant="soft" sx={{ p: 3, minWidth: 300 }}>
                        <Typography level="body-sm" color="neutral" sx={{ mb: 1 }}>
                            Your Balance
                        </Typography>
                        <Typography level="h2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            ₹{currentBalance.toLocaleString('en-IN')}
                        </Typography>
                        <Typography level="body-xs" color="neutral" sx={{ mb: 2 }}>
                            Balance Available
                        </Typography>
                        {/* Amounts above the bar */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography level="body-xs" color="danger">
                                ₹{totalDebit.toLocaleString('en-IN')}
                            </Typography>
                            <Typography level="body-xs" color="success">
                                ₹{totalCredit.toLocaleString('en-IN')}
                            </Typography>
                        </Box>
                        {/* Progress bar */}
                        <Box sx={{ width: '100%', position: 'relative', mb: 0.5 }}>
                            <Box
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    background: '#e0e0e0',
                                    width: '100%',
                                    overflow: 'hidden',
                                    position: 'relative',
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        height: '100%',
                                        width: `${totalDebit + totalCredit === 0 ? 50 : (totalDebit / (totalDebit + totalCredit)) * 100}%`,
                                        backgroundColor: '#f44336',
                                        transition: 'width 0.3s',
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: `${totalDebit + totalCredit === 0 ? 50 : (totalDebit / (totalDebit + totalCredit)) * 100}%`,
                                        top: 0,
                                        height: '100%',
                                        width: `${totalDebit + totalCredit === 0 ? 50 : (totalCredit / (totalDebit + totalCredit)) * 100}%`,
                                        backgroundColor: '#4caf50',
                                        transition: 'width 0.3s',
                                    }}
                                />
                            </Box>
                        </Box>
                        {/* Labels below the bar */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography level="body-xs" color="danger">
                                Balance Used
                            </Typography>
                            <Typography level="body-xs" color="success">
                                Total Balance
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
            <Box sx={{ mt: 4 }}>
                <Typography level="title-md" sx={{ mb: 2 }}>
                    Recent Transactions
                </Typography>
                <List sx={{ maxWidth: 500 }}>
                    {transactions.length === 0 ? (
                        <ListItem>
                            <ListItemContent>
                                <Typography level="body-sm" color="neutral">
                                    No transactions found.
                                </Typography>
                            </ListItemContent>
                        </ListItem>
                    ) : (
                        transactions.map((txn, idx) => (
                            <ListItem key={txn.id || idx} sx={{ mb: 1 }}>
                                <ListItemDecorator>
                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            backgroundColor: txn.type === 'credit' ? '#e8f5e9' : '#ffebee',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: txn.type === 'credit' ? '#388e3c' : '#d32f2f',
                                            fontWeight: 'bold',
                                            fontSize: 18,
                                        }}
                                    >
                                        {txn.type === 'credit' ? '+' : '-'}
                                    </Box>
                                </ListItemDecorator>
                                <ListItemContent>
                                    <Typography level="body-md" sx={{ fontWeight: 500 }}>
                                        {txn.user || 'Unknown User'}
                                    </Typography>
                                    <Typography level="body-xs" color="neutral">
                                        {formatDate(txn.created_at)}
                                    </Typography>
                                </ListItemContent>
                                <Typography
                                    level="body-md"
                                    sx={{
                                        color: txn.status === 'credit' ? 'success.600' : 'danger.600',
                                        fontWeight: 600,
                                    }}
                                >
                                    {txn.status === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                                </Typography>
                            </ListItem>
                        ))
                    )}
                </List>
            </Box>
        </Box>
    );
};

export default BalanceView;
