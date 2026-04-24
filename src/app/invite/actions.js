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
            .select('id, role, room')
            .eq('uid', user.id)
            .single();

        if (currentUser?.role !== 'Admin' || currentUser?.room !== parseInt(roomId)) {
            return { success: false, error: 'Only room admins can create invite links' };
        }

        // Revoke any previous pending invite for this room (one active link at a time)
        await supabase
            .from('Invite')
            .update({ status: 'rejected', updated_at: new Date().toISOString() })
            .eq('room', parseInt(roomId))
            .eq('status', 'pending');

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

        // Fetch invite directly to avoid join aliasing issues
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
            .select('id, room')
            .eq('uid', user.id)
            .single();

        if (!currentUser) return { success: false, error: 'User not found' };
        if (currentUser.room) return { success: false, error: 'Already in a room' };

        const roomId = invite.room;

        const { error: userUpdateError } = await supabase
            .from('Users')
            .update({ room: roomId, role: 'Member' })
            .eq('id', currentUser.id);

        if (userUpdateError) throw new Error('Failed to join room');

        const { data: room } = await supabase
            .from('Rooms')
            .select('members')
            .eq('id', roomId)
            .single();

        await supabase
            .from('Rooms')
            .update({ members: (room?.members || 0) + 1 })
            .eq('id', roomId);

        const { error: inviteUpdateError } = await supabase
            .from('Invite')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', invite.id);

        if (inviteUpdateError) {
            console.error('Failed to update invite status:', inviteUpdateError);
        }

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

export async function getPendingInvites(roomId) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return { success: false, error: 'Unauthorized' };

        const { data: currentUser } = await supabase
            .from('Users')
            .select('role, room')
            .eq('uid', user.id)
            .single();

        if (currentUser?.role !== 'Admin' || currentUser?.room !== parseInt(roomId)) {
            return { success: false, error: 'Unauthorized' };
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() - 7);

        const { data: invites, error } = await supabase
            .from('Invite')
            .select('id, token, created_at')
            .eq('room', parseInt(roomId))
            .eq('status', 'pending')
            .gte('created_at', expiryDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) return { success: false, error: error.message };
        return { success: true, invites: invites || [] };
    } catch (error) {
        console.error('getPendingInvites error:', error);
        return { success: false, error: error.message };
    }
}

export async function revokeInvite(inviteId, roomId) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return { success: false, error: 'Unauthorized' };

        const { data: currentUser } = await supabase
            .from('Users')
            .select('role, room')
            .eq('uid', user.id)
            .single();

        if (currentUser?.role !== 'Admin' || currentUser?.room !== parseInt(roomId)) {
            return { success: false, error: 'Unauthorized' };
        }

        const { error } = await supabase
            .from('Invite')
            .update({ status: 'rejected', updated_at: new Date().toISOString() })
            .eq('id', inviteId)
            .eq('room', parseInt(roomId));

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (error) {
        console.error('revokeInvite error:', error);
        return { success: false, error: error.message };
    }
}
