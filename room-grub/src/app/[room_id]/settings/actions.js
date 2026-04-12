'use server';

import { createClient } from '@/utils/supabase/server';

export async function deleteRoom(roomId) {
    try {
        const supabase = await createClient();

        // SECURITY CHECK 1: Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Unauthorized: User not authenticated' };
        }

        // SECURITY CHECK 2: Verify current user is admin
        const { data: currentUser } = await supabase
            .from('Users')
            .select('role, room, email')
            .eq('email', user.email)
            .single();

        if (currentUser?.role !== 'Admin') {
            return { success: false, error: 'Unauthorized: Only admins can delete the room' };
        }

        // SECURITY CHECK 3: Verify current user belongs to this room
        if (currentUser?.room !== parseInt(roomId)) {
            return { success: false, error: 'Unauthorized: User not a member of this room' };
        }

        // PRE-CONDITION: Block if any expenses are unsettled
        const { data: pending } = await supabase
            .from('Spendings')
            .select('id')
            .eq('room', roomId)
            .or('settled.is.null,settled.eq.false')
            .limit(1);

        if (pending?.length > 0) {
            return { success: false, error: 'All expenses must be settled before deleting the room.', pendingExists: true };
        }

        // NOTIFY all members before deleting subscriptions
        try {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId,
                    triggeredBy: user.email,
                    activityType: 'room_deleted',
                    title: 'Room Deleted',
                    message: 'This room has been deleted by the admin.',
                    data: null,
                }),
            });
        } catch (notifyError) {
            // Notification failure should not block deletion
            console.error('Failed to send room deletion notification:', notifyError);
        }

        // DELETION SEQUENCE (order matters for FK integrity)

        // 1. Null out all members
        const { error: usersError } = await supabase
            .from('Users')
            .update({ room: null, role: null })
            .eq('room', roomId);
        if (usersError) throw new Error('Failed to remove members from room');

        // 2. Delete balance records
        const { error: balanceError } = await supabase
            .from('balance')
            .delete()
            .eq('room', roomId);
        if (balanceError) throw new Error('Failed to delete balance records');

        // 3. Delete spendings
        const { error: spendingsError } = await supabase
            .from('Spendings')
            .delete()
            .eq('room', roomId);
        if (spendingsError) throw new Error('Failed to delete spendings');

        // 4. Delete invites
        const { error: invitesError } = await supabase
            .from('Invite')
            .delete()
            .eq('room', roomId);
        if (invitesError) throw new Error('Failed to delete invites');

        // 5. Delete push subscriptions
        const { error: pushError } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('room_id', roomId);
        if (pushError) throw new Error('Failed to delete push subscriptions');

        // 6. Delete notifications
        const { error: notificationsError } = await supabase
            .from('notifications')
            .delete()
            .eq('room_id', roomId);
        if (notificationsError) throw new Error('Failed to delete notifications');

        // 7. Delete the room itself
        const { error: roomError } = await supabase
            .from('Rooms')
            .delete()
            .eq('id', roomId);
        if (roomError) throw new Error('Failed to delete room');

        return { success: true };

    } catch (error) {
        console.error('Delete room error:', error);
        return { success: false, error: error.message };
    }
}
