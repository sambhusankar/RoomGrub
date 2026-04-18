'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function settlePayment(roomId, memberEmail) {
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

        // Fetch unsettled expenses for this member
        const { data: memberExpenses, error: expensesError } = await supabase
            .from('Spendings')
            .select('id, money')
            .eq('user', memberEmail)
            .eq('room', roomId)
            .or('settled.is.null,settled.eq.false'); // covers NULL and false

        if (expensesError) throw new Error('Failed to fetch expenses');

        if (!memberExpenses || memberExpenses.length === 0) {
            return { success: false, error: 'No pending expenses to settle for this member' };
        }

        // Build one balance record per expense
        const balanceRecords = memberExpenses.map(expense => ({
            room: roomId,
            user: memberEmail,
            amount: parseFloat(expense.money) * -1,
            status: 'debit',
            spending_id: expense.id
        }));

        const expenseIds = memberExpenses.map(e => e.id);

        // Insert balance records
        const { error: insertError } = await supabase
            .from('balance')
            .insert(balanceRecords);

        if (insertError) {
            console.error('Error recording settlement:', insertError);
            throw new Error('Failed to record settlement');
        }

        // Mark all expenses as settled
        const { error: settleError } = await supabase
            .from('Spendings')
            .update({ settled: true })
            .in('id', expenseIds);

        if (settleError) {
            console.error('Error marking expenses as settled:', settleError);
            throw new Error('Failed to mark expenses as settled');
        }

        revalidatePath(`/${roomId}`, 'layout');

        return { success: true, expensesSettled: expenseIds.length };

    } catch (error) {
        console.error('Settlement error:', error);
        return { success: false, error: error.message };
    }
}

export async function settleAllPending(roomId, memberBalances, filters = {}) {
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

        // Filter members with pending balances
        const pendingMembers = memberBalances.filter(mb => Math.abs(mb.balance) > 0.01);

        if (pendingMembers.length === 0) {
            return { success: false, error: 'No pending settlements to process' };
        }

        const memberEmails = pendingMembers.map(mb => mb.member.email);

        // Batch fetch unsettled expenses and legacy lump-sum debits (spending_id IS NULL)
        // Apply the same date filters the client used so server-side pending matches client calculation
        let expensesQuery = supabase
            .from('Spendings')
            .select('id, money, user')
            .in('user', memberEmails)
            .eq('room', roomId)
            .or('settled.is.null,settled.eq.false'); // IS NOT TRUE — covers NULL and false

        let paymentsQuery = supabase
            .from('balance')
            .select('amount, user')
            .in('user', memberEmails)
            .eq('room', roomId)
            .eq('status', 'debit')
            .is('spending_id', null); // legacy lump-sum records only

        if (filters.dateRange?.from) {
            expensesQuery = expensesQuery.gte('created_at', filters.dateRange.from);
            paymentsQuery = paymentsQuery.gte('created_at', filters.dateRange.from);
        }
        if (filters.dateRange?.to) {
            expensesQuery = expensesQuery.lte('created_at', filters.dateRange.to);
            paymentsQuery = paymentsQuery.lte('created_at', filters.dateRange.to);
        }

        const [expensesResult, paymentsResult] = await Promise.all([expensesQuery, paymentsQuery]);

        const allExpenses = expensesResult.data || [];
        const allPayments = paymentsResult.data || [];

        // Group by user email using Maps for O(1) lookups
        const expensesByUser = new Map();
        const paymentsByUser = new Map();

        allExpenses.forEach(expense => {
            const email = expense.user;
            if (!expensesByUser.has(email)) expensesByUser.set(email, []);
            expensesByUser.get(email).push(expense);
        });

        allPayments.forEach(payment => {
            const email = payment.user;
            if (!paymentsByUser.has(email)) paymentsByUser.set(email, []);
            paymentsByUser.get(email).push(payment);
        });

        const verifiedSettlements = [];
        const allExpenseIdsToSettle = [];

        for (const mb of pendingMembers) {
            const memberExpenses = expensesByUser.get(mb.member.email) || [];
            const memberPayments = paymentsByUser.get(mb.member.email) || [];

            // Pending = unsettled expenses + legacy debit settlements (negative), clamped to 0 minimum
            const totalExpenses = memberExpenses.reduce((sum, e) => sum + parseFloat(e.money || 0), 0);
            const totalLegacySettlements = memberPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
            const actualPending = Math.max(0, totalExpenses + totalLegacySettlements);

            // Verify pending amount matches client-sent value (allow 0.01 rounding diff)
            if (Math.abs(actualPending - mb.pendingAmount) > 0.01) {
                return {
                    success: false,
                    error: `Pending amount mismatch for ${mb.member.name || mb.member.email}. Please refresh and try again.`
                };
            }

            // Only settle if there are actually unsettled expenses
            if (memberExpenses.length === 0) continue;

            // One balance record per expense
            for (const expense of memberExpenses) {
                verifiedSettlements.push({
                    room: roomId,
                    user: mb.member.email,
                    amount: parseFloat(expense.money) * -1,
                    status: 'debit',
                    spending_id: expense.id
                });
                allExpenseIdsToSettle.push(expense.id);
            }
        }

        if (verifiedSettlements.length === 0) {
            return { success: false, error: 'No valid pending amounts to settle' };
        }

        // Insert all balance records
        const { error: insertError } = await supabase
            .from('balance')
            .insert(verifiedSettlements);

        if (insertError) {
            console.error('Error settling all:', insertError);
            throw new Error('Failed to settle all balances');
        }

        // Mark all settled expenses
        const { error: settleError } = await supabase
            .from('Spendings')
            .update({ settled: true })
            .in('id', allExpenseIdsToSettle);

        if (settleError) {
            console.error('Error marking expenses as settled:', settleError);
            throw new Error('Failed to mark expenses as settled');
        }

        // Delete legacy debit records (spending_id IS NULL) for settled members,
        // scoped to the same filters active during settlement.
        let deleteQuery = supabase
            .from('balance')
            .delete()
            .in('user', memberEmails)
            .eq('room', roomId)
            .eq('status', 'debit')
            .is('spending_id', null);

        if (filters.dateRange?.from) {
            deleteQuery = deleteQuery.gte('created_at', filters.dateRange.from);
        }
        if (filters.dateRange?.to) {
            deleteQuery = deleteQuery.lte('created_at', filters.dateRange.to);
        }

        const { error: deleteError } = await deleteQuery;
        if (deleteError) {
            console.error('Error deleting legacy debits:', deleteError);
            // Non-fatal — settlement succeeded, log and continue
        }

        revalidatePath(`/${roomId}`, 'layout');

        return {
            success: true,
            settledCount: pendingMembers.length,
            expensesSettled: allExpenseIdsToSettle.length
        };

    } catch (error) {
        console.error('Settle all error:', error);
        return { success: false, error: error.message };
    }
}
