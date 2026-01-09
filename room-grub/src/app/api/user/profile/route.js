'use server';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { connectDatabase } from '@/database';

export async function PUT(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name');
    const profileImage = formData.get('profileImage');

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let profileUrl = user.user_metadata?.picture || user.user_metadata?.avatar_url;

    if (profileImage) {
      const fileExt = profileImage.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const arrayBuffer = await profileImage.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, buffer, {
          contentType: profileImage.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      profileUrl = publicUrlData.publicUrl;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        name: name.trim(),
        full_name: name.trim(),
        picture: profileUrl,
        avatar_url: profileUrl,
      },
    });

    if (updateError) {
      console.error('Error updating user metadata:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    try {
      const db = await connectDatabase();
      const User = db.models.User;

      await User.update(
        {
          name: name.trim(),
          profile: profileUrl,
        },
        {
          where: { uid: user.id },
        }
      );
    } catch (dbError) {
      console.error('Error updating database:', dbError);
    }

    return NextResponse.json({
      success: true,
      user: {
        name: name.trim(),
        profile: profileUrl,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
