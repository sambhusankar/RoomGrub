'use client'
import React, { useState } from 'react';
import { Box, Typography, IconButton, Chip, Sheet } from '@mui/joy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { format } from 'date-fns';
import EditActivityDialog from './EditActivityDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

export default function ActivityCard({ activity, isAdmin, roomId }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formattedDate = format(new Date(activity.createdAt), 'MMM dd, yyyy');

  return (
    <>
      <Sheet
        variant="outlined"
        sx={{
          padding: 3,
          borderRadius: '12px',
          bgcolor: 'background.surface',
          border: '1px solid',
          borderColor: 'neutral.outlinedBorder',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.outlinedBorder',
            boxShadow: 'sm',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'primary.softBg',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.solidColor',
              flexShrink: 0,
            }}>
              <ShoppingCartIcon />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography level="title-md" sx={{ fontWeight: 600 }}>
                  {activity.description}
                </Typography>
                <Chip size="sm" color="warning" variant="soft">
                  Pending
                </Chip>
              </Box>

              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1 }}>
                By: {activity.user}
              </Typography>

              <Typography level="title-lg" sx={{ fontWeight: 700, color: 'primary.solidColor' }}>
                ₹{parseFloat(activity.amount).toFixed(2)}
              </Typography>

              <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 1 }}>
                {formattedDate}
              </Typography>
            </Box>
          </Box>

          {isAdmin && (
            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              <IconButton
                size="sm"
                variant="soft"
                color="primary"
                onClick={() => setEditDialogOpen(true)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="sm"
                variant="soft"
                color="danger"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Sheet>

      <EditActivityDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        activity={activity}
        roomId={roomId}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        activity={activity}
        roomId={roomId}
      />
    </>
  );
}
