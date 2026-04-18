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
  Select,
  Option,
} from '@mui/joy';
import { editGroceryActivity, editPaymentActivity } from '../action';

export default function EditActivityDialog({ open, onClose, activity, roomId }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const isGrocery = activity.type === 'grocery';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target);

    startTransition(async () => {
      let result;

      if (isGrocery) {
        result = await editGroceryActivity(activity.id, formData);
      } else {
        result = await editPaymentActivity(activity.id, formData);
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
          maxWidth: 500,
          borderRadius: '12px',
          p: 3,
        }}
      >
        <ModalClose />
        <Typography level="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Edit {isGrocery ? 'Grocery' : 'Payment'} Activity
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
          {isGrocery ? (
            <>
              {/* Grocery fields */}
              <FormControl sx={{ mb: 2 }}>
                <FormLabel>Item Name</FormLabel>
                <Input
                  name="material"
                  defaultValue={activity.description}
                  required
                  disabled={isPending}
                />
              </FormControl>

              <FormControl sx={{ mb: 3 }}>
                <FormLabel>Amount ($)</FormLabel>
                <Input
                  name="money"
                  type="number"
                  step="0.01"
                  defaultValue={activity.amount}
                  required
                  disabled={isPending}
                />
              </FormControl>
            </>
          ) : (
            <>
              {/* Payment fields */}
              <FormControl sx={{ mb: 2 }}>
                <FormLabel>Amount ($)</FormLabel>
                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={activity.amount}
                  required
                  disabled={isPending}
                />
              </FormControl>

              <FormControl sx={{ mb: 3 }}>
                <FormLabel>Type</FormLabel>
                <Select
                  name="status"
                  defaultValue={activity.paymentType}
                  required
                  disabled={isPending}
                >
                  <Option value="credit">Credit (Contribution)</Option>
                  <Option value="debit">Debit (Withdrawal)</Option>
                </Select>
              </FormControl>
            </>
          )}

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
                '&:hover': {
                  backgroundColor: 'darkblue',
                }
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
