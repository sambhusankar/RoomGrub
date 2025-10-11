'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sheet from '@mui/joy/Sheet';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import useUserRole from '@/hooks/useUserRole';

import {
  Group,
  AccountBalanceWallet,
  ReceiptLong,
  Payment,
  ShoppingCart,
  Dashboard,
  Analytics,
} from '@mui/icons-material';

const navItems = [
  {
    label: 'Members',
    subtext: 'Manage or view room members',
    icon: Group,
    path: '/members',
  },
  {
    label: 'Balance',
    subtext: 'See your current balance',
    icon: AccountBalanceWallet,
    path: '/balance',
  },
  {
    label: 'Expenses',
    subtext: 'Track shared expenses',
    icon: ReceiptLong,
    path: '/expenses',
  },
  {
    label: 'Payments',
    subtext: 'View or add payments',
    icon: Payment,
    path: '/payments',
  },
  {
    label: 'Add Grocery',
    subtext: 'Add items to grocery list',
    icon: ShoppingCart,
    path: '/addgroccery',
  },
  {
    label: 'Analytics & Splits',
    subtext: 'View reports and settle expenses',
    icon: Analytics,
    path: '/analytics',
  },
];

export default function Page() {
  const { room_id } = useParams();
  const router = useRouter();
  const { role, loadings } = useUserRole();

  const navigateTo = (path) => {
    router.push(`${room_id}${path}`);
  };

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
        sx={{
          width: '100%',
          maxWidth: 500,
          bgcolor: 'transparent',
        }}
      >
        <List
          sx={{
            gap: 2,
          }}
        >
          {navItems.map(({ label, subtext, icon: Icon, path }) => (
            <ListItem
              key={label}
              sx={{
                alignItems: 'stretch',
                padding: 0,
              }}
            >
              <Button
                fullWidth
                variant="soft"
                color="primary"
                onClick={() => navigateTo(path)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  padding: 2,
                  minHeight: 70,
                  textAlign: 'left',
                  gap: 2,
                  bgcolor: 'background.level1', // ✅ light background
                  boxShadow: 'sm',              // ✅ subtle shadow
                  borderRadius: 'md',
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #7b61ff, #619eff)',
                    borderRadius: '12px',
                    padding: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography level="title-md">{label}</Typography>
                  <Typography level="body-sm" color="neutral">
                    {subtext}
                  </Typography>
                </Box>
              </Button>
            </ListItem>
          ))}

          {!loadings && role === 'Admin' && (
            <ListItem sx={{ alignItems: 'stretch', padding: 0 }}>
              <Button
                fullWidth
                variant="soft"
                color="success"
                onClick={() => navigateTo('/admin')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  padding: 2,
                  minHeight: 70,
                  textAlign: 'left',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #00c851, #007e33)',
                    borderRadius: '12px',
                    padding: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Dashboard sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography level="title-md">Admin Dashboard</Typography>
                  <Typography level="body-sm" color="neutral">
                    Manage the room settings
                  </Typography>
                </Box>
              </Button>
            </ListItem>
          )}
        </List>
      </Sheet>
    </Sheet>
  );
}
