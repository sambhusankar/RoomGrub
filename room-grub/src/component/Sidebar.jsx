'use client'
import { useState } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Avatar,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/joy';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import { useRouter, useParams } from 'next/navigation';
import ProfileEdit from './ProfileEdit';

export default function Sidebar({ user, signOut }) {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();
  const { room_id } = useParams();

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleSignOut = () => {
    signOut();
    setOpen(false);
  };

  const handleSettings = () => {
    router.push(`/${room_id}/settings`);
    setOpen(false);
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleCloseEdit = () => {
    setEditMode(false);
  };

  return (
    <>
      <IconButton
        variant="plain"
        color="neutral"
        onClick={toggleDrawer(true)}
        sx={{ ml: 1 }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        anchor="left"
        size="md"
        slotProps={{
          content: {
            sx: {
              bgcolor: 'background.surface',
              p: 3,
              boxShadow: 'lg',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography level="h4">Account</Typography>
            <IconButton variant="plain" color="neutral" onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Profile Section */}
          {!editMode ? (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={user?.user_metadata?.picture || user?.user_metadata?.avatar_url}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    border: '4px solid',
                    borderColor: 'primary.softBg',
                  }}
                />
                <IconButton
                  size="sm"
                  color="primary"
                  variant="solid"
                  onClick={handleEditProfile}
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: -8,
                    borderRadius: '50%',
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Box>
              <Typography level="h4" sx={{ mb: 0.5 }}>
                {user?.user_metadata?.name || user?.user_metadata?.full_name}
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                {user?.email}
              </Typography>
            </Box>
          ) : (
            <ProfileEdit user={user} onClose={handleCloseEdit} />
          )}

          {!editMode && (
            <>
              <Divider sx={{ my: 2 }} />

              {/* Account Details */}
              <Box sx={{ mb: 3 }}>
                <Typography level="title-sm" sx={{ mb: 1.5, color: 'text.secondary' }}>
                  Account Details
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                      Email
                    </Typography>
                    <Typography level="body-sm">{user?.email}</Typography>
                  </Box>
                  <Box>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                      User ID
                    </Typography>
                    <Typography level="body-sm" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {user?.id?.substring(0, 20)}...
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Action Buttons */}
              <List sx={{ flexGrow: 1 }}>
                <ListItem>
                  <ListItemButton onClick={handleSettings}>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={handleEditProfile}>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText>Edit Profile</ListItemText>
                  </ListItemButton>
                </ListItem>
              </List>

              {/* Logout Button */}
              <Box sx={{ mt: 'auto' }}>
                <Divider sx={{ mb: 2 }} />
                <Button
                  fullWidth
                  variant="soft"
                  color="danger"
                  startDecorator={<LogoutIcon />}
                  onClick={handleSignOut}
                  size="lg"
                >
                  Logout
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}
