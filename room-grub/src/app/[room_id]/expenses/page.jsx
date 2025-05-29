'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'

const ExpenseHistory = () => {
    const supabase = createClient()
    const param = useParams()
    const [filter, setFilter] = useState('');
    const [expenses, setExpenses] = useState([]);
    useEffect(() => {
            // Simulate fetching Expenses from a database
            const fetchExpenses = async () => {
                try {
                    const { data: Expenses, error: fetchError } = await supabase
                    .from("Spendings")
                    .select("*")
                    .eq("room", param.room_id)
                    setExpenses(Expenses);
                } catch (error) {
                    console.error('Error fetching Expenses:', error);
                }
            };
    
            fetchExpenses();
        }, []);
    const filteredExpenses = expenses.filter((expense) =>
        expense.category.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded-md">
            <h1 className="text-xl font-bold mb-4">Expense History</h1>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Filter by category"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <ul className="space-y-4">
                {filteredExpenses.map((expense) => (
                    <li
                        key={expense.id}
                        className="flex justify-between items-center p-3 bg-gray-100 rounded-md shadow-sm"
                    >
                        <div>
                            <p className="font-medium">{expense.name}</p>
                            <p className="text-sm text-gray-500">{expense.date}</p>
                            <p className="text-sm text-gray-500">{expense.category}</p>
                        </div>
                        <p className="font-bold">{expense.amount}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ExpenseHistory;