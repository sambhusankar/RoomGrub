'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

async function getCurrentMembership(supabase, userEmail, roomId) {
    const { data: currentUser } = await supabase
        .from('Users')
        .select('id, email')
        .eq('email', userEmail)
        .single();

    if (!currentUser) return { currentUser: null, membership: null };

    const { data: membership } = await supabase
        .from('UserRooms')
        .select('role')
        .eq('user_id', currentUser.id)
        .eq('room_id', parseInt(roomId))
        .single();

    return { currentUser, membership };
}

export async function updateMemberRole(roomId, memberEmail, newRole) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Unauthorized: User not authenticated' };
        }

        const { currentUser, membership } = await getCurrentMembership(supabase, user.email, roomId);

        if (!membership) {
            return { success: false, error: 'Unauthorized: User not a member of this room' };
        }

        if (membership.role !== 'Admin') {
            return { success: false, error: 'Unauthorized: Only admins can change member roles' };
        }

        if (currentUser.email === memberEmail && newRole !== 'Admin') {
            return { success: false, error: 'Cannot demote yourself from admin role' };
        }

        if (newRole !== 'Admin' && newRole !== 'Member') {
            return { success: false, error: 'Invalid role. Must be "Admin" or "Member"' };
        }

        const { data: targetMember, error: memberError } = await supabase
            .from('Users')
            .select('id, email')
            .eq('email', memberEmail)
            .single();

        if (memberError || !targetMember) {
            return { success: false, error: 'Member not found' };
        }

        const { data: targetMembership } = await supabase
            .from('UserRooms')
            .select('role')
            .eq('user_id', targetMember.id)
            .eq('room_id', parseInt(roomId))
            .single();

        if (!targetMembership) {
            return { success: false, error: 'Member does not belong to this room' };
        }

        if (targetMembership.role === newRole) {
            return { success: false, error: `Member is already a ${newRole}` };
        }

        const { error: updateError } = await supabase
            .from('UserRooms')
            .update({ role: newRole })
            .eq('user_id', targetMember.id)
            .eq('room_id', parseInt(roomId));

        if (updateError) throw new Error('Failed to update member role');

        revalidatePath(`/${roomId}`, 'layout');
        return { success: true, message: `Successfully updated ${memberEmail} to ${newRole}` };

    } catch (error) {
        console.error('Update member role error:', error);
        return { success: false, error: error.message };
    }
}

export async function removeMember(roomId, memberEmail) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Unauthorized: User not authenticated' };
        }

        const { currentUser, membership } = await getCurrentMembership(supabase, user.email, roomId);

        if (!membership) {
            return { success: false, error: 'Unauthorized: User not a member of this room' };
        }

        if (membership.role !== 'Admin') {
            return { success: false, error: 'Unauthorized: Only admins can remove members' };
        }

        if (currentUser.email === memberEmail) {
            return { success: false, error: 'Admins cannot remove themselves from the room' };
        }

        const { data: targetMember, error: memberError } = await supabase
            .from('Users')
            .select('id, email')
            .eq('email', memberEmail)
            .single();

        if (memberError || !targetMember) {
            return { success: false, error: 'Member not found' };
        }

        const { data: targetMembership } = await supabase
            .from('UserRooms')
            .select('id')
            .eq('user_id', targetMember.id)
            .eq('room_id', parseInt(roomId))
            .single();

        if (!targetMembership) {
            return { success: false, error: 'Member does not belong to this room' };
        }

        const { error: deleteError } = await supabase
            .from('UserRooms')
            .delete()
            .eq('user_id', targetMember.id)
            .eq('room_id', parseInt(roomId));

        if (deleteError) throw new Error('Failed to remove member');

        const { data: room } = await supabase.from('Rooms').select('members').eq('id', parseInt(roomId)).single();
        await supabase.from('Rooms').update({ members: Math.max(0, (room?.members || 1) - 1) }).eq('id', parseInt(roomId));

        revalidatePath(`/${roomId}`, 'layout');
        return { success: true, message: `Successfully removed ${memberEmail} from the room` };

    } catch (error) {
        console.error('Remove member error:', error);
        return { success: false, error: error.message };
    }
}

export async function exitRoom(roomId) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Unauthorized: User not authenticated' };
        }

        const { currentUser, membership } = await getCurrentMembership(supabase, user.email, roomId);

        if (!membership) {
            return { success: false, error: 'Unauthorized: User not a member of this room' };
        }

        if (membership.role === 'Admin') {
            return { success: false, error: 'Admins cannot leave the room' };
        }

        const { error: deleteError } = await supabase
            .from('UserRooms')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('room_id', parseInt(roomId));

        if (deleteError) throw new Error('Failed to exit room');

        const { data: room } = await supabase.from('Rooms').select('members').eq('id', parseInt(roomId)).single();
        await supabase.from('Rooms').update({ members: Math.max(0, (room?.members || 1) - 1) }).eq('id', parseInt(roomId));

        return { success: true };

    } catch (error) {
        console.error('Exit room error:', error);
        return { success: false, error: error.message };
    }
}
