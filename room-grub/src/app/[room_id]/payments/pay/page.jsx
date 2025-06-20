'use server'
import { createClient } from '@/utils/supabase/server';
import { LoginRequired } from '@/policies/LoginRequired';
import { redirect } from 'next/navigation';
import PaymentFormView from './_components/PaymentFormView';

async function addPayment(formData) {
    'use server'
    
    const supabase = await createClient();
    const amount = formData.get('amount');
    const user = formData.get('user');
    const room = formData.get('room');
    const status = formData.get('status');

    const { data, error } = await supabase
        .from('Balance')
        .insert([{
            room: parseInt(room),
            user: parseInt(user),
            amount: parseFloat(amount),
            status: status
        }]);

    if (error) {
        console.error('Error adding payment:', error);
        return { error: 'Failed to add payment' };
    }

    redirect(`/${room}/payments`);
}

export default async function PayPage({ params }) {
    const session = await LoginRequired();
    const supabase = await createClient();
    
    const { data: users, error } = await supabase
        .from("Users")
        .select("*")
        .eq("room", params.room_id);

    return (
        <PaymentFormView 
            roomId={params.room_id} 
            users={users || []} 
            addPayment={addPayment}
        />
    );
}
