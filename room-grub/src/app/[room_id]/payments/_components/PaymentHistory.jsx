'use client'
import React from 'react';
import { Card, CardContent, Typography } from '@mui/joy';

export default function PaymentHistory({ payments }){
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    // Override PaymentHistoryCard to use MUI Joy
    const PaymentHistoryCard = ({ user, amount, date }) => (
        <Card variant="outlined" sx={{ bgcolor: '#f9f9f9', mb: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography level="title-md" sx={{ color: 'black', fontWeight: 'bold' }}>{user}</Typography>
                <Typography level="body-sm" sx={{ color: 'black' }}>{date}</Typography>
                <Typography level="title-md" sx={{ color: 'black', fontWeight: 'bold' }}>₹{amount}</Typography>
            </CardContent>
        </Card>
    );

    return (
        <div style = {{color: 'black', padding: '20px', backgroundColor: '#f0f0f0'}}>
            <h1>Payment History</h1>
            <div style={{ maxWidth: '600px', margin: '0 auto', color: 'black' }}>
                {payments.length === 0 ? (
                    <p>No payments found</p>
                ) : (
                    payments.map((payment) => (
                        <PaymentHistoryCard 
                            key={payment.id} 
                            user={payment.user || 'Unknown User'} 
                            amount={parseFloat(payment.amount).toFixed(2)}
                            date={formatDate(payment.created_at)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
