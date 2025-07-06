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
import { Group, AccountBalanceWallet, ReceiptLong, Payment, ShoppingCart, Dashboard } from '@mui/icons-material';

export default function Page() {
  const { room_id } = useParams();
  const router = useRouter();
  const {role, loadings} = useUserRole()

  const navigateTo = (path) => {
    router.push(`${room_id}/${path}`);
  };

  // Import icons at the top of your file:
  // import GroupIcon from '@mui/icons-material/Group';
  // import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
  // import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
  // import PaymentIcon from '@mui/icons-material/Payment';
  // import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
  // import DashboardIcon from '@mui/icons-material/Dashboard';

  return (
    <Sheet
      sx={{
        bgcolor: 'transparent',
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
              startDecorator={<Group />}
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
              startDecorator={<AccountBalanceWallet />}
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
              startDecorator={<ReceiptLong />}
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
              startDecorator={<Payment />}
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
              startDecorator={<ShoppingCart />}
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
              startDecorator={<Dashboard />}
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
