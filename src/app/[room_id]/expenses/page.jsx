import ExpenseHistory from './_components/ExpenseHistory';
import { fetchPaginatedExpenses, getRoomMembers } from './actions';

export default async function ExpensesPage({ params }) {
    const { room_id } = await params;

    const [initialData, userMap] = await Promise.all([
        fetchPaginatedExpenses({ roomId: room_id, cursor: null, limit: 20, filters: { settled: false } }),
        getRoomMembers(room_id),
    ]);

    return (
        <ExpenseHistory
            initialExpenses={initialData.expenses || []}
            initialCursor={initialData.nextCursor}
            initialHasMore={initialData.hasMore}
            roomId={room_id}
            userMap={userMap}
        />
    );
}
