'use client'
import React, { useState } from 'react';

const PaymentForm = ({ roomId, users, onPaymentSuccess }) => {
    const [amount, setAmount] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !selectedUser) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('amount', amount);
            formData.append('user', selectedUser);
            formData.append('room', roomId);
            formData.append('status', 'credit');

            const response = await fetch('/api/balance', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setAmount('');
                setSelectedUser('');
                onPaymentSuccess?.();
                alert('Payment recorded successfully!');
            } else {
                alert('Error recording payment');
            }
        } catch (error) {
            alert('Error recording payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 border rounded-lg bg-white shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Record Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Select User</label>
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        required
                    >
                        <option value="">Choose a user</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Enter amount"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                    {isSubmitting ? 'Recording...' : 'Record Payment'}
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;