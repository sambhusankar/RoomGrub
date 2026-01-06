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

        // SECURITY CHECK 1: Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Unauthorized: User not authenticated' };
        }

        // SECURITY CHECK 2: Verify user is admin
        const { data: currentUser } = await supabase
            .from('Users')
            .select('role, room')
            .eq('email', user.email)
            .single();

        if (currentUser?.role !== 'Admin') {
            return { success: false, error: 'Unauthorized: Only admins can settle payments' };
        }

        // SECURITY CHECK 3: Verify user belongs to this room
        if (currentUser?.room !== parseInt(roomId)) {
            return { success: false, error: 'Unauthorized: User not a member of this room' };
        }

        // VALIDATION 1: Filter members with pending balances
        const pendingMembers = memberBalances.filter(mb => Math.abs(mb.balance) > 0.01);

        if (pendingMembers.length === 0) {
            return { success: false, error: 'No pending settlements to process' };
        }

        // VALIDATION 3: Re-calculate and verify pending amounts on server
        // This prevents client-side manipulation of amounts
        const verifiedSettlements = [];

        for (const mb of pendingMembers) {
            // Fetch actual expenses for this member
            const { data: memberExpenses } = await supabase
                .from('Spendings')
                .select('money')
                .eq('user', mb.member.email)
                .eq('room', roomId);

            // Fetch actual settlements for this member (debit transactions)
            const { data: memberPayments } = await supabase
                .from('balance')
                .select('amount, status')
                .eq('user', mb.member.email)
                .eq('room', roomId)
                .eq('status', 'debit');

            // Calculate actual pending amount
            const totalExpenses = (memberExpenses || []).reduce((sum, e) => sum + parseFloat(e.money || 0), 0);
            const totalSettlements = (memberPayments || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
            const actualPending = totalExpenses + totalSettlements; // settlements are negative

            // Verify pending amount matches (allow 0.01 difference for rounding)
            if (Math.abs(actualPending - mb.pendingAmount) > 0.01) {
                return {
                    success: false,
                    error: `Pending amount mismatch for ${mb.member.name || mb.member.email}. Please refresh and try again.`
                };
            }

            // Only include if actually has pending amount
            if (actualPending > 0.01) {
                verifiedSettlements.push({
                    room: roomId,
                    user: mb.member.email,
                    amount: actualPending * -1,  // Negative of pending amount
                    status: 'debit'              // Always debit
                });
            }
        }

        // FINAL CHECK: Ensure we have settlements to process
        if (verifiedSettlements.length === 0) {
            return { success: false, error: 'No valid pending amounts to settle' };
        }

        // Insert all verified settlements
        const { error } = await supabase
            .from('balance')
            .insert(verifiedSettlements);

        if (error) {
            console.error('Error settling all:', error);
            throw new Error('Failed to settle all balances');
        }

        // Revalidate the splits page to show updated data
        revalidatePath(`/${roomId}/splits`);

        return { success: true, settledCount: verifiedSettlements.length };

    } catch (error) {
        console.error('Settle all error:', error);
        return { success: false, error: error.message };
    }
}
