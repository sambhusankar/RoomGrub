'use client';

import { useState } from 'react';
import { 
    Modal, 
    ModalDialog, 
    ModalClose, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Input, 
    Typography 
} from '@mui/joy';
import { createClient } from '@/utils/supabase/client';
import { useParams } from 'next/navigation';
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
    const supabase = createClient();

    const handleMonthlyContribution = async () => {
        if (!contributionAmount || parseFloat(contributionAmount) <= 0) return;

        setIsSubmitting(true);
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

            alert('Contribution recorded successfully!');
            setContributionAmount('');
            setShowContributionForm(false);
            onDataRefresh(); // Refresh data

            // Send notification to room members
            try {
                // Get user data for the member
                const { data: userData } = await supabase
                    .from("Users")
                    .select("id, name")
                    .eq("email", member.email)
                    .single();

                if (userData) {
                    await NotificationService.notifyContributionMade(
                        parseInt(params.room_id),
                        userData.id,
                        userData.name || member.name || member.email,
                        parseFloat(contributionAmount)
                    );
                    console.log('Contribution notification sent successfully');
                }
            } catch (notificationError) {
                console.error('Failed to send contribution notification:', notificationError);
                // Don't show error to user as the main action succeeded
            }
        } catch (error) {
            console.error('Error recording contribution:', error);
            alert('Error recording contribution');
        } finally {
            setIsSubmitting(false);
        }
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
                    <Button 
                        variant="plain" 
                        color="neutral" 
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </ModalDialog>
        </Modal>
    );
}