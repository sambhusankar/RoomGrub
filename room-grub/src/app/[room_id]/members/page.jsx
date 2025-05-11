'use client'
import React, { useEffect, useState } from 'react';

const MembersPage = () => {
    const [members, setMembers] = useState(['ram', 'shyam', 'sita']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching members from a database
        const fetchMembers = async () => {
            setLoading(true);
            try {
                // Replace with your actual API call
                const response = await fetch('/api/members');
                const data = await response.json();
                setMembers(data);
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
        alert('Add Friend button clicked!');
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Room Members</h1>
            {members.length === 0 ? (
                <p>No friends added in your room.</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {members.map((member) => (
                        <div
                            key={member.id}
                            style={{
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                padding: '10px',
                                width: '200px',
                                textAlign: 'center',
                                color: 'white',
                            }}
                        >
                            <h3>{member.name}</h3>
                        </div>
                    ))}
                </div>
            )}
            <button
                onClick={handleAddFriend}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#007BFF',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Add Friend
            </button>
        </div>
    );
};

export default MembersPage;