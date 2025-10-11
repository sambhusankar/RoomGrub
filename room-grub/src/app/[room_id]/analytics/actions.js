'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function settlePayment(roomId, memberEmail, finalBalance, memberStatus) {
    try {
        const supabase = await createClient();

        const settlementAmount = Math.abs(finalBalance);

        // Determine the correct status and amount for balance table
        let status, amount;

        if (memberStatus === 'credit') {
            // Member should receive money - record as debit with negative value
            status = 'debit';
            amount = parseFloat(-settlementAmount);
        } else {
            // Member should pay money - record as credit with positive value
            status = 'credit';
            amount = parseFloat(settlementAmount);
        }

        // Insert settlement record into balance table
        const { data, error } = await supabase
            .from('balance')
            .insert({
                amount: amount,
                user: memberEmail,
                room: roomId,
                status: status
            })
            .select()
            .single();

        if (error) {
            console.error('Error recording settlement:', error);
            throw new Error('Failed to record settlement');
        }

        // Revalidate the analytics page to show updated data
        revalidatePath(`/${roomId}/analytics`);

        return { success: true, data };

    } catch (error) {
        console.error('Settlement error:', error);
        return { success: false, error: error.message };
    }
}
