'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const INVITE_EXPIRY_DAYS = 7;

export async function validateToken(token) {
    try {
        const supabase = await createClient();

        const { data: invite, error } = await supabase
            .from('Invite')
            .select('*, Rooms(*), Users!invited_by(name, email)')
            .eq('token', token)
            .single();

        if (error || !invite) return { valid: false, reason: 'not_found' };
        if (invite.status !== 'pending') return { valid: false, reason: invite.status };

        const expiryDate = new Date(invite.created_at);
        expiryDate.setDate(expiryDate.getDate() + INVITE_EXPIRY_DAYS);
        if (new Date() > expiryDate) {
            await supabase
                .from('Invite')
                .update({ status: 'expired', updated_at: new Date().toISOString() })
                .eq('id', invite.id);
            return { valid: false, reason: 'expired' };
        }

        const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

        return {
            valid: true,
            invite: {
                id: invite.id,
                token: invite.token,
                room: invite.Rooms,
                invitedBy: invite['Users'],
                daysLeft,
            }
        };
    } catch (error) {
        console.error('validateToken error:', error);
        return { valid: false, reason: 'error' };
    }
}

export async function createInvite(roomId) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return { success: false, error: 'Unauthorized' };

        const { data: currentUser } = await supabase
            .from('Users')
            .select('id')
            .eq('email', user.email)
            .single();

        if (!currentUser) return { success: false, error: 'User not found' };

        const { data: membership } = await supabase
            .from('UserRooms')
            .select('role')
            .eq('user_id', currentUser.id)
            .eq('room_id', parseInt(roomId))
            .single();

        if (membership?.role !== 'Admin') {
            return { success: false, error: 'Only room admins can create invite links' };
        }

        const { data: invite, error } = await supabase
            .from('Invite')
            .insert({ room: parseInt(roomId), invited_by: currentUser.id })
            .select()
            .single();

        if (error) return { success: false, error: error.message };
        return { success: true, token: invite.token };
    } catch (error) {
        console.error('createInvite error:', error);
        return { success: false, error: error.message };
    }
}

export async function acceptInvite(token) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return { success: false, error: 'Unauthorized' };

        const { data: invite, error: inviteError } = await supabase
            .from('Invite')
            .select('id, room, status, created_at')
            .eq('token', token)
            .single();

        if (inviteError || !invite) return { success: false, error: 'Invite not found' };
        if (invite.status !== 'pending') return { success: false, error: `Invite is ${invite.status}` };

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (new Date(invite.created_at) < sevenDaysAgo) {
            await supabase
                .from('Invite')
                .update({ status: 'expired', updated_at: new Date().toISOString() })
                .eq('id', invite.id);
            return { success: false, error: 'Invite is expired' };
        }

        const { data: currentUser } = await supabase
            .from('Users')
            .select('id')
            .eq('email', user.email)
            .single();

        if (!currentUser) return { success: false, error: 'User not found' };

        const roomId = invite.room;

        // Idempotency: if already a member of this room, return success silently
        const { data: existing } = await supabase
            .from('UserRooms')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('room_id', roomId)
            .single();

        if (existing) return { success: true, roomId };

        const { error: membershipError } = await supabase
            .from('UserRooms')
            .insert({ user_id: currentUser.id, room_id: roomId, role: 'Member' });

        if (membershipError) throw new Error('Failed to join room');

        const { data: room } = await supabase
            .from('Rooms')
            .select('members')
            .eq('id', roomId)
            .single();

        await supabase
            .from('Rooms')
            .update({ members: (room?.members || 0) + 1 })
            .eq('id', roomId);

        await supabase
            .from('Invite')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', invite.id);

        revalidatePath(`/${roomId}`, 'layout');
        return { success: true, roomId };
    } catch (error) {
        console.error('acceptInvite error:', error);
        return { success: false, error: error.message };
    }
}

export async function rejectInvite(token) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return { success: false, error: 'Unauthorized' };

        const { data: invite, error } = await supabase
            .from('Invite')
            .select('id, status')
            .eq('token', token)
            .single();

        if (error || !invite) return { success: false, error: 'Invite not found' };
        if (invite.status !== 'pending') return { success: false, error: `Invite is already ${invite.status}` };

        await supabase
            .from('Invite')
            .update({ status: 'rejected', updated_at: new Date().toISOString() })
            .eq('id', invite.id);

        return { success: true };
    } catch (error) {
        console.error('rejectInvite error:', error);
        return { success: false, error: error.message };
    }
}
