import React from 'react';

const BalancePage = () => {
    const totalCollected = 5000; // Example data
    const totalSpent = 3000; // Example data
    const currentBalance = totalCollected - totalSpent;

    const recentTransactions = [
        { id: 1, description: 'Groceries', amount: -500, date: '2023-10-01' },
        { id: 2, description: 'Rent', amount: -2000, date: '2023-09-30' },
        { id: 3, description: 'Salary', amount: 5000, date: '2023-09-28' },
    ];

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            <h1 style={{ textAlign: 'center' }}>Balance Overview</h1>
            <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>Total Collected</h2>
                    <p style={{ fontSize: '1.5rem', color: 'green' }}>₹{totalCollected}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h2>Total Spent</h2>
                    <p style={{ fontSize: '1.5rem', color: 'red' }}>₹{totalSpent}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h2>Current Balance</h2>
                    <p style={{ fontSize: '1.5rem', color: 'blue' }}>₹{currentBalance}</p>
                </div>
            </div>
            <div>
                <h2>Recent Transactions</h2>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {recentTransactions.map((transaction) => (
                        <li
                            key={transaction.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '10px',
                                borderBottom: '1px solid #ccc',
                            }}
                        >
                            <span>{transaction.description}</span>
                            <span>{transaction.date}</span>
                            <span style={{ color: transaction.amount < 0 ? 'red' : 'green' }}>
                                ₹{transaction.amount}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default BalancePage;