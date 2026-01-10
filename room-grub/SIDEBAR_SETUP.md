# Sidebar and Profile Edit Setup

This document describes the newly added sidebar and profile editing features.

## Features Added

1. **Sidebar Component** - A collapsible sidebar accessible from the top-left menu icon
2. **Profile Editing** - Users can edit their name and upload a new profile picture
3. **Account Details Display** - View user account information in the sidebar

## Required Supabase Storage Setup

To enable profile picture uploads, you need to create a storage bucket in Supabase:

### Steps:

1. Go to your Supabase project dashboard
2. Navigate to **Storage** section
3. Click **Create a new bucket**
4. Name the bucket: `avatars`
5. Set it as **Public** (so profile pictures are publicly accessible)
6. Click **Create bucket**

### Storage Policies (Optional but Recommended):

Add these policies to the `avatars` bucket for better security:

**Upload Policy:**
```sql
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures'
);
```

**Update Policy:**
```sql
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures'
);
```

**Read Policy:**
```sql
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## File Structure

New files created:
- `/src/component/Sidebar.jsx` - Main sidebar component
- `/src/component/ProfileEdit.jsx` - Profile editing interface
- `/src/app/api/user/profile/route.js` - API endpoint for profile updates

Modified files:
- `/src/component/NavBar.jsx` - Integrated sidebar button

## Usage

1. Click the menu icon (☰) in the top-left corner to open the sidebar
2. Click the edit icon on the profile picture or "Edit Profile" to enter edit mode
3. Upload a new profile picture by clicking the camera icon
4. Edit your name in the input field
5. Click "Save" to update your profile
6. The page will reload to reflect the changes

## Features in the Sidebar

- **Profile Picture** - Displays current profile picture with edit option
- **User Name** - Shows user's name (editable)
- **Email** - Displays user's email address
- **User ID** - Shows truncated user ID
- **Settings Button** - Navigate to settings page
- **Edit Profile Button** - Open profile editing interface
- **Logout Button** - Sign out from the application

## Technical Details

- Profile pictures are stored in Supabase Storage under `avatars/profile-pictures/`
- User metadata is updated in Supabase Auth
- Database User table is also updated for consistency
- Images must be less than 5MB
- Supported image formats: All standard image types (jpg, png, gif, etc.)
