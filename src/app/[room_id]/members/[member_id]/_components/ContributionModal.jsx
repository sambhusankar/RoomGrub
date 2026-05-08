'use client';

import { useState } from 'react';
import {
    Modal, ModalDialog, ModalClose, DialogTitle, DialogContent,
    DialogActions, Button, Input, Typography
} from '@mui/joy';
import { useParams } from 'next/navigation';
import { recordContribution } from '../actions';
import NotificationService from '@/services/NotificationService';

export default function ContributionModal({
    showContributionForm,
    setShowContributionForm,
    member,
    onDataRefresh
}) {
    const [contributionAmount, setContributionAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const params = useParams();

    const handleMonthlyContribution = async () => {
        if (!contributionAmount || parseFloat(contributionAmount) <= 0) return;

        setIsSubmitting(true);
        const result = await recordContribution(params.room_id, member.email, contributionAmount);

        if (result.success) {
            alert('Contribution recorded successfully!');
            setContributionAmount('');
            setShowContributionForm(false);
            onDataRefresh();

            try {
                await NotificationService.notifyContributionMade(
                    parseInt(params.room_id),
                    member.id,
                    member.name || member.email,
                    parseFloat(contributionAmount)
                );
            } catch (_) {}
        } else {
            alert('Error recording contribution');
        }
        setIsSubmitting(false);
    };

    const handleClose = () => {
        setContributionAmount('');
        setShowContributionForm(false);
    };

    return (
        <Modal open={showContributionForm} onClose={handleClose}>
            <ModalDialog>
                <ModalClose />
                <DialogTitle>Record Contribution</DialogTitle>
                <DialogContent>
                    <Typography level="body-sm" sx={{ mb: 2 }}>
                        Record {member?.name}'s contribution to the room.
                    </Typography>
                    <Input
                        type="number"
                        placeholder="Enter amount"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        startDecorator="₹"
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="solid"
                        color="primary"
                        onClick={handleMonthlyContribution}
                        disabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
                        loading={isSubmitting}
                    >
                        Contribute
                    </Button>
                    <Button variant="plain" color="neutral" onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </ModalDialog>
        </Modal>
    );
}
