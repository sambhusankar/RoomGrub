'use client';

import React, { useMemo, useState } from 'react';
import { 
    Box, 
    Typography, 
    Card, 
    Grid, 
    Button, 
    Select,
    Option,
    Table,
    Sheet,
    Chip,
    Alert
} from '@mui/joy';
import { 
    Download, 
    PictureAsPdf, 
    TableChart,
    Receipt,
    Person,
    Calculate
} from '@mui/icons-material';

export default function ReportGenerator({ expenses, payments, members, filters, roomId }) {
    const [reportType, setReportType] = useState('summary');
    const [exportFormat, setExportFormat] = useState('csv');

    // Generate report data based on type
    const reportData = useMemo(() => {
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.money || 0), 0);
        const numberOfMembers = members.length;
        const equalShare = totalExpenses / numberOfMembers;

        // Calculate member-wise data
        const memberStats = {};
        members.forEach(member => {
            memberStats[member.email] = {
                member,
                expenses: 0,
                payments: 0,
                expenseCount: 0,
                transactions: []
            };
        });

        // Process expenses
        expenses.forEach(expense => {
            if (memberStats[expense.user]) {
                memberStats[expense.user].expenses += parseFloat(expense.money || 0);
                memberStats[expense.user].expenseCount += 1;
                memberStats[expense.user].transactions.push({
                    type: 'expense',
                    date: expense.created_at,
                    description: expense.material || 'Expense',
                    amount: parseFloat(expense.money || 0)
                });
            }
        });

        // Process payments
        payments.forEach(payment => {
            if (memberStats[payment.user]) {
                const amount = parseFloat(payment.amount || 0);
                if (payment.status === 'credit') {
                    memberStats[payment.user].payments += amount;
                } else if (payment.status === 'debit') {
                    memberStats[payment.user].payments -= amount;
                }
                memberStats[payment.user].transactions.push({
                    type: payment.status,
                    date: payment.created_at,
                    description: 'Payment',
                    amount: amount
                });
            }
        });

        // Calculate balances
        const memberBalances = Object.values(memberStats).map(stat => ({
            ...stat,
            shouldPay: equalShare,
            balance: stat.expenses - equalShare,
            status: stat.expenses - equalShare > 0 ? 'credit' : 
                    stat.expenses - equalShare < 0 ? 'debit' : 'even'
        }));

        return {
            totalExpenses,
            equalShare,
            memberBalances,
            summary: {
                totalTransactions: expenses.length + payments.length,
                averagePerTransaction: (totalExpenses / (expenses.length || 1)),
                activeMembers: memberBalances.filter(mb => mb.expenses > 0).length,
                pendingSettlements: memberBalances.filter(mb => Math.abs(mb.balance) > 0.01).length
            }
        };
    }, [expenses, payments, members]);

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(amount));
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN');
    };

    // Generate CSV data
    const generateCSVData = () => {
        let csvData = '';
        
        if (reportType === 'summary') {
            csvData = 'Member,Expenses,Should Pay,Balance,Status\n';
            reportData.memberBalances.forEach(mb => {
                csvData += `"${mb.member.name || mb.member.email}",${mb.expenses},${mb.shouldPay},${mb.balance},"${mb.status}"\n`;
            });
        } else if (reportType === 'detailed') {
            csvData = 'Member,Date,Type,Description,Amount\n';
            reportData.memberBalances.forEach(mb => {
                mb.transactions.forEach(tx => {
                    csvData += `"${mb.member.name || mb.member.email}","${formatDate(tx.date)}","${tx.type}","${tx.description}",${tx.amount}\n`;
                });
            });
        } else if (reportType === 'expenses') {
            csvData = 'Date,Member,Description,Amount\n';
            expenses.forEach(exp => {
                const member = members.find(m => m.email === exp.user);
                csvData += `"${formatDate(exp.created_at)}","${member?.name || exp.user}","${exp.material || 'Expense'}",${exp.money}\n`;
            });
        }
        
        return csvData;
    };

    // Download CSV
    const downloadCSV = () => {
        const csvData = generateCSVData();
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `room-${roomId}-${reportType}-report.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Generate printable report (simple HTML for now - can be enhanced with PDF library)
    const generatePrintableReport = () => {
        const reportWindow = window.open('', '_blank');
        const reportHTML = `
            <html>
                <head>
                    <title>Room ${roomId} - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                        th { background-color: #f5f5f5; font-weight: bold; }
                        .header { margin-bottom: 30px; }
                        .summary-stats { display: flex; gap: 20px; margin: 20px 0; }
                        .stat-card { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Room ${roomId} Expense Report</h1>
                        <p>Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
                        <p>Generated on: ${new Date().toLocaleDateString('en-IN')}</p>
                        <p>Period: ${filters.period || 'All time'}</p>
                    </div>
                    
                    <div class="summary-stats">
                        <div class="stat-card">
                            <h3>Total Expenses</h3>
                            <p>${formatAmount(reportData.totalExpenses)}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Per Member Share</h3>
                            <p>${formatAmount(reportData.equalShare)}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Active Members</h3>
                            <p>${reportData.summary.activeMembers}/${members.length}</p>
                        </div>
                    </div>
                    
                    ${reportType === 'summary' ? `
                        <h2>Member Summary</h2>
                        <table>
                            <tr>
                                <th>Member</th>
                                <th>Expenses</th>
                                <th>Should Pay</th>
                                <th>Balance</th>
                                <th>Status</th>
                            </tr>
                            ${reportData.memberBalances.map(mb => `
                                <tr>
                                    <td>${mb.member.name || mb.member.email}</td>
                                    <td>${formatAmount(mb.expenses)}</td>
                                    <td>${formatAmount(mb.shouldPay)}</td>
                                    <td>${formatAmount(mb.balance)}</td>
                                    <td>${mb.status === 'credit' ? 'Gets back' : mb.status === 'debit' ? 'Owes' : 'Even'}</td>
                                </tr>
                            `).join('')}
                        </table>
                    ` : ''}
                </body>
            </html>
        `;
        
        reportWindow.document.write(reportHTML);
        reportWindow.document.close();
        reportWindow.print();
    };

    return (
        <Box>
            {/* Report Configuration */}
            <Card sx={{ mb: 3, p: 3 }}>
                <Typography level="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Generate Reports
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid xs={12} md={6}>
                        <Typography level="body-sm" sx={{ mb: 1 }}>Report Type</Typography>
                        <Select
                            value={reportType}
                            onChange={(_, value) => setReportType(value)}
                        >
                            <Option value="summary">Member Summary</Option>
                            <Option value="detailed">Detailed Transactions</Option>
                            <Option value="expenses">Expenses Only</Option>
                            <Option value="settlements">Settlement Report</Option>
                        </Select>
                    </Grid>
                    
                    <Grid xs={12} md={6}>
                        <Typography level="body-sm" sx={{ mb: 1 }}>Export Format</Typography>
                        <Select
                            value={exportFormat}
                            onChange={(_, value) => setExportFormat(value)}
                        >
                            <Option value="csv">CSV (Excel)</Option>
                            <Option value="print">Printable Report</Option>
                        </Select>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        startDecorator={exportFormat === 'csv' ? <TableChart /> : <PictureAsPdf />}
                        onClick={exportFormat === 'csv' ? downloadCSV : generatePrintableReport}
                        color="primary"
                    >
                        {exportFormat === 'csv' ? 'Download CSV' : 'Generate Print Report'}
                    </Button>
                </Box>
            </Card>

            {/* Report Preview */}
            <Card sx={{ p: 3 }}>
                <Typography level="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Report Preview
                </Typography>

                {/* Summary Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid xs={6} md={3}>
                        <Card variant="soft" color="primary" size="sm">
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Typography level="body-xs" color="neutral">Total Expenses</Typography>
                                <Typography level="title-md" sx={{ fontWeight: 'bold' }}>
                                    {formatAmount(reportData.totalExpenses)}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid xs={6} md={3}>
                        <Card variant="soft" color="success" size="sm">
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Typography level="body-xs" color="neutral">Per Member</Typography>
                                <Typography level="title-md" sx={{ fontWeight: 'bold' }}>
                                    {formatAmount(reportData.equalShare)}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid xs={6} md={3}>
                        <Card variant="soft" color="warning" size="sm">
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Typography level="body-xs" color="neutral">Transactions</Typography>
                                <Typography level="title-md" sx={{ fontWeight: 'bold' }}>
                                    {reportData.summary.totalTransactions}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid xs={6} md={3}>
                        <Card variant="soft" color="neutral" size="sm">
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Typography level="body-xs" color="neutral">Active Members</Typography>
                                <Typography level="title-md" sx={{ fontWeight: 'bold' }}>
                                    {reportData.summary.activeMembers}/{members.length}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>

                {/* Report Data Preview */}
                {reportType === 'summary' && (
                    <Sheet variant="outlined" sx={{ borderRadius: 'md' }}>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Total Expenses</th>
                                    <th>Should Pay</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.memberBalances.map((mb) => (
                                    <tr key={mb.member.email}>
                                        <td>{mb.member.name || mb.member.email}</td>
                                        <td>{formatAmount(mb.expenses)}</td>
                                        <td>{formatAmount(mb.shouldPay)}</td>
                                        <td>
                                            <Typography
                                                sx={{
                                                    color: mb.status === 'credit' ? 'success.600' : 
                                                           mb.status === 'debit' ? 'warning.600' : 'text.primary'
                                                }}
                                            >
                                                {mb.status === 'even' ? '₹0' : formatAmount(mb.balance)}
                                            </Typography>
                                        </td>
                                        <td>
                                            <Chip
                                                size="sm"
                                                variant="soft"
                                                color={
                                                    mb.status === 'credit' ? 'success' : 
                                                    mb.status === 'debit' ? 'warning' : 'neutral'
                                                }
                                            >
                                                {mb.status === 'credit' ? 'Gets Back' : 
                                                 mb.status === 'debit' ? 'Owes' : 'Settled'}
                                            </Chip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Sheet>
                )}

                {reportType === 'expenses' && (
                    <Sheet variant="outlined" sx={{ borderRadius: 'md', maxHeight: 400, overflow: 'auto' }}>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Member</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.slice(0, 50).map((expense) => {
                                    const member = members.find(m => m.email === expense.user);
                                    return (
                                        <tr key={expense.id}>
                                            <td>{formatDate(expense.created_at)}</td>
                                            <td>{member?.name || expense.user}</td>
                                            <td>{expense.material || 'Expense'}</td>
                                            <td>{formatAmount(parseFloat(expense.money || 0))}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                        {expenses.length > 50 && (
                            <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.level1' }}>
                                <Typography level="body-sm" color="neutral">
                                    Showing first 50 expenses. Download full report to see all {expenses.length} entries.
                                </Typography>
                            </Box>
                        )}
                    </Sheet>
                )}

                {reportType === 'settlements' && (
                    <Box>
                        {reportData.memberBalances.filter(mb => Math.abs(mb.balance) > 0.01).length === 0 ? (
                            <Alert color="success" startDecorator={<Receipt />}>
                                All expenses are settled! No outstanding balances.
                            </Alert>
                        ) : (
                            <Grid container spacing={2}>
                                {reportData.memberBalances
                                    .filter(mb => Math.abs(mb.balance) > 0.01)
                                    .map((mb) => (
                                    <Grid xs={12} md={6} key={mb.member.email}>
                                        <Card variant="outlined" color={mb.status === 'credit' ? 'success' : 'warning'}>
                                            <Box sx={{ p: 2 }}>
                                                <Typography level="title-sm" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    {mb.member.name || mb.member.email}
                                                </Typography>
                                                <Typography level="body-sm" color="neutral" sx={{ mb: 1 }}>
                                                    Spent: {formatAmount(mb.expenses)} | Should pay: {formatAmount(mb.shouldPay)}
                                                </Typography>
                                                <Typography 
                                                    level="title-md" 
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        color: mb.status === 'credit' ? 'success.600' : 'warning.600'
                                                    }}
                                                >
                                                    {mb.status === 'credit' ? 'Should receive' : 'Should pay'}: {formatAmount(mb.balance)}
                                                </Typography>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}
            </Card>
        </Box>
    );
}