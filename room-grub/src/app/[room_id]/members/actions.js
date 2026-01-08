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

        // Revalidate relevant pages
        revalidatePath(`/${roomId}/members`);
        revalidatePath(`/${roomId}/admin`);

        return {
            success: true,
            message: `Successfully updated ${memberEmail} to ${newRole}`
        };

    } catch (error) {
        console.error('Update member role error:', error);
        return { success: false, error: error.message };
    }
}
