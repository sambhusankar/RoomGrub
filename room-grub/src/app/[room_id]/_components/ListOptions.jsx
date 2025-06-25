// You need to install @mui/joy if not already: npm install @mui/joy
// filepath: /home/sankar/PROJECTS/RoomGrub/room-grub/src/app/[room_id]/page.jsx
'use client'

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sheet from '@mui/joy/Sheet';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import useUserRole from '@/hooks/useUserRole'

export default function Page() {
  const { room_id } = useParams();
  const router = useRouter();
  const {role, loadings} = useUserRole()

  const navigateTo = (path) => {
    router.push(`${room_id}/${path}`);
  };

  return (
    <Sheet
      sx={{
        bgcolor: 'background.level1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4,
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 400,
          mt: 7,
          borderRadius: 'md',
          boxShadow: 'md',
          p: 3,
          bgcolor: 'background.surface',
        }}
      >
        <List
          sx={{
            gap: 2,
          }}
        >
          <ListItem>
            <Button
              fullWidth
              variant="soft"
              color="primary"
              onClick={() => navigateTo('/members')}
            >
              Members
            </Button>
          </ListItem>
          <ListItem>
            <Button
              fullWidth
              variant="soft"
              color="primary"
              onClick={() => navigateTo('/balance')}
            >
              Balance
            </Button>
          </ListItem>
          <ListItem>
            <Button
              fullWidth
              variant="soft"
              color="primary"
              onClick={() => navigateTo('/expenses')}
            >
              Expenses
            </Button>
          </ListItem>
          <ListItem>
            <Button
              fullWidth
              variant="soft"
              color="primary"
              onClick={() => navigateTo('/payments')}
            >
              Payments
            </Button>
          </ListItem>
          <ListItem>
            <Button
              fullWidth
              variant="soft"
              color="primary"
              onClick={() => navigateTo('/addgroccery')}
            >
              Add Groccery
            </Button>
          </ListItem>
          { !loadings && role == 'Admin' &&
          (<ListItem>
            <Button
              fullWidth
              variant="soft"
              color="success"
              onClick={() => navigateTo('/admin')}
            >
              Admin Dashboard
            </Button>
          </ListItem>
          )}
        </List>
      </Sheet>
    </Sheet>
  );
}
