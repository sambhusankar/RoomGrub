'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMemberData(roomId, memberId) {
    const supabase = await createClient();

    const { data: member, error } = await supabase
        .from('Users').select('*').eq('id', memberId).single();

    if (error || !member) return { member: null, purchases: [], summary: { pendingAmount: 0, totalPurchases: 0 } };

    const [pendingResult, allResult] = await Promise.all([
        supabase.from('Spendings').select('*')
            .eq('user', member.email).eq('room', roomId)
            .or('settled.is.null,settled.eq.false')
            .order('created_at', { ascending: false }),
        supabase.from('Spendings').select('money')
            .eq('user', member.email).eq('room', roomId),
    ]);

    const purchases = pendingResult.data || [];
    const pendingAmount = purchases.reduce((sum, p) => sum + parseFloat(p.money), 0);
    const totalPurchases = (allResult.data || []).reduce((sum, p) => sum + parseFloat(p.money), 0);

    return { member, purchases, summary: { pendingAmount, totalPurchases } };
}

export async function settleMember(roomId, memberEmail, pendingAmount) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase.from('balance').insert([{
        room: roomId,
        user: memberEmail,
        amount: pendingAmount * -1,
        status: 'debit',
    }]);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/${roomId}`, 'layout');
    return { success: true };
}

export async function recordContribution(roomId, memberEmail, amount) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase.from('balance').insert([{
        room: roomId,
        user: memberEmail,
        amount: parseFloat(amount),
        status: 'credit',
    }]);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/${roomId}`, 'layout');
    return { success: true };
}
