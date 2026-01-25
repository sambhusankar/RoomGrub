import ExpenseHistory from './_components/ExpenseHistory';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';
import { createClient } from '@/utils/supabase/client';

export default async function ExpensesPage({ params }) {
    const user = await LoginRequired();
    await validRoom({ params });
    const param = await params;
    const supabase = createClient();

    const fetchExpenses = async () => {
        try {
            // First get all expenses
            const { data: expensesData, error: fetchError } = await supabase
                .from("Spendings")
                .select("*")
                .eq("room", param.room_id)
                .order("created_at", { ascending: false });

            if (fetchError) throw fetchError;

            // Then get user data for each unique email
            const uniqueEmails = [...new Set(expensesData?.map(e => e.user))].filter(Boolean);
            const { data: usersData, error: usersError } = await supabase
                .from("Users")
                .select("email, name, profile")
                .in("email", uniqueEmails);

            if (usersError) throw usersError;

            // PERFORMANCE FIX: Use Map for O(1) lookups instead of O(n) .find()
            const userMap = new Map(usersData?.map(user => [user.email, user]) || []);

            // Merge the data with O(1) lookup per expense
            const expensesWithUsers = expensesData?.map(expense => ({
                ...expense,
                Users: userMap.get(expense.user)
            }));

            return expensesWithUsers || [];
        } catch (error) {
            console.error('Error fetching Expenses:', error);
        }
    };

    const expenses = await fetchExpenses();

    return <ExpenseHistory expenses={expenses} />;
}