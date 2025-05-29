'use client'
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'

const MembersPage = () => {
    const supabase = createClient()
    const param = useParams()
    const router = useRouter()
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching members from a database
        const fetchMembers = async () => {
            setLoading(true);
            try {
                const { data: Members, error: fetchError } = await supabase
                .from("Users")
                .select("*")
                .eq("room", param.room_id)
                setMembers(Members);
            } catch (error) {
                console.error('Error fetching members:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const handleAddFriend = () => {
        // Logic to add a new friend
        //lert('Add Friend button clicked!');
        router.push(`${window.location.pathname}/add`)
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="p-5 bg-white min-h-screen">
            <h1 className="text-black text-2xl font-bold mb-5">Room Members</h1>
            {members.length === 0 ? (
                <p className="text-black">No friends added in your room.</p>
            ) : (
                <div className="flex flex-wrap gap-5">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="border border-gray-300 rounded-lg p-5 w-full max-w-xs text-center text-black bg-white h-40 flex flex-col justify-center"
                        >
                            <h3 className="text-lg font-semibold text-black">{member.name}</h3>
                        </div>
                    ))}
                </div>
            )}
            <button
                onClick={handleAddFriend}
                className="mt-5 px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
                Add Friend
            </button>
        </div>
    );
};

export default MembersPage;
