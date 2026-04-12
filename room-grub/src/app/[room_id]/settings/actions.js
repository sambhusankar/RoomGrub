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
            .select('role, room, email')
            .eq('email', user.email)
            .single();

        if (currentUser?.role !== 'Admin') {
            return { success: false, error: 'Unauthorized: Only admins can delete the room' };
        }

        if (currentUser?.room !== rid) {
            return { success: false, error: 'Unauthorized: User not a member of this room' };
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
        // Delete dependent rows first, then members, then the room itself

        await DB.sequelize.query(
            'DELETE FROM "public"."balance" WHERE room = :roomId',
            { replacements: { roomId: rid } }
        );

        await DB.sequelize.query(
            'DELETE FROM "public"."Spendings" WHERE room = :roomId',
            { replacements: { roomId: rid } }
        );

        await DB.sequelize.query(
            'DELETE FROM "public"."Invite" WHERE room = :roomId',
            { replacements: { roomId: rid } }
        );

        await DB.sequelize.query(
            'DELETE FROM "public"."push_subscriptions" WHERE room_id = :roomId',
            { replacements: { roomId: rid } }
        );

        await DB.sequelize.query(
            'DELETE FROM "public"."notifications" WHERE room_id = :roomId',
            { replacements: { roomId: rid } }
        );

        await DB.sequelize.query(
            'UPDATE "public"."Users" SET room = NULL, role = NULL WHERE room = :roomId',
            { replacements: { roomId: rid } }
        );

        await DB.sequelize.query(
            'DELETE FROM "public"."Rooms" WHERE id = :roomId',
            { replacements: { roomId: rid } }
        );

        return { success: true };

    } catch (error) {
        console.error('Delete room error:', error);
        return { success: false, error: error.message };
    }
}
