'use client'
import React, { useState, useTransition } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
} from '@mui/joy';
import { editGroceryActivity } from '../action';

export default function EditActivityDialog({ open, onClose, activity, roomId }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target);

    startTransition(async () => {
      const result = await editGroceryActivity(activity.id, formData);

      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ maxWidth: 500, borderRadius: '12px', p: 3 }}>
        <ModalClose />
        <Typography level="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Edit Expense
        </Typography>

        {error && (
          <Box sx={{
            p: 2,
            mb: 2,
            bgcolor: 'danger.softBg',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'danger.outlinedBorder',
          }}>
            <Typography level="body-sm" sx={{ color: 'danger.solidColor' }}>
              {error}
            </Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Item Name</FormLabel>
            <Input
              name="material"
              defaultValue={activity.description}
              required
              disabled={isPending}
            />
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Amount (₹)</FormLabel>
            <Input
              name="money"
              type="number"
              step="0.01"
              defaultValue={activity.amount}
              required
              disabled={isPending}
            />
          </FormControl>

          <FormControl sx={{ mb: 3 }}>
            <FormLabel>Date</FormLabel>
            <Input
              name="created_at"
              type="date"
              defaultValue={activity.createdAt?.split('T')[0]}
              required
              disabled={isPending}
            />
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="plain"
              color="neutral"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isPending}
              sx={{
                backgroundColor: 'blue',
                '&:hover': { backgroundColor: 'darkblue' },
              }}
            >
              Save Changes
            </Button>
          </Box>
        </form>
      </ModalDialog>
    </Modal>
  );
}
