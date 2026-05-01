'use server';

import { createClient } from '@/utils/supabase/server';
import { LoginRequired } from '@/policies/LoginRequired';
import { revalidatePath } from 'next/cache';

export async function editGroceryActivity(activityId, formData, roomId) {
  const session = await LoginRequired();
  const supabase = await createClient();

  const { data: currentUser } = await supabase
    .from('Users')
    .select('id')
    .eq('email', session.user.email)
    .single();

  const { data: membership } = await supabase
    .from('UserRooms')
    .select('role')
    .eq('user_id', currentUser?.id)
    .eq('room_id', parseInt(roomId))
    .single();

  if (membership?.role !== 'Admin') {
    return { error: 'Only admins can edit activities' };
  }

  const material = formData.get('material');
  const money = parseFloat(formData.get('money'));
  const created_at = formData.get('created_at');

  const { error: updateError } = await supabase
    .from('Spendings')
    .update({ material, money, created_at })
    .eq('id', activityId)
    .eq('room', parseInt(roomId));

  if (updateError) {
    console.error('Error updating grocery:', updateError);
    return { error: 'Failed to update expense' };
  }

  await supabase
    .from('Notifications')
    .insert({
      room_id: parseInt(roomId),
      triggered_by: currentUser.id,
      activity_type: 'grocery',
      title: 'Expense Edited',
      message: `Admin edited an expense: ${material} - ₹${money}`,
      data: { activityId, type: 'edit' }
    });

  revalidatePath(`/${roomId}`, 'layout');
  return { success: true };
}

export async function deleteGroceryActivity(activityId, material, money, roomId) {
  const session = await LoginRequired();
  const supabase = await createClient();

  const { data: currentUser } = await supabase
    .from('Users')
    .select('id')
    .eq('email', session.user.email)
    .single();

  const { data: membership } = await supabase
    .from('UserRooms')
    .select('role')
    .eq('user_id', currentUser?.id)
    .eq('room_id', parseInt(roomId))
    .single();

  if (membership?.role !== 'Admin') {
    return { error: 'Only admins can delete activities' };
  }

  const { error: deleteError } = await supabase
    .from('Spendings')
    .delete()
    .eq('id', activityId)
    .eq('room', parseInt(roomId));

  if (deleteError) {
    console.error('Error deleting grocery:', deleteError);
    return { error: 'Failed to delete expense' };
  }

  await supabase
    .from('Notifications')
    .insert({
      room_id: parseInt(roomId),
      triggered_by: currentUser.id,
      activity_type: 'grocery',
      title: 'Expense Deleted',
      message: `Admin deleted an expense: ${material} - ₹${money}`,
      data: { activityId, type: 'delete' }
    });

  revalidatePath(`/${roomId}`, 'layout');
  return { success: true };
}
