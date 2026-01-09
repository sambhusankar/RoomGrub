'use client'
import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Stack, Chip, IconButton, Modal, ModalDialog, ModalClose, Divider } from '@mui/joy';
import { useRouter } from 'next/navigation';
import useUserRole from '@/hooks/useUserRole';
import { updateMemberRole, removeMember } from '../actions';
import EditIcon from '@mui/icons-material/Edit';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

export default function ListMembers({ members, roomId }) {
    const router = useRouter();
    const { role, loadings } = useUserRole();
    const [updating, setUpdating] = useState({});
    const [editModal, setEditModal] = useState({ open: false, member: null });

    console.log(members)

    const handleAddFriend = () => {
        router.push(`/${roomId}/members/add`);
    };

    const handleOpenEditModal = (e, member) => {
        e.stopPropagation();
        setEditModal({ open: true, member });
    };

    const handleCloseEditModal = () => {
        setEditModal({ open: false, member: null });
    };

    const handleRoleChange = async (newRole) => {
        if (!editModal.member) return;

        const memberEmail = editModal.member.email;
        const currentRole = editModal.member.role;

        const confirmMessage = newRole === 'Admin'
            ? `Are you sure you want to promote ${editModal.member.name} to Admin?`
            : `Are you sure you want to demote ${editModal.member.name} to Member?`;

        if (!confirm(confirmMessage)) {
            return;
        }

        setUpdating({ ...updating, [memberEmail]: true });

        try {
            const result = await updateMemberRole(roomId, memberEmail, newRole);

            if (result.success) {
                alert(result.message);
                handleCloseEditModal();
                // Refresh the page to show updated data
                router.refresh();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            alert(`Failed to update role: ${error.message}`);
        } finally {
            setUpdating({ ...updating, [memberEmail]: false });
        }
    };

    const handleRemoveMember = async () => {
        if (!editModal.member) return;

        const memberEmail = editModal.member.email;
        const memberName = editModal.member.name;

        const confirmMessage = `Are you sure you want to remove ${memberName} from this room?\n\nThey will lose access to the room, but their expense history will be preserved. You can re-invite them later if needed.`;

        if (!confirm(confirmMessage)) {
            return;
        }

        setUpdating({ ...updating, [memberEmail]: true });

        try {
            const result = await removeMember(roomId, memberEmail);

            if (result.success) {
                alert(result.message);
                handleCloseEditModal();
                // Refresh the page to show updated data
                router.refresh();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            alert(`Failed to remove member: ${error.message}`);
        } finally {
            setUpdating({ ...updating, [memberEmail]: false });
        }
    };

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 4 },
                bgcolor: 'background.body',
                minHeight: '100vh',
                width: '100%',
                boxSizing: 'border-box',
            }}
        >
            <Typography
                level="h3"
                sx={{
                    mb: 3,
                    fontWeight: 'bold',
                    textAlign: { xs: 'center', sm: 'left' },
                }}
            >
                Room Members
            </Typography>
            {(!members || members.length === 0) ? (
                <Typography textAlign="center">No friends added in your room.</Typography>
            ) : (
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    flexWrap="wrap"
                    sx={{
                        mb: 3,
                        alignItems: { xs: 'center', sm: 'flex-start' },
                        justifyContent: { xs: 'center', sm: 'flex-start' },
                        width: '100%',
                    }}
                >
                    {members.map((member) => (
                        <Card
                            key={member.id}
                            sx={{
                                width: { xs: '100%', sm: 240 },
                                mb: { xs: 1, sm: 2 },
                                bgcolor: 'background.level1',
                                cursor: 'pointer',
                                boxShadow: 'sm',
                                borderRadius: 2,
                                '&:hover': {
                                    boxShadow: 'md',
                                    transform: 'translateY(-2px)',
                                    transition: 'all 0.2s',
                                },
                            }}
                            onClick={() => router.push(`/${roomId}/members/${member.id}`)}
                        >
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                                        <Box
                                            component="img"
                                            src={member.profile || '/default-profile.png'}
                                            alt={member.name}
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                bgcolor: 'background.level2',
                                                border: '1px solid #eee',
                                            }}
                                            onError={e => {
                                                e.target.onerror = null;
                                                e.target.src = '/default-profile.png';
                                            }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography level="title-md">{member.name}</Typography>
                                                <Chip
                                                    size="sm"
                                                    color={member.role === 'Admin' ? 'primary' : 'neutral'}
                                                    variant="soft"
                                                >
                                                    {member.role}
                                                </Chip>
                                            </Box>
                                            <Typography level="body-sm">{member.email}</Typography>
                                        </Box>
                                    </Stack>
                                    {!loadings && role === 'Admin' && (
                                        <IconButton
                                            size="sm"
                                            variant="plain"
                                            color="neutral"
                                            onClick={(e) => handleOpenEditModal(e, member)}
                                            sx={{ ml: 1 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
            <Button
                variant="solid"
                color="primary"
                onClick={handleAddFriend}
                sx={{
                    mt: 2,
                    width: { xs: '100%', sm: 'auto' },
                    display: 'block',
                    mx: { xs: 'auto', sm: 0 },
                }}
            >
                Add Friend
            </Button>

            {/* Edit Role Modal */}
            <Modal open={editModal.open} onClose={handleCloseEditModal}>
                <ModalDialog sx={{ minWidth: 400 }}>
                    <ModalClose />
                    <Typography level="h4" sx={{ mb: 2 }}>
                        Edit Member Role
                    </Typography>
                    {editModal.member && (
                        <Box>
                            <Box sx={{ mb: 3 }}>
                                <Typography level="body-sm" sx={{ mb: 0.5 }}>
                                    Member: <strong>{editModal.member.name}</strong>
                                </Typography>
                                <Typography level="body-sm" sx={{ mb: 1 }}>
                                    Email: {editModal.member.email}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography level="body-sm">
                                        Current Role:
                                    </Typography>
                                    <Chip
                                        size="sm"
                                        color={editModal.member.role === 'Admin' ? 'primary' : 'neutral'}
                                        variant="soft"
                                    >
                                        {editModal.member.role}
                                    </Chip>
                                </Box>
                            </Box>
                            <Typography level="body-sm" sx={{ mb: 2 }}>
                                Change role to:
                            </Typography>
                            <Stack spacing={2}>
                                <Button
                                    variant="solid"
                                    color="success"
                                    onClick={() => handleRoleChange('Admin')}
                                    disabled={editModal.member.role === 'Admin' || updating[editModal.member.email]}
                                    loading={updating[editModal.member.email]}
                                >
                                    Promote to Admin
                                </Button>
                                <Button
                                    variant="solid"
                                    color="warning"
                                    onClick={() => handleRoleChange('Member')}
                                    disabled={editModal.member.role === 'Member' || updating[editModal.member.email]}
                                    loading={updating[editModal.member.email]}
                                >
                                    Demote to Member
                                </Button>

                                <Divider sx={{ my: 1 }} />

                                <Button
                                    variant="solid"
                                    color="danger"
                                    onClick={handleRemoveMember}
                                    disabled={updating[editModal.member.email]}
                                    loading={updating[editModal.member.email]}
                                    startDecorator={!updating[editModal.member.email] && <PersonRemoveIcon />}
                                >
                                    Remove from Room
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </ModalDialog>
            </Modal>
        </Box>
    );
}