'use client'
import React from 'react';
import { Box, Button, Typography, Sheet } from '@mui/joy';
import { useParams, useRouter } from 'next/navigation';
import HistoryIcon from '@mui/icons-material/History';

export default function ActivityHistoryCard() {
  const params = useParams();
  const router = useRouter();

  const handleNavigateToActivities = () => {
    router.push(`/${params.room_id}/settings/activities`);
  };

  return (
    <Sheet
      variant="outlined"
      sx={{
        padding: 3,
        width: '100%',
        borderRadius: '12px',
        bgcolor: 'background.surface',
        border: '1px solid',
        borderColor: 'neutral.outlinedBorder',
      }}
    >
      <Typography level="title-md" sx={{ marginBottom: 2, fontWeight: 600 }}>
        Activity History
      </Typography>

      <Typography level="body-sm" sx={{ marginBottom: 2, color: 'text.secondary' }}>
        View and manage all room activities including groceries and payments.
        {' '}Admins can edit or delete activities.
      </Typography>

      <Button
        onClick={handleNavigateToActivities}
        variant="solid"
        startDecorator={<HistoryIcon />}
        sx={{
          width: '100%',
          backgroundColor: "blue",
          '&:hover': {
            backgroundColor: "darkblue"
          }
        }}
      >
        View Activity History
      </Button>
    </Sheet>
  );
}
