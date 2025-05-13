'use client'
import React from 'react';

const TransactionHistory = ({ user, transactions }) => {
    const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    return (
        <div className="max-w-lg mx-auto p-6 border rounded-lg bg-gray-50 text-black">
            {/* User Info */}
            <div className="flex items-center mb-6">
                <img
                    src={user.picture}
                    alt={`${user.name}'s profile`}
                    className="w-12 h-12 rounded-full mr-4"
                />
                <h2 className="text-xl font-bold">{user.name}</h2>
            </div>

            {/* Transactions */}
            <div className="space-y-4 mb-6">
                {transactions.map((transaction, index) => (
                    <div
                        key={index}
                        className="p-4 border rounded-lg bg-white shadow-sm"
                    >
                        <p>
                            <strong>Amount:</strong> ${transaction.amount}
                        </p>
                        <p>
                            <strong>Date:</strong> {transaction.date}
                        </p>
                        <p>
                            <strong>Grocery:</strong> {transaction.grocery}
                        </p>
                    </div>
                ))}
            </div>

            {/* Total Amount */}
            <div className="text-center">
                <button className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                    Pay ${totalAmount}
                </button>
            </div>
        </div>
    );
};

export default function Page() {
    const dummyUser = {
        name: 'John Doe',
        picture: 'https://via.placeholder.com/50',
    };

    const dummyTransactions = [
        { amount: 50, date: '2023-10-01', grocery: 'Milk, Bread' },
        { amount: 30, date: '2023-10-02', grocery: 'Eggs, Butter' },
        { amount: 20, date: '2023-10-03', grocery: 'Fruits, Vegetables' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <TransactionHistory user={dummyUser} transactions={dummyTransactions} />
        </div>
    );
}
