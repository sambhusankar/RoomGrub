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
    // First get all payments
    const { data: paymentsData, error: paymentsError } = await supabase
        .from("balance")
        .select("*")
        .eq("room", param.room_id)
        .order("created_at", { ascending: false });
    
    if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
    }
    
    // Then get user data for each unique email (since balance.user contains emails)
    const uniqueEmails = [...new Set(paymentsData?.map(p => p.user))].filter(Boolean);
    const { data: usersData, error: usersError } = await supabase
        .from("Users")
        .select("email, name, profile")
        .in("email", uniqueEmails);
    
    if (usersError) {
        console.error('Error fetching users:', usersError);
    }
    
    // Merge the data
    const paymentsWithUsers = paymentsData?.map(payment => ({
        ...payment,
        Users: usersData?.find(user => user.email === payment.user)
    }));
    
    const payments = paymentsWithUsers || [];

    return <PaymentHistory payments={payments || []} roomId={param.room_id} />;
}