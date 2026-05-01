'use server';

import { createClient } from '@/utils/supabase/server';
import DB from '@/database';

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
                    triggeredBy: user.email,
                    activityType: 'room_deleted',
                    title: 'Room Deleted',
                    message: 'This room has been deleted by the admin.',
                    data: null,
                }),
            });
        } catch (notifyError) {
            console.error('Failed to send room deletion notification:', notifyError);
        }

        // DELETION SEQUENCE via direct DB connection (bypasses RLS)
        // Wrapped in a transaction so a mid-sequence failure rolls back all deletes atomically
        await DB.sequelize.transaction(async (t) => {
            const opts = { replacements: { roomId: rid }, transaction: t };

            await DB.sequelize.query('DELETE FROM "public"."balance" WHERE room = :roomId', opts);
            await DB.sequelize.query('DELETE FROM "public"."Spendings" WHERE room = :roomId', opts);
            await DB.sequelize.query('DELETE FROM "public"."Invite" WHERE room = :roomId', opts);
            await DB.sequelize.query('DELETE FROM "public"."push_subscriptions" WHERE room_id = :roomId', opts);
            await DB.sequelize.query('DELETE FROM "public"."notifications" WHERE room_id = :roomId', opts);
            await DB.sequelize.query('DELETE FROM "public"."UserRooms" WHERE room_id = :roomId', opts);
            await DB.sequelize.query('DELETE FROM "public"."Rooms" WHERE id = :roomId', opts);
        });

        return { success: true };

    } catch (error) {
        console.error('Delete room error:', error);
        return { success: false, error: error.message };
    }
}
