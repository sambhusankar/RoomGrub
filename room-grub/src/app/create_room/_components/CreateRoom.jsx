'use client';

import { createRoom } from '../action';
import React from 'react';
import {
  Box, Typography, Sheet,
  Button,
  Divider,
  List,
  ListItem,
  Card,
  CardContent,
} from '@mui/joy';
import {
  Home,
  Add,
  PersonAdd,
  Groups,
  CheckCircle,
} from '@mui/icons-material';

export default function CreateRoom() {
  const features = [
    'Split expenses easily',
    'Track who owes what',
    'Manage shared groceries',
  ];

  const handleCreateRoom = async () => {
    await createRoom();
  };

  const handleJoinRequest = () => {
    alert('Ask your friend to invite you to a room.');
  };

  return (
    <Sheet
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.body',
        p: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          animation: 'fadeIn 0.6s ease-in-out',
        }}
      >
        {/* Hero Icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 3,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7b61ff, #619eff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'lg',
            animation: 'scaleIn 0.5s ease-in-out',
          }}
        >
          <Home sx={{ fontSize: 36, color: 'white' }} />
        </Box>

        {/* Heading */}
        <Typography level="h3" fontWeight="lg" mb={1}>
          Create Your First Room
        </Typography>
        <Typography level="body-md" textColor="text.secondary" mb={3}>
          Start managing shared expenses with your roommates
        </Typography>

        {/* Action Card */}
        <Card variant="outlined" sx={{ mb: 3, animationDelay: '200ms' }}>
          <CardContent sx={{ p: 3 }}>
            <Box mb={3}>
              <Button
                size="lg"
                fullWidth
                variant="solid"
                color="primary"
                startDecorator={<Add />}
                onClick={handleCreateRoom}
                sx={{
                  fontSize: '1rem',
                  fontWeight: 'lg',
                  py: 1.5,
                }}
              >
                Create New Room
              </Button>
              <Typography level="body-sm" textColor="text.secondary" mt={1}>
                Set up a room and invite your friends
              </Typography>
            </Box>

            <Divider>
              <Typography level="body-xs" textColor="text.tertiary">
                OR
              </Typography>
            </Divider>

            <Box mt={3}>
              <Button
                size="md"
                fullWidth
                variant="outlined"
                color="neutral"
                startDecorator={<PersonAdd />}
                onClick={handleJoinRequest}
              >
                Ask friends to invite you
              </Button>
              <Typography level="body-sm" textColor="text.secondary" mt={1}>
                Get an invitation link from your roommates
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Features List */}
        <Card variant="soft" sx={{ animationDelay: '400ms' }}>
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <Groups fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />
              <Typography level="title-sm">What you can do:</Typography>
            </Box>
            <List size="sm" sx={{ '--ListItemDecorator-size': '24px' }}>
              {features.map((feature, index) => (
                <ListItem key={index}>
                  <CheckCircle fontSize="small" color="success" />
                  <Typography level="body-sm" textColor="text.secondary" ml={1}>
                    {feature}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Sheet>
  );
}
