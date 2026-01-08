'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import NotificationService from '@/services/NotificationService';

export async function addGroceryForFriend(roomId, friendEmail, grocery, price, date) {
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
            .select('role, room, id, name')
            .eq('email', user.email)
            .single();

        if (currentUser?.role !== 'Admin') {
            return { success: false, error: 'Unauthorized: Only admins can add groceries for others' };
        }

        // SECURITY CHECK 3: Verify current user belongs to this room
        if (currentUser?.room !== parseInt(roomId)) {
            return { success: false, error: 'Unauthorized: User not a member of this room' };
        }

        // VALIDATION 1: Verify friend exists and belongs to the same room
        const { data: friendUser, error: friendError } = await supabase
            .from('Users')
            .select('email, room, id, name')
            .eq('email', friendEmail)
            .single();

        if (friendError || !friendUser) {
            return { success: false, error: 'Friend not found' };
        }

        if (friendUser.room !== parseInt(roomId)) {
            return { success: false, error: 'Friend does not belong to this room' };
        }

        // VALIDATION 2: Validate input data
        if (!grocery || grocery.trim().length === 0) {
            return { success: false, error: 'Grocery item is required' };
        }

        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            return { success: false, error: 'Valid price is required' };
        }

        // Prepare insert data
        const insertData = {
            room: parseInt(roomId),
            material: grocery.trim(),
            money: parseFloat(price),
            user: friendEmail
        };

        // If date provided, use it; otherwise database will use default (current timestamp)
        if (date) {
            insertData.created_at = new Date(date).toISOString();
        }

        // Insert grocery spending
        const { error: insertError } = await supabase
            .from('Spendings')
            .insert([insertData]);

        if (insertError) {
            console.error('Error adding grocery for friend:', insertError);
            throw new Error('Failed to add grocery');
        }

        // Send notification to room members
        try {
            await NotificationService.notifyGroceryAdded(
                parseInt(roomId),
                friendUser.id,
                friendUser.name || friendEmail,
                1 // item count
            );
            console.log('Grocery notification sent successfully');
        } catch (notificationError) {
            console.error('Failed to send grocery notification:', notificationError);
            // Don't fail the operation if notification fails
        }

        // Revalidate relevant pages
        revalidatePath(`/${roomId}/addgroccery`);
        revalidatePath(`/${roomId}/admin`);

        return {
            success: true,
            message: `Successfully added grocery for ${friendUser.name || friendEmail}`
        };

    } catch (error) {
        console.error('Add grocery for friend error:', error);
        return { success: false, error: error.message };
    }
}
