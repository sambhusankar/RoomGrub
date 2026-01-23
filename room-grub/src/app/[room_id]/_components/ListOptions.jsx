'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sheet from '@mui/joy/Sheet';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';

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
    label: 'Splits',
    subtext: 'Split expenses and settle balances',
    icon: Analytics,
    path: '/splits',
  },
];

export default function ListOptions({ userRole }) {
  const { room_id } = useParams();
  const router = useRouter();

  const navigateTo = (path) => {
    router.push(`${room_id}${path}`);
  };

  return (
    <>
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
                  </Box>
                </Button>
              </ListItem>
            ))}

            {userRole === 'Admin' && (
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
                  </Box>
                </Button>
              </ListItem>
            )}
          </List>
        </Sheet>
      </Sheet>

      {/* Fixed Floating Action Button for Add Grocery */}
      <Button
        onClick={() => navigateTo('/addgroccery')}
        variant="solid"
        color="success"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          minWidth: 56,
          minHeight: 56,
          borderRadius: '50%',
          zIndex: 1000,
          boxShadow: 'lg',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
      >
        <ShoppingCart />
      </Button>
    </>
  );
}
