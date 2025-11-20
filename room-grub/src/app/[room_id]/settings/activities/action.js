'use server';

import { createClient } from '@/utils/supabase/server';
import { LoginRequired } from '@/policies/LoginRequired';
import { revalidatePath } from 'next/cache';

/**
 * Edit a grocery activity
 */
export async function editGroceryActivity(activityId, formData) {
  const session = await LoginRequired();
  const supabase = await createClient();
  // Get current user and verify admin role
  console.log('edit grocerry item action')
  const { data: currentUser } = await supabase
    .from('Users')
    .select('role, room')
    .eq('email', session.user.email)
    .single();

  if (currentUser?.role !== 'Admin') {
    return { error: 'Only admins can edit activities' };
  }
  console.log(currentUser, "------------------")
  const material = formData.get('material');
  const money = parseFloat(formData.get('money'));
  const roomId = currentUser.room;
console.log(material,money)

  // Update the grocery activity
  console.log('[DB UPDATE] Attempting to update Spendings table - activityId:', activityId, 'material:', material, 'money:', money);

  const { data: updateData, error: updateError } = await supabase
    .from('Spendings')
    .update({
      material,
      money,
    })
    .eq('id', activityId)
    .select();

  console.log('[DB UPDATE] Query executed - Rows returned:', updateData?.length, 'Data:', JSON.stringify(updateData));

  if (updateError) {
    console.error('[DB UPDATE] ERROR during update:', JSON.stringify(updateError));
    return { error: 'Failed to update grocery activity' };
  }

  if (!updateData || updateData.length === 0) {
    console.error('[DB UPDATE] WARNING - No rows were updated! ActivityId might not exist:', activityId);
  } else {
    console.log('[DB UPDATE] SUCCESS - Database updated successfully');
  }

  // Create notification for all room members
  await supabase
    .from('Notifications')
    .insert({
      room_id: roomId,
      triggered_by: currentUser.id,
      activity_type: 'grocery',
      title: 'Activity Edited',
      message: `Admin edited a grocery item: ${material} - $${money}`,
      data: { activityId, type: 'edit' }
    });

  revalidatePath(`/${roomId}/settings/activities`);
  return { success: true };
}

/**
 * Edit a payment activity
 */
export async function editPaymentActivity(activityId, formData) {
  const session = await LoginRequired();
  const supabase = await createClient();

  // Get current user and verify admin role
  const { data: currentUser } = await supabase
    .from('Users')
    .select('role, room')
    .eq('email', session.user.email)
    .single();

  if (currentUser?.role !== 'Admin') {
    return { error: 'Only admins can edit activities' };
  }

  const amount = parseFloat(formData.get('amount'));
  const status = formData.get('status'); // 'credit' or 'debit'
  const roomId = currentUser.room;

  // Update the payment activity
  const { error: updateError } = await supabase
    .from('balance')
    .update({
      amount,
      status,
    })
    .eq('id', activityId);

  if (updateError) {
    console.error('Error updating payment:', updateError);
    return { error: 'Failed to update payment activity' };
  }

  // Create notification for all room members
  const actionType = status === 'credit' ? 'contributed' : 'withdrew';
  await supabase
    .from('Notifications')
    .insert({
      room_id: roomId,
      triggered_by: currentUser.id,
      activity_type: 'payment',
      title: 'Activity Edited',
      message: `Admin edited a payment: ${actionType} $${amount}`,
      data: { activityId, type: 'edit' }
    });

  revalidatePath(`/${roomId}/settings/activities`);
  return { success: true };
}

/**
 * Delete a grocery activity
 */
export async function deleteGroceryActivity(activityId, material, money) {
  const session = await LoginRequired();
  const supabase = await createClient();

  // Get current user and verify admin role
  const { data: currentUser } = await supabase
    .from('Users')
    .select('role, room')
    .eq('email', session.user.email)
    .single();

  if (currentUser?.role !== 'Admin') {
    return { error: 'Only admins can delete activities' };
  }

  const roomId = currentUser.room;

  // Delete the grocery activity
  const { error: deleteError } = await supabase
    .from('Spendings')
    .delete()
    .eq('id', activityId);

  if (deleteError) {
    console.error('Error deleting grocery:', deleteError);
    return { error: 'Failed to delete grocery activity' };
  }

  // Create notification for all room members
  await supabase
    .from('Notifications')
    .insert({
      room_id: roomId,
      triggered_by: currentUser.id,
      activity_type: 'grocery',
      title: 'Activity Deleted',
      message: `Admin deleted a grocery item: ${material} - $${money}`,
      data: { activityId, type: 'delete' }
    });

  revalidatePath(`/${roomId}/settings/activities`);
  return { success: true };
}

/**
 * Delete a payment activity
 */
export async function deletePaymentActivity(activityId, amount, status) {
  const session = await LoginRequired();
  const supabase = await createClient();

  // Get current user and verify admin role
  const { data: currentUser } = await supabase
    .from('Users')
    .select('role, room')
    .eq('email', session.user.email)
    .single();

  if (currentUser?.role !== 'Admin') {
    return { error: 'Only admins can delete activities' };
  }

  const roomId = currentUser.room;

  // Delete the payment activity
  const { error: deleteError } = await supabase
    .from('balance')
    .delete()
    .eq('id', activityId);

  if (deleteError) {
    console.error('Error deleting payment:', deleteError);
    return { error: 'Failed to delete payment activity' };
  }

  // Create notification for all room members
  const actionType = status === 'credit' ? 'contribution' : 'withdrawal';
  await supabase
    .from('Notifications')
    .insert({
      room_id: roomId,
      triggered_by: currentUser.id,
      activity_type: 'payment',
      title: 'Activity Deleted',
      message: `Admin deleted a payment ${actionType}: $${amount}`,
      data: { activityId, type: 'delete' }
    });

  revalidatePath(`/${roomId}/settings/activities`);
  return { success: true };
}
