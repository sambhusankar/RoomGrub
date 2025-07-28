'use server'
import { createClient } from '@/utils/supabase/server';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';
import PaymentHistory from './_components/PaymentHistory';

export default async function PaymentsPage({ params }) {
    const session = await LoginRequired();
    await validRoom({ params });
    const supabase = await createClient();
    const param = await params;
    const { data: payments, error } = await supabase
        .from("balance")
        .select(`
            *
        `)
        .eq("room", param.room_id)
        .order("created_at", { ascending: false });

    return <PaymentHistory payments={payments || []} roomId={param.room_id} />;
}