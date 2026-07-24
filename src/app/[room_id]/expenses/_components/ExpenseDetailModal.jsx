'use client';

import {
    Modal, ModalDialog, ModalClose, DialogTitle, DialogContent,
    Typography, Box, CircularProgress, Avatar,
} from '@mui/joy';

const formatAmount = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
}).format(amount);

export default function ExpenseDetailModal({ open, onClose, loading, error, detail }) {
    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog sx={{ maxWidth: 420, width: '100%' }}>
                <ModalClose />
                <DialogTitle>Expense Details</DialogTitle>
                <DialogContent>
                    {loading && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CircularProgress size="sm" />
                        </Box>
                    )}

                    {!loading && error && (
                        <Typography level="body-sm" sx={{ color: 'danger.500', py: 2 }}>
                            {error}
                        </Typography>
                    )}

                    {!loading && !error && detail && (
                        <Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography level="title-md" sx={{ fontWeight: 700 }}>
                                    {detail.material}
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                                    {formatAmount(detail.money)} · paid by {detail.payer_name || 'Unknown'}
                                </Typography>
                            </Box>

                            <Typography level="body-xs" sx={{ mb: 1, color: 'text.tertiary', fontWeight: 600, textTransform: 'uppercase' }}>
                                Participants
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {(detail.participants || []).map(p => (
                                    <Box
                                        key={p.user_id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            py: 1,
                                            px: 1.5,
                                            borderRadius: 'md',
                                            bgcolor: 'background.level1',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar src={p.profile || '/default-profile.png'} alt={p.name || ''} size="sm" />
                                            <Box>
                                                <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                                                    {p.name || 'Unknown'}
                                                </Typography>
                                                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                                    paid {formatAmount(p.amount_paid)} · owes {formatAmount(p.amount_owed)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography
                                            level="body-sm"
                                            sx={{
                                                fontWeight: 700,
                                                color: p.net > 0 ? 'success.600' : p.net < 0 ? 'danger.500' : 'text.tertiary',
                                            }}
                                        >
                                            {p.net > 0 ? '+' : ''}{formatAmount(p.net)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </ModalDialog>
        </Modal>
    );
}
