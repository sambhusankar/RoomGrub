import React from 'react';

export default async function page({ params }) {
    const { room_id } = await params;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
            <h2 className="text-sm font-bold text-gray-800 absolute top-4 left-4">
                Manage your room wisely {room_id}
            </h2>
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4 mt-16">
                <ul className="space-y-4">
                    <li className="bg-white shadow rounded-lg p-4">
                        <a
                            href=""
                            className="block text-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Members
                        </a>
                    </li>
                    <li className="bg-white shadow rounded-lg p-4">
                        <a
                            href=""
                            className="block text-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Balance
                        </a>
                    </li>
                    <li className="bg-white shadow rounded-lg p-4">
                        <a
                            href=""
                            className="block text-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Expenses
                        </a>
                    </li>
                    <li className="bg-white shadow rounded-lg p-4">
                        <a
                            href=""
                            className="block text-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Payments
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
