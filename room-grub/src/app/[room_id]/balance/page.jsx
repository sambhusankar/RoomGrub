'use server'
import { createClient } from '@/utils/supabase/server';
import { LoginRequired } from '@/policies/LoginRequired';
import BalanceView from './_components/BalanceView';

export default async function BalancePage({ params }) {
    const session = await LoginRequired();
    const supabase = await createClient();
    const param = await params;
    
    const { data: transactions, error } = await supabase
        .from("balance")
        .select(`
            *
        `)
        .eq("room", param.room_id)
        .order("created_at", { ascending: false });

    // Calculate totals
    const totalCredit = transactions?.reduce((sum, t) => 
        t.status === 'credit' ? sum + parseFloat(t.amount) : sum, 0) || 0;
    
    const totalDebit = transactions?.reduce((sum, t) => 
        t.status === 'debit' ? sum + parseFloat(t.amount) : sum, 0) || 0;
    
    const currentBalance = totalCredit - totalDebit;

    const balanceData = {
        totalCredit,
        totalDebit,
        currentBalance,
        transactions: transactions || []
    };
    console.log("Balance Data:", balanceData);
    return <BalanceView balanceData={balanceData} roomId={param.room_id} />;
}