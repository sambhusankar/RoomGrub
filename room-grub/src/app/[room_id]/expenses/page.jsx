import ExpenseHistory from './_components/ExpenseHistory';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';
import { createClient } from '@/utils/supabase/client';
import { fetchPaginatedExpenses } from './actions';

export default async function ExpensesPage({ params }) {
    const user = await LoginRequired();
    await validRoom({ params });
    const param = await params;
    const supabase = createClient();

    // Fetch first page of expenses
    const initialData = await fetchPaginatedExpenses({
        roomId: param.room_id,
        cursor: null,
        limit: 20,
        filters: {},
    });

    // Fetch all room members for the user filter dropdown
    const { data: roomMembers } = await supabase
        .from('Users')
        .select('email, name')
        .eq('room', param.room_id);

    const userMap = {};
    (roomMembers || []).forEach(m => {
        if (m.email && !userMap[m.email]) {
            userMap[m.email] = m.name || m.email;
        }
    });

    return (
        <ExpenseHistory
            initialExpenses={initialData.expenses || []}
            initialCursor={initialData.nextCursor}
            initialHasMore={initialData.hasMore}
            roomId={param.room_id}
            userMap={userMap}
        />
    );
}
