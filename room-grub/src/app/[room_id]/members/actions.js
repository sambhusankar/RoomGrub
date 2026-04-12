'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateMemberRole(roomId, memberEmail, newRole) {
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
            return { success: false, error: 'Unauthorized: Only admins can change member roles' };
        }

        // SECURITY CHECK 3: Verify current user belongs to this room
        if (currentUser?.room !== parseInt(roomId)) {
            return { success: false, error: 'Unauthorized: User not a member of this room' };
        }

        // SECURITY CHECK 4: Prevent self-demotion
        if (currentUser.email === memberEmail && newRole !== 'Admin') {
            return { success: false, error: 'Cannot demote yourself from admin role' };
        }

        // VALIDATION 1: Verify new role is valid
        if (newRole !== 'Admin' && newRole !== 'Member') {
            return { success: false, error: 'Invalid role. Must be "Admin" or "Member"' };
        }

        // VALIDATION 2: Verify target member exists and belongs to the same room
        const { data: targetMember, error: memberError } = await supabase
            .from('Users')
            .select('email, room, role')
            .eq('email', memberEmail)
            .single();

        if (memberError || !targetMember) {
            return { success: false, error: 'Member not found' };
        }

        if (targetMember.room !== parseInt(roomId)) {
            return { success: false, error: 'Member does not belong to this room' };
        }

        // Check if role is already the same
        if (targetMember.role === newRole) {
            return { success: false, error: `Member is already a ${newRole}` };
        }

        // Update the member's role
        const { error: updateError } = await supabase
            .from('Users')
            .update({ role: newRole })
            .eq('email', memberEmail)
            .eq('room', roomId);

        if (updateError) {
            console.error('Error updating member role:', updateError);
            throw new Error('Failed to update member role');
        }

        revalidatePath(`/${roomId}`, 'layout');

        return {
            success: true,
            message: `Successfully updated ${memberEmail} to ${newRole}`
        };

    } catch (error) {
        console.error('Update member role error:', error);
        return { success: false, error: error.message };
    }
}

export async function removeMember(roomId, memberEmail) {
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
            return { success: false, error: 'Unauthorized: Only admins can remove members' };
        }

        // SECURITY CHECK 3: Verify current user belongs to this room
        if (currentUser?.room !== parseInt(roomId)) {
            return { success: false, error: 'Unauthorized: User not a member of this room' };
        }

        // SECURITY CHECK 4: Prevent admin from removing themselves
        if (currentUser.email === memberEmail) {
            return { success: false, error: 'Admins cannot remove themselves from the room' };
        }

        // VALIDATION: Verify target member exists and belongs to the same room
        const { data: targetMember, error: memberError } = await supabase
            .from('Users')
            .select('email, room')
            .eq('email', memberEmail)
            .single();

        if (memberError || !targetMember) {
            return { success: false, error: 'Member not found' };
        }

        if (targetMember.room !== parseInt(roomId)) {
            return { success: false, error: 'Member does not belong to this room' };
        }

        // Remove the member by nullifying room and role
        const { error: updateError } = await supabase
            .from('Users')
            .update({ room: null, role: null })
            .eq('email', memberEmail)
            .eq('room', roomId);

        if (updateError) {
            console.error('Error removing member:', updateError);
            throw new Error('Failed to remove member');
        }

        revalidatePath(`/${roomId}`, 'layout');

        return {
            success: true,
            message: `Successfully removed ${memberEmail} from the room`
        };

    } catch (error) {
        console.error('Remove member error:', error);
        return { success: false, error: error.message };
    }
}

export async function exitRoom(roomId) {
    try {
        const supabase = await createClient();

        // SECURITY CHECK 1: Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Unauthorized: User not authenticated' };
        }

        // SECURITY CHECK 2: Verify current user belongs to this room
        const { data: currentUser } = await supabase
            .from('Users')
            .select('role, room, email')
            .eq('email', user.email)
            .single();

        if (currentUser?.room !== parseInt(roomId)) {
            return { success: false, error: 'Unauthorized: User not a member of this room' };
        }

        // SECURITY CHECK 3: Block admins from exiting
        if (currentUser?.role === 'Admin') {
            return { success: false, error: 'Admins cannot leave the room' };
        }

        // Exit the room by nullifying room and role
        const { error: updateError } = await supabase
            .from('Users')
            .update({ room: null, role: null })
            .eq('email', user.email)
            .eq('room', roomId);

        if (updateError) {
            console.error('Error exiting room:', updateError);
            throw new Error('Failed to exit room');
        }

        return { success: true };

    } catch (error) {
        console.error('Exit room error:', error);
        return { success: false, error: error.message };
    }
}
