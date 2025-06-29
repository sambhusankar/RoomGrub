'use server'
import { createClient } from '@/utils/supabase/server';
const supabase = createClient();

export async function getMember({ member_id, room_id }) {
    const { data: memberData, error: memberError } = await supabase
        .from('Users')
        .select('*')
        .eq('id', member_id)
        .eq('room', room_id)
        .single();

    if (memberError) throw memberError;
    return memberData;
}

export async function getPurchases({ email, room_id }) {
    const { data: purchaseData, error: purchaseError } = await supabase
        .from('Spendings')
        .select('*')
        .eq('user', email)
        .eq('room', room_id)
        .order('created_at', { ascending: false });

    if (purchaseError) throw purchaseError;
    return purchaseData;
}

export async function getPayments({ email, room_id }) {
    const { data: paymentData, error: paymentError } = await supabase
        .from('balance')
        .select('*')
        .eq('user', email)
        .eq('room', room_id)
        .order('created_at', { ascending: false });

    if (paymentError) throw paymentError;
    return paymentData;
}