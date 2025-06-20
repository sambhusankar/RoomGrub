'use client'
import React from 'react';

const PaymentFormView = ({ roomId, users, addPayment }) => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="max-w-md mx-auto p-6 border rounded-lg bg-white shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-center text-black">Record Payment</h2>
                <form action={addPayment} className="space-y-4">
                    <input type="hidden" name="room" value={roomId} />
                    <input type="hidden" name="status" value="credit" />
                    
                    <div>
                        <label className="block text-sm font-medium mb-2 text-black">Select User</label>
                        <select
                            name="user"
                            className="w-full p-2 border rounded-lg text-black"
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
                        <label className="block text-sm font-medium mb-2 text-black">Amount (₹)</label>
                        <input
                            type="number"
                            name="amount"
                            step="0.01"
                            className="w-full p-2 border rounded-lg text-black"
                            placeholder="Enter amount"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        Record Payment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentFormView;