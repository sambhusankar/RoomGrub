'use client'
import { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Input,
  Button,
  Stack,
  IconButton,
  CircularProgress,
} from '@mui/joy';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

export default function ProfileEdit({ user, onClose }) {
  const [name, setName] = useState(user?.user_metadata?.name || user?.user_metadata?.full_name || '');
  const [profileImage, setProfileImage] = useState(user?.user_metadata?.picture || user?.user_metadata?.avatar_url || '');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setImageFile(file);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('name', name);

      if (imageFile) {
        formData.append('profileImage', imageFile);
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      window.location.reload();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.user_metadata?.name || user?.user_metadata?.full_name || '');
    setProfileImage(user?.user_metadata?.picture || user?.user_metadata?.avatar_url || '');
    setImageFile(null);
    setPreviewUrl('');
    setError('');
    onClose();
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography level="h4" sx={{ mb: 3 }}>
        Edit Profile
      </Typography>

      {/* Profile Picture Upload */}
      <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
        <Avatar
          src={previewUrl || profileImage}
          sx={{
            width: 120,
            height: 120,
            mx: 'auto',
            border: '4px solid',
            borderColor: 'primary.softBg',
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <IconButton
          size="sm"
          color="primary"
          variant="solid"
          onClick={() => fileInputRef.current?.click()}
          sx={{
            position: 'absolute',
            bottom: 0,
            right: -8,
            borderRadius: '50%',
          }}
        >
          <PhotoCameraIcon />
        </IconButton>
      </Box>

      {imageFile && (
        <Typography level="body-sm" sx={{ color: 'success.plainColor', mb: 2 }}>
          New image selected: {imageFile.name}
        </Typography>
      )}

      {/* Name Input */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography level="body-sm" sx={{ mb: 1, textAlign: 'left' }}>
            Name
          </Typography>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            size="lg"
            fullWidth
          />
        </Box>
      </Stack>

      {/* Error Message */}
      {error && (
        <Typography level="body-sm" sx={{ color: 'danger.plainColor', mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          color="neutral"
          onClick={handleCancel}
          disabled={loading}
          startDecorator={<CloseIcon />}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="solid"
          color="primary"
          onClick={handleSave}
          disabled={loading || !name.trim()}
          startDecorator={loading ? <CircularProgress size="sm" /> : <CheckIcon />}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </Stack>
    </Box>
  );
}
