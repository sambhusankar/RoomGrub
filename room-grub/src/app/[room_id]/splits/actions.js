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

        // Revalidate the splits page to show updated data
        revalidatePath(`/${roomId}/splits`);

        return { success: true, data };

    } catch (error) {
        console.error('Settlement error:', error);
        return { success: false, error: error.message };
    }
}

export async function settleAllPending(roomId, memberBalances) {
    try {
        const supabase = await createClient();

        // Filter members with pending balances (finalBalance !== 0)
        const pendingMembers = memberBalances.filter(mb => Math.abs(mb.balance) > 0.01);

        if (pendingMembers.length === 0) {
            return { success: false, error: 'No pending settlements' };
        }

        // Create settlement entries for all pending members
        // Following admin dashboard pattern: always debit with negative of pending amount
        const settlements = pendingMembers.map(mb => ({
            room: roomId,
            user: mb.member.email,
            amount: mb.pendingAmount * -1,  // Negative of pending amount
            status: 'debit'                 // Always debit
        }));

        // Insert all settlements in one transaction
        const { error } = await supabase
            .from('balance')
            .insert(settlements);

        if (error) {
            console.error('Error settling all:', error);
            throw new Error('Failed to settle all balances');
        }

        // Revalidate the splits page to show updated data
        revalidatePath(`/${roomId}/splits`);

        return { success: true, settledCount: settlements.length };

    } catch (error) {
        console.error('Settle all error:', error);
        return { success: false, error: error.message };
    }
}
