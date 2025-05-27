'use client';

import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { createClient } from '@/utils/supabase/client'
import { useParams } from 'next/navigation'

export default function InvitePage() {
  const param = useParams();
  const supabase = createClient()
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleInvite = async () => {
    if (!email) {
      setStatus('Please enter a valid email.');
      return;
    }
    console.log(param.room_id)
    const {error: insertError} = await supabase
    .from("Invite")
    .insert({
        email: email,
        room: param.room_id
    })
    // TODO: Replace this with actual invite logic (e.g., API call)
    console.log('Sending invite to:', email);
    setStatus(`Invite sent to ${email}`);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Invite a Member</h2>

        <TextField
          label="Email Address"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleInvite}
          sx={{ fontWeight: 'bold', paddingY: 1 }}
        >
          Send Invite
        </Button>

        {status && (
          <p className="mt-4 text-sm text-green-600 font-medium">{status}</p>
        )}
      </div>
    </div>
  );
}
