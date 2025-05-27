'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Page({ params }) {
  const { room_id } = params;
  const router = useRouter();

  const navigateTo = (path) => {
    router.push(`${room_id}/${path}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h2 className="text-sm font-bold text-gray-800 absolute top-4 left-4">
        Manage your room wisely {room_id}
      </h2>
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4 mt-16">
        <ul className="space-y-4">
          <li className="bg-white shadow rounded-lg p-4 text-center">
            <button
              onClick={() => navigateTo('/members')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Members
            </button>
          </li>
          <li className="bg-white shadow rounded-lg p-4 text-center">
            <button
              onClick={() => navigateTo('/balance')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Balance
            </button>
          </li>
          <li className="bg-white shadow rounded-lg p-4 text-center">
            <button
              onClick={() => navigateTo('/expenses')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Expenses
            </button>
          </li>
          <li className="bg-white shadow rounded-lg p-4 text-center">
            <button
              onClick={() => navigateTo('/payments')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Payments
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
