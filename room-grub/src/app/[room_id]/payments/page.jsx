import React from 'react';

const PaymentHistoryCard = ({ name, amount }) => {
    return (
        <div style={styles.card}>
            <div style={styles.name}>{name}</div>
            <div style={styles.amount}>${amount}</div>
        </div>
    );
};

const PaymentHistory = ({ payments }) => {
    return (
        <div style={styles.container}>
            {payments.map((payment, index) => (
                <PaymentHistoryCard key={index} name={payment.name} amount={payment.amount} />
            ))}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '20px',
    },
    card: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
    },
    name: {
        fontSize: '16px',
        fontWeight: 'bold',
    },
    amount: {
        fontSize: '16px',
        color: '#4caf50',
    },
};

const Page = () => {
    const payments = [
        { name: 'John Doe', amount: 120 },
        { name: 'Jane Smith', amount: 150 },
        { name: 'Alice Johnson', amount: 200 },
        { name: 'Bob Brown', amount: 90 },
    ];

    return (
        <div>
            <h1>Payment History</h1>
            <PaymentHistory payments={payments} />
        </div>
    );
};

export default Page;