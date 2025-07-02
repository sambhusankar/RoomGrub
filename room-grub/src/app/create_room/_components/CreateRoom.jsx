'use client';
import React from 'react';
import { Button } from '@mui/material';
import { createRoom } from '../action'

export default function CreateRoom() {
  const handleCreateRoom = async () => {
    await createRoom();
  };

  return (
    <div>
      <h2 className="font-bold m-3">You are not joined any room</h2>
      <div className="m-8 text-center">
        <Button
          sx={{
            backgroundColor: 'blue',
            color: 'white',
            padding: '5px 5px',
            fontWeight: 'bold',
            margin: '5px',
            '&:hover': {
              backgroundColor: 'darkblue'
            }
          }}
          onClick={handleCreateRoom}
        >
          Create & Manage Your Room
        </Button>
        <p>--------------------- OR ------------------------</p>
        <p className="m-5 text-gray">Tell your friend to add you as a member</p>
      </div>
    </div>
  );
}