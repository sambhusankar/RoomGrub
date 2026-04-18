'use client'
import React, { useState, useTransition } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Button,
  Box,
} from '@mui/joy';
import WarningIcon from '@mui/icons-material/Warning';
import { deleteGroceryActivity, deletePaymentActivity } from '../action';

export default function DeleteConfirmDialog({ open, onClose, activity, roomId }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const isGrocery = activity.type === 'grocery';

  const handleDelete = async () => {
    setError(null);

    startTransition(async () => {
      let result;

      if (isGrocery) {
        result = await deleteGroceryActivity(
          activity.id,
          activity.description,
          activity.amount
        );
      } else {
        result = await deletePaymentActivity(
          activity.id,
          activity.amount,
          activity.paymentType
        );
      }

      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          maxWidth: 450,
          borderRadius: '12px',
          p: 3,
        }}
      >
        <ModalClose />

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
        }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'danger.softBg',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'danger.solidColor',
          }}>
            <WarningIcon fontSize="large" />
          </Box>
          <Typography level="h4" sx={{ fontWeight: 700 }}>
            Delete Activity?
          </Typography>
        </Box>

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

        <Typography level="body-md" sx={{ mb: 2, color: 'text.secondary' }}>
          Are you sure you want to delete this {isGrocery ? 'grocery' : 'payment'} activity?
        </Typography>

        <Box sx={{
          p: 2,
          mb: 3,
          bgcolor: 'neutral.softBg',
          borderRadius: '8px',
        }}>
          <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
            {activity.description}
          </Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            Amount: ${parseFloat(activity.amount).toFixed(2)}
          </Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            User: {activity.user}
          </Typography>
        </Box>

        <Typography level="body-sm" sx={{ mb: 3, color: 'danger.solidColor', fontWeight: 600 }}>
          This action cannot be undone. All room members will be notified.
        </Typography>

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
            color="danger"
            onClick={handleDelete}
            loading={isPending}
          >
            Delete Activity
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
