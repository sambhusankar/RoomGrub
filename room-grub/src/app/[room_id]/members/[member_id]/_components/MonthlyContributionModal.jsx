'use client'
import React, {useState} from 'react'
import { Button, Modal, ModalDialog, ModalClose, DialogTitle, DialogContent, DialogActions, Input, Typography } from '@mui/joy';
import { createClient } from '@/utils/supabase/client';

export default function MonthlyContributionModal({member, showForm}) {
    const [showContributionForm, setShowContributionForm] = useState(showForm);
    const [contributionAmount, setContributionAmount] = useState('');
    const supabase = createClient();
    const handleMonthlyContribution = async () => {
        if (!contributionAmount || parseFloat(contributionAmount) <= 0) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Record monthly contribution as debit
            const { error } = await supabase
                .from('balance')
                .insert([{
                    room: params.room_id,
                    user: member.email,
                    amount: parseFloat(contributionAmount),
                    status: 'credit'
                }]);

            if (error) throw error;
            
            alert('Monthly contribution recorded successfully!');
            setContributionAmount('');
            setShowContributionForm(false);
            fetchMemberData(); // Refresh data
        } catch (error) {
            console.error('Error recording contribution:', error);
            alert('Error recording contribution');
        }
    };
    return (
        <Modal open={showContributionForm} onClose={() => setShowContributionForm(false)}>
            <ModalDialog>
                <ModalClose />
                <DialogTitle>Record Monthly Contribution</DialogTitle>
                <DialogContent>
                    <Typography level="body-sm" sx={{ mb: 2 }}>
                        Record {member?.name}'s monthly contribution to the room.
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
                    >
                        Record Contribution
                    </Button>
                    <Button
                        variant="plain"
                        color="neutral"
                        onClick={() => setShowContributionForm(false)}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </ModalDialog>
        </Modal>
    )
}