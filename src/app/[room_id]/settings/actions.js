'use server';

import { createClient } from '@/utils/supabase/server';

export async function deleteRoom(roomId) {
    try {
        const supabase = await createClient();
        const rid = parseInt(roomId);

        // SECURITY CHECK 1: Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Unauthorized: User not authenticated' };
        }

        // SECURITY CHECK 2: Verify current user is admin and belongs to this room
        const { data: currentUser } = await supabase
            .from('Users')
            .select('id')
            .eq('email', user.email)
            .single();

        if (!currentUser) return { success: false, error: 'Unauthorized' };

        const { data: membership } = await supabase
            .from('UserRooms')
            .select('role')
            .eq('user_id', currentUser.id)
            .eq('room_id', rid)
            .single();

        if (!membership) {
            return { success: false, error: 'Unauthorized: User not a member of this room' };
        }

        if (membership.role !== 'Admin') {
            return { success: false, error: 'Unauthorized: Only admins can delete the room' };
        }

        // PRE-CONDITION: Block if any expenses are unsettled
        const { data: pending } = await supabase
            .from('Spendings')
            .select('id')
            .eq('room', rid)
            .or('settled.is.null,settled.eq.false')
            .limit(1);

        if (pending?.length > 0) {
            return { success: false, error: 'All expenses must be settled before deleting the room.', pendingExists: true };
        }

        // NOTIFY all members before deleting subscriptions
        try {
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: rid,
                    triggeredBy: currentUser.id,
                    activityType: 'room_deleted',
                    title: 'Room Deleted',
                    message: 'This room has been deleted by the admin.',
                    data: null,
                }),
            });
        } catch (notifyError) {
            console.error('Failed to send room deletion notification:', notifyError);
        }

        await supabase.from('balance').delete().eq('room', rid);
        await supabase.from('Spendings').delete().eq('room', rid);
        await supabase.from('Invite').delete().eq('room', rid);
        await supabase.from('push_subscriptions').delete().eq('room_id', rid);
        await supabase.from('notifications').delete().eq('room_id', rid);
        await supabase.from('UserRooms').delete().eq('room_id', rid);
        await supabase.from('Rooms').delete().eq('id', rid);

        return { success: true };

    } catch (error) {
        console.error('Delete room error:', error);
        return { success: false, error: error.message };
    }
}
